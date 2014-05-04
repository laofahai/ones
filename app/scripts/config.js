/**
 * 基本配置
 * */
var ERPBaseConf = {
    //Base Server Uri 所有与服务器交互绝对路径开始
    BSU : "http://127.0.0.1/vhosts/erp_server/index.php/",
    DEBUG: true,
    
    Prefix: "idea-erp",
    
    yesNoDataSource: [
        {id:0, name:"No"},
        {id:1, name:"Yes"}
    ]
};

angular.module("erp.config", [])
        .value("erp.config", ERPBaseConf);