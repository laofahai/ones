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
                    "next_node_id" => "ConfirmReceive",
                    "status_text" => "新收款计划"
                ),
                "ConfirmReceive" => array(
                    "name" => "确认收款",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess,ConfirmReceive",
                    "next_node_id" => "ConfirmReceive,CompleteProcess",
                    "status_text" => "已收款",
                    "max_times" => 9999
                ),
                "CompleteProcess" => array(
                    "name" => "完成收款",
                    "type" => 2,
                    "listorder" => 2,
                    "prev_node_id" => "ConfirmReceive",
                    "next_node_id" => "",
                    "status_text" => "已收款",
                    "cond" => "m:checkAllReceived"
                ),
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
                    "next_node_id" => "ConfirmPay",
                    "status_text" => "新付款计划"
                ),
                "ConfirmPay" => array(
                    "name" => "确认付款",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess,ConfirmPay",
                    "next_node_id" => "ConfirmPay,CompleteProcess",
                    "status_text" => "已付款",
                    "max_times" => 9999
                ),
                "CompleteProcess" => array(
                    "name" => "完成付款",
                    "type" => 2,
                    "listorder" => 2,
                    "prev_node_id" => "ConfirmPay",
                    "next_node_id" => 0,
                    "status_text" => "已付清",
                    "max_times" => 1,
                    "cond" => "m:checkAllPayed"
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