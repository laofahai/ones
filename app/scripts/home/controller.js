'use strict';

angular.module("erp.home", ['erp.home.services', 'ngGrid', 'erp.common.directives'])
        .config(function($routeProvider) {
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
                    });
        })
        .controller("DataModelCtl", ["$scope", "DataModelRes", "DataModelModel", "$location",
            function($scope, DataModelRes, DataModelModel, $location) {
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
                var fields = DataModelModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope: $scope,
                    resource: DataModelRes,
                    location: $location
                }, fields);
            }])
        .controller("DataModelEditCtl", ["$scope", "DataModelModel", "DataModelRes", "$location", "$routeParams",
            function($scope, DataModelModel, DataModelRes, $location, $routeParams) {
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
                CommonView.displayForm({
                    scope : $scope,
                    resource: DataModelRes,
                    location: $location,
                    routeParams: $routeParams
                }, DataModelModel, opts);
            }])
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "$location", "$routeParams",
            function($scope, DataModelFieldsRes, DataModelFieldsModel, $location, $routeParams) {
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
                var fields = DataModelFieldsModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope: $scope,
                    resource: DataModelFieldsRes,
                    location: $location
                }, fields, {
                    module: "/HOME/DataModelFields",
                });
            }])
        
        .controller("DataModelFieldsEditCtl", ["$scope", "DataModelFieldsModel", "DataModelFieldsRes", "$location", "$routeParams",
            function($scope, DataModelFieldsModel, DataModelFieldsRes, $location, $routeParams) {
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
                CommonView.displayForm({
                    scope : $scope,
                    resource: DataModelFieldsRes,
                    location: $location,
                    routeParams: $routeParams
                }, DataModelFieldsModel, opts);
            }])
        .controller("DataModelDataCtl", ["$scope", "DataModelDataRes", "DataModelDataModel", "$location", "$routeParams",
            function($scope, DataModelDataRes, DataModelDataModel, $location, $routeParams) {
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
                var fields = DataModelDataModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope: $scope,
                    resource: DataModelDataRes,
                    location: $location
                }, fields, {
                    module: "/HOME/DataModelData",
                    subModule: $routeParams.modelId,
                    extraParams: {modelId:$routeParams.modelId}
                });
            }])
        .controller("DataModelDataEditCtl", ["$scope", "DataModelDataModel", "DataModelDataRes","DataModelFieldsRes", "$location", "$routeParams",
            function($scope, DataModelDataModel, DataModelDataRes, DataModelFieldsRes, $location, $routeParams) {
                
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
                CommonView.displayForm({
                    scope : $scope,
                    resource: DataModelDataRes,
                    foreignResource: [$routeParams.modelId, DataModelFieldsRes],
                    location: $location,
                    routeParams: $routeParams
                }, DataModelDataModel, opts);
            }])