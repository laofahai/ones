<?php

/**
 * @filename RelationshipCompanyLinkmanModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-14  15:59:26
 * @Description
 * 
 */
class RelationshipCompanyLinkmanModel extends CommonModel {

    public function select($options = array()) {

        $data = parent::select($options);

        foreach($data as $k=>$v) {
            $data[$k]["is_primary_label"];
        }
        return $data;

    }

}

?>
