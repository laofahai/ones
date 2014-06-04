/**
 * 基本配置
 * */
var ERPBaseConf = {
    //Base Server Uri 所有与服务器交互绝对路径开始
    BSU : "../erp_server/gateway.php?s=/",
    DEBUG: true,
    
    Prefix: "ones",
    
    yesNoDataSource: [
        {id:0, name:"No"},
        {id:1, name:"Yes"}
    ]
};

angular.module("ones.config", [])
        .value("ones.config", ERPBaseConf)
        .run(["$rootScope", "$http", function($rootScope, $http){
            /**
             * 加载语言包
             * */
            $rootScope.i18n = angular.fromJson(localStorage.getItem(ERPBaseConf.Prefix+"i18n"));
            if(ERPBaseConf.DEBUG || !$rootScope.i18n) {
                $http.get("scripts/i18n/zh-cn.json").success(function(data) {
                    $rootScope.i18n = data;
                    localStorage.setItem(ERPBaseConf.Prefix+"i18n", angular.toJson(data));
                });
            }
        }])
        ;