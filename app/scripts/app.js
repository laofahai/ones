'use strict';

var loginHash = uriParamsGet('hash');
var ERP = angular.module('erp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngGrid',
    'ngAnimate',
    'mgcrea.ngStrap',
    'localytics.directives',
    
    'erp.common',
    'erp.commonView',
    'erp.config',
    
    'erp.passport',
    'erp.home',
    'erp.jxc',
    'erp.crm'
//    'erp.service'
])
        /**
         * $http interceptor.
         * On 401 response – it stores the request and broadcasts 'event:loginRequired'.
         */
        .config(["$httpProvider", function($httpProvider) {
            var interceptor = ['$rootScope', '$q', function(scope, $q) {
                    function success(response) {
                        return response;
                    }
                    function error(response) {
                        var status = response.status;
                        var deferred = $q.defer();
                        if (401 === status) {
                            scope.$broadcast('event:loginRequired');
                            return deferred.promise;
                        } else if(403 === status) {
                            scope.$broadcast('event:permissionDenied');
                        } else if(500 === status) {
                            scope.$broadcast('event:serverError');
                        }
                        return $q.reject(response);
                    }

                    return function(promise) {
                        return promise.then(success, error);
                    };
                }];
            $httpProvider.responseInterceptors.push(interceptor);
        }])
        .run(["$http", function($http) {
            //设置HTTP请求默认头
            $http.defaults.headers.common["sessionHash"] = loginHash;
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            $http.defaults.transformRequest = function(data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;
            };
        }]);

/**
 * Root Ctrl
 * */
ERP.controller('MainCtl', ["$scope", "$rootScope", "$location", "$http", "erp.config", "$modal", "ComView",
        function($scope, $rootScope, $location, $http, conf, $modal, ComView) {
            if (!loginHash) {
                window.location.href = 'index.html';
            }
            $scope.$on("event:loginRequired", function() {
                window.location.href = 'index.html';
            });
            
            $scope.$on("event:permissionDenied", function() {
                ComView.alert($rootScope.i18n.lang.messages.permissionDenied, "danger");
            });
            
            $scope.$on("event:serverError", function() {
                ComView.alert($rootScope.i18n.lang.messages.serverError, "danger");
            });
            
//            $scope.openModal = function(controller){
//                var modalInstance = $modal.open({
//                    templateUrl: 'myModalContent.html',
//                    controller: ModalInstanceCtrl,
//                    resolve: {
//                        items: function () {
//                            return $scope.items;
//                        }
//                    }
//                });
//                modalInstance.result.then(function (selectedItem) {
//                    $scope.selected = selectedItem;
//                }, function () {
//                    console.log('Modal dismissed at: ' + new Date());
//                });
//            };
            
            
            $scope.doWorkflow = function(event, node_id, selectedItems, res){
                selectedItems = selectedItems || [];
                if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
                    return false;
                }
                
                for(var i=0;i<selectedItems.length;i++) {
                    res.doWorkflow({
                        workflow: true,
                        node_id: node_id,
                        id: selectedItems[i].id
                    });
                }
                $scope.$broadcast("gridData.changed");
            };
            $scope.workflowActionDisabled = function(id, selectedItems) {
                selectedItems = selectedItems || [];
                if(!selectedItems.length) {
                    return true;
                }
                var result = true;
                for(var i=0;i<selectedItems.length;i++) {
                    var item = selectedItems[i];
                    if(!item["processes"]) {
                        result = true;
                        break;
                    }
                    for(var j=0;j<item.processes.nextNodes.length;j++) {
                        if(item.processes.nextNodes[j].id == id) {
                            result = false;
                            break;
                        }
                    }
                }
                return result;
            };
            $scope.workflowDisabled = function(selectedItems) {
                if(!selectedItems.length) {
                    return true;
                }
                var next = null;
                var disable = true;
                for(var i=0;i<selectedItems.length;i++) {
                    var item = selectedItems[i];
                    if(!item["processes"]) {
                        disable = true;
                        break;
                    }
                    if(next !== null && next !== item["processes"]["nextActions"]) {
                        disable = true;
                        break;
                    }
                    disable = false;
                    next = item["processes"]["nextActions"];
                }
                return disable;
            };

            /**
             * 加载语言包
             * */
            $http.get("scripts/i18n/zh-cn.json").success(function(data) {
                $rootScope.i18n = data;
                /**
                 * 监控路由变化
                 * */
                $scope.$watch(function() {
                    return $location.path();
                }, function() {
                    //设置当前页面信息
                    var fullPath = $location.path().split("/").slice(1, 4);
                    var group = fullPath[0];
                    var module = fullPath[1];
                    var action = fullPath[2];
                    group = group ? group : "HOME";
                    module = module ? module : "Index";
                    action = action && isNaN(parseInt(action)) ? action : "index";
                    $scope.currentPage = {};
                    if (group in $rootScope.i18n.urlMap) {
                        $scope.currentPage.group = $rootScope.i18n.urlMap[group].name;
                        if (module in $rootScope.i18n.urlMap[group].modules) {
                            $scope.currentPage.module = $rootScope.i18n.urlMap[group].modules[module].name;
                            if (action in $rootScope.i18n.urlMap[group].modules[module].actions) {
                                $scope.currentPage.action = $rootScope.i18n.urlMap[group].modules[module].actions[action] instanceof Array 
                                                            ? $rootScope.i18n.urlMap[group].modules[module].actions[action][0]
                                                            : $rootScope.i18n.urlMap[group].modules[module].actions[action];
                                $scope.currentPage.actionDesc = $rootScope.i18n.urlMap[group].modules[module].actions[action] instanceof Array 
                                                            ? $rootScope.i18n.urlMap[group].modules[module].actions[action][1] : "";
                            }
                        }
                    }
                });

                /**
                 * 获取页面基本信息
                 * */
                $http.get(conf.BSU+"HOME/Index/index").success(function(data){
                    $rootScope.uesrInfo = data.user;
                    $scope.$broadcast("initDataLoaded", data);
                });
                
                $scope.$on("initDataLoaded", function(event, data){
                    $scope.userInfo = data.user;
                });
                
            });

        }]);

