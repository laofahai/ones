<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/14/14
 * Time: 16:31
 */

class PurchaseBuild extends CommonBuildAction {

    protected $workflows = array(
        "purchase" => array(
            "name" => "采购工作流",
            "workflow_file" => "Returns",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建采购单",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "SavePurchase",
                    "status_text" => "新采购单"
                ),
                "SavePurchase" => array(
                    "name" => "保存采购单",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "MakeStockin",
                    "status_text" => "采购单已保存"
                ),
                "MakeStockin" => array(
                    "name" => "生成入库单",
                    "type" => 1,
                    "listorder" => 2,
                    "prev_node_id" => "SaveReturnsPaper",
                    "next_node_id" => "CompleteProcess",
                    "status_text" => "已生成入库单"
                ),
                "CompleteProcess" => array(
                    "name" => "完成采购",
                    "type" => 3,
                    "listorder" => 3,
                    "prev_node_id" => "MakeStockin",
                    "next_node_id" => 0,
                    "status_text" => "已完成"
                ),
            )
        )
    );

} 