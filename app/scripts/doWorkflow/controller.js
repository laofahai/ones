'use strict'
/**
 * 工作流节点额外操作处理
 * 如：出库单 确认出库时需要一个界面显示出库信息以供确认
 * */
angular.module("ones.doWorkflow", ["ones.doWorkflow.service"])
    .config(["$routeProvider",function($routeProvider) {
        $routeProvider
            .when('/doWorkflow/Stockout/confirm/:nodeId/:id', {
                controller: "WorkflowConfirmStockoutCtl",
                templateUrl: "views/jxc/stockout/confirmStockout.html"
            })
            .when('/doWorkflow/Stockin/confirm/:nodeId/:id', {
                controller: "WorkflowConfirmStockinCtl",
                templateUrl: "views/jxc/stockin/confirmStockin.html"
            })
            .when('/doWorkflow/Produce/makeBoms/:nodeId/:id', {
                templateUrl: "views/produce/producePlan/makeBoms.html",
                controller: "WorkflowMakeProduceBomsCtl"
            })
            .when('/doWorkflow/Produce/doCraft/:nodeId/:id', {
                templateUrl: "views/produce/producePlan/doCraft.html",
                controller : "WorkflowDoCraftCtl"
            })
            ;
        }])
    //确认出库
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
                    $location.url("/JXC/list/stockout");
                });
            };
        }])
    //确认入库
    .controller("WorkflowConfirmStockinCtl", ["$scope", "$routeParams", "ComView", "StockinRes", "StockinEditModel", "$location",
        function($scope, $routeParams, ComView, res, model, $location){
            $scope.selectAble= false;
            ComView.displayBill($scope, model, res, {
                id: $routeParams.id,
                queryExtraParams: {includeSource: true, workflowing: true}
            });

            $scope.doSubmit = function() {
                
                $scope.formMetaData.rows = $scope.formData;
                var data = {
                    workflow: true,
                    node_id: $routeParams.nodeId,
                    id: $routeParams.id,
                    donext: true,
//                    data: $scope.formMetaData
                };
                res.doPostWorkflow(data).$promise.then(function(data){
                    $location.url("/JXC/list/stockin");
                });
            };
        }])
    //生成生产计划物料清单
    .controller("WorkflowMakeProduceBomsCtl", ["$scope", "ComView", "ProduceBomsRes", "ProduceBomsModel", "$routeParams", "$location",
        function($scope, ComView, res, model, $routeParams, $location){
            $scope.selectAble=false;
            
            ComView.makeGridSelectedActions($scope, model, res, "Produce", "ProducePlan");
            
            ComView.displayBill($scope, model, res, {
                id: $routeParams.id,
                queryExtraParams: {workflowing: true}
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
                    $location.url("/JXC/list/stockout");
                });
            };
        }])
    /**
     * 执行生产工序
     * 提供当前生产计划成品列表，供操作员选择执行某个成品的某个工序，工序按照预定义顺序执行
     * */
    .controller("WorkflowDoCraftCtl", ["$scope", "ComView", "DoCraftRes", "DoCraftModel", "$routeParams",
        function($scope, ComView, res, model, $routeParams){
            
            /**
             * 扩展选择操作选项
             * */
            ComView.makeGridSelectedActions($scope, model, res, "Produce", "doCraft");
            
            
            
            ComView.displayGrid($scope, model, res, {
                queryExtraParams: {
                    plan_id: $routeParams.id,
                    workflow: true
                }
            });
        }])
    ;