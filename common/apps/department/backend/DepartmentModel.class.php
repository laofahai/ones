<?php

/**
 * @filename DepartmentModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:27:53
 * @Description
 * 
 */
class DepartmentModel extends CommonTreeModel {


    public function getUsers($depIds, $includeSub=true) {
        $model = D("User");

        if($includeSub) {
            foreach($depIds as $id) {
                $deps = $this->getTree($id);
                foreach($deps as $dep) {
                    $depIds[] = $dep["id"];
                }
            }
        }

        $map = array(
            "department_id" => array("IN", $depIds)
        );

        return $model->where($map)->select();
    }

}

