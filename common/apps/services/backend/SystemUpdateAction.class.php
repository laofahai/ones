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
    }

    //下载
    public function read() {
        $version = $this->getVersion($_GET["id"]);

        //检测是不是相邻版本
        if(!$this->isAdjoiningVersion(DBC("system.version"), $version["version"])) {
            $this->error("you only can upgrade current version to the adjoining version.");
            return;
        }

        //文件路径为HTTP绝对地址
        if(strStartWith($version["file"], "http://") or strStartWith($version["file"], "https://")) {
            $remoteUri = $version["file"];
        } else {
            $remoteUri = file_get_contents($this->server."getDownload/id/".$version["id"]);
        }


        $localPathFull = $this->getLocalPath($version["file"]);
        $tmp = explode("/", $localPathFull);
        $localName = array_pop($tmp);
        $localPath = implode("/", $tmp);

        import("@.ORG.CurlAxel");

        $axel = new CurlAxel();

        $axel->setUrl($remoteUri);
        $size = $axel->getFileSize($remoteUri);

        $axel->setProgressCallback(false);

        $axel->setTempDir(ENTRY_PATH."/Runtime/Temp");
        $axel->setDownloadDir($localPath);
        $axel->setFilename($localName);
        $axel->setBufferSize(32*1024);
        $axel->activeLog(true);
        $axel->download();

        $maxTry = 30;
        $sleep = 1;
        $try = 0;
        $downloaded = false;

        do {
            $try ++;
            sleep($sleep);
            clearstatcache();
            //下载成功
            if(is_file($localPath.$localName) and filesize($localPath.$localName) == $size) {
                $downloaded = true;
                break;
            }

        } while($try <= $maxTry);

        if(!$downloaded) {
            $this->error("download_failed");
            return;
        }
    }

    public function insert() {
        //下载升级包
        if($_POST["doDownload"] && $_POST["version"]) {


        }

        //执行升级，需要zip模块支持
        if($_POST["doUpdate"] && $_POST["version"]) {
            $version = $this->getVersion($_POST["version"]);
            $zip = new ZipArchive();
            $tmpFolder = $this->local."update_".$_POST["version"];

            $rs = $zip->open($this->getLocalPath($version["file"]));
            if($rs === true) {
                if(!is_dir($tmpFolder)) {
                    $rs = mkdir($tmpFolder, 0777);
                }
                $zip->extractTo($tmpFolder);
            }
            $zip->close();
            unlink($this->getLocalPath($version["file"]));
            //暂定根目录为ENTRY_PATH上级目录
            //更新数据库
            $sqlFile = $tmpFolder."/upgrade.sql";
            if(file_exists_case($sqlFile)) {
                $rs = importSQL($sqlFile);
                unlink($sqlFile);
                if(true !== $rs) {
                    $this->error($rs[0]);return;
                }
            }

            //复制文件
            recursionCopy($tmpFolder, dirname(ENTRY_PATH));

            //删除更新文件
            delDirAndFile($tmpFolder);

            //更新系统版本
            $model = D("Config");
            $model->where(array(
                "alias" => 'system.version'
            ))->save(array(
                "value" => $version["version"]
            ));
        }
    }

    /*
     * 获取某版本信息
     * **/
    private function getVersion($id) {
        $url = sprintf("%sgetVersion/id/%d", $this->server, $id);
        $version = file_get_contents($url);
        if(!$version) {
            $this->error("not_found");
            return;
        }
        return json_decode($version, true);
    }

    /*
     * 获取可更新版本列表
     * **/
    private function getUpdateVersions() {
        $url = $this->server."getUpdates/version/".$this->currentVersion.".json";
        $versions = file_get_contents($url);
        if($versions) {

            import("@.ORG.markdown");
            $markdown = new Parsedown();

            $versions = json_decode($versions, true);
            foreach($versions as $k=>$ver) {
                if(is_file($this->getLocalPath($ver["file"]))) {
                    $versions[$k]["downloaded"] = true;
                }

                $versions[$k]["memo"] = $markdown->text($ver["memo"]);
            }
        }
        $data["current_version"] = $this->currentVersion;
        $data["updates"] = $versions;
        return $data;
    }

    /*
     * 判断是否相邻版本
     * **/
    private function isAdjoiningVersion($current, $upgradeTo){
        $url = sprintf("%sisAdjoiningVersion/current/%s/upgrade/%s", $this->server, $current, $upgradeTo);
        $result = file_get_contents($url);
        if(!$result or empty($result)) {
            return true;
        } else {
            Log::write("try to install a version that doesn't match:".$upgradeTo);
            return false;
        }
    }

    private function getLocalPath($file) {
        return $this->local."/".md5($file).".zip";
    }

} 