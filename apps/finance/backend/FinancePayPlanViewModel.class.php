<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/16/14
 * Time: 10:54
 */

class FinancePayPlanViewModel extends CommonViewModel {

    public $workflowAlias = "financePay";

    protected $viewFields = array(
        "FinancePayPlan" => array("*", "_type"=>"left"),
        "Types" => array("name"=>"type", "_on"=>"FinancePayPlan.type_id=Types.id", "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"supplier_name_label", "_on"=>"FinancePayPlan.supplier_id=RelationshipCompany.id", "_type"=>"left")
    );

    public $searchFields = array(
        "FinanceAccount.name", "Types.name", "RelationshipCompany.name"
    );

    public function select($options=array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }

        foreach($data as $k=>$v) {
            $data[$k]["sponsor"] = toTruename($v["user_id"]);
            $data[$k]["financer"] = toTruename($v["financer_id"]);
        }

        return $data;
    }

} 