/**
 * 基本配置
 * */
var ERPBaseConf = {
    //Base Server Uri 所有与服务器交互绝对路径开始
    BSU : "../erp_server/gateway.php?s=/",
    DEBUG: true,
    
    Prefix: "idea-erp",
    
    yesNoDataSource: [
        {id:0, name:"No"},
        {id:1, name:"Yes"}
    ]
};

angular.module("ones.config", [])
        .value("ones.config", ERPBaseConf);