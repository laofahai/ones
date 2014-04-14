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
                        console.log(data);return;
                        $location.url("/JXC/Stockout");
                    });
                };
            }])