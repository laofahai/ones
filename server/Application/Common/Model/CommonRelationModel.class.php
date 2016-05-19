<?php
namespace Common\Model;
use \Think\Model\RelationModel;

class CommonRelationModel extends RelationModel {

    public $real_model_name;

    public $not_belongs_to_company = false;

    public function getProperty($name) {
        return $this->$name;
    }

    /*
     * @override
     *
     * 默认增加company_id字段
     * */
    public function where($map, $parse=null) {
        if(!$this->not_belongs_to_company) {

            $this->real_model_name = $this->real_model_name ? $this->real_model_name : $this->getModelName();

            $map[$this->real_model_name.".company_id"] = get_current_company_id();
        }

        return parent::where($map, $parse);
    }

    public function set($k, $v) {
        $this->$k = $v;
    }

    public function get($k) {
        return $this->$k;
    }

}