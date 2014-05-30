<?php

/**
 * @filename ShipmentViewModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-6  13:48:36
 * @Description
 * 
 */
class ShipmentViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "Shipment" => array("id","stockout_id","shipment_type","from_name","from_company","from_address","from_phone","to_name", "to_company", "to_address", "to_phone", "freight_type", "freight", "weight", "total_num"),
        "Types" => array("name" => "shipmentTypeName", "alias" => "shipmentTypeAlias", "_on"=>"Shipment.shipment_type=Types.id")
    );
    
}

?>
