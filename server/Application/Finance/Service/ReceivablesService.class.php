<?php

/*
 * @app Finance
 * @package Finance.service.Receivables
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class ReceivablesService extends CommonModel {

    protected $_auto = [
        ["user_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 「工作流」 确认收款
     * */
    public function confirm($id, $current_node) {
        if(!I('get.workflow_submit')) {
            return [
                'pause' => 'true',
                'type'=> 'redirect',
                'url' => '/finance/receivables/confirm/' . $id . '/node/' . $current_node['id']
            ];
        }
    }

    /*
     * 「工作流」 检测是否已完全收款
     * */
    public function check_full_received($id) {
        $data = $this->where(['id'=>$id])->find();
        if(!$data) {
            return false;
        }

        return $data['amount'] >= $data['received'];
    }

}