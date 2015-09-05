<?php

/*
 * @app Supplier
 * @package Supplier.controller.Supplier
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
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
            $_POST['head_id'] = $_POST['head_id'][0];
        }
    }

    protected function _before_update() {
        $this->_before_insert();
    }

    public function on_post() {
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

    public function on_put() {}
}