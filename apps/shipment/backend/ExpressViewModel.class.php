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
class ExpressViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "Express" => array("*", "_type"=>"left"),
        "Types" => array("name" => "express_type_label", "alias" => "expressTypeAlias", "_on"=>"Express.express_type=Types.id", "_type"=>"left")
    );

    public $searchFields = array(
        "from_name","from_company","from_address","from_phone","to_name","to_company","to_address","to_phone", "Types.name"
    );
    
}
