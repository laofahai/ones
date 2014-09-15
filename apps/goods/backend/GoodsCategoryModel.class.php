<?php

/**
 * @filename GoodsCategoryModel.class.php
 * @encoding UTF-8
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-12  17:15:48
 * @Description
 *
 */

class GoodsCategoryModel extends CommonTreeModel {

    public function __construct($modelName="", $tablePrefix="", $connection="") {
        parent::__construct("GoodsCategory", $tablePrefix, $connection);
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
            "GoodsCategory.deleted" => 0
        );

        $this->excludeDeletedMap = true;
//        print_r($map);exit;
        $data = $this->table(C("DB_PREFIX")."goods_category GoodsCategory")
            ->field("GoodsCategory.*")
            ->where($map)->order("lft ASC,listorder DESC")->select();
//        echo $this->getLastSql();exit;
        $right = array();
        $items = array();
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
                $row["prefix"] = "│".str_repeat('━ ', $rightLength);
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


}