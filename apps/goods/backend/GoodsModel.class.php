<?php

/**
 * @filename GoodsViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-12  17:16:27
 * @Description
 * 
 * CREATE VIEW x_goods_view AS 
 *  SELECT g.*,gc.name AS goods_category_name,go.id AS color_id,go.name as color_name
 *  gs.id as standard_id, gs.name as standard_name
 *  FROM x_goods g
 *  x_goods_category gc
 *  x_goods_color go
 *  x_goods_standard gs
 *  WHERE gc.id = g.goods_category_id
 *  
 */
class GoodsModel extends CommonModel {

    public $searchFields = array(
        "factory_code", "name", "pinyin"
    );
    
}
