<?php

namespace Home\Event;
use Common\Event\BaseRestEvent;
use Home\Service\SchemaService;

class SchemaEvent extends BaseRestEvent {

    protected $not_belongs_to_company = true;
    
    /*
     * 获取应用数据结构
     * @todo 缓存
     * **/
    public function on_list() {
        $app = I("get.app");
        
        $schemas = SchemaService::getSchemaByApp($app);

        $this->response($schemas);
        
    }
    
}