<?php

/*
 * @app Supplier
 * @package Supplier.controller.Supplier
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Supplier\Controller;
use Common\Controller\BaseRestController;

class SupplierController extends BaseRestController {

    protected function _filter(&$map) {
        // X级以上
        if($map['gt_level']) {
            $map['supplier.level'] = ['EGT', $map['gt_level']];
            unset($map['gt_level']);
        }

        // 仅查询产品供应商
        // @todo
        if($map['product_id']) {
            unset($map['product_id']);
        }
    }

    protected function _before_insert() {
        if(!$_POST['head_id']) {
            unset($_POST['head_id']);
        } else {
            $_POST['head_id'] = process_with_item_select_ids('head_id');
        }
    }

    protected function _before_update() {
        $this->_before_insert();
    }

    public function on_post() {
        $this->_before_insert();
        $contacts_company_model = D('ContactsCompany/ContactsCompany');
        if(!$contacts_company_model->create(I('post.'))) {
            return $this->error($contacts_company_model->getError());
        }

        $id = $contacts_company_model->add();
        if(!$id) {
            return $this->error($contacts_company_model->getError());
        }

        $data = [
            'contacts_company_id' => $id,
            'level' => I('post.level'),
            'head_id' => I('post.head_id')
        ];

        $supplier_model = D('Supplier/Supplier');
        if(!$supplier_model->create($data)) {
            return $this->error($supplier_model->getError());
        }

        if(!$supplier_model->add()) {
            return $this->error($supplier_model->getError());
        }
    }

    public function on_put() {
        $this->_before_update();

        $supplier_model = D('Supplier/Supplier');

        $save_data = [
            'remark' => I('post.remark'),
            'level' => I('post.level')
        ];
        if(I('post.head_id')) {
            $save_data['head_id'] = I('post.head_id');
        }

        $supplier_model->create($save_data);
        $supplier_model->where([
            'id' => I('get.id')
        ])->save();

        $supplier = $supplier_model->where(['id'=>I('get.id')])->find();
        $contacts_company_model = D('ContactsCompany/ContactsCompany');
        $contacts_company_model->create(I('post.'));
        $contacts_company_model->where([
            "id" => $supplier['contacts_company_id']
        ])->save();
    }
}