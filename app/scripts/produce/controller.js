'use strict';

angular.module("ones.produce", ["ones.produce.service"])
        .config(["$routeProvider", function($route){
            $route.when('/Produce/addBill/producePlan', {
                templateUrl: "views/produce/producePlan/edit.html",
                controller : "ProducePlanEditCtl"
            });
        }])
        .controller("ProducePlanEditCtl", ["$scope", "ProducePlanDetailModel", "ProducePlanDetailRes", "ComView", "$routeParams","TypesRes",
            function($scope, model, res, comView, $routeParams, TypesRes){
                
                $scope.selectAble = false;
                
                $scope.formMetaData = {
                    startTime : new Date(),
                    endTime : new Date()
                };
                
                //生产计划类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.purchase_type",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "produce"
                        }
                    }
                };
                
                comView.displayBill($scope, model, res, {
                    id: $routeParams.id
                });
            }])
    ;