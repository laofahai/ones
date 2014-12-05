<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/16/14
 * Time: 10:54
 */

class FinanceReceivePlanViewModel extends CommonViewModel {

    public $workflowAlias = "financeReceive";

    protected $viewFields = array(
        "FinanceReceivePlan" => array("*", "_type"=>"left"),
        "Types" => array("name"=>"type", "_on"=>"FinanceReceivePlan.type_id=Types.id", "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"customer_name_label", "_on"=>"FinanceReceivePlan.customer_id=RelationshipCompany.id", "_type"=>"left")
    );

    public $searchFields = array(
        "FinanceAccount.name", "Types.name", "RelationshipCompany.name"
    );

    public $orderFields = array(
        "status"
    );

} 