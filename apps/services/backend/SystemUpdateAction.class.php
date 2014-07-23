<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-12
 * Time: 21:48
 */
class SystemUpdateAction extends CommonAction {

    protected $singleAction = true;

    protected $server;

    protected $local;

    protected $currentVersion;

    public function __construct() {
        parent::__construct();
        $this->server = DBC("remote.service.uri")."Update/";
        $this->local  = ENTRY_PATH."/Data/Updates/";
        $this->currentVersion = DBC("system.version");
    }

    public function index() {
        if(!IS_POST) {
            $data = $this->getUpdateVersions();
            $this->response($data);return;
        }

        //下载升级包
        if($_POST["doDownload"] && $_POST["version"]) {
            $version = $this->getVersion($_POST["version"]);

            import("ORG.Net.Http");
            $remoteUri = str_replace("/index.php?s=/Update", "", $this->server)."Data/updates/".$version["file"];
//            echo $remoteUri;
//            echo $this->local.$version["file"];
//            exit;

            $localPath = $this->local.$version["file"];
            Http::curlDownload($remoteUri, $localPath);

            if(!file_exists_case($localPath)) {
                $this->error("download_failed");
            }

//            var_dump($rs);
        }

        //执行升级，需要zip模块支持
        if($_POST["doUpdate"] && $_POST["version"]) {
            $version = $this->getVersion($_POST["version"]);
            $zip = new ZipArchive();
            $tmpFolder = $this->local."update_".$_POST["version"];
//            echo $tmpFolder;exit;
//            echo $localPath;
            $rs = $zip->open($this->local.$version["file"]);
            if($rs === true) {
//                echo 123;
                if(!is_dir($tmpFolder)) {
                    $rs = mkdir($tmpFolder, 0777);
                }
                $zip->extractTo($tmpFolder);
            }
            $zip->close();
            unlink($this->local.$version["file"]);
            //暂定根目录为ENTRY_PATH上级目录
            //更新数据库
            $sqlFile = $tmpFolder."/upgrade.sql";
            if(file_exists_case($sqlFile)) {
                if(false === $this->executeSql($sqlFile)) {
                    $this->error("upgrade_failed");
                }
                unlink($sqlFile);
            }
//            echo $tmpFolder;
//            echo dirname(ENTRY_PATH);exit;
            //复制文件
            recursionCopy($tmpFolder, dirname(ENTRY_PATH));

            //删除更新文件
            delDirAndFile($tmpFolder);
        }


    }

    private function getVersion($id) {
        $url = sprintf("%sgetVersion/id/%d", $this->server, $id);
        $version = file_get_contents($url);
        if(!$version) {
            $this->error("not_found");
            return;
        }
        return json_decode($version, true);
    }

    private function getUpdateVersions() {
        $url = $this->server."getUpdates/version/".$this->currentVersion;
        $versions = file_get_contents($url);
        if($versions) {
            $versions = json_decode($versions, true);
//            print_r($versions);exit;
            foreach($versions as $k=>$ver) {
                if(is_file($this->local.$ver["file"])) {
                    $versions[$k]["downloaded"] = true;
                }
            }
        }
        $data["current_version"] = $this->currentVersion;
        $data["updates"] = $versions;
        return $data;
    }

    private function executeSql($sqlFile) {
        $sqls = file_get_contents($sqlFile);
        $sqls = str_replace("[PREFIX]", C("DB_PREFIX"), $sqls);
        $sqls = explode("\n", $sqls);
        $model = new Model;
        foreach($sqls as $sql) {
            if(false === $model->execute($sql)) {
                return false;
            }
        }
    }

} 