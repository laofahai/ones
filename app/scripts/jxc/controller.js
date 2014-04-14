'use strict'

angular.module("erp.jxc", ['erp.jxc.services', 'ngGrid', 'erp.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                    //入库
                    .when('/JXC/Stockin', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'JXCStockinCtl'
                    })
                    .when('/JXC/Stockin/add', {
                        templateUrl: 'views/jxc/stockin/edit.html',
                        controller: 'JXCStockinEditCtl'
                    })
                    .when('/JXC/Stockin/edit/id/:id', {
                        templateUrl: 'views/jxc/stockin/edit.html',
                        controller: 'JXCStockinEditCtl'
                    })
                    //商品基础
                    .when('/JXC/Goods', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'JXCGoodsCtl'
                    })
                    .when('/JXC/Goods/add', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCGoodsEditCtl'
                    })
                    .when('/JXC/Goods/edit/dataModel/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCGoodsEditModelCtl'
                    })
                    .when('/JXC/Goods/edit/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCGoodsEditCtl'
                    })
                    .when('/JXC/GoodsCategory', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'JXCGoodsCategoryCtl'
                    })
                    .when('/JXC/GoodsCategory/add/pid/:pid', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCGoodsCategoryEditCtl'
                    })
                    .when('/JXC/GoodsCategory/edit/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCGoodsCategoryEditCtl'
                    })
                    //仓库管理
                    .when('/JXC/Stock', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'JXCStockCtl'
                    })
                    .when('/JXC/Stock/add', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCStockEditCtl'
                    })
                    .when('/JXC/Stock/edit/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'JXCStockEditCtl'
                    })
                    //库存列表
                    .when('/JXC/StockProductList', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'StockProductsCtl'
                    })
                    .when('/JXC/StockProductList/edit/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller: 'StockProductsEditCtl'
                    })
                    .when('/JXC/StockProductList/Export', {
                        templateUrl: 'views/jxc/stockProductList/export.html',
                        controller: 'StockProductsExportCtl'
                    })
                    .when('/JXC/Stock/warning', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'StockWarningCtl'
                    })
                    //商品拆装模板
                    .when('/JXC/ProductTpl', {
                        templateUrl: 'views/common/grid.html',
                        controller:  'ProductTplCtl'
                    })
                    .when('/JXC/ProductTpl/add', {
                        templateUrl: 'views/common/edit.html',
                        controller:  'ProductTplEditCtl'
                    })
                    .when('/JXC/ProductTpl/edit/id/:id', {
                        templateUrl: 'views/common/edit.html',
                        controller:  'ProductTplEditCtl'
                    })
                    //订单
                    .when('/JXC/Orders', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'JXCOrdersCtl'
                    })
                    .when('/JXC/Orders/add', {
                        templateUrl: 'views/jxc/orders/edit.html',
                        controller: 'JXCOrdersEditCtl'
                    })
                    .when('/JXC/Orders/edit/id/:id', {
                        templateUrl: 'views/jxc/orders/edit.html',
                        controller: 'JXCOrdersEditCtl'
                    })
                    //出库
                    .when('/JXC/Stockout', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'StockoutCtl'
                    })
        }])
        //出库单
        .controller("StockoutCtl", ["$scope", "StockoutRes", "StockoutModel", "ComView",
            function($scope, res, model, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Stockout");
                ComView.displayGrid($scope, model, res);
                
                $scope.workflowAble = true;
                $scope.workflowAlias= "stockout";
                
                $scope.$parent.assignWorkflowNodes($scope);
                
                $scope.doWorkflow = function(event, id) {
                    return $scope.$parent.doWorkflow(event, id, $scope.gridSelected, res);
                };
                $scope.workflowActionDisabled = function(id){
                    return $scope.$parent.workflowActionDisabled(id, $scope.gridSelected);
                };
                
                $scope.workflowDisabled = false;
            }])
        //订单
        .controller("JXCOrdersCtl", ["$scope", "OrdersRes", "OrdersModel", "$location", "ComView",
            function($scope, OrdersRes, OrdersModel, $location, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Orders");
                ComView.displayGrid($scope, OrdersModel, OrdersRes);
                
                $scope.workflowAble = true;
                $scope.workflowAlias= "order";
                $scope.$parent.assignWorkflowNodes($scope);
                
                $scope.doWorkflow = function(event, id) {
//                    $scope.selectedItems = [];
                    return $scope.$parent.doWorkflow(event, id, $scope.gridSelected, OrdersRes);
                };
                $scope.workflowActionDisabled = function(id){
                    return $scope.$parent.workflowActionDisabled(id, $scope.gridSelected);
                };
                
                $scope.workflowDisabled = false;
            }])
        .controller("JXCOrdersEditCtl", ["$scope", "OrdersRes", "GoodsRes", "OrdersEditModel", "ComView", "RelCompanyRes", "$routeParams", "TypesRes",
            function($scope, OrdersRes, GoodsRes, OrdersEditModel, ComView, RelCompanyRes, $routeParams, TypesRes) {
                ComView.makeDefaultPageAction($scope, "JXC/Orders");
                
                $scope.workflowAble = true;
                $scope.selectAble = false;
                $scope.showWeeks = true;
                $scope.formMetaData = {
                    inputTime : new Date(),
                    total_amount_real: 0.00
                };
//                $scope.formMetaData.inputTime = new Date();
                
                ComView.displayBill($scope, OrdersEditModel, OrdersRes, {
                    id: $routeParams.id
                });
                $scope.customerSelectOpts = {
                    context: {
                        field: "customer_id"
                    },
                    fieldDefine: {
//                        "ui-event": "{blur: 'afterNumBlur($event)'}",
                        inputType: "select3",
                        "ng-model": "formMetaData.customer_id",
                        dataSource: RelCompanyRes
                    }
                };
                $scope.typeSelectOpts = {
                    context: {
                        field: "sale_type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.sale_type",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "sale"
                        }
                    }
                };
                
                $scope.$watch('formMetaData.customer_id', function(){
                    if($scope.formMetaData.customer_id) {
                        RelCompanyRes.get({
                            id: $scope.formMetaData.customer_id
                        }, function(data){
                            data.discount = parseInt(data.discount);
                            $scope.formMetaData.customerInfo = {
                                id: data.id,
                                name: data.name,
                                discount: parseInt(data.discount)
                            };
                        });
                    }
                });
                
                $scope.$watch('formMetaData.total_amount', function(){
                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
                });
                
                var countRowAmount = function(index, price, num, discount){
                    discount = discount == undefined || 100;
                    $scope.formData[index].amount = Number(parseFloat(num * price * discount / 100).toFixed(2));
                };
                $scope.onNumberBlur = function(event){
                    var context = getInputContext(event.target);
                    
                    if($scope.formData[context.trid] && $scope.formData[context.trid].goods_id) {
                        var gid = $scope.formData[context.trid].goods_id.split("_");
                        var goods = GoodsRes.get({
                            id: gid[1]
                        }).$promise.then(function(data){
                            $scope.formData[context.trid].unit_price = Number(data.price);
                        });
                    }
                    if($scope.formMetaData.customerInfo) {
                        $scope.formData[context.trid].discount = $scope.formMetaData.customerInfo.discount;
                    }
                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
                };
                
                $scope.onUnitPriceBlur = function(event){
                    var context = getInputContext(event.target);
                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
                };
                
                
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        .controller("ProductTplCtl", ["$scope", "GoodsTplRes", "GoodsTplModel", "ComView", function($scope, res, model ,ComView){
            ComView.makeDefaultPageAction($scope, "JXC/ProductTpl");
            ComView.displayGrid($scope, model, res);
        }])
        .controller("ProductTplEditCtl", ["$scope", "GoodsTplRes", "GoodsTplModel", "ComView", function($scope, res, model ,ComView){
            ComView.makeDefaultPageAction($scope, "JXC/ProductTpl");
            ComView.displayForm($scope, model, res);
        }])
        .controller("StockWarningCtl", ["$scope", "StockWarningRes", "StockWarningModel", "ComView", 
            function($scope, res, model, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "success",
                        href  : "/JXC/StockWarning/Export"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayGrid($scope, model, res);
                
            }])
        .controller("JXCStockCtl", ["$scope", "StockModel", "StockRes", "$location", "ComView",
            function($scope, StockModel, StockRes, $location, ComView){
                ComView.makeDefaultPageAction($scope, "JXC/Stock");
                ComView.displayGrid($scope, StockModel, StockRes);
            }])
        .controller("JXCStockEditCtl", ["$scope", "StockModel", "StockRes", "$routeParams", "ComView",
            function($scope, StockModel, StockRes, $routeParams, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Stock");
                $scope.selectAble = false;
                var opts = {
                    name: "StockEdit",
                    id: $routeParams["id"]
                };
                
                ComView.displayForm($scope, StockModel, StockRes, opts, true);
                
            }])
        //入库单
        .controller("JXCStockinCtl", ["$scope", "StockinRes", "StockinModel", "WorkflowNodeRes", "$location", "ComView",
            function($scope, StockinRes, StockinModel, WorkflowNodeRes, $location, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Stockin");
                ComView.displayGrid($scope, StockinModel, StockinRes);
                
                $scope.workflowAble = true;
                $scope.workflowAlias= "stockin";
                
                WorkflowNodeRes.query({workflow_alias: "stockin"}).$promise.then(function(data){
                    $scope.workflowActionList = data;
                });
                
                $scope.doWorkflow = function(event, id) {
//                    $scope.selectedItems = [];
                    return $scope.$parent.doWorkflow(event, id, $scope.gridSelected, StockinRes);
                };
                $scope.workflowActionDisabled = function(id){
                    return $scope.$parent.workflowActionDisabled(id, $scope.gridSelected);
                };
                //@todo 判断 两条数据 下步操作相同情况
                var ifWorkflowDisabled = function(){
                    var rs = $scope.$parent.workflowDisabled($scope.gridSelected);
                    return rs;
                };
                
                
                
                $scope.workflowDisabled = false;
//                $scope.$watch(function(){
//                    return $scope.selectedItems;
//                }, function(){
//                    $scope.workflowDisabled = ifWorkflowDisabled();
//                });
            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "StockinEditModel", "ComView", "$routeParams",
            function($scope, StockinRes, StockinEditModel, ComView, $routeParams) {
                ComView.makeDefaultPageAction($scope, "JXC/Stockin");
                
                $scope.workflowAble = true;
                $scope.selectAble = false;
                $scope.showWeeks = true;
                
                ComView.displayBill($scope, StockinEditModel, StockinRes, {
                    id: $routeParams.id
                });
                
                
                $scope.formMetaData = {};
                $scope.formMetaData.inputTime = new Date();
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        //商品管理
        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", "JXCGoodsModel", "ComView",
            function($scope, GoodsRes, JXCGoodsModel, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Goods");
                ComView.displayGrid($scope, JXCGoodsModel, GoodsRes);
            }])
        .controller("JXCGoodsEditCtl", ["$scope", "JXCGoodsModel", "GoodsRes", "$routeParams", "ComView",
            function($scope, JXCGoodsModel, GoodsRes, $routeParams, ComView) {
                ComView.makeDefaultPageAction($scope, "JXC/Goods");
                $scope.selectAble = false;
                
                var opts = {
                    name: "JXCGoodsEdit",
                    id: $routeParams["id"]
                };
                ComView.displayForm($scope, JXCGoodsModel, GoodsRes, opts, true);
                
            }])
        
        //商品分类管理
        .controller("JXCGoodsCategoryCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "ComView",
            function($scope, model, res, ComView){
                ComView.displayGrid($scope, model, res, {
                    multiSelect: false
                });
                $scope.addChildAble = true;
                $scope.viewDataAble = true;
            }])
        .controller("JXCGoodsCategoryEditCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "$routeParams", "ComView",
            function($scope, model, res, $routeParams, ComView) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/GoodsCategory"
                    }
                ];
                $scope.selectAble = false;
                
                var opts = {
                    name: "JXCGoodsCategoryEdit",
                    id: $routeParams["id"]
                };
                ComView.displayForm($scope, model, res, opts, true);
                
            }])
        
        //库存列表
        .controller("StockProductsCtl", ["$scope", "StockProductsRes", "StockProductModel", "ComView",
            function($scope, StockProductsRes, StockProductModel, ComView) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/StockProductList"
                    },
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "success",
                        href  : "/JXC/StockProductList/Export"
                    }
                ];
                $scope.selectAble = true;
                ComView.displayGrid($scope, StockProductModel, StockProductsRes);
            }])
        .controller("StockProductsEditCtl", ["$scope", "ComView", "StockProductsRes", "StockProductEditModel", "$routeParams",
            function($scope, ComView, res, model, $routeParams){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/StockProductList"
                    },
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "success",
                        href  : "/JXC/StockProductList/Export"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayForm($scope, model, res, {
                    id: $routeParams.id
                });
            }])
        .controller("StockProductsExportCtl", ["$scope", "StockProductExportModel", "ComView", "$http", "erp.config",
            function($scope, StockProductExportModel, ComView, $http, cnf) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/StockProductList"
                    },
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "success",
                        href  : "/JXC/StockProductList/Export"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayForm($scope, StockProductExportModel, null, {
                    name: "export"
                }, true);
                
                $scope.doSubmit = function(){
                    var url = cnf.BSU+'JXC/StockProductList/Export';
                    if($scope.exportData.stock) {
                        url+= "/stock/"+$scope.exportData.stock.join('_');
                    }
                    url+= "/category/"+$scope.exportData.category.join('_');
                    url+= "/warningonly/"+$scope.exportData.stockWarningOnly;
                    window.open(url);
                };
            }])