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
    'ui.utils',
    'ui.select',
    
    'erp.common',
    'erp.commonView',
    'erp.config',
    'erp.doWorkflow',
    
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
                        if(parseInt(response.data.error) > 0) {
                            scope.$broadcast('event:serverError', response.data.msg);
                            return $q.reject(response);
                        } else {
                            return response;
                        }
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
            
        }]);

/**
 * Root Ctrl
 * */
ERP.controller('MainCtl', ["$scope", "$rootScope", "$location", "$http", "erp.config", "ComView", "WorkflowNodeRes",
        function($scope, $rootScope, $location, $http, conf, ComView, WorkflowNodeRes) {
            
            $scope.$watch(function(){
                return $location.$$url;
            }, function(){
                $scope.currentURI = encodeURI(encodeURIComponent($location.$$url));
            });
            
            if (!loginHash) {
                window.location.href = 'index.html';
            }
            
            //监听全局事件
            $scope.$on("event:loginRequired", function() {
                window.location.href = 'index.html';
            });
            
            $scope.$on("event:permissionDenied", function() {
                ComView.alert($rootScope.i18n.lang.messages.permissionDenied, "danger");
            });
            
            $scope.$on("event:serverError", function(evt, message) {
                message = message || $rootScope.i18n.lang.messages.serverError;
                ComView.alert(message, "danger");
            });
            
            //屏蔽默认快捷键
            $scope.removeDefaultKey = function() {
                
            };
            
//            $scope.assignWorkflowNodes = function(sourceScope){
//                if(sourceScope.workflowAlias) {
//                    WorkflowNodeRes.query({
//                        workflow_alias: sourceScope.workflowAlias,
//                        only_active: true
//                    }).$promise.then(function(data){
//                        sourceScope.workflowActionList = data;
//                    });
//                }
//            };
//            
//            $scope.doWorkflow = function(event, node_id, selectedItems, res){
//                selectedItems = selectedItems || [];
//                if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
//                    return false;
//                }
//                for(var i=0;i<selectedItems.length;i++) {
//                    res.doWorkflow({
//                        workflow: true,
//                        node_id: node_id,
//                        id: selectedItems[i].id
//                    }).$promise.then(function(data){
//                        if(data.type) {
//                            switch(data.type) {
//                                case "redirect":
//                                    $location.url(data.location);
//                                    return;
//                                    break;
//                            }
//                        }
//                    });
//                }
//                $scope.$broadcast("gridData.changed");
//            };
//            $scope.workflowActionDisabled = function(id, selectedItems) {
//                selectedItems = selectedItems || [];
//                if(selectedItems.length > 1) {
//                    return true;
//                }
//                if(!selectedItems.length) {
//                    return true;
//                }
//                var result = true;
//                for(var i=0;i<selectedItems.length;i++) {
//                    var item = selectedItems[i];
//                    if(!item["processes"]) {
//                        result = true;
//                        break;
//                    }
//                    angular.forEach(item.processes.nextNodes, function(node){
//                        if(node.id === id) {
//                            result = false;
//                            return;
//                        }
//                    });
//                }
//                return result;
//            };
//            $scope.workflowDisabled = function(selectedItems) {
//                if(!selectedItems.length) {
//                    return true;
//                }
//                var next = null;
//                var disable = true;
//                for(var i=0;i<selectedItems.length;i++) {
//                    var item = selectedItems[i];
//                    if(!item["processes"]) {
//                        disable = true;
//                        break;
//                    }
//                    if(next !== null && next !== item["processes"]["nextActions"]) {
//                        disable = true;
//                        break;
//                    }
//                    disable = false;
//                    next = item["processes"]["nextActions"];
//                }
//                return disable;
//            };

            /**
             * 加载语言包
             * */
            $rootScope.i18n = angular.fromJson(localStorage.getItem(conf.Prefix+"i18n"));
            if(conf.DEBUG || !$rootScope.i18n) {
                $http.get("scripts/i18n/zh-cn.json").success(function(data) {
                    $rootScope.i18n = data;
                    localStorage.setItem(conf.Prefix+"i18n", angular.toJson(data));
                    
                    /**
                     * 监控路由变化
                     * */
                    $scope.$watch(function() {
                        return $location.path();
                    }, function() {
                        /**
                         * 设置当前页面信息
                         * 两种URL模式： 普通模式 group/module/action
                         *             URL友好模式 action(list|add|edit)/module
                         * */
                        var actionList = ['list', 'add', 'edit', 'addChild', 'viewChild'], fullPath,group,module,action;
                        fullPath = $location.path().split("/").slice(1, 4);
                        group = fullPath[0];
                        fullPath[1] = fullPath[1].replace(/Bill/ig, ''); //将addBill, editBill转换为普通add,edit
                        //友好模式
                        if(actionList.indexOf(fullPath[1]) >= 0) {
                            module= fullPath[2].ucfirst();
                            action= fullPath[1];
                        } else {
                            module = fullPath[1];
                            action = fullPath[2];
                        }

                        group = group ? group : "HOME";
                        module = module ? module : "Index";
                        action = action && isNaN(parseInt(action)) ? action : "list";
//                        console.log(module);
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
                });
            }
            
            
            /**
             * 获取页面基本信息
             * @return {
             *  user: {},
             *  navs: {}
             * }
             * */
            $http.get(conf.BSU+"HOME/Index/index").success(function(data){
                $rootScope.uesrInfo = data.user;
                $scope.$broadcast("initDataLoaded", data);
            });

            $scope.$on("initDataLoaded", function(event, data){
                $scope.userInfo = data.user;
            });


        }]);

