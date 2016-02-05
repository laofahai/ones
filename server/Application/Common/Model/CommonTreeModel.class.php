<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/31/15
 * Time: 21:41
 */

namespace Common\Model;


class CommonTreeModel extends CommonModel {

    /*
     * 获得缩进树形
     * */
    public function get_tree($pid = null) {

        if(!$pid) {
            $parent = $this->where([])->order('id ASC')->find();
        } else {
            $parent = $this->find($pid);
        }

        if(!$parent) {
            return;
        }

        $map = array(
            "lft" => array("between", array($parent["lft"], $parent["rgt"]))
        );

        if(!isset($_GET['_ot'])) {
            $map['trashed'] = "0";
        } else {
            $map['trashed'] = "1";
        }

        $data = $this->where($map)->order("lft ASC")->select();
        $items = array();
        $right = array();
        foreach($data as $row) {
            // only check stack if there is one
            if (count($right) > 0) {
                // 检查我们是否应该将节点移出堆栈
                while ($right[count($right) - 1] < $row['rgt']) {
                    array_pop($right);
                    if(count($right) <= 0) {
                        break;
                    }
                }
            }

//            if(count($right) > $level) {
//                break;
//            }
            // 缩进显示节点的名称
            $rightLength = count($right);
            if($rightLength > 0) {
                $row["prefix"] = "|".str_repeat('---', $rightLength);
            } else {
                $row["prefix"] = "";
            }
            $row['prefix_name'] = $row['prefix'].$row['name'];
            // 是否包含子分类
            if($row["rgt"]-$row["lft"] > 1) {
                $row["has_child"] = true;
            }

            $row["deep"] = $rightLength;
            $items[] = $row;
            // 将这个节点加入到堆栈中
            $right[] = $row['rgt'];
        }

        return $items;
    }

    /*
     * 新增子节点
     * */
    public function add_child($pid, $source_data, $table) {
        $parent = $this->find($pid);

        if(!$parent) {
            return false;
        }

        $company_id = get_current_company_id();

        /**
         * 更新右值
         */
        $map = array(
            "rgt" => array("EGT", $parent["rgt"])
        );
        if(!$this->not_belongs_to_company) {
            $map['company_id'] = $company_id;
        }

        $this->startTrans();
        $rs = $this->where($map)->setInc('rgt', 2);
        if(false === $rs) {
            $this->rollback();
            return false;
        }

        /**
         * 更新左值
         */
        $map = array(
            "lft" => array("EGT", $parent["rgt"])
        );
        if(!$this->not_belongs_to_company) {
            $map['company_id'] = $company_id;
        }
        $rs = $this->where($map)->setInc('rgt', 2);
        if(false === $rs) {
            $this->rollback();
            return false;
        }

        /**
         * 插入新值
         */
        $data = array(
            "lft" => $parent["rgt"],
            "rgt" => $parent["rgt"]+1
        );
        if(!$this->not_belongs_to_company) {
            $data['company_id'] = $company_id;
        }

        foreach($source_data as $k=>$v) {
            $data[$k] = $v;
        }

        $rs = $this->table($table)->add($data);

        if(!$rs) {
            $this->rollback();
            return false;
        }


        $this->commit();
        return $rs;
    }

    /*
     * 删除节点
     * */
    public function delete_node($id) {
        $node = $this->where(['id'=>$id])->find();

        if(!$node) {
            return true;
        }

        if($node["lft"] == 1) {
            $this->error = __("common.Root node can't be deleted");
            return false;
        }

        $fields = $this->getDbFields();
        if(in_array('trashed', $fields)) {
            $result = $this->where([
                'lft' => ['BETWEEN', [$node['lft'], $node['rgt']]]
            ])->save(['trashed'=>'1']);
            return $result;
        }

        $this->startTrans();

        $this->where([
            'lft' => ['BETWEEN', [$node['lft'], $node['rgt']]]
        ])->delete();

        // 右侧需减去
        $need_minus = $node['rgt'] - $node['lft'] + 1;

        $this->where(['rgt' => ['GT', $node['rgt']]])->setDec('rgt', $need_minus);
        $this->where(['lft' => ['GT', $node['rgt']]])->setDec('lft', $need_minus);

        $this->commit();

    }

}