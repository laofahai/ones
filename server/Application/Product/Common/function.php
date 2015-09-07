<?php

/*
 * 生成包含商品属性ID的唯一编号
 * 产品ID|属性ID_属性值ID|属性2ID_属性值2ID
 * */
function generate_product_unique_id($row, $attribute_fields=[]) {

    if(!$attribute_fields) {
        $attribute_fields = D('ProductAttribute/ProductAttribute')->get_attribute_fields();
    }

    $product_unique_id = [$row['product_id']];
    foreach($attribute_fields as $attr) {
        array_push($product_unique_id, sprintf('%d_%d', $attr['id'], $row[$attr['alias']]));
    }

    return implode('|', $product_unique_id);
}
