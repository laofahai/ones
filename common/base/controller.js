(function(){
    angular.module('ones.common', ['ones.common.filters', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                .when('/HOME/goTo/url/:url', {
                    controller: "HOMERedirectCtl",
                    templateUrl: "common/base/views/blank.html"
                })
                .when('/HOME/list/clearCache', {
                    templateUrl: "common/base/views/home/clearCache.html",
                    controller: "clearCacheCtl"
                })
                .when('/HOME/viewDetail/apps/id/:id', {
                    templateUrl: "common/base/views/home/appDetail.html",
                    controller: "AppViewDetailCtl"
                })
            ;
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])

        .controller("clearCacheCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'home/clearCache.json', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
                });
            };
        }])
        .controller('CommonSidebarCtl', ['$scope','$location', function($scope, $location) {
            $scope.$on("initDataLoaded", function(event, data){
                $scope.navs = data.navs;
                $scope.activeSubNav = "";
                $scope.checkActiveNav = function($index, id) {
                    $scope.openNav = id;
                    $scope.activeNav = id;
                };
                $scope.checkSubActiveNav = function(id, parent) {
                    $scope.activeSubNav = id;
                    $scope.activeShowNav = parent;
                    $scope.openNav = parent;
                };
                $scope.checkThirdActiveNav = function(id, pid) {
                    $scope.activeThirdNav = id;
                    $scope.activeSubNav = pid;
                };
                $scope.goPage = function(url) {
                    if(!url) {
                        return;
                    }
                    $location.url("/"+url);
                };
            });
        }])

        //app详情
        .controller("AppViewDetailCtl", ["$scope", "$rootScope", "ComView", "AppsRes", "$routeParams", "$location", "$timeout",
            function($scope, $rootScope, ComView, res, $routeParams, $location, $timeout){
                $scope.selectAble = false;
                ComView.makeDefaultPageAction($scope, "HOME/apps", ['list', 'listAll']);

                $scope.consoleMessages = [];

                res.get({
                    id: $routeParams.id
                }).$promise.then(function(data){
                    $scope.appInfo = data;
                });

                $scope.consoleClass = "info";


                //卸载
                //@todo 卸载确认
                $scope.doAppUninstall = function() {
                    $scope.consoleMessages = [];
                    $scope.consoleMessages.push(
                        $rootScope.i18n.lang.messages.apps.uninstalling
                    );
                    res.delete({
                        id: $scope.appInfo.alias
                    }).$promise.then(function(data){
                        if(data.error) {
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.messages.apps.uninstall_failed + ": " + data.msg
                            );
                        }
                        $scope.consoleMessages.push(
                            $rootScope.i18n.lang.messages.apps.uninstall_success
                        );
                        $scope.consoleMessages.push(
                            $rootScope.i18n.lang.messages.apps.afterOperate
                        );
                        $scope.appInfo = data;
                    });
                };

                //安装
                $scope.doAppInstall = function() {
                    $scope.consoleMessages = [];
                    $scope.consoleMessages.push(
                        $rootScope.i18n.lang.messages.apps.installing
                    );
                    var params = {
                        alias: $scope.appInfo.alias
                    };
                    res.save(params, function(data){

                        if(data.type == "requirements") {
                            $scope.consoleClass = "danger";
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.requirementsApp + ": " + data.requirements
                            );
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.messages.apps.requirements
                            );
                            return;
                        }

                        if(data.error) {
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.messages.apps.install_failed + ": " + data.msg
                            );
                        } else {
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.messages.apps.install_success
                            );
                            $scope.consoleMessages.push(
                                $rootScope.i18n.lang.messages.apps.afterOperate
                            );
                            $scope.appInfo = data;
                        }
                    });
                };

                var changeStatus = function(status) {
                    $scope.consoleMessages = [];
                    var params = {
                        alias: $scope.appInfo.alias,
                        status: status
                    };
                    res.update({id: $scope.appInfo.id}, params, function(data){
                        if(!data.error) {
                            $timeout(function(){
                                $scope.consoleMessages.push($rootScope.i18n.lang.messages.apps.operateSuccess);
                                $scope.appInfo = data;
                                $scope.consoleMessages.push($rootScope.i18n.lang.messages.apps.afterOperate);
                            }, 100);

                        }
                    });
                };

                //禁用
                $scope.doAppInactive = function() {
                    $scope.consoleMessages = [];
                    changeStatus(0);
                };


                //启用
                $scope.doAppActive = function() {
                    $scope.consoleMessages = [];
                    changeStatus(1);
                };

                //升级
                $scope.doAppUpgrade = function() {
                    $scope.consoleMessages = [];
                    $scope.consoleMessages.push(
                        $rootScope.i18n.lang.messages.apps.upgrading
                    );
                    res.update({
                        id: $scope.appInfo.id,
                        alias: $scope.appInfo.alias,
                        upgrade: true
                    }, {}, function(data){
                        $scope.consoleMessages.push(
                            $rootScope.i18n.lang.messages.apps.upgradeSuccess
                        );
                        $scope.consoleMessages.push($rootScope.i18n.lang.messages.apps.afterOperate);
                        $scope.appInfo = data;
                    });
                }

            }])
    ;
})();