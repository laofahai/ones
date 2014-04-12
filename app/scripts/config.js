/**
 * 基本配置
 * */
var ERPBaseConf = {
    //Base Server Uri 所有与服务器交互绝对路径开始
    BSU : "../erp_server/index.php/"
};

angular.module("erp.config", [])
        .value("erp.config", ERPBaseConf);