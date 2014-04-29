'use strict'
/**
 * 工作流节点额外操作处理
 * 如：出库单 确认出库时需要一个界面显示出库信息以供确认
 * */
angular.module("erp.doWorkflow", ["erp.doWorkflow.service"])
    .config(["$routeProvider",function($routeProvider) {
        $routeProvider
            .when('/doWorkflow/Stockout/confirm/:nodeId/:id', {
                controller: "WorkflowConfirmStockoutCtl",
                templateUrl: "views/jxc/stockout/confirmStockout.html"
            })
        }])
    .controller("WorkflowConfirmStockoutCtl", ["$scope", "$routeParams", "ComView", "StockoutRes", "StockoutEditModel", "$location",
        function($scope, $routeParams, ComView, res, model, $location){
            $scope.selectAble= false;
            ComView.displayBill($scope, model, res, {
                id: $routeParams.id,
                queryExtraParams: {includeSource: true, workflowing: true}
            });

            $scope.doSubmit = function() {
                $scope.formMetaData.rows = $scope.formData;
                res.doPostWorkflow({
                    workflow: true,
                    node_id: $routeParams.nodeId,
                    id: $routeParams.id,
                    donext: true,
                    data: $scope.formMetaData
                }).$promise.then(function(data){
//                    console.log(data);return;
                    $location.url("/JXC/list/tockout");
                });
            };
        }])