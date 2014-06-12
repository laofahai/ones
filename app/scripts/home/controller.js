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
//                    .when('/HOME/DataModel', {
//                        templateUrl: "views/common/grid.html",
//                        controller: "DataModelCtl"
//                    })
//                    .when('/HOME/DataModel/add', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelEditCtl"
//                    })
//                    .when('/HOME/DataModel/edit/id/:id', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelEditCtl"
//                    })
                    .when('/HOME/viewChild/dataModel/pid/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "DataModelFieldsCtl"
                    })
//                    .when('/HOME/DataModelFields/add/pid/:pid', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelFieldsEditCtl"
//                    })
//                    .when('/HOME/DataModelFields/edit/id/:id/pid/:pid', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelFieldsEditCtl"
//                    })
                    .when('/HOME/DataModelData/catid/:catid', {
                        templateUrl: "views/common/blank.html",
                        controller: "DataModelDataCatidCtl"
                    })
//                    .when('/HOME/DataModelData/:modelId', {
//                        templateUrl: "views/common/grid.html",
//                        controller: "DataModelDataCtl"
//                    })
//                    .when('/HOME/DataModelData/add/:modelId', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelDataEditCtl"
//                    })
//                    .when('/HOME/DataModelData/:modelId/edit/id/:id', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "DataModelDataEditCtl"
//                    })
                    .when('/HOME/viewChild/workflow/pid/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "WorkflowNodeCtl"
                    })
//                    .when('/HOME/WorkflowNode/add/pid/:pid', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "WorkflowNodeEditCtl"
//                    })
//                    .when('/HOME/WorkflowNode/edit/id/:id/pid/:pid', {
//                        templateUrl: "views/common/edit.html",
//                        controller: "WorkflowNodeEditCtl"
//                    })
                    .when('/HOME/Settings/clearCache', {
                        templateUrl: "views/home/clearCache.html",
                        controller: "clearCacheCtl"
                    })
                    .when('/HOME/Settings/dataBackup', {
                        templateUrl: "views/home/dataBackup.html",
                        controller: "dataBackupCtl"
                    })
                    .when('/HOME/Settings/clearData', {
                        templateUrl: "views/home/clearData.html",
                        controller: "clearDataCtl"
                    })
                    ;
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])
        .controller("clearCacheCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
                });
            };
        }])
        .controller("clearDataCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
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
                ComView.makeGridSelectedActions($scope, model, res, "HOME", "DataModelFields"); 
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
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModelFields/add/pid/"+$routeParams.id
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModel/viewSub/id/"+$routeParams.pid
                    }
                ];
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/HOME/DataModelFields",
                    returnPage: "/HOME/DataModel/viewSub/id/"+$routeParams.id,
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