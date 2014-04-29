'use strict';

angular.module("erp.home", ['erp.home.services', 'ngGrid', 'erp.common.directives'])
        .config(["$routeProvider",function($routeProvider) {
            $routeProvider
                    .when('/HOME/goTo/url/:url', {
                        controller: "HOMERedirectCtl",
                        templateUrl: "views/common/blank.html",
                    })
                    .when('/HOME/DataModel', {
                        templateUrl: "views/common/grid.html",
                        controller: "DataModelCtl"
                    })
                    .when('/HOME/DataModel/add', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelEditCtl"
                    })
                    .when('/HOME/DataModel/edit/id/:id', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelEditCtl"
                    })
                    .when('/HOME/DataModel/viewSub/id/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "DataModelFieldsCtl"
                    })
                    .when('/HOME/DataModelFields/add/pid/:pid', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelFieldsEditCtl"
                    })
                    .when('/HOME/DataModelFields/edit/id/:id/pid/:pid', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelFieldsEditCtl"
                    })
                    .when('/HOME/DataModelData/:modelId', {
                        templateUrl: "views/common/grid.html",
                        controller: "DataModelDataCtl"
                    })
                    .when('/HOME/DataModelData/add/:modelId', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelDataEditCtl"
                    })
                    .when('/HOME/DataModelData/:modelId/edit/id/:id', {
                        templateUrl: "views/common/edit.html",
                        controller: "DataModelDataEditCtl"
                    })
                    .when('/HOME/viewChild/workflow/pid/:pid', {
                        templateUrl: "views/common/grid.html",
                        controller: "WorkflowNodeCtl"
                    })
                    .when('/HOME/WorkflowNode/add/pid/:pid', {
                        templateUrl: "views/common/edit.html",
                        controller: "WorkflowNodeEditCtl"
                    })
                    .when('/HOME/WorkflowNode/edit/id/:id/pid/:pid', {
                        templateUrl: "views/common/edit.html",
                        controller: "WorkflowNodeEditCtl"
                    })
                    .when('/HOME/Settings/clearCache', {
                        templateUrl: "views/home/clearCache.html",
                        controller: "clearCacheCtl"
                    })
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])
        .controller("clearCacheCtl", ["$scope", "$http", "erp.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
                });
            };
        }])
        .controller("WorkflowNodeCtl", ["$scope", "WorkflowNodeRes", "WorkflowNodeModel", "ComView", "$routeParams", 
            function($scope, WorkflowNodeRes, WorkflowNodeModel, ComView, $routeParams){
                $routeParams.group = "HOME";
                $routeParams.module = "workflowNode";
                var actions = $scope.$parent.i18n.urlMap.HOME.modules.WorkflowNode.actions;
                ComView.makeGridLinkActions($scope, actions, false, "/pid/"+$routeParams.pid);
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
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/WorkflowNode/add/pid/"+$routeParams.pid
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/Workflow/viewSub/id/"+$routeParams.pid
                    }
                ];
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/HOME/WorkflowNode",
                    returnPage: "/HOME/Workflow/viewSub/id/"+$routeParams.pid,
                    id: $routeParams.id
                };
                ComView.displayForm($scope, WorkflowNodeModel, WorkflowNodeRes, opts, true);
            }])
        .controller("WorkflowCtl", ["$scope", "WorkflowRes", "WorkflowModel", "ComView", 
            function($scope, WorkflowRes, WorkflowModel, ComView){
                $scope.pageActions = [
                    {
                        label: $scope.i18n.lang.actions.add,
                        class: "success",
                        href: "/HOME/Types/add"
                    },
                    {
                        label: $scope.i18n.lang.actions.list,
                        class: "primary",
                        href: "/HOME/Types"
                    }
                ];
                $scope.viewSubAble = true;
                ComView.displayGrid($scope,WorkflowModel,WorkflowRes);
            }])
        .controller("WorkflowEditCtl", ["$scope", "WorkflowRes", "WorkflowModel", "ComView", "$routeParams",
            function($scope, WorkflowRes, WorkflowModel, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label: $scope.i18n.lang.actions.add,
                        class: "success",
                        href: "/HOME/Types/add"
                    },
                    {
                        label: $scope.i18n.lang.actions.list,
                        class: "primary",
                        href: "/HOME/Types"
                    }
                ];
                $scope.selectAble = false;
                
                var opts = {
                    name: "TypesEdit",
                    id: $routeParams.id
                };
                ComView.displayForm($scope,WorkflowModel,WorkflowRes,opts);
            }])
        .controller("DataModelCtl", ["$scope", "DataModelRes", "DataModelModel", "ComView",
            function($scope, DataModelRes, DataModelModel, ComView) {
                $scope.pageActions = [
                    {
                        label: $scope.i18n.lang.actions.add,
                        class: "success",
                        href: "/HOME/DataModel/add"
                    },
                    {
                        label: $scope.i18n.lang.actions.list,
                        class: "primary",
                        href: "/HOME/DataModel"
                    }
                ];
                $scope.viewSubAble = true;
                ComView.displayGrid($scope, DataModelModel, DataModelRes);
            }])
        .controller("DataModelEditCtl", ["$scope", "DataModelModel", "DataModelRes", "ComView", "$routeParams",
            function($scope, DataModelModel, DataModelRes, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModel/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModel/"
                    }
                ];
                $scope.selectAble = false;
                
                var opts = {
                    name: "DataModelEdit",
                    id: $routeParams.id
                };
                ComView.displayForm($scope,DataModelModel,DataModelRes, opts);
            }])
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "ComView", "$routeParams",
            function($scope, DataModelFieldsRes, DataModelFieldsModel, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModelFields/add/pid/"+$routeParams.pid
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModel/viewSub/id/"+$routeParams.pid
                    }
                ];
                ComView.displayGrid($scope,DataModelFieldsModel,DataModelFieldsRes,{
                    queryExtraParams: {
                        modelId: $routeParams.pid
                    },
                    module: "/HOME/DataModelFields",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
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