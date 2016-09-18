<?php
namespace Common\Model;
use \Think\Model;

class CommonModel extends Model {

    public $not_belongs_to_company = false;

    public $real_model_name = '';

    public $error_code = null;

    const MSG_NOT_FOUND = 'common.Query Not Match Any Row';

    public function getProperty($name) {
        return $this->$name;
    }

    /*
     * @override
     *
     * 默认增加company_id字段
     * */
    public function where($map, $parse=null) {
        if(!$this->not_belongs_to_company && !$map['id'] && !$map['company_id']) {
            $map["company_id"] = get_current_company_id();
        }

        return parent::where($map, $parse);
    }

    /*
     * 「工作流接口」
     * 更新字段数据
     *
     * @param integer $main_row_id 源数据ID
     * @param string $field 更新字段
     * @param mixed $data 更新字段数据
     *
     * */
    public function update_field_data($main_row_id, $field, $data) {
        $row = $this->where(array(
            'id' => $main_row_id
        ))->find();
        if(!$row) {
            $this->error = __(self::MSG_NOT_FOUND);
            return false;
        }

        return $this->where(array(
            'id' => $main_row_id
        ))->save(array(
            $field => $data
        ));
    }

    /*
     * 更改项目审核状态
     * */
    public function change_audit_status($ids, $status) {
        $ids = is_array($ids) ? $ids : explode(',', $ids);

        $result = $this->where(['id'=>['IN', $ids]])->save([
            'is_platform_reviewed' => $status ? 1 : 0
        ]);

        return $result;

    }

    /*
     * 增加事务忽略外键检测
     * */
    public function startTrans() {
        $this->query('SET FOREIGN_KEY_CHECKS = 0');
        parent::startTrans();
    }
    public function commit() {
        parent::commit();
        $this->query('SET FOREIGN_KEY_CHECKS = 1');
    }
    public function rollback() {
        parent::rollback();
        $this->query('SET FOREIGN_KEY_CHECKS = 1');
    }

    /*
     * 设置错误信息
     * */
    protected function set_error($error, $error_code=null, $include_sql=true, $model=null) {
        $this->error = $error;
        $this->error_code = $error_code;

        $obj = $model ? $model : $this;

        if(DEBUG && $include_sql) {
            $this->error .= ' SQL: '. $obj->getLastSql();
        }
    }

    protected function setError($error, $error_code=null, $include_sql=true, $model=null) {
        return $this->set_error($error, $error_code, $include_sql, $model);
    }

    public function getError() {
        $error_code = $this->error_code ? sprintf('[%s] ', $this->error_code) : '';
        return $error_code.$this->error;
    }

    public function set($k, $v) {
        $this->$k = $v;
    }

    public function get($k) {
        return $this->$k;
    }

}