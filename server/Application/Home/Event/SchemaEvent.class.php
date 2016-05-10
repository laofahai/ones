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

        // service中包含返回数据结构方法
        $module_service = D(ucfirst($app).'/'.camelCase(I('get.table')));
        if(method_exists($module_service, 'get_schema')) {
            return $this->response(
                [
                    I('get.table') => $module_service->get_schema()
                ]
            );
        }

        $schemas = SchemaService::getSchemaByApp($app);
        if(!$schemas) {
            $ignore = ['__MACOS', '.', '..', '.DS_Store'];
            foreach(new \RecursiveDirectoryIterator(APP_PATH) as $app_dir_name) {
                $app_name = basename($app_dir_name);
                if(in_array($app_name, $ignore)) {
                    continue;

                }
                if(!is_dir($app_dir_name.'/Schema')) {
                    continue;
                }

                $schemas = SchemaService::getSchemaByApp(lcfirst($app_name));

                if($schemas) {
                    break;
                }

            }
        }

        $this->response($schemas);
        
    }
    
}