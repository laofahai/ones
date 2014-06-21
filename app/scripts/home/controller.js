'use strict';

angular.module("ones.home", ['ones.home.services', 'ngGrid', 'ones.common.directives'])
        .config(["$routeProvider",function($routeProvider) {
            $routeProvider
                    .when('/HOME/goTo/url/:url', {
                        controller: "HOMERedirectCtl",
                        templateUrl: "views/common/blank.html",
                    })
                    .when('/HOME/Index/dashboard', {
                        controller: "HOMEDashboardCtl",
                        templateUrl: "views/home/dashboard.html"
                    })
                    .when('/HOME/viewChild/dataModel/pid/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "DataModelFieldsCtl"
                    })
                    .when('/HOME/DataModelData/catid/:catid', {
                        templateUrl: "views/common/blank.html",
                        controller: "DataModelDataCatidCtl"
                    })
                    .when('/HOME/viewChild/workflow/pid/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "WorkflowNodeCtl"
                    })
                    .when('/HOME/Settings/clearCache', {
                        templateUrl: "views/home/clearCache.html",
                        controller: "clearCacheCtl"
                    })
                    .when('/HOME/Settings/dataBackup', {
                        templateUrl: "views/home/dataBackup.html",
                        controller: "dataBackupCtl"
                    })
                    .when('/HOME/Update/systemUpdate', {
                        templateUrl: "views/home/systemUpdate.html",
                        controller: "systemUpdateCtl"
                    })
                    .when('/HOME/list/myDesktop', {
                        templateUrl: "views/home/myDesktop.html",
                        controller: "HomeMyDesktopCtl"
                    })
                    ;
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])
        .controller("HomeMyDesktopCtl", ["$scope", "MyDesktopRes", function($scope, res){
//                $scope.$on("initDataLoaded", function(evt, initData){
                    res.query().$promise.then(function(data){
                        $scope.items = data;
                    });
//                });
                $scope.doSubmit = function() {
                    res.save($scope.items);
                };
        }])
        .controller("clearCacheCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
                });
            };
        }])
        //系统升级
        .controller("systemUpdateCtl", ["$scope", "$http", "ones.config", "ComView", "$rootScope",
            function($scope, $http, conf, ComView, $rootScope){
                var uri = conf.BSU+"HOME/Update/systemUpdate";
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
                $http({method: "POST", url:conf.BSU+'HOME/Settings/dataBackup', data:{options: $scope.options}}).success(function(data){
                    ComView.alert(data, "info");
                });
            };
        }])
        .controller("WorkflowNodeCtl", ["$scope", "WorkflowNodeRes", "WorkflowNodeModel", "ComView", "$routeParams", 
            function($scope, WorkflowNodeRes, WorkflowNodeModel, ComView, $routeParams){
                $routeParams.group = "HOME";
                $routeParams.module = "workflowNode";
                var actions = $scope.$parent.i18n.urlMap.HOME.modules.WorkflowNode.actions;
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                ComView.makeGridSelectedActions($scope, WorkflowNodeModel, WorkflowNodeRes, "HOME", "WorkflowNode"); 
//                function($scope, model, res, group, module);
//                $scope.currentPage.action = "某工作流";
                ComView.displayGrid($scope,WorkflowNodeModel,WorkflowNodeRes, {
                    queryExtraParams: {
                        workflow_id: $routeParams.pid
                    },
                    module: "/HOME/WorkflowNode",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])
        .controller("WorkflowNodeEditCtl", ["$scope", "WorkflowNodeModel", "WorkflowNodeRes", "ComView", "$routeParams",
            function($scope, WorkflowNodeModel, WorkflowNodeRes, ComView, $routeParams) {
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/HOME/WorkflowNode",
                    returnPage: "/HOME/Workflow/viewSub/id/"+$routeParams.pid,
                    id: $routeParams.id
                };
                ComView.displayForm($scope, WorkflowNodeModel, WorkflowNodeRes, opts, true);
            }])
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams) {
                $routeParams.group = "HOME";
                $routeParams.module = "DataModelFields";
                var actions = $scope.$parent.i18n.urlMap.HOME.modules.DataModelFields.actions;
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                ComView.makeGridSelectedActions($scope, model, res, "HOME", "DataModelFields", "/pid/"+$routeParams.pid); 
                ComView.displayGrid($scope,model,res, {
                    queryExtraParams: {
                        modelId: $routeParams.pid
                    },
                    module: "/HOME/DataModelFields",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
                
//                ComView.makeGridLinkActions($scope, actions, false, "/pid/"+$routeParams.pid);
//                ComView.makeGridSelectedActions($scope, model, res, "HOME", "WorkflowNode"); 
//                ComView.displayGrid($scope,model,res,{
//                    queryExtraParams: {
//                        modelId: $routeParams.pid
//                    },
//                    module: "/HOME/DataModelFields",
//                    editExtraParams: "/pid/"+$routeParams.pid
//                });
            }])
        
        .controller("DataModelFieldsEditCtl", ["$scope", "DataModelFieldsModel", "DataModelFieldsRes", "ComView", "$routeParams",
            function($scope, DataModelFieldsModel, DataModelFieldsRes, ComView, $routeParams) {
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/HOME/DataModelFields",
                    returnPage: "/HOME/viewChild/dataModel/pid/"+$routeParams.pid,
                    id: $routeParams.id
                };
                ComView.displayForm($scope, DataModelFieldsModel, DataModelFieldsRes, opts);
            }])
        .controller("DataModelDataCatidCtl", ["$scope", "$location", "DataModelRes", "$routeParams",
            function($scope, $location, res, $routeParams){
                res.get({
                    id: 0,
                    cat_id: $routeParams.catid
                }).$promise.then(function(data){
                    $location.url("/HOME/list/DataModelData/modelId/"+data.id+"/source_id/"+$routeParams.catid);
                });
            }])
        .controller("DataModelDataCtl", ["$scope", "DataModelDataRes", "DataModelDataModel", "ComView", "$routeParams",
            function($scope, DataModelDataRes, DataModelDataModel, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModelData/add/"+$routeParams.modelId
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModelData/"+$routeParams.modelId
                    }
                ];
                ComView.displayGrid($scope, DataModelDataModel, DataModelDataRes, {
                    module: "/HOME/DataModelData",
                    subModule: $routeParams.modelId,
                    queryExtraParams: {modelId:$routeParams.modelId}
                });
            }])
        .controller("DataModelDataEditCtl", ["$scope", "DataModelDataModel", "DataModelDataRes","DataModelFieldsRes", "ComView", "$routeParams",
            function($scope, DataModelDataModel, DataModelDataRes, DataModelFieldsRes, ComView, $routeParams) {
                
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModelData/add/"+$routeParams.modelId
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModelData/"+$routeParams.modelId
                    }
                ];
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelDataEdit",
                    module: "/HOME/DataModelData",
                    returnPage: "/HOME/DataModelData/"+$routeParams.modelId,
                    id: $routeParams.id,
                    dataLoadedEvent: "foreignDataLoaded"
                };
                ComView.displayForm($scope,DataModelDataModel,DataModelDataRes,opts, true);
            }])