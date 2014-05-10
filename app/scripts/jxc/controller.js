'use strict'

angular.module("ones.jxc", ['ones.jxc.services', 'ngGrid', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                    //入库
                    .when('/JXC/addBill/stockin', {
                        templateUrl: 'views/jxc/stockin/edit.html',
                        controller: 'JXCStockinEditCtl'
                    })
                    .when('/JXC/editBill/stockin/id/:id', {
                        templateUrl: 'views/jxc/stockin/edit.html',
                        controller: 'JXCStockinEditCtl'
                    })
                    //库存列表
                    .when('/JXC/export/stockProductList', {
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
                    .when('/JXC/edit/productTpl/id/:id', {
                        templateUrl: 'views/jxc/productTpl/edit.html',
                        controller:  'ProductTplEditCtl'
                    })
                    .when('/JXC/ProductTpl/viewSub/id/:pid', {
                        templateUrl: 'views/jxc/productTpl/edit.html',
                        controller: 'ProductTplDetailCtl'
                    })
                    //订单
                    .when('/JXC/addBill/orders', {
                        templateUrl: 'views/jxc/orders/edit.html',
                        controller: 'JXCOrdersEditCtl'
                    })
                    .when('/JXC/editBill/orders/id/:id', {
                        templateUrl: 'views/jxc/orders/edit.html',
                        controller: 'JXCOrdersEditCtl'
                    })
                    //订单退货
                    .when('/JXC/addBill/returns', {
                        templateUrl: 'views/jxc/returns/edit.html',
                        controller: 'JXCReturnsEditCtl'
                    })
                    .when('/JXC/editBill/returns/id/:id', {
                        templateUrl: 'views/jxc/returns/edit.html',
                        controller: 'JXCReturnsEditCtl'
                    })
                    //采购
                    .when('/JXC/addBill/purchase', {
                        templateUrl: 'views/jxc/purchase/edit.html',
                        controller: 'JXCPurchaseEditCtl'
                    })
                    ;
        }])
        //出库单
//        .controller("StockoutCtl", ["$scope", "StockoutRes", "StockoutModel", "ComView",
//            function($scope, res, model, ComView) {
//                ComView.makeDefaultPageAction($scope, "JXC/Stockout");
//                ComView.displayGrid($scope, model, res);
//                
//                $scope.workflowAble = true;
//                $scope.workflowAlias= "stockout";
//                
//                $scope.$parent.assignWorkflowNodes($scope);
//                
//                $scope.doWorkflow = function(event, id) {
//                    return $scope.$parent.doWorkflow(event, id, $scope.gridSelected, res);
//                };
//                $scope.workflowActionDisabled = function(id){
//                    return $scope.$parent.workflowActionDisabled(id, $scope.gridSelected);
//                };
//                
//                $scope.workflowDisabled = false;
//            }])
        //订单
//        .controller("JXCOrdersCtl", ["$scope", "OrdersRes", "OrdersModel", "$location", "ComView",
//            function($scope, OrdersRes, OrdersModel, $location, ComView) {
//                ComView.makeDefaultPageAction($scope, "JXC/Orders");
//                ComView.displayGrid($scope, OrdersModel, OrdersRes);
//                
//                $scope.workflowAble = true;
//                $scope.workflowAlias= "order";
//                $scope.$parent.assignWorkflowNodes($scope);
//                
//                $scope.doWorkflow = function(event, id) {
////                    $scope.selectedItems = [];
//                    return $scope.$parent.doWorkflow(event, id, $scope.gridSelected, OrdersRes);
//                };
//                $scope.workflowActionDisabled = function(id){
//                    return $scope.$parent.workflowActionDisabled(id, $scope.gridSelected);
//                };
//                
//                $scope.workflowDisabled = false;
//            }])
        .controller("JXCPurchaseEditCtl", ["$scope", "PurchaseRes", "GoodsRes", "PurchaseEditModel", "ComView", "RelCompanyRes", "$routeParams", "TypesRes",
            function($scope, res, GoodsRes, model, ComView, RelCompanyRes, $routeParams, TypesRes) {
//                ComView.makeDefaultPageAction($scope, "JXC/Orders");
                
                $scope.workflowAble = true;
                $scope.selectAble = false;
                $scope.showWeeks = true;
                $scope.formMetaData = {
                    inputTime : new Date(),
                    total_amount_real: 0.00
                };
//                $scope.formMetaData.inputTime = new Date();
                
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id
                });
                //客户选择字段定义
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
                //销售类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "sale_type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.purchase_type",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "purchase"
                        }
                    }
                };
                
                //实收金额
                $scope.$watch('formMetaData.total_amount', function(){
                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
                });
                
                //一行总价
                var countRowAmount = function(index, price, num){
                    $scope.formData[index].amount = Number(parseFloat(num * price).toFixed(2));
                };
                $scope.onNumberBlur = function(event){
                    var context = getInputContext(event.target);
                    
                    if($scope.formData[context.trid] && $scope.formData[context.trid].goods_id) {
                        var gid = $scope.formData[context.trid].goods_id.split("_");
                        var goods = GoodsRes.get({
                            id: gid[1]
                        }).$promise.then(function(data){
                            $scope.formData[context.trid].unit_price = Number(data.cost);
                        });
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
        .controller("JXCOrdersEditCtl", ["$scope", "OrdersRes", "GoodsRes", "OrdersEditModel", "ComView", "RelCompanyRes", "$routeParams", "TypesRes",
            function($scope, OrdersRes, GoodsRes, OrdersEditModel, ComView, RelCompanyRes, $routeParams, TypesRes) {
                ComView.makeDefaultPageAction($scope, "JXC/orders");
                
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
                //客户选择字段定义
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
                //销售类型字段定义
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
                
                //实收金额
                $scope.$watch('formMetaData.total_amount', function(){
                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
                });
                
                //一行总价
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
        .controller("JXCReturnsEditCtl", ["$scope", "ReturnsRes", "GoodsRes", "ReturnsEditModel", "ComView", "RelCompanyRes", "$routeParams", "TypesRes",
            function($scope, OrdersRes, GoodsRes, ReturnsEditModel, ComView, RelCompanyRes, $routeParams, TypesRes) {
                ComView.makeDefaultPageAction($scope, "JXC/returns");
                
                $scope.workflowAble = true;
                $scope.selectAble = false;
                $scope.showWeeks = true;
                $scope.formMetaData = {
                    inputTime : new Date(),
                    total_amount_real: 0.00
                };
//                $scope.formMetaData.inputTime = new Date();
                
                ComView.displayBill($scope, ReturnsEditModel, OrdersRes, {
                    id: $routeParams.id
                });
                //客户选择字段定义
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
                //销售类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "returns_type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.returns_type",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "returns"
                        }
                    }
                };
                
                //客户ID变动时 更新当前的折扣率
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
                
                //实收金额
                $scope.$watch('formMetaData.total_amount', function(){
                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
                });
                
                //一行总价
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
//        .controller("ProductTplCtl", ["$scope", "ProductTplRes", "ProductTplModel", "ComView", function($scope, res, model ,ComView){
//            ComView.makeDefaultPageAction($scope, "JXC/ProductTpl");
//            $scope.viewSubAble = true;
//            ComView.displayGrid($scope, model, res);
//        }])
//        .controller("ProductTplEditCtl", ["$scope", "ProductTplRes", "ProductTplEditModel", "ComView", "$routeParams", function($scope, res, model ,ComView, $routeParams){
//            ComView.makeDefaultPageAction($scope, "JXC/productTpl", ['addBill', 'list']);
//            $scope.selectAble = false;
//
//            ComView.displayForm($scope, model, res, {
//                id: $routeParams.id
//            });
//
//            $scope.formMetaData = {};
//        }])
//        .controller("ProductTplDetailCtl", ["$scope", "ProductTplDetailRes", "ProductTplDetailModel", "ComView", "$routeParams",
//            function($scope, res, model, ComView, $routeParams){
//                $scope.formMetaData = {};
//                $scope.selectAble = false;
//                $routeParams.id = $routeParams.pid;
//                ComView.displayBill($scope, model, res, {
//                    id: $routeParams.pid,
//                    module: "/JXC/ProductTplDetail",
//                    editExtraParams: "/pid/"+$routeParams.pid
//                });
//            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "StockinEditModel", "ComView", "$routeParams",
            function($scope, StockinRes, StockinEditModel, ComView, $routeParams) {
                ComView.makeDefaultPageAction($scope, "JXC/stockin");
                
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
        .controller("StockProductsExportCtl", ["$scope", "StockProductExportModel", "ComView", "$http", "ones.config",
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