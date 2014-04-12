angular.module("erp.doWorkflow", ["erp.doWorkflow.service"])
    .config(["$routeProvider",function($routeProvider) {
        $routeProvider
            .when('/doWorkflow/Stockout/confirm/id/:id', {
                controller: "WorkflowConfirmStockoutCtl",
                templateUrl: "views/jxc/stockout/confirmStockout.html"
            })
        }])
        .controller("WorkflowConfirmStockoutCtl", ["$scope", "$routeParams", "ComView", "StockoutRes", "StockoutEditModel",
            function($scope, $routeParams, ComView, res, model){
                $scope.selectAble= false;
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id,
                    queryExtraParams: {includeSource: true, workflowing: true}
                });
            }])