<?php

/**
 * @filename DepartmentModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
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

