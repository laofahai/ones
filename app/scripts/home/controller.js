'use strict';

angular.module("erp.home", ['erp.home.services', 'ngGrid', 'erp.common.directives'])
        .config(function($routeProvider) {
            $routeProvider
                    .when('/HOME/DataModel', {
                        templateUrl: "views/home/dataModel/index.html",
                        controller: "DataModelCtl"
                    })
                    .when('/HOME/DataModel/add', {
                        templateUrl: "views/home/dataModel/edit.html",
                        controller: "DataModelEditCtl"
                    })
                    .when('/HOME/DataModel/edit/id/:id', {
                        templateUrl: "views/home/dataModel/edit.html",
                        controller: "DataModelEditCtl"
                    })
                    .when('/HOME/DataModel/viewSub/id/:id', {
                        templateUrl: "views/home/dataModel/viewSub.html",
                        controller: "DataModelFieldsCtl"
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
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "$location",
            function($scope, DataModelFieldsRes, DataModelFieldsModel, $location) {
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
                var fields = DataModelFieldsModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope: $scope,
                    resource: DataModelFieldsRes,
                    location: $location
                }, fields);
            }])