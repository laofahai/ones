<?php

/*
 * @app Productattribute
 * @package Productattribute.service.ProductAttribute
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Productattribute\Service;
use Common\Model\CommonModel;

class ProductAttributeService extends CommonModel {

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 从一行数据中提取属于产品属性的字段
     * @return array
     * */
    public function get_attribute_fields() {
        $map = [];
        return $this->where($map)->select();
    }

    /*
     * 为rows赋予产品属性字段值
     * @param array $rows 源rows数据
     * @param string $source_model 源数据来源模型
     * @return array
     * */
    public function assign_to($rows, $source_model) {
        $row_ids = get_array_by_field($rows, 'id');

        $map = [
            'source_id' => ['IN', $row_ids],
            'source_model' => $source_model
        ];

        $map_model = D('ProductAttribute/ProductAttributeMap', 'Model');
        $mapping = $map_model->where($map)->select();
        $mapping = get_array_to_ka($mapping, 'source_id');

        foreach($rows as $k=>$row) {
            if(array_key_exists($row['id'], $mapping)) {
                $field = $mapping[$row['id']]['attribute_field'];
                $rows[$k][$field] = $mapping[$row['id']]['product_attribute_content_id'];
                $rows[$k][$field.'__label__'] = $mapping[$row['id']]['content'];
            }
        }
        return $rows;
    }

}