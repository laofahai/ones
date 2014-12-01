<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommonViewModel
 *
 * @author 志鹏
 */
class CommonViewModel extends ViewModel{
    

    protected $workflowAlias;
    
    protected $workflowMainRowField = "id";
    
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
//        echo substr($this->name, 0, -4);exit;
        if($this->baseModelName) {
            $model = D($this->baseModelName);
        } else {
            $model = D(substr($this->name, 0, -4));
        }
//        echo substr($this->name, 0, -4);exit;
//        print_r($model->fields);
//        var_dump($model->fields["_type"]["deleted"]);

        if(!isset($where["deleted"])) {
            if($model->fields["_type"]["deleted"]) {
                $where["deleted"] = 0;
            } else {
                $tmp = $this->viewFields;
                foreach($tmp as $k=>$v) {
                    $tmpModel = D($k);
                    if($tmpModel->fields["_type"]["deleted"]) {
                        if(!is_array($where)) {
                            $tmp = explode("=", $where);
                            $where = array();
                            $where[$tmp[0]] = $tmp[1];
                        }
                        $where[$k.".deleted"] = 0;
                    }
                    break;
                }
            }

        }

//        print_r($where);
        return parent::where($where, $parse);
    }
    
    /**
     * @override
     */
    public function select($options = array()) {
        $data = parent::select($options);

//        var_dump($this);

//        echo $this->getLastSql()."<br />";

        if(!$data) {
            return $data;
        }
        foreach($data as $k=>$v) {
            $ids[] = $v[$this->workflowMainRowField];

        }
//        echo $this->workflowMainRowField;exit;
//        print_r($ids);exit;
        /**
         * 工作流
         */
        if($this->workflowAlias and false !== $this->includeWorkflowProcess) {
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getListProcess($ids);
            foreach($data as $k=> $v) {
                $data[$k]["processes"] = $processData[$v[$this->workflowMainRowField]];
            }
//            print_r($data);exit;
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
        /**
         * 工作流
         */
        if($this->workflowAlias and false !== $this->includeWorkflowProcess) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getCurrentProcess($data[$this->workflowMainRowField]);
            $data["processes"] = $processData;
        }
        
        return $data;
    }
    
    /**
     * 执行删除
     */
    public function doDelete($ids, $pk, $modelName = null) {
        if(!$modelName) {
            $model = $this;
        } else {
            $model = D($modelName);
        }
        
        $pk = $pk ? $pk : $model->getPk();
        
        $condition = array(
            $pk => array("IN", is_array($ids) ? implode(",", $ids) : $ids)
        );
        
        if(in_array("deleted", $model->fields)) {
            $rs = $model->where($condition)->save(array("deleted"=>1));
        } else {
//                    echo 222;exit;
            $rs = $model->where($condition)->delete();
        }
        
        return $rs;
        
    }
    
}

?>
