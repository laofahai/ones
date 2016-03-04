<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/26/15
 * Time: 17:13
 */

namespace DataModel\Service;


use Common\Model\CommonModel;

class DataModelDataService extends CommonModel{

    protected $_auto = [
        array("company_id", "get_current_company_id", 1, "function")
    ];

    /*
     * 插入模型数据
     * @param $source_id 源数据ID
     * @param $data POST的数据
     * @param $fields 涉及到的数据模型字段alias
     *
     * @todo 优先判断是否已存在 再使用 REPLACE INTO
     * */
    public function insert($source_id, $data=array(), $fields = array(), $modelName) {

        $data = $data ? $data : I('post.');

        if(!$fields) {
            $fields = explode(",", I('post._data_model_fields_'));
        }

        if(!$fields) {
            return;
        }

        $fields_config = D('DataModelField', 'Service')->where(array('id' => array('IN', $fields)))->select();

        $company_id = get_current_company_id();
        foreach($fields_config as $config) {
            if(array_key_exists($config['alias'], $data)) {
                $insert_data_model_data = array(
                    'source_id' => $source_id,
                    'data_model_field_id' => $config['id'],
                    'data' => $data[$config['alias']],
                    'company_id' => $company_id
                );
            }

            $table = $config['search_able'] > 0 ? 'data_model_data_search' : 'data_model_data';
            $this->table($table)->add($insert_data_model_data, array(), true);

        }
    }

    /*
     * 源数据删除时，删除相关模型
     * @param array $ids 源数据ID数组
     *
     * @todo 删除前验证
     * */
    public function delete_data($ids, $fields=array()) {
        $ids = is_array($ids) ? $ids : explode(',', $ids);

        $fields = $fields ? $fields : explode(",", I('get._df'));

        $fields_config = D('DataModelField', 'Service')->where(array('id' => array('IN', $fields)))->select();

        foreach($fields_config as $field) {
            $table = $field['search_able'] > 0 ? 'data_model_data_search' : 'data_model_data';

            $map = array(
                'source_id' => array('IN', $ids),
                'data_model_field_id' => $field['id']
            );

            $this->table($table)->where($map)->delete();
        }

    }

}