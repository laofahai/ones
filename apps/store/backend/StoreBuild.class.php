<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-8-8
 * Time: 10:46
 */

class StoreBuild extends CommonBuildAction {

    protected $workflows = array(
        "stockin" => array(
            "name"  => "入库工作流",
            "workflow_file" => "Stockin",
            "memo" => "",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建入库单",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "ConfirmStockin",
                    "status_text" => "新入库单"
                ),
                "ConfirmStockin" => array(
                    "name" => "确认入库",
                    "type" => 1,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => 0,
                    "status_text" => "已入库"
                )
            )
        ),

        "stockout" => array(
            "name" => "出库工作流",
            "workflow_file" => "Stockout",
            "memo" => "",

            "_rows" => array(
                "StartProcess" => array(
                    "name" => "新建出库单",
                    "type" => 1,
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id" => "ConfirmStockout,RejectStockout",
                    "status_text" => "新出库单"
                ),
                "ConfirmStockout" => array(
                    "name" => "确认出库",
                    "type" => 7,
                    "listorder" => 1,
                    "prev_node_id" => "StartProcess",
                    "next_node_id" => "MakeShipment,Complete",
                    "status_text" => "出库单已确认"
                ),
                "RejectStockout" => array(
                    "name" => "驳回出库",
                    "type" => 7,
                    "listorder" => 1,
                    "prev_node_id" => "startProcess",
                    "next_node_id" => 0,
                    "status_text" => "出库单已驳回"
                ),
                "MakeShipment" => array(
                    "name" => "生成出库单",
                    "type" => 1,
                    "listorder" => 2,
                    "prev_node_id" => "ConfirmStockout",
                    "next_node_id" => "Complete",
                    "status_text" => "待发货"
                ),
                "Complete" => array(
                    "name" => "完成出库",
                    "type" => 2,
                    "listorder" => 3,
                    "prev_node_id" => "ConfirmStockout,MakeShipment",
                    "next_node_id" => 0,
                    "status_text" => "已完成"
                )
            )
        )
    );

    /*
     * APP安装
     * **/
    public function appInstall($alias) {

        parent::appInstall($alias);

        if(!isModuleEnabled("workflow")) {
            $this->requireApp("workflow");
            return false;
        }

        if(!$this->appInsertWorkflow($this->workflows)) {
            $this->error("install failed while insert workflow.");
        }

        return true;
    }

    /*
     * APP卸载
     * **/
    public function appUninstall() {
        parent::appUninstall();
        $this->appDeleteWorkflow($this->workflows);
        return true;
    }

} 