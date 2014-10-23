<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-16
 * Time: 21:39
 */

class CommonBuildAction {

    protected $appConfig;

    protected $appPath;

    protected $error;

    public function __construct($appConfig) {
        $this->appConfig = $appConfig;
        $this->appPath = ROOT_PATH."/apps/".$this->appConfig["alias"];
        if(!$appConfig["alias"]) {
//            Log::write();
            exit();
        }
    }

    /*
     * APP安装
     * 子类可覆盖
     * **/
    public function appInstall($alias) {
        $installSql = sprintf("%s/apps/%s/data/sqls/install.sql", ROOT_PATH, $alias);
        if(is_file($installSql)) {
            $rs = importSQL($installSql);
            if(true !== $rs) {
                $this->error = $rs[0];
                return false;
            }
        }

        if($this->workflows) {
            if(!isModuleEnabled("workflow")) {
                $this->requireApp("workflow");
                return false;
            }

            if(!$this->appInsertWorkflow($this->workflows)) {
                return false;
            }
        }

        if($this->authNodes) {
            $nodeActions = array(
                "read", "add", "edit", "delete"
            );
            foreach($this->authNodes as $k=> $node) {
                if(substr($node,-1,1) == "*") {
                    foreach($nodeActions as $act) {
                        array_push($this->authNodes, str_replace("*", $act, $node));
                    }
                    unset($this->authNodes[$k]);
                }
            }

            $model = D("AuthRule");
            foreach($this->authNodes as $node) {
                $model->add(array(
                    "name" => $node,
                    "status"=>1,
                    "category"=>$alias
                ));
            }
        }

        return true;
    }

    /*
     * APP卸载
     * 子类可覆盖
     * **/
    public function appUninstall() {

        /*
         * 更新数据库
         * **/
        $uninstallSql = sprintf("%s/apps/%s/data/sqls/uninstall.sql", ROOT_PATH, $this->appConfig["alias"]);
        if(is_file($uninstallSql)) {
            $rs = importSQL($uninstallSql);
            if(true !== $rs) {
                $this->error = $rs[0];
                return false;
            }
        }

        /*
         * 删除APP目录
         * **/
        delDirAndFile($this->appPath);
        rmdir($this->appPath);

        if($this->workflows) {
            $this->appDeleteWorkflow($this->workflows);
        }

        if($this->authNodes) {
            $model = D("AuthRule");
            $model->where(array(
                "category"=>$this->appConfig["alias"]
            ))->delete();
        }

        if(is_dir($this->appPath)) {
            $this->error("uninstall failed when remove the app dir");
        }

        return true;

        /*
         * 其他扩展文件
         * @todo
         * **/
    }

    /*
     * 默认APP更新方法
     * **/
    public function appUpgrade() {
        $upgradeSql = sprintf("%s/apps/%s/data/sqls/upgrade.sql", ROOT_PATH, $this->appConfig["alias"]);
        if(is_file($upgradeSql)) {
            $rs = importSQL($upgradeSql);
            if(true !== $rs) {
                $this->error = $rs[0];
                return false;
            }
        }

        return true;
    }

    public function afterAppUpgrade() {
        if(!$this->error) {
            D("Apps")->where(array(
                "alias" => $this->appConfig["alias"]
            ))->save(array(
                "version" => $this->appConfig["version"]
            ));
        }
    }

    /*
     * 安装结束后的回调方法
     * @param $result boolean
     * **/
    public function afterAppInstall() {
        if(!$this->error) {
            D("Apps")->add(array(
                "alias" => $this->appConfig["alias"],
                "version" => $this->appConfig["version"],
                "dateline" => CTS,
                "status"   => 0
            ));
        }
    }

    /*
     * 卸载结束后的回调方法
     * @param $result boolean
     * **/
    public function afterAppUninstall() {
        if(!$this->error) {
            D("Apps")->where(array(
                "alias" => $this->appConfig["alias"]
            ))->delete();
        }
    }

    /*
     * 默认APP启用方法
     * 仅涉及更新apps表中状态
     * **/
    public function appEnable() {
        $model = D("Apps");
        return false !== $model->where(array(
            "alias" => $this->appConfig["alias"]
        ))->save(array(
            "status" => 1
        ));
    }

    /*
     * 默认APP禁用方法
     * 仅涉及更新apps表中状态
     * **/
    public function appDisable() {
        $model = D("Apps");
        return false !== $model->where(array(
            "alias" => $this->appConfig["alias"]
        ))->save(array(
            "status" => 0
        ));
    }

    /*
     * 插入数据，HasMany关系
     * 如： workflow表  workflow_node表 通过 workflow_id(foreignKey)与workflow表关联
     * @param $parentModel 主model
     * @param $subModel 子model
     * @param $data 数据
     * @param $foreignKey 外键
     * **/
    final protected function appHasManyInsert($parentModel, $subModel, $data, $foreignKey = null) {
        $foreignKey = $foreignKey ? $foreignKey : strtolower($parentModel)."_id";
        $parentModel = D($parentModel);
        $subModel = D($subModel);

        $parentModel->startTrans();

        $ids = array();

        foreach($data as $parent) {
            $rows = $parent["_rows"];
            unset($parent["rows"]);
            $pid = $parentModel->add($parent);
            array_push($ids, $pid);

            if(!$pid) {
                LogSQLError($parentModel, true);
                return false;
            }

            foreach($rows as $row) {
                $row[$foreignKey] = $pid;
                if(!$subModel->add($row)) {
                    LogSQLError($parentModel, true);
                    return false;
                }
            }

        }

        $parentModel->commit();

        return $ids;
    }

    /*
     * 插入工作流
     * **/
    final protected function appInsertWorkflow($data) {
        $sourceData = $data;
        foreach($data as $workflowAlias => $workflow) {
            $data[$workflowAlias]["alias"] = $workflowAlias;
            foreach($workflow["_rows"] as $nodeFile => $node) {
                $data[$workflowAlias]["_rows"][$nodeFile]["execute_file"] = $nodeFile;
                unset($data[$workflowAlias]["_rows"][$nodeFile]["prev_node_id"]);
                unset($data[$workflowAlias]["_rows"][$nodeFile]["next_node_id"]);
            }
            $aliases[] = $workflowAlias;
        }

        $ids = $this->appHasManyInsert("Workflow", "WorkflowNode", $data);

        if(!$ids) {
            $this->error("Install Error: error while install workflow: ". implode(",", $aliases));
            Log::write($this->error);
            return false;
        }

        $model = D("WorkflowNodeView");
        $nodeModel = D("WorkflowNode");
        $nodes = $model->where(
            array("workflow_id"=>array("IN", implode(",", $ids)))
        )->select();

        $aliasMap = array();
        foreach($nodes as $node) {
            //工作流节点 alias => $node
            $aliasMap[$node["workflow_id"]][$node["execute_file"]] = $node;
        }

        foreach($nodes as $node) {
            $prevKey = $sourceData[$node["workflow_alias"]]["_rows"][$node["execute_file"]]["prev_node_id"];
            $nextKey = $sourceData[$node["workflow_alias"]]["_rows"][$node["execute_file"]]["next_node_id"];

            $prevKey = explode(",", $prevKey);
            $nextKey = explode(",", $nextKey);

            foreach($prevKey as $pk) {
                $node["prev_node_id"][] = $prevKey ? $aliasMap[$node["workflow_id"]][$pk]["id"] : "";
            }

            foreach($nextKey as $nk) {
                $node["next_node_id"][] = $nextKey ? $aliasMap[$node["workflow_id"]][$nk]["id"] : "";
            }

            $node["prev_node_id"] = implode(",", $node["prev_node_id"]);
            $node["next_node_id"] = implode(",", $node["next_node_id"]);

            $node["prev_node_id"] = $node["prev_node_id"] ? $node["prev_node_id"] : 0;
            $node["next_node_id"] = $node["next_node_id"] ? $node["next_node_id"] : 0;

            if(false === $nodeModel->save($node)) {
                LogSQLError($nodeModel);
                return false;
            }
        }

        return true;

    }

    final protected function appDeleteWorkflow($workflows) {
        $aliases = array_keys($workflows);
        $model = D("Workflow");
        $workflows = $model->where(array(
            "alias" => array("IN", implode(",", $aliases))
        ))->select();

        foreach($workflows as $w) {
            $ids[] = $w["id"];
        }

        if(!$ids) {
            return true;
        }

        $map["workflow_id"] = array("IN", implode(",", $ids));

        $model->where(array(
            "id" => array("IN", implode(",", $ids))
        ))->delete();

        D("WorkflowNode")->where($map)->delete();
        D("WorkflowProcess")->where($map)->delete();

    }

    final protected function requireApp($appName) {
        $appName = is_array($appName) ? implode(",", $appName) : $appName;
        $this->error("this app require {$appName} app installed");
    }


    final protected function error($msg) {
        $this->error = $msg;
    }

    final public function getError() {
        return $this->error;
    }


}