<?php

/**
 * @filename WorkflowNodeModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
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
