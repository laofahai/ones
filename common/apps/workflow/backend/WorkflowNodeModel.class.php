<?php

/**
 * @filename WorkflowNodeModel.class.php 
 * @encoding UTF-8 
 * @author 闫志鹏 <a href="mailto:dk_nemo@163.com">dk_nemo@163.com</a>
 *
 *
 * @datetime 2013-11-16  17:27:42
 * @Description
 * 
 */
class WorkflowNodeModel extends CommonModel {

    public function find($options) {
        $data = parent::find($options);
        $executor = explode("|", $data["executor"]);
        foreach($executor as $v) {
            list($role, $ids) = explode(":", $v);
            switch($role) {
                case "g":
                    $data["executor_group"] = explode(",", $ids);
                    break;
                case "d":
                    $data["executor_department"] = explode(",", $ids);
                    break;
                case "u":
                    $data["executor_user"] = explode(",", $ids);
                    break;
            }
        }

        return $data;
    }

}
