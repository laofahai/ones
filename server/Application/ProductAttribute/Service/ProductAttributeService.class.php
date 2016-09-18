<?php

/*
 * @app Productattribute
 * @package Productattribute.service.ProductAttribute
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Productattribute\Service;
use Common\Model\CommonModel;
use Home\Service\AppService;

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

        if(!$source_model) {
            return $this->assign_to_by_product_unique($rows);
        }

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

    /*
     * 根据产品唯一ID
     * */
    public function assign_to_by_product_unique($rows) {
        if(!AppService::is_app_active('productAttribute')) {
            return [];
        }

        $attr_content_ids = [];
        foreach($rows as $k=>$row) {
            $unique_id = $row['product_unique_id'];
            if(!$unique_id) {
                continue;
            }
            $tmp = explode('|', $unique_id);

            $rows[$k]['attribute_content_ids'] = [];

            foreach($tmp as $attr) {
                list($attr_id, $attr_content_id) = explode('_', $attr);
                array_push($attr_content_ids, $attr_content_id);
                array_push($rows[$k]['attribute_content_ids'], $attr_content_id);
            }
        }

        if(!$attr_content_ids) {
            return $rows;
        }

        $attribute_contents = D('ProductAttribute/ProductAttributeContent', 'Model')->where([
            'id' => ['IN', $attr_content_ids]
        ])->select();
        $attribute_contents = get_array_to_ka($attribute_contents, 'id');

        foreach($rows as $k=>$row) {
            foreach($row['attribute_content_ids'] as $ac_id) {
                if(array_key_exists($ac_id, $attribute_contents)) {
                    $attribute_field = $attribute_contents[$ac_id]['alias'];
                    $attribute_value = $attribute_contents[$ac_id]['content'];
                    $rows[$k][$attribute_field] = $attribute_value;
                }
            }
        }

        return $rows;
    }

}