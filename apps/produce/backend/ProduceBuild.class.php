<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/16/14
 * Time: 13:23
 */

class ProduceBuild extends CommonBuildAction {

    protected $workflows = array(
        "producePlan" => array(
            "workflow_file" => "ProducePlan",
            "name" => "生产计划工作流",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建生产计划",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "MakeBoms,DoCraft,MakeStockin",
                    "status_text" => "新生产计划"
                ),
                "MakeBoms" => array(
                    "name" => "生成物料清单",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "MakeStockout",
                    "status_text" => "已生成物料清单"
                ),
                "MakeStockout" => array(
                    "name" => "生成出库单",
                    "type" => 1,
                    "listorder" => 2,
                    "prev_node_id" => "MakeBoms,MakePurchase",
                    "next_node_id" => "DoCraft,MakeStockin,MakePurchase",
                    "status_text" => "物料已出库"
                ),
                "MakePurchase" => array(
                    "name" => "生成物料采购单",
                    "type" => 1,
                    "listorder" => 2,
                    "prev_node_id" => "MakeStockout,DoCraft",
                    "next_node_id" => "MakeStockout,DoCraft,MakeStockin"
                ),
                "DoCraft" => array(
                    "name" => "执行生产工艺",
                    "type" => 1,
                    "listorder" => 3,
                    "prev_node_id" => "StartProcess,MakeStockout",
                    "next_node_id" => "MakeStockin,MakeStockout,MakePurchase",
                    "status" => "生产进程中"
                ),
                "MakeStockin" => array(
                    "name" => "生成入库单",
                    "type" => 1,
                    "listorder" => 4,
                    "prev_node_id" => "MakePurchase,MakeStockout,DoCraft",
                    "next_node_id" => "CompleteProcess",
                    "status_text" => "成品正在入库"
                ),
                "CompleteProcess" => array(
                    "name" => "完成计划",
                    "type" => 3,
                    "listorder" => 5,
                    "prev_node_id" => "MakeStockin",
                    "next_node_id" => 0,
                    "status_text"  => "已完成"
                )
            )
        )
    );

    protected $authNodes = array(
        "produce.craft.*",
        "produce.goodscraft.*",
        "produce.docraft.read",
        "produce.docraft.edit",
        "produce.produceboms.*",
        "produce.produceplan.*",
        "produce.produceplandetail.read",
        "produce.producttpl.*",
        "produce.producttpldetail.*"
    );

} 