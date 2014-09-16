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
        if(!isset($where["deleted"])) {
            if($this->fields["_type"]["deleted"] and !$this->excludeDeletedMap) {
                if(!is_array($where)) {
                    $tmp = explode("=", $where);
                    $where = array();
                    $where[$tmp[0]] = $tmp[1];
                }
                $where["deleted"] = "0";
            }
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
    public function doDelete($ids, $pk=null, $modelName = null, $forceDelete=false) {
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
        if($model->fields["_type"]["deleted"] && !$forceDelete) {
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

    /*
     * 删除单据详情中修改时被删除的行，以ID判断
     * @param $rows 行数组
     * @param $map = source_id=xxx 数组格式
     * @param $model 行所在model
     * **/
    final protected function removeDeletedRows($rows, $map, $model="") {
        $model = $model ? $model : $this;

        $ids = array();
        foreach($rows as $row) {
            if($row["id"]) {
                $ids[] = $row["id"];
            }
        }

        //如果ID数量大于等于所有行数量，标明没有行需要被删除
//        if(count($ids) >= count($rows)) {
//            return true;
//        }

        if($ids) {
            $map["id"] = array("NOT IN", implode(",", $ids));
        }

        $model->where($map)->delete();
//        print_r($rows);
//        echo $model->getLastSql();exit;
    }

    /*
     * 预检测行内的factory_code_all是否完整
     * **/
    final protected function checkFactoryCodeAll($rows) {
        $template = explode(",", DBC("goods.unique.template"));

        //预检测，判断factory_code_all为空或者元素数量和模板不对等
        foreach($rows as $row) {
            $fca = explode(DBC("goods.unique.separator"), $row["factory_code_all"]);
            if(!$row["factory_code_all"] or count($fca) !== count($template)) {
                return false;
            }

            $factoryCode[$fca[0]] = $fca[0];
            for($i=1;$i<count($template);$i++) {
                $modelIds[$template[$i]][] = $fca[$i];
            }
        }

//        print_r($modelIds);exit;

        //再次检测，factory_code不存在于goods表中
        $model = D("Goods");
        $map = array(
            "factory_code" => array("IN", $factoryCode)
        );
        $count = $model->where($map)->count();
        if($count < count($factoryCode)) {
            return false;
        }

        //或者modelDataId的字段名和模板不能对应起来
//        $model = D("DataModelFields");
//        $modelFields = $model->getFieldsByAlias("product");


        return true;
    }
    
}

