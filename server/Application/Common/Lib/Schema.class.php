<?php

namespace Common\Lib;

use Home\Service\SchemaService;

class Schema {

    /*
     * 解析schema供前端使用，包含数据模型字段
     * @param Array $schemas 
     * @param String|Array $tables
     * @return Array
     * **/
    static public function parse($app, $schemas, $tables="all", $exclude_meta=false) {
        $result = array();
        foreach($schemas as $table=>$schema) {

            if(!$table) {
                continue;
            }

            if($tables !== "all" && !in_array($table, $tables)) {
                continue;
            }
            
            $fields = array();
            $ignore = array('$meta', 'company', '_trashed', '_rate');
            foreach($schema as $field => $option) {
                if(in_array($field, $ignore)) {
                    continue;
                }

                $fields[$field] = self::deal_with_field_config($field, (array)$option);
            }

            $meta = $schema['$meta'];
            $meta['list_display'] = array();

            // 处理foreignKey
            foreach($meta["foreign"] as $foreign_table => $foreign_option) {
                if(is_numeric($foreign_table) && !is_array($foreign_option)) {
                    $foreign_table = $foreign_option;
                    $foreign_option = [
                        'restrict' => [
                            "delete" => "CASCADE"
                        ]
                    ];
                }
                $foreign_field = $foreign_option['foreign_key'] ? $foreign_option['foreign_key'] : $foreign_table.'_id';
                $fields[$foreign_table] = array(
                    "map" => $foreign_field,
                    "field"=> $foreign_field,
                    "type" => "foreign",
                    "data_source" => $foreign_table
                );
            }

//            print_r($fields);exit;

            /*
             * 数据模型字段
             * 会覆盖默认数据表中数据
             * */
            $data_model_service = D("DataModel/DataModelField", "Service");
            $module = sprintf('%s.%s', lcfirst($app), lcfirst(camelCase($table)));

            $extra_fields = $data_model_service->get_fields_by_module($module);
            $efs = array();
            foreach($extra_fields as $ef) {
//                $fields[$ef['alias']] = array(
//                    'label' => $ef['label'],
//                    'type'  => $ef['data_type'],
//                    'widget'=> $ef['widget'],
//                    'value' => $ef['default'],
//                    'limit' => $ef['limit'],
//                    'blank' => $ef['blank']
//                );
                $efs[] = $ef['id'];
                $fields[$field] = self::deal_with_field_config($ef['alias'], (array)$ef);

                //list_display
                if($ef['list_display']) {
                    $meta['list_display'][] = $ef['alias'];
                }
            }

            if($efs) {
                $fields['_data_model_fields_'] = array(
                    'field' => "_data_model_fields_",
                    'widget' => 'hidden',
                    'type'   => 'hidden',
                    'value'=> implode(',', $efs),
                    'required' => false
                );
            }


            $result[$table] = $meta;
            $result[$table]["structure"] = reIndex($fields);
            
        }

        return $result;
        
    }
    
    /*
     * 数据类型转换
     * @param $data 需转换的数组
     * @param $model 模型对象
     * @param $is_table $model参数是否为表名
     * **/
    static public function data_format($data, $model, $is_table=false, $app=MODULE_NAME) {
        if(!$model && !$is_table) {
            return $data;
        }

        if(!$is_table) {
            $table = $model->getProperty('tableName') ? $model->getProperty('tableName') : array_shift(explode(' ', $model->getTableName()));
        } else {
            $table = $model;
        }

        $module_service_name = ucfirst($app).'/'.camelCase($table);
        $module_service = D($module_service_name);
        if(method_exists($module_service, 'get_schema')) {
            $schemas = $module_service->get_schema();
            $schema = get_array_to_ka($schemas['structure'], 'field');
        } else {
            $schemas = SchemaService::getSchemaByTable($table);
            $schema = get_array_to_ka($schemas['structure'], 'field');
        }
        $is_single = is_assoc($data);

        // 单条数据
        if($is_single) {
            $data = [$data];
        }

        foreach($data as $k=>$item) {

            foreach($item as $field=>$value) {

                if($field === "id") {
                    $data[$k][$field] = (int)$value;
                    continue;
                }

                $is_exists = array_key_exists($field, $schema); // 数据表结构中包含字段

                if($is_exists) {
                    $structure = $schema[$field];
                    $data[$k][$field] = self::data_field_format($value, $structure['type']);
                }
            }
        }

        return $is_single ? $data[0] : $data;
    }

    /*
     * 字段数据格式化
     * @param $value 值
     * @param $type 类型
     * @param $is_foreign_exists
     * */
    static public function data_field_format($value, $type) {
        $scale = DBC('decimal_scale') ? DBC('decimal_scale') : 2;
        switch($type) {
            case "integer":
                $value = (string)$value;
                $value = (int)$value;
                break;
            case "foreign":
                $value && $value = (int)$value;
                break;
            case "money":
            case "float":
            case "decimal":
                $value = (string)$value;
                $value = round($value, $scale);
                break;
            case "boolean":
                $value = (boolean)$value ? 1 : 0;
                break;
            case "enum":
                $value = (string)$value;
                if(is_numeric($value)) {
                    $value = (int)$value;
                }
                break;
            case "date":
                $value = date('Y-m-d', strtotime($value));
                break;
        }

        return $value;
    }

    /*
     * 处理表字段配置 =》 前端配置
     * */
    static private function deal_with_field_config($field, $option) {
        $result = array(
            "field" => $field,
        );

        foreach($option as $k=>$v) {
            $result[$k] = $v;
        }

        // required
        if($option['blank'] || false === $option['required']) {
            $result['required'] = false;
        }

        if($option['data_type']) {
            $result['type'] = $option['data_type'];
        }

        // 类型widget
        if(!$result['widget']) {
            switch($result['type']) {
                case "text":
                    $result['widget'] = 'textarea';
                    break;
                case "string":
                    $result['widget'] = 'text';
                    break;
                case "date":
                    $result['widget'] = 'date';
                    break;
                case "datetime":
                    $result['widget'] = 'datetime';
                    break;
                case "boolean":
                    $result['widget'] = 'select';
                    break;
            }
        }

        return $result;
    }
    
}