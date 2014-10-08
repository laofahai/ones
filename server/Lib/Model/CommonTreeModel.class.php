<?php

/**
 * @filename CommonTreeModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:05:03
 * @Description
 * 
 */
class CommonTreeModel extends CommonModel {
    
    /**
     * 增加子节点
     */
    public function addChildNode($sourceData) {
        $parent = $this->find($sourceData["pid"]);
//        if(!is_array($sourceData)) {
//            $sourceData["name"] = $sourceData;
//        }
        
        if(!$parent) {
            return false;
        }
        
        //rgt = parent rgt -1
        /**
         * 更新右值
         */
        $map = array(
            "rgt" => array("EGT", $parent["rgt"])
        );
        $this->startTrans();
        //$data['lft'] = array("lft", "lft+2");
        $data['rgt'] = array("exp", "rgt+2");
        $rs = $this->where($map)->save($data);
        
        unset($data);
        /**
         * 更新左值
         */
        $map = array(
            "lft" => array("EGT", $parent["rgt"])
        );
        //$data['lft'] = array("lft", "lft+2");
        $data['lft'] = array("exp", "lft+2");
        $rs = $this->where($map)->save($data);
        unset($data);
        
        /**
         * 插入新值
         */
        $data = array(
            "lft" => $parent["rgt"],
            "rgt" => $parent["rgt"]+1,
        );
        foreach($sourceData as $k=>$v) {
            $data[$k] = $v;
        }
        $data["pinyin"] = Pinyin($sourceData["name"]);
//        echo "<pre>";
//        print_r($_POST);
//        echo 1;
//        print_r($sourceData);
//        echo 2;
//        print_r($data);
//        
        $this->create($data);
        $rs = $this->add();
//        echo $this->getLastSql();exit;
        
        if(!$rs) {
            Log::write("SQL Error:".$this->getLastSql(), Log::SQL);
            $this->rollback();
            return false;
        }
        
        
        $this->commit();
        return $rs;
    }
    
    /**
     * 删除子节点
     * @todo 删除多条时 只会删除第一条数据
     */
    public function deleteNode($id) {

        $id = abs(intval($id));

        $node = $this->find($id);
        if(!$node) {
            $this->error = "can't find item";
            return false;
        }

        if($node["lft"] == 1) {
            $this->error = "root can't be deleted";
            return false;
        }

        if(array_key_exists("deleted", $this->fields["_type"])) {

            $this->where(array(
                "lft" => array("EGT", $node['lft']),
                "rgt" => array("ELT", $node['rgt'])
            ))->save(array(
                "deleted" => 1
            ));

            return true;
        }



        //DELETE FROM category WHERE lft BETWEEN @myLeft AND @myRight;
//        $this->where("id=".$id)->save(array(
//            "deleted" => 1
//        ));
//        echo $this->getLastSql();exit;
//        return true;

        //UPDATE `x_department` SET `lft`=lft-2 WHERE ( `lft` > '4' )
        //UPDATE `x_department` SET `rgt`=rgt-2 WHERE ( `rgt` > '4' )
        //DELETE FROM `x_department` WHERE ( `lft` >= '3' ) AND ( `rgt` <= '4' ){"error":0,"msg":"operate_success"}
        
        $this->startTrans();
        
        $this->where(array(
            "lft" => array("EGT", $node['lft']),
            "rgt" => array("ELT", $node['rgt']) 
        ))->delete();
        
        $width = $node["rgt"] - $node["lft"] + 1;
        $this->where(array(
            "lft" => array("GT", $node["rgt"])
        ))->setDec('lft',$width);
        $this->where(array(
            "rgt" => array("GT", $node["rgt"])
        ))->setDec('rgt',$width); 
        
        $this->commit();
        
        return true;
    }
    
    /**
     * 获取直属一级子节点
     */
    public function getChildren($parentid) {
        $map = array(
            "parentid"=> $parentid,
            "deleted" => 0
        );
        $childs = $this->where($map)->order("listorder DESC, lft ASC")->select();
        foreach($childs as $c) {
            $_childs[$c["id"]] = $c;
        }
        
        return $_childs;
    }
    
    /**
     * 获取分类树
     */
    public function getTree($parentid, $level=1) {
        $node = $this->find($parentid);
        if(!$node) {
            return;
        }
        
        $map = array(
            "lft" => array("between", array($node["lft"], $node["rgt"])),
            "deleted" => 0
        );
        $data = $this->where($map)->order("lft ASC,listorder DESC")->select();
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
            
            $row["deep"] = $rightLength;
            $items[] = $row;
            // 将这个节点加入到堆栈中
            $right[] = $row['rgt'];
            
        }
        
        
        return $items;
    }
    
    public function getTreeArray($pid) {
        $parent = $this->find($pid);
        $childs = $this->where(array(
            "parentid" => $pid,
            "deleted" => 0
        ))->order("listorder DESC, lft ASC")->select();
        if(!$childs) {
            return array();
        }
        foreach($childs as $c) {
            $cids[] = $c["id"];
            $c["urlField"] = $c["alias"] ? $c["alias"] : $c["id"];
            $_childs[$c["id"]] = $c;
        }
        $map = array(
            "parentid" => array("in", implode(",", $cids)),
            "deleted" => 0
        );
        $sonsons = $this->where($map)->order("listorder DESC, lft ASC")->select();
        if(!$sonsons) {
            return $_childs;
        }
        
        foreach($sonsons as $s) {
            $s["urlField"] = $s["alias"] ? $s["alias"] : $s["id"];
            $_childs[$s["parentid"]]["children"][] = $s;
            
        }
        
        return $_childs;
        
    }
    
    /**
     * 获取节点路径
     */
    public function getNodePath($nodeid, $includeSelf = true) {
//        SELECT name FROM tree WHERE lft < 4 AND rgt >; 5 ORDER BY lft ASC;
        $node = $this->find($nodeid);
        $type = $includeSelf ? "ELT" : "LT";
        $map = array(
            "lft" => array($type, $node["lft"]),
            "rgt" => array("EGT", $node["rgt"]),
            "deleted" => 0
        );
        return $this->where($map)->order("lft ASC")->select();
    }

}
