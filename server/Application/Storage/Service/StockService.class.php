<?php

namespace Storage\Service;
use Common\Model\CommonModel;
use Home\Service\AppService;

/*
 * 库存模型接口
 * */
class StockService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 库存数量操作接口
     * @param integer $direction 1出，2入
     * @param $rows = [ // source_row
     *  product_id, quantity, storage_id, product_unique_id ...
     * ]
     *
     * */
    public function change_quantity($direction, $rows) {

        $exists_map = [
            'product_unique_id' => ['IN', get_array_by_field($rows, 'product_unique_id')],
            'storage_id' => ['IN' ,get_array_by_field($rows, 'storage_id')]
        ];
        $exists = $this->where($exists_map)->select();

        $exists_keys = [];
        foreach($exists as $v) {
            array_push($exists_keys, sprintf('%s.%s', $v['storage_id'], $v['product_unique_id']));
        }

        foreach($rows as $row) {
            $item_key = sprintf('%s.%s', $row['storage_id'], $row['product_unique_id']);
            if(in_array($item_key, $exists_keys)) {
                $map = [
                    'product_unique_id' => $row['product_unique_id'],
                    'storage_id' => $row['storage_id']
                ];
                $method = $direction === '+' ? 'setInc' : 'setDec';
                $this->where($map)->$method('balance', $row['quantity']);
            } else {
                $data = [
                    'balance' => $row['quantity'],
                    'product_id' => $row['product_id'],
                    'product_unique_id' => $row['product_unique_id'],
                    'storage_id' => $row['storage_id']
                ];
                if(false === $this->create($data)) {
                    return false;
                }
                if(!$this->add()) {
                    return false;
                }
            }
        }

        return true;

    }

    /*
     * 获取某产品的库存余量
     * 前端录入时EVENT方法
     * */
    public function get_quantity_by_product($row_data) {

        $quantity_balance = 0;

        if($row_data['product_unique_id']) {
            $product_unique_id = $row_data['product_unique_id'];
        } else {
            if(AppService::is_app_active('productAttribute')) {
                $attribute_fields = D('ProductAttribute/ProductAttribute')->get_attribute_fields();
                $product_unique_id = generate_product_unique_id($row_data, $attribute_fields);
            } else if($row_data['product_id']) {
                $product_unique_id = $row_data['product_id'];
            }
        }

        if(!$product_unique_id) {
            return $quantity_balance;
        }

        $map = [
            'product_unique_id' => $product_unique_id
        ];

        // 指定仓库
        if($row_data['storage_id']) {
            $map['storage_id'] = $row_data['storage_id'];
        }

        $raw_data = $this->where($map)->select();

        foreach($raw_data as $v) {
            $quantity_balance += $v['balance'];
        }

        return round((string)$quantity_balance, DBC('decimal_scale'));
    }

}