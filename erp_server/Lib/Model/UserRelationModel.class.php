<?php

/**
 * @filename UserRelationModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:47:15
 * @Description
 * 
 */
class UserRelationModel extends RelationModel {
    
    protected $tableName = "User";
    
    protected $_link = array(
        "AuthGroup" => array(
            "mapping_type" => MANY_TO_MANY,
            "class_name" => "AuthGroup",
            "mapping_name" => "groups",
            "foreign_key" => "uid",
            "relation_foreign_key" => "group_id",
            "relation_table" => "x_auth_group_access"
        ),
        "Department" => BELONGS_TO
    );
    
    protected $status_lang = array(
        "blocked", "normal"
    );
    
    protected $status_class = array(
        "", "success"
    );
    
     /**
     * @override
     */
    public function select($options = array()) {
        $data = parent::select($options);
        $_datas = array();
        foreach($data as $k=>$v) {
            $data[$k]["status_lang"] = $this->status_lang[$v["status"]];
            $data[$k]["status_class"] = $this->status_class[$v["status"]];
        }
        
        return $data;
    }
    
}

?>
