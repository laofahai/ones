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
            "StartProcess" => array(
                "name" => "新建入库单",
                "type" => 1,
                "listorder" => 0,
                "prev_node_id" => 0,
                "next_node_id" => "ComfirmStockin",
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
        ),

        "stockout" => array(
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
            "MakeShipment"
        )
    );

    /*
     * APP安装
     * **/
    public function appInstall($alias) {

        parent::appInstall($alias);

        if(!isModuleEnabled("workflow")) {
            $this->error("this app require workflow app installed");
            return false;
        }

//        INSERT INTO `x_workflow_node` (`id`, `workflow_id`, `name`, `type`, `execute_file`, `listorder`, `prev_node_id`, `next_node_id`, `executor`, `cond`, `default`, `execute_type`, `remind`, `max_time`, `status_text`, `memo`, `btn_class`, `status_class`) VALUES
//        (11, 2, '新建入库单', 1, 'StartProcess', 0, '0', '13', 'g:1,2,9,10', NULL, 0, 0, 0, 0, '新入库单', NULL, 'success', 'normal'),
//        (13, 2, '确认入库', 1, 'ConfirmStockin', 3, '11', '0', 'g:1,2,9,10', 'method=checkStockManger', 0, 0, 0, 0, '已入库', '123', 'success', 'success'),
//        (22, 4, '确认出库', 7, 'ConfirmStockout', 1, '21', '24,27', 'g:1,2,9,10|d:5|u:6', NULL, 1, 0, 0, 0, '已确认待发货', NULL, 'primary', 'info'),
//        (21, 4, '新建出库单', 1, 'StartProcess', 0, '0', '22,23', 'g:1', NULL, 0, 0, 0, 0, '新出库单', NULL, 'success', 'normal'),
//        (23, 4, '驳回出库单', 7, 'RejectStockout', 1, '21', '0', 'g:1,2,9,10|d:5,8|u:6', NULL, 0, 0, 0, 0, '出库单已驳回', NULL, 'danger', 'normal'),
//        (24, 4, '生成发货单', 1, 'MakeShipment', 2, '22', '25', 'g:1,2,9,10', NULL, 0, 0, 0, 0, '发货单已生成', NULL, 'success', 'info'),
//        (25, 4, '确认发货', 1, 'ConfirmShipment', 3, '24', '27', 'g:1,2,9,10', NULL, 0, 0, 0, 0, '已发货', NULL, 'success', 'success'),
//        (27, 4, '完成出库', 2, 'Complete', 5, '22,25', '0', 'g:1,2,9,10', NULL, 0, 0, 0, 0, '出库已完成', NULL, 'success', 'success');

        $workflows = array(
            "stockin" => array(
                array(
                    "name" => "新建入库单",
                    "type" => 1,
                    "execute_file" => "StartProcess",
                    "listorder" => 0,
                    "prev_node_id" => 0,
                    "next_node_id"
                )
            ),
            "stockout" => array(

            )
        );

        $model = D('Workflow');
        $workflow = $model->getByAlias("stockin");

        $workflowNodes = array();

    }

    /*
     * APP卸载
     * **/
    public function appUninstall() {
        parent::appUninstall();
    }

} 