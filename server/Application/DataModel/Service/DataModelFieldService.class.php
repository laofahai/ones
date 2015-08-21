<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/25/15
 * Time: 19:34
 */

namespace DataModel\Service;
use Common\Model\CommonModel;

class DataModelFieldService extends CommonModel {

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];

    /*
     * 根据模块获取扩展字段
     * */
    public function get_fields_by_module($module, $map = array()) {
        $map['belongs_to_module'] = $module;
        $fields = $this->where($map)->select();

        foreach($fields as $k=>$v) {
            $fields[$k] = array_merge($v, self::parse_field_config($v['config']));
            $fields[$k]['search_able'] = (int)$fields[$k]['search_able'];
        }



        return $fields;
    }

    /*
     * 解析扩展字段的扩展配置
     * 扩展配置eg:
     *  name: value
     * */
    static public function parse_field_config($configs) {

        $configs = explode("\n", $configs);
        $return = array();
        foreach($configs as $config) {
            $tmp = explode(":", $config);
            $k = trim(array_shift($tmp));
            $v = trim(implode(":", $tmp));

            // boolean
            switch($v) {
                case "false":
                    $v = false;
                    break;
                case "true":
                    $v = true;
                    break;
            }

            // array or object, try json decode
            $tmp = json_decode(str_replace("'", "\"", $v));
            if(null !== $tmp && false !== $tmp) {
                $return[$k] = $tmp;
            } else {
                $return[$k] = $v;
            }
        }

        foreach($return as $k=>$v) {
            switch($k) {
                case "data_source":
                    if(is_array($v) && !$v['value']) {
                        $return[$k] = array();
                        foreach($v as $tv) {
                            $return[$k][] = array(
                                'label' => $tv,
                                'value' => $tv
                            );
                        }

                    }
                    break;
            }
        }

        return $return;
    }


}