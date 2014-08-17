<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/13/14
 * Time: 15:36
 */

class SaleBuild extends CommonBuildAction {

    protected $workflows = array(
        "order" => array(
            "name" => "订单工作流",
            "workflow_file" => "Orders",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建订单",
                    "type" => 2,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "SaveOrder",
                    "status_text" => "新订单"
                ),
                "SaveOrder" => array(
                    "name" => "保存订单",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "RequireFinanceVerify",
                    "status_text" => "订单已保存"
                ),
                "RequireFinanceVerify" => array(
                    "name" => "申请财务审核",
                    "type" => 2,
                    "listorder" => 2,
                    "prev_node_id" => "SaveOrder",
                    "next_node_id" => "FinanceVerifySuccess",
                    "status_text"  => "已申请财务审核"
                ),
                "FinanceVerifySuccess" => array(
                    "name" => "财务审核通过",
                    "type" => 2,
                    "listorder" => 3,
                    "prev_node_id" => "RequireFinanceVerify",
                    "next_node_id" => "MakeStockoutPaper",
                    "status_text"  => "财务已审核"
                ),
                "FinanceVerifyFailed" => array(
                    "name" => "财务审核不通过",
                    "type" => 2,
                    "listorder" => 3,
                    "prev_node_id" => "RequireFinanceVerify",
                    "next_node_id" => "RequireFinanceVerify",
                    "status_text"  => "财务驳回"
                ),
                "MakeStockoutPaper" => array(
                    "name" => "生成出库单",
                    "type" => 1,
                    "listorder" => 4,
                    "prev_node_id" => "FinanceVerifySuccess",
                    "next_node_id" => "Complete",
                    "status_text" => "正在出库"
                ),
                "Complete" => array(
                    "name" => "完成订单",
                    "type" => 1,
                    "listorder" => 4,
                    "prev_node_id" => "MakeStockoutPaper",
                    "next_node_id" => 0,
                    "status_text" => "已完成"
                )
            )
        ),
        "return" => array(
            "name" => "销售退货",
            "workflow_file" => "Returns",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新退货单",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "SaveReturnsPaper",
                    "status_text" => "新退货单"
                ),
                "SaveReturnsPaper" => array(
                    "name" => "保存退货单",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "MakeStockin",
                    "status_text" => "退货单已保存"
                ),
                "MakeStockin" => array(
                    "name" => "生成入库单",
                    "type" => 1,
                    "listorder" => 2,
                    "prev_node_id" => "SaveReturnsPaper",
                    "next_node_id" => "CompleteProcess",
                    "status" => "入库单已生成，等待入库"
                ),
                "CompleteProcess" => array(
                    "name" => "完成退货",
                    "type" => 1,
                    "listorder" =>3,
                    "prev_node_id" => "MakeStockin",
                    "next_node_id" => 0,
                    "status_text" => "已完成"
                )
            )
        )
    );
} 