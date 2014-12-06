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
            "relation_table" => "auth_group_access"
        ),
        "Department" => BELONGS_TO
    );
    
    public $searchFields = array(
        "username", "truename", "email", "phone"
    );

    public function __construct() {
        $this->_link['AuthGroup']["relation_table"] = C("DB_PREFIX").$this->_link['AuthGroup']["relation_table"];
        parent::__construct();
    }
    
     /**
     * @override
     */
    public function select($options = array()) {
        $data = parent::select($options);
        
        foreach($data as $k=>$v) {
            unset($data[$k]["password"]);
            if($v["groups"]) {
                foreach($v["groups"] as $ag) {
                    $data[$k]["usergroup"][] = $ag["title"];
                    $data[$k]["group_ids"][] = $ag["id"];
                }
                $data[$k]["group_ids"] = implode(",",$data[$k]["group_ids"]);
                $data[$k]["usergroup"] = implode(", ", $data[$k]["usergroup"]);
            }
        }
        return $data;
    }
    
    public function find($options = array()){
        $data = parent::find($options);
        if(!$data) {
            return $data;
        }
        
        if($data["groups"]) {
            foreach($data["groups"] as $k=> $g) {
                $data["usergroup"][] = $g["id"];
            }
            $data["usergroup"] = implode(",", $data["usergroup"]);
        }
        return $data;
    }

    public function getFullUserInfo($value, $field="id") {
        switch($field) {
            case "id":
                $method = "find";
                break;
            case "username":
                $method = "getByUsername";
                break;
            case "email":
                $method = "getByEmail";
                break;
        }
        $theUser = $this->relation(true)->$method($value);
        if(!$theUser) {
            return false;
        }

        foreach($theUser["groups"] as $g) {
            $theUser["group_ids"][] = $g["id"];
            $theUser["group_labels"][] = $g["title"];
        }

        $tmp = D("Department")->getNodePath($theUser["department_id"]);
        foreach($tmp as $d) {
            $departmentPath[] = $d["name"];
        }
//            print_r($departmentPath);exit;

        $theUser["Department"]["path"] = implode(" > ", $departmentPath);

        return $theUser;
//            print_r($theUser);exit;
    }
    
}