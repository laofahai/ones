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
            //发货单
            .when('/doWorkflow/Stockout/makeShipment/:nodeId/:id', {
                controller: "WorkflowMakeShipmentCtl",
                templateUrl: "views/common/edit.html"
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
            .when('/doWorkflow/Produce/makeStockin/:nodeId/:id', {
                templateUrl: "views/produce/producePlan/makeStockin.html",
                controller : "WorkflowProduceMakeStockinCtl"
            })
            .when('/doWorkflow/FinanceReceivePlan/confirm/:nodeId/:id', {
                templateUrl: "views/finance/confirmReceive.html",
                controller: "WorkflowFinanceReceiveConfirmCtl"
            })
            ;
        }])
    //生成发货单
    .controller("WorkflowMakeShipmentCtl", ["$scope", "StockoutRes", "RelationshipCompanyRes", "ShipmentRes", "ShipmentModel", "ComView", "$routeParams", "ones.config", "$location",
        function($scope, res, cusRes, ShipmentRes, model, ComView, $routeParams, conf, $location){
            var cusId;
            $scope.formData = $scope.formData || {};
            res.get({id:$routeParams.id}).$promise.then(function(data){
                if(!data.source) {
                    return;
                }
                if(data.source.customer_id) {
                    cusId = data.source.customer_id;
                } else if(data.source.supplier_id) {
                    cusId = data.source.supplier_id;
                }
                
                if(cusId) {
                    cusRes.get({
                        id: cusId
                    }).$promise.then(function(data){
                        $scope.formData.to_company = data.name;
                        $scope.formData.to_name = data.Linkman[0].contact;
                        $scope.formData.to_address = data.address;
                        $scope.formData.to_phone = data.Linkman[0].mobile || data.linkman[0].tel;
                    });
                }
            });
            
            
            
            //@todo. 按状态监测，非延时监测
            setTimeout(function(){
                $scope.formData.from_name = $scope.$parent.userInfo.truename;
                $scope.formData.from_company = conf.company_name;
                $scope.formData.from_address = conf.company_address;
                $scope.formData.from_phone   = conf.company_phone;
            },200);
            
            
            $scope.selectAble = false;
            ComView.displayForm($scope, model, res);
            
            //重写doSubmit()方法
            $scope.doSubmit = function(){
                if (!$scope.form.$valid) {
                    ComView.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                    return;
                }
                ShipmentRes.save($scope.formData, function(data){
                    if(data.error) {
                        ComView.alert(data.msg);
                    } else {
                        if(conf.DEBUG) {
                            ComView.alert("success", "success");
                            return;
                        }
                        $location.url("/JXC/list/shipment");
                    }
                });
            };
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
    .controller("WorkflowConfirmStockinCtl", ["$scope", "$routeParams", "ComView", "StockinRes", "StockinEditModel", "$location", "$injector",
        function($scope, $routeParams, ComView, res, model, $location, $injector){
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
                    data: $scope.formMetaData
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
                    $location.url("/Produce/list/producePlan");
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
    /**
     * 生成入库单
     * */
    .controller("WorkflowProduceMakeStockinCtl", ["$scope", "ProducePlanRes", "ProducePlanDetailEditModel", "ComView", "$routeParams", "$location",
        function($scope, res, model, ComView, $routeParams, $location){
            $scope.selectAble = false;
            ComView.displayBill($scope, model, res, {
                plan_id: $routeParams.id,
                queryExtraParams: {workflowing: true}
            });

            $scope.doSubmit = function(){
                $scope.formMetaData.rows = $scope.formData;
                res.doPostWorkflow({
                    workflow: true,
                    node_id: $routeParams.nodeId,
                    id: $routeParams.id,
                    donext: true,
                    data: $scope.formMetaData
                }).$promise.then(function(data){
                    $location.url("/Produce/list/producePlan");
                });
            };
        }])
    /**
     * 确认收款
     * */
    .controller("WorkflowFinanceReceiveConfirmCtl", ["$scope", "ComView", "ConfirmReceiveModel", "FinanceReceivePlanRes", "$routeParams", "$location",
        function($scope, ComView, model, res, $routeParams, $location){
            $scope.selectAble = false;
            ComView.displayForm($scope, model, res, {
                id: $routeParams.id
            });

            $scope.doSubmit = function(){
                res.doPostWorkflow({
                    workflow: true,
                    node_id: $routeParams.nodeId,
                    id: $routeParams.id,
                    donext: true,
                    data: $scope.formMetaData
                }).$promise.then(function(data){
                    $location.url('/Finance/list/financeReceivePlan');
                });
            };
        }])
 ;