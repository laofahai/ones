/**
 * 基本配置
 * */
var conf = {
    //Base Server Uri 所有与服务器交互绝对路径开始
    BSU : "http://127.0.0.1/vhosts/newopenx/erp_server/index.php/"
};

angular.module("erp.config", [])
        .value("erp.config", conf);

