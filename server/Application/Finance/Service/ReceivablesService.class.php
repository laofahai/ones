<?php

/*
 * @app Finance
 * @package Finance.service.Receivables
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Finance\Service;
use Common\Model\CommonModel;

class ReceivablesService extends CommonModel {

    protected $_auto = [
        ["user_info_id", "get_current_user_id", 1, "function"],
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 「工作流」 确认收款
     *
     * @todo 错误处理
     * */
    public function confirm($id, $current_node) {
        if(!I('get.workflow_submit')) {
            return [
                'pause' => 'true',
                'type'=> 'redirect',
                'url' => '/finance/receivables/confirm/' . $id . '/node/' . $current_node['id']
            ];
        }

        if(!I('post.amount')) {
            $this->error = __('common.Please fill out the form correctly');
            return false;
        }

        $this->exec_remark = trim(strip_tags(I('post.remark')));

        // 更新记录
        $this->where(['id'=>$id])->setInc('received', I('post.amount'));

        // 更新账户余额
        D('Finance/FinanceAccount')->update_balance(I('post.account_id'), I('post.amount'));

        // 写流水日志
        D('Finance/FinanceStreamline')->record([
            'direction' => 1,
            'amount'    => I('post.amount'),
            'source_id' => $id,
            'finance_account_id' => I('post.account_id'),
            'remark' => I('post.remark'),
            'payment_method' => I('post.payment_method')
        ]);
    }

    /*
     * 「工作流」 检测是否已完全收款
     * */
    public function check_full_received($id) {
        $data = $this->where(['id'=>$id])->find();

        if(!$data) {
            return false;
        }

        return $data['received'] >= $data['amount'] ? true : false;
    }

    /*
     * [工作流] 通知外部等待响应节点
     * */
    public function response_to_outside() {}

    public function make_bill($data) {

        auto_make_bill_subject($data);

        $this->create($data);
        return $this->add();
    }

}