<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/1/15
 * Time: 21:14
 */

namespace Account\Service;

use Common\Model\CommonModel;

class UserPreferenceService extends CommonModel {

    public $not_belongs_to_company = true;

    protected $_auto = array(
        array("company_id", "get_current_company_id", 1, "function")
    );

    /*
     * 设置单条用户首选项
     * @param array $data
     * @param boolean $append 是否追加至原项目
     * */
    public function set_preference($key, $data, $append=false, $data_type='serialize') {
        $exists = $this->get_preference($key, $data_type);

        if(false === $exists) {

            if($data_type == "serialize") {
                $data = serialize($data);
            }

            $rs = $this->add(array(
                'user_info_id' => get_current_user_id(),
                'name' => $key,
                'data' => $data,
                'data_type' => $data_type
            ));

            return $rs;
        }

        // 追加
        if($append && $data_type === 'serialize') {
            $exists['data'] = array_merge_recursive((array)$exists['data'], $data);
        }

        $exists['data'] = $data_type === 'serialize' ? serialize($data) : $data;

        return false === $this->save($exists);
    }

    /*
     * 获得k=>v 配置
     * */
    public function get_preference($name=null) {

        $cache_key = get_company_cache_key('user_preference/'.get_current_user_id());
        $cached = F($cache_key);
        if(DEBUG || !$cached) {
            $source = $this->where(array(
                'user_info_id' => get_current_user_id()
            ))->select();

            $cached = array();
            foreach($source as $row) {
                if($row["data_type"] == "serialize") {
                    $row['data'] = unserialize($row["data"]);
                }
                $cached[$row['name']] = $row;
            }
            F($cache_key, $cached);
        }

        if($name) {
            return array_key_exists($name, $cached) ? $cached[$name] : false;
        } else {
            return $cached;
        }
    }

    /*
     * 更新k=>v配置（数据库存储）
     * */
    public function update_kv_config($data) {
        $uid = get_current_user_id();

        $exists = $this->where(array(
            'user_info_id' => $uid
        ))->select();
        $exists_id = get_array_to_kv($exists, 'id', 'name');
        $exists = get_array_to_kv($exists, 'data', 'name');


        foreach($data as $row) {
            if(array_key_exists($row['name'], $exists)) {
                if($row['data'] == $exists) {
                    continue;
                }
                $this->save(array(
                    'id' => $exists_id[$row['name']],
                    'data' => $row['data'],
                    'name' => $row['name'],
                    'data_type' => $row['data_type'],
                ));
                continue;
            }
            $row['user_info_id'] = $uid;
            $this->add($row);
        }

        $cache_key = get_company_cache_key('user_preference/'.$uid);
        F($cache_key, null);
    }


}