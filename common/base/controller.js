(function(){
    angular.module('ones.common', ['ones.common.filters', 'ones.common.directives'])
        .config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {

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
                .when('/HOME/viewDetail/apps/alias/:alias', {
                    templateUrl: "common/base/views/home/appDetail.html",
                    controller: "AppViewDetailCtl"
                })
                .when("/systemPreference", {
                    templateUrl: "common/base/views/systemPreference.html",
                    controller: "SystemPreferenceCtl"
                })
            ;
//            $locationProvider.html5Mode(true);
//            $locationProvider.hashPrefix('!');
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])

        .controller("clearCacheCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.frontCache = [false, false, false];
            $scope.doClearCache = function() {
                angular.forEach($scope.frontCache, function(item, k){
                    if(!item) {
                        return;
                    }
                    switch(k) {
                        case 0:
                            ones.caches.clear(-1);
                        case 1:
                            ones.caches.clear(0);
                        case 2:
                            ones.caches.clear(1);
                    }
                });
                $http({method: "POST", url:conf.BSU+'home/clearCache.json', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert(l('lang.messages.cacheCleared'));
                });
            };
        }])
        .controller('TopBarCtl', ['$scope', function($scope){
        	var navs = ones.caches.getItem("ones.main.navs");

            if(!navs) {
                return false;
            }
            ones.caches.setItem("ones.settings.navs", navs.shift());
            $scope.navs = navs;
            
            angular.forEach(navs, function(c1, k) {
            	if(c1.childs) {
            		angular.forEach(c1.childs, function(c2, i){
            			navs[k].childs[i].label = l("lang.navs."+c2.label);
            			if(c2.childs) {
    						angular.forEach(c2.childs, function(c3, j){
    							navs[k].childs[i].childs[j].label = l("lang.navs."+c3.label);
    						});
            			}
            		});
            	}
            });
            
            //左侧导航切换
            $scope.toggleLeftMenu = function(childs, id){
            	$scope.active_nav = id;
            	$scope.$emit("left_side_changed", childs);
            }
        }])

        .controller("SystemPreferenceCtl", ["$scope", "$rootScope",
            function($scope, $rootScope){
                $scope.selectAble = false;
                $scope.settingNav = ones.caches.getItem("ones.settings.navs");
                $rootScope.currentPage = {
                		lang: {
                			app: l("lang.navs.system_setting")
                		}
                };
            }])

        //app详情
        .controller("AppViewDetailCtl", ["$scope", "$rootScope", "ComView", "ones.dataApiFactory", "$routeParams", "$location", "$timeout", "$modal",
            function($scope, $rootScope, ComView, dataAPI, $routeParams, $location, $timeout, $modal){

                dataAPI.init("HOME", "apps");
                var appModel = dataAPI.model;

                $scope.selectAble = false;
                ComView.makeDefaultPageAction($scope, "HOME/apps", ['list', 'listall']);

                $scope.consoleMessages = [];

                appModel.api.get({
                    id: $routeParams.id || 0,
                    alias: $routeParams.alias
                }).$promise.then(function(data){
                    $scope.appInfo = data;
                });



                $scope.consoleClass = "info";

                //卸载确认
                //@todo 卸载确认
                var confirmModal = {};
                $scope.doAppUninstall = function() {
                    confirmModal = $modal({
                        template: "common/base/views/home/confirmUninstallApp.html",
                        scope: $scope
                    });
                };
                //卸载
                $scope.uninstallConfirmed = function() {
                    $scope.consoleMessages = [];
                    $scope.consoleMessages.push(
                        l('lang.messages.apps.uninstalling')
                    );
                    appModel.api.delete({
                        id: $scope.appInfo.alias
                    }).$promise.then(function(data){
                        if(data.error) {
                            $scope.consoleMessages.push(
                                l('lang.messages.apps.uninstall_failed') + ": " + data.msg
                            );
                        }
                        $scope.consoleMessages.push(
                            l('lang.messages.apps.uninstall_success')
                        );
                        $scope.consoleMessages.push(
                            l('lang.messages.apps.afterOperate')
                        );
                        $scope.appInfo = data;
                    });
                    confirmModal.hide();
                };

                //安装
                $scope.doAppInstall = function() {
                    $scope.consoleMessages = [];
                    $scope.consoleMessages.push(
                        l('lang.messages.apps.installing')
                    );
                    var params = {
                        alias: $scope.appInfo.alias
                    };
                    appModel.api.save(params, function(data){

                        if(data.type === "ones") {
                            $scope.consoleClass = "danger"
                            $scope.consoleMessages.push(
                                sprintf(l("lang.messages.apps.requirementOnesVersion"), data.requirements)
                            );
                            return;
                        }
                        if(data.type == "requirements") {
                            $scope.consoleClass = "danger";
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.requirementsApp") + "<br /> " + data.requirements.join("<br />")
                            );
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.requirements")
                            );
                            return;
                        }

                        if(data.error) {
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.install_failed") + ": " + data.msg
                            );
                        } else {
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.install_success")
                            );
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.afterOperate")
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
                    appModel.api.update({id: $scope.appInfo.id}, params, function(data){
                        if(!data.error) {
                            $timeout(function(){
                                $scope.consoleMessages.push(l("lang.messages.apps.operateSuccess"));
                                $scope.appInfo = data;
                                $scope.consoleMessages.push(l("lang.messages.apps.afterOperate"));
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
                        l('lang.messages.apps.upgrading')
                    );
                    appModel.api.update({
                        id: $scope.appInfo.id,
                        alias: $scope.appInfo.alias,
                        upgrade: true
                    }, {}, function(data){

                        if(data.type === "ones") {
                            $scope.consoleClass = "danger"
                            $scope.consoleMessages.push(
                                sprintf(l("lang.messages.apps.requirementOnesVersion"), data.requirements)
                            );
                            return;
                        }
                        if(data.type == "requirements") {
                            $scope.consoleClass = "danger";
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.requirementsApp") + "<br /> " + data.requirements.join("<br />")
                            );
                            $scope.consoleMessages.push(
                                l("lang.messages.apps.requirements")
                            );
                            return;
                        }

                        $scope.consoleMessages.push(
                            l('lang.messages.apps.upgradeSuccess')
                        );
                        $scope.consoleMessages.push(l('lang.messages.apps.afterOperate'));
                        $scope.appInfo = data;
                    });
                }

            }])
    ;
})();