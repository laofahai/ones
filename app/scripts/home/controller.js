'use strict';

angular.module("erp.home", ['erp.home.services', 'ngGrid', 'erp.common.directives'])
        .config(["$routeProvider",function($routeProvider) {
            $routeProvider
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
                    .when('/HOME/DataModelFields/edit/id/:id', {
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
                    .when('/HOME/Types', {
                        templateUrl: "views/common/grid.html",
                        controller: "HomeTypesCtl"
                    })
                    .when('/HOME/Types/add', {
                        templateUrl: "views/common/edit.html",
                        controller: "HomeTypesEditCtl"
                    })
                    .when('/HOME/Types/edit/id/:id', {
                        templateUrl: "views/common/edit.html",
                        controller: "HomeTypesEditCtl"
                    })
                    .when('/HOME/Settings/clearCache', {
                        templateUrl: "views/home/clearCache.html",
                        controller: "clearCacheCtl"
                    })
        }])
        .controller("clearCacheCtl", ["$scope", "$http", "erp.config", function($scope, $http, conf){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    $scope.$parent.alert($scope.i18n.lang.messages.cacheCleared);
                });
            };
        }])
        .controller("HomeTypesCtl", ["$scope", "TypesRes", "TypesModel", "ComView", 
            function($scope, TypesRes, TypesModel, ComView){
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
                ComView.displayGrid($scope,TypesModel,TypesRes);
            }])
        .controller("HomeTypesEditCtl", ["$scope", "TypesRes", "TypesModel", "ComView", "$routeParams",
            function($scope, TypesRes, TypesModel, ComView, $routeParams) {
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
                $scope.selecteAble = false;
                
                var opts = {
                    name: "TypesEdit",
                    id: $routeParams.id
                };
                ComView.displayForm($scope,TypesModel,TypesRes,opts);
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
                $scope.selecteAble = false;
                
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
                        href  : "/HOME/DataModelFields"
                    }
                ];
                ComView.displayGrid($scope,DataModelFieldsModel,DataModelFieldsRes,{
                    module: "/HOME/DataModelFields"
                });
            }])
        
        .controller("DataModelFieldsEditCtl", ["$scope", "DataModelFieldsModel", "DataModelFieldsRes", "ComView", "$routeParams",
            function($scope, DataModelFieldsModel, DataModelFieldsRes, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/DataModelFields/add/pid/"+$routeParams.pid
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/DataModelFields/"
                    }
                ];
                $scope.selecteAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/HOME/DataModelFields",
                    returnPage: "/HOME/DataModel/viewSub/id/"+$routeParams.pid,
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
                    extraParams: {modelId:$routeParams.modelId}
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
                $scope.selecteAble = false;
                var opts = {
                    name: "DataModelDataEdit",
                    module: "/HOME/DataModelData",
                    returnPage: "/HOME/DataModelData/"+$routeParams.modelId,
                    id: $routeParams.id,
                    dataLoadedEvent: "foreignDataLoaded"
                };
                ComView.displayForm($scope,DataModelDataModel,DataModelDataRes,opts, true);
            }])