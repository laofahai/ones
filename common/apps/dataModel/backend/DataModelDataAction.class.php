<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DataModelDataAction
 *
 * @author nemo
 */
class DataModelDataAction extends CommonAction {

    protected $indexModel = "DataModelDataView";
    protected $readModel = "DataModelDataView";

    protected function _filter(&$map) {

        if($_GET["modelId"]) {
            $map["DataModelData.model_id"] = abs(intval($_GET["modelId"]));
        }
        if($_GET['fieldAlias']) {
            $map["DataModelFields.field_name"] = $_GET['fieldAlias'];
        }
        if($_GET["typeahead"]) {
            $map["DataModelData.data|DataModelData.pinyin"] = array("LIKE", "%{$_GET["typeahead"]}%");
        }
        if($_GET["source_id"]) {
            $map["DataModelData.source_id"] = abs(intval($_GET["source_id"]));
        }
        //根据分类查询对应的模型
        if($_GET["goods_id"]) {
            if(strpos($_GET["goods_id"], "_") !== false) {
                list($factory_code, $id, $catid) = explode("_", $_GET["goods_id"]);
                $model = D("GoodsCategory");
                $category = $model->find($catid);
                if($category) {
                    $map["DataModel.alias"] = "product";
                    if(DBC("dataModel.showOnlyBind")) {
                        $map["DataModelData.source_id"] = $catid;
                    }

                }
            } else {
                $model = D("GoodsCatView");
                $category = $model->find($_GET["goods_id"]);
                if($category) {
                    $map["DataModel.alias"] = "product";
                    if(DBC("dataModel.showOnlyBind")) {
                        $map["DataModelData.source_id"] = $category["goods_category_id"];
                    }
                }
            }
        }
        if($_GET["cat_id"]) {
            $map["DataModel.alias"] = "product";
        }

        $map["DataModelData.deleted"] = 0;

    }

    protected function pretreatment() {
        if($_GET["id"]) {
            unset($_POST["model_id"]);
        } else {
            $_POST["model_id"] = $_POST["modelId"];
        }

        if(!$_POST["pinyin"]) {
            $_POST["pinyin"] = Pinyin($_POST["data"]);
        }


        //动态新增
        if($_POST["goods_id"]) {
            list($fa, $goods_id, $cat_id) = explode("_", $_POST["goods_id"]);
            $_POST["source_id"] = $cat_id;
        }

        if($_POST["modelAlias"]) {
            $theModel = D("DataModel")->getByAlias($_POST["modelAlias"]);
            $_POST["model_id"] = $theModel["id"];
        }

        //检测重复项
        if($_POST["model_id"] && $_POST["source_id"] && $_POST["field_id"] && $_POST["data"]) {
            $_map = array(
                "model_id" => $_POST["model_id"],
                "source_id"=> $_POST["source_id"],
                "field_id" => $_POST["field_id"],
                "data" => $_POST["data"]
            );
            if(D("DataModelData")->where($_map)->find()) {
                $this->error("repeat_item");
                exit;
            }
        }
    }

}
