<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 8/15/15
 * Time: 09:29
 */

/*
 * 生成包含商品属性ID的唯一编号
 * */
function generate_product_unique_id($row, $attribute_fields) {
    $product_unique_id = [$row['product_id']];
    foreach($attribute_fields as $attr) {
        array_push($product_unique_id, sprintf('%d_%d', $attr['id'], $row[$attr['alias']]));
    }

    return implode('|', $product_unique_id);
}