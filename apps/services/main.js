(function(){
    /**
     * ONES 服务模块，包括系统升级、数据备份等
     * */
    angular.module("ones.services", ["ones.department"])
        .config(["$routeProvider", function($route){
            $route
                .when('/services/list/systemUpdate', {
                    templateUrl: appView("systemUpdate.html", "services"),
                    controller: "systemUpdateCtl"
                })
                .when('/services/list/dataBackup', {
                    templateUrl: appView("dataBackup.html", "services"),
                    controller: "dataBackupCtl"
                })
            ;
        }])

        //系统升级
        .controller("systemUpdateCtl", ["$scope", "$http", "ones.config", "ComView", "$rootScope",
            function($scope, $http, conf, ComView, $rootScope){
                var uri = conf.BSU+"services/systemUpdate.json";
                var pageDesc = $scope.currentPage.actionDesc;
                var getUpdates = function() {
                    $http.get(uri).success(function(data){
                        if(!data.updates) {
                            $scope.noNewVersion = true;
                        }
                        $scope.currentPage.actionDesc = sprintf("%s: %s. %s",
                            $rootScope.i18n.lang.currentVersion,
                            data.current_version,
                            pageDesc
                        );
                        $scope.updates = data;
                    });
                }

                getUpdates();

                //下载更新文件
                $scope.doDownload = function(id) {
                    $http.post(uri, {
                        doDownload: true,
                        version: id
                    }).success(function(data){
                        getUpdates();
                    });
                };
                //执行更新
                $scope.doUpdate = function(id) {
                    $http.post(uri, {
                        doUpdate: true,
                        version: id
                    }).success(function(data){
                        getUpdates();
                    });
                };

            }])
        .controller("dataBackupCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.options = {
                send_email: true,
                packit: true,
                autodelete: true
            };
            $scope.doSubmit = function() {
                $http({method: "POST", url:conf.BSU+'services/dataBackup.json', data:{options: $scope.options}}).success(function(data){
                    ComView.alert(data, "info");
                });
            };
        }])
    ;
})();