<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-9
 * Time: 1:14
 *
 * Apps 中所有涉及ID均为远程ID
 */

class AppsAction extends CommonAction {

    private $serviceUri;

    public function __construct() {
        $this->serviceUri = DBC("remote.service.uri");
    }

    public function index() {

        import("@.ORG.httplib");
        $http = new httplib();

        //获取所有APP
        if($_GET["queryAll"]) {
            //获取所有APP列表
            $http->request($this->serviceUri."App/getList", array(
                "_pn" => $_GET["_pn"],
                "_ps" => $_GET["_ps"]
            ));

            $tmp = $http->get_data();
            $response = json_decode($tmp, true);
            if(!$response["count"]) {
                $this->error("get apps list failed");
                exit;
            }
            $allApps = $response["apps"];

            $model = D("Apps");
            $tmp = $model->select();
            foreach($tmp as $app) {
                $installedApps[] = $app["alias"];
                $installedAppVersions[$app["alias"]] = $app["version"];
            }

            foreach($allApps as $k=>$app) {
                $allApps[$k]["status"] = "appStatus";
                if(in_array($app["alias"], $installedApps)) {
                    $allApps[$k]["status"] .= "installed";
                    $allApps[$k]["installed"] = true;
                    if($app["latest_version"] > $installedAppVersions[$app["alias"]]) {
                        $allApps[$k]["status"] .= "hasUpdate";
                        $allApps[$k]["hasUpdate"] = true;
                    }
                }
            }

            $allApps = reIndex($allApps);

            if($_GET["_ic"]) {
                $response = array(
                    array("count" => $response["count"]),
                    $allApps
                );
            } else {
                $response = $allApps;
            }

            $this->response($response);

        } else {

            $tmp = parent::index(true);

            foreach($tmp as $app) {
                $installedApps[$app["alias"]] = $app;
                $installedAppAlias[] = $app["alias"];
            }

            $http->request($this->serviceUri."App/getList", array(
                "alias" => implode(",", $installedAppAlias)
            ));

            $tmp = $http->get_data();
            $response = json_decode($tmp, true);

            foreach($response["apps"] as $appMeta) {
                $installedApps[$appMeta["alias"]]["id"] = $appMeta["id"];
                $installedApps[$appMeta["alias"]]["name"] = $appMeta["name"];
                $installedApps[$appMeta["alias"]]["author"] = $appMeta["author"];
                $installedApps[$appMeta["alias"]]["link"] = $appMeta["link"];
                $installedApps[$appMeta["alias"]]["description"] = $appMeta["description"];
                $installedApps[$appMeta["alias"]]["status"] = "appStatusinstalled";

                if($appMeta["latest_version"] > $installedAppAlias[$appMeta["alias"]]["version"]) {
                    $installedApps[$appMeta["alias"]]["status"] .= "hasUpdate";
                }
            }

            $count = D("Apps")->where($this->queryMeta["map"])->count("id");
//            print_r($installedApps);exit;
            $this->response(array(
                array("count"=>$count),
                reIndex($installedApps)
            ));

        }

    }

    public function read() {

        import("@.ORG.httplib");
        $http = new httplib();

        $id = abs(intval($_GET["id"]));

        $http->request($this->serviceUri."App/getInfo", array(
            "id" => $id
        ));

        $tmp = $http->get_data();
//        echo $tmp;
        $appInfo = json_decode($tmp, true);

        $model = D("Apps");
        $installed = $model->where(array("alias" => $appInfo["alias"]))->find();

        if($installed) {
            $appInfo["installed"] = true;
            $appInfo["hasUpdate"] = $appInfo["latest_version"] > $installed["version"] ? true : false;
            $appInfo["currentVersion"] = $installed["version"];
            $appInfo["status"] = $installed["status"];
        }

        $this->response($appInfo);


    }

}