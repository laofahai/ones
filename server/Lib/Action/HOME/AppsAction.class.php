<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-7-9
 * Time: 1:14
 */

class AppsAction extends CommonAction {

    private $serviceUri;

    public function __construct() {
        $this->serviceUri = DBC("remote.service.uri");
    }

    public function index() {

        //获取所有APP
        if($_GET["queryAll"]) {
            //获取所有APP列表
            import("@.ORG.httplib");
            $http = new httplib();
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
                    if($app["version"] > $installedAppVersions[$app["alias"]]) {
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
            parent::index();
        }

    }

}