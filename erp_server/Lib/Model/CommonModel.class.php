<?php

/**
 * @filename CommonModel.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-13  18:09:06
 * @Description
 * 
 */
!defined("HAS_ONE") && define('HAS_ONE',1);
!defined("BELONGS_TO") && define('BELONGS_TO',2);
!defined("HAS_MANY") && define('HAS_MANY',3);
!defined("MANY_TO_MANY") && define('MANY_TO_MANY',4);

class CommonModel extends AdvModel{
    
    protected $_auto = array(
        array("status",1)
    );
    
//    protected $_filter = array(
//       'deleted'=>array('contentWriteFilter','contentReadFilter'),
//    );
    
//    protected $status_lang = array(
//        "ineffective","effective"
//    );
//    
//    protected $status_class = array(
//        "normal","success"
//    );
    
    protected $workflowMainRowField = "id";
    
    public function updateStatus($id, $status) {
        $data = array(
            "status" => $status
        );
        return $this->where("id=".$id)->save($data);
    }
    
    public function getIndexArray($data, $value="name", $key="id") {
        if(!$data) {
            return array();
        }
        foreach($data as $k=>$v) {
            $return[$v[$key]] = $v[$value];
        }
        return $return;
    }
    
    public function where($where, $parse = null) {
        if($model->fields["_type"]["deleted"]) {
            $where["deleted"] = 0;
        }
        return parent::where($where, $parse);
    }
    
    /**
     * @override
     */
    public function select($options = array()) {
        $data = parent::select($options);
        if(!$data) {
            return $data;
        }
        
        foreach($data as $k=>$v) {
            if($v["dateline"]) {
                $data[$k]["dateline_lang"] = date("Y-m-d H:i:s", $v["dateline"]);
            }
//            if(isset($v["status"])) {
//                if(isset($this->status_lang[$v["status"]])) {
//                    $data[$k]["status_lang"] = L($this->status_lang[$v["status"]]);
//                }
//                if($this->status_class) {
//                    $data[$k]["status_class"] = $this->status_class[$v["status"]];
//                }
//            }
            
            $ids[] = $v[$this->workflowMainRowField];
        }
        
        /**
         * 工作流
         */
        if($this->workflowAlias and false !== $this->includeWorkflowProcess) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getListProcess($ids);
            foreach($data as $k=> $v) {
                $data[$k]["processes"] = $processData[$v[$this->workflowMainRowField]];
            }
        }
        return $data;
    }
    
    /**
     * @override
     */
    public function find($options = array()) {
        $data = parent::find($options);
        if(!$data) {
            return $data;
        }
        if($data["dateline"]) {
            $data["dateline_lang"] = date("Y-m-d H:i:s", $data["dateline"]);
        }
        
        if($this->workflowAlias and false !== $this->includeWorkflowProcess) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getCurrentProcess($data["id"]);
            $data["processes"] = $processData;
        }
        
//        if(isset($data["status"])) {
//            if(isset($this->status_lang)) {
//                $data["status_lang"] = L($this->status_lang[$data["status"]]);
//            }
//            if(isset($this->status_class)) {
//                $data["status_class"] = $this->status_class[$data["status"]];
//            }
//        }
        return $data;
    }
    
    /**
     * 执行删除
     */
    public function doDelete($ids, $pk=null, $modelName = null) {
//        echo 123;exit;
        if(!$modelName) {
            $model = $this;
        } else {
            $model = D($modelName);
        }
        $pk = $pk ? $pk : $model->getPk();
        $condition = array(
            $pk => array("IN", is_array($ids) ? implode(",", $ids) : $ids)
        );
        
        /**
         * 判断是否有deleted字段
         */
//        var_dump($model->fields["deleted"]);
//        print_r($model->fields);
//        var_dump(in_array("deleted", $model->fields));exit;
        if($model->fields["_type"]["deleted"]) {
            $rs = $model->where($condition)->save(array("deleted"=>1));
        } else {
            if(method_exists($model, "relation")) {
                $model = $model->relation(true);
            }
            $rs = $model->where($condition)->delete();
        }
//        echo $model->getLastSql();exit;
//        var_dump($rs);exit;
        return $rs;
        
    }
    
}
