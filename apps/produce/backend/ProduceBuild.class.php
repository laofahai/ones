<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/16/14
 * Time: 13:23
 */

class ProduceBuild extends CommonBuildAction {

    protected $workflows = array(
        "produce" => array(
            "workflow_file" => "Produce",
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
                    "prev_node_id" => "MakeBoms",
                    "next_node_id" => "DoCraft,MakeStockin",
                    "status_text" => "已出库"
                ),
                "DoCraft" => array(
                    "name" => "执行生产工艺",
                    "type" => 1,
                    "listorder" => 3,
                    "prev_node_id" => "StartProcess,MakeStockout",
                    "next_node_id" => "MakeStockin",
                    "status" => "生产进程中"
                ),
                "MakeStockin" => array(
                    "name" => "完成计划",
                    "type" => 1,
                    "listorder" => 4,
                    "prev_node_id" => "StartProcess,DoCraft",
                    "next_node_id" => "CompleteProcess",
                    "status_text" => "已入库"
                ),
                "CompleteProcess" => array(
                    "name" => "完成计划",
                    "type" => 2,
                    "listorder" => 5,
                    "prev_node_id" => "MakeStockin",
                    "next_node_id" => 0,
                    "status_text"  => "已完成"
                )
            )
        )
    );

} 