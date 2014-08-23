<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/15/14
 * Time: 16:02
 */

class FinanceBuild extends CommonBuildAction {

    protected $workflows = array(
        "financeReceive" => array(
            "workflow_file" => "FinanceReceive",
            "name" => "财务收款计划",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建收款计划",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "CompleteProcess",
                    "status_text" => "新收款计划"
                ),
                "CompleteProcess" => array(
                    "name" => "确认收款",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => 0,
                    "status_text" => "已收款"
                )
            )
        ),
        "financePay" => array(
            "workflow_file" => "FinancePay",
            "name" => "财务付款计划",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建付款计划",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "SubmitToCommander",
                    "status_text" => "新付款计划"
                ),
                "CompleteProcess" => array(
                    "name" => "确认收款",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "VerifySuccess,VerifyFailed",
                    "status_text" => "已收款"
                )
            )
        )
    );


    protected $authNodes = array(
        "finance.financeaccount.*",
        "finance.financepayplan.*",
        "finance.financereceiveplan.*",
        "finance.financerecord.*"
    );

} 