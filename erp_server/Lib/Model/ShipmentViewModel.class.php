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
        "Shipment" => array("*", "_type"=>"left"),
        "Types" => array("name" => "shipment_type_label", "alias" => "shipmentTypeAlias", "_on"=>"Shipment.shipment_type=Types.id", "_type"=>"left")
    );
    
}
