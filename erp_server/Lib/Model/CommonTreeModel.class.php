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
            $this->rollback();
            return false;
        }
        
        
        $this->commit();
        return $rs;
    }
    
    /**
     * 删除子节点
     */
    public function deleteNode($id) {
        //DELETE FROM category WHERE lft BETWEEN @myLeft AND @myRight;
        
        $node = $this->find($id);
        if(!$node) {
            return false;
        }
        //UPDATE nested_category SET rgt = rgt - @myWidth WHERE rgt > @myRight;
        //UPDATE nested_category SET lft = lft - @myWidth WHERE lft > @myRight;
        $width = $node["rgt"] - $node["lft"] + 1;
        $this->where(array(
            "lft" => array("GT", $node["rgt"])
        ))->setDec('lft',$width);
        $this->where(array(
            "rgt" => array("GT", $node["rgt"])
        ))->setDec('rgt',$width); 
        
        return $this->where(array(
            "lft" => array("EGT", $node['lft']),
            "rgt" => array("ELT", $node['rgt']) 
        ))->delete();
    }
    
    /**
     * 获取直属一级子节点
     */
    public function getChildren($parentid) {
        $map = array(
            "parentid"=> $parentid
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
        );
        $data = $this->where($map)->order("lft ASC,listorder DESC")->select();
//        echo $this->getLastSql();
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
    
    public function getTreeArray($pid, $perlimit=20) {
        $parent = $this->find($pid);
        $childs = $this->where(array(
            "parentid" => $pid
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
            "parentid" => array("in", implode(",", $cids))
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
    public function getNodePath($nodeid) {
//        SELECT name FROM tree WHERE lft < 4 AND rgt >; 5 ORDER BY lft ASC;
        $node = $this->find($nodeid);
        $map = array(
            "lft" => array("LT", $node["lft"]),
            "rgt" => array("EGT", $node["rgt"])
        );
        return $this->where($map)->order("lft ASC")->select();
    }
    
}

?>
