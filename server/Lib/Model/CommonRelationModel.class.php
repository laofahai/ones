<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommonRelationModel
 *
 * @author nemo
 */
class CommonRelationModel extends RelationModel {
    
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
        
        if($model->fields["_type"]["deleted"]) {
            $rs = $model->where($condition)->save(array("deleted"=>1));
        } else {
            $model = $model->relation(true);
            $rs = $model->where($condition)->delete();
        }
        return $rs;
        
    }
    
}
