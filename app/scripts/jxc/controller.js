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
                    //出库
                    .when('/JXC/editBill/stockout/id/:id', {
                        templateUrl: 'views/jxc/stockout/edit.html',
                        controller: 'JXCStockoutEditCtl'
                    })
                    //库存列表
                    .when('/JXC/export/stockProductList', {
                        templateUrl: 'views/jxc/stockProductList/export.html',
                        controller: 'StockProductsExportCtl'
                    })
                    .when('/JXC/list/StockWarning', {
                        templateUrl: 'views/common/grid.html',
                        controller: 'StockWarningCtl'
                    })
                    .when('/JXC/viewChild/productTpl/pid/:pid', {
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
                    .when('/JXC/editBill/purchase/id/:id', {
                        templateUrl: 'views/jxc/purchase/edit.html',
                        controller: 'JXCPurchaseEditCtl'
                    })
                    ;
        }])
        .controller("JXCPurchaseEditCtl", ["$scope", "PurchaseRes", "GoodsRes", "PurchaseEditModel", "ComView", "RelationshipCompanyRes", "$routeParams", "TypesRes",
            function($scope, res, GoodsRes, model, ComView, RelationshipCompanyRes, $routeParams, TypesRes) {
                
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
                        field: "supplier_id"
                    },
                    fieldDefine: {
//                        "ui-event": "{blur: 'afterNumBlur($event)'}",
                        inputType: "select3",
                        "ng-model": "formMetaData.supplier_id",
                        dataSource: RelationshipCompanyRes
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
//                $scope.$watch('formMetaData.total_amount', function(){
//                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
//                });
//
//                //一行总价
//                var countRowAmount = function(index, price, num){
//                    $scope.formData[index].amount = Number(parseFloat(num * price).toFixed(2));
//                };
//                var recountTotalAmount = function() {
//                    var totalAmount = 0;
//                    var totalNum = 0;
//                    angular.forEach($scope.formData, function(row){
//                        if(!row.amount) {
//                            return;
//                        }
//                        totalNum += Number(row.num);
//                        totalAmount += Number(row.amount);
//                    });
//                    $scope.formMetaData.total_amount = totalAmount;
//                    $scope.formMetaData.total_num = totalNum;
//                };
//                $scope.onNumberBlur = function(event){
//                    var context = getInputContext(event.target);
//
//                    if($scope.formData[context.trid] && $scope.formData[context.trid].goods_id) {
//                        var gid = $scope.formData[context.trid].goods_id.split("_");
//                        var goods = GoodsRes.get({
//                            id: gid[1]
//                        }).$promise.then(function(data){
//                            $scope.formData[context.trid].unit_price = Number(data.price);
//                        });
//                    }
//                    if($scope.formMetaData.customerInfo) {
//                        $scope.formData[context.trid].discount = $scope.formMetaData.customerInfo.discount;
//                    }
//                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
//                    recountTotalAmount();
//                };
//
//                $scope.onUnitPriceBlur = function(event){
//                    var context = getInputContext(event.target);
//                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
//                };
                
                
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        .controller("JXCOrdersEditCtl", ["$scope", "OrdersRes", "GoodsRes", "OrdersEditModel", "ComView", "RelationshipCompanyRes", "$routeParams", "TypesRes", "$timeout",
            function($scope, OrdersRes, GoodsRes, OrdersEditModel, ComView, RelationshipCompanyRes, $routeParams, TypesRes, $timeout) {
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
                        dataSource: RelationshipCompanyRes
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
                
                //客户ID变动时 更新当前的折扣率
                $scope.$watch('formMetaData.customer_id', function(){
                    if($scope.formMetaData.customer_id) {
                        RelationshipCompanyRes.get({
                            id: $scope.formMetaData.customer_id
                        }, function(data){
                            data.discount = parseInt(data.discount);
                            $scope.formMetaData.customerInfo = {
                                id: data.id,
                                name: data.name,
                                discount: parseInt(data.discount)
                            };
                            angular.forEach($scope.formData, function(item, k) {
                                if(!item.goods_id || item.discount) {
                                    return;
                                }
                                $scope.formData[k].discount = parseInt(data.discount);
//                                console.log(data.discount);
//                                console.log(item);
                                $scope.recountTotalAmount(k);
                            });
                        });
                    }
                });
                
                //实收金额
//                $scope.$watch('formMetaData.total_amount', function(){
//                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
//                });
                
                //一行总价
//                var countRowAmount = function(index){
//                    var price =  $scope.formData[index].unit_price
//                    var num = $scope.formData[index].num;
//                    var discount = $scope.formData[index].discount;
//                    if(discount === undefined || parseInt(discount) === 0) {
//                        discount = 100;
//                    };
//                    $scope.formData[index].amount = Number(parseFloat(num * price * discount / 100).toFixed(2));
//                };
//                var recountTotalAmount = function() {
//                    var totalAmount = 0;
//                    angular.forEach($scope.formData, function(row){
//                        if(!row.amount) {
//                            return;
//                        }
//                        totalAmount += Number(row.amount);
//                    });
//                    $scope.formMetaData.total_amount = totalAmount;
//                };
                //Num字段更新
//                $scope.onNumNumberBlur = function(event){
//                    var context = getInputContext(event.target);
//
//                    if($scope.formMetaData.customerInfo) {
//                        $scope.formData[context.trid].discount = $scope.formMetaData.customerInfo.discount;
//                    }
//
//                    if($scope.formData[context.trid] && $scope.formData[context.trid].goods_id) {
//                        var gid = $scope.formData[context.trid].goods_id.split("_");
//                        var goods = GoodsRes.get({
//                            id: gid[1]
//                        }).$promise.then(function(data){
//                            $scope.formData[context.trid].unit_price = Number(data.price);
//                            countRowAmount(context.trid);
//                            recountTotalAmount();
//                        });
//                    }
//                };
                //折扣字段更新
                //金额字段更新
//                $scope.onUnit_priceNumberBlur = function(event){
//                    var context = getInputContext(event.target);
//                    countRowAmount(context.trid);
//                    recountTotalAmount();
//                };
                
                
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        .controller("JXCReturnsEditCtl", ["$scope", "ReturnsRes", "GoodsRes", "ReturnsEditModel", "ComView", "RelationshipCompanyRes", "$routeParams", "TypesRes",
            function($scope, OrdersRes, GoodsRes, ReturnsEditModel, ComView, RelationshipCompanyRes, $routeParams, TypesRes) {
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
                        dataSource: RelationshipCompanyRes
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
                
                
//
//                //实收金额
//                $scope.$watch('formMetaData.total_amount', function(){
//                    $scope.formMetaData.total_amount_real = $scope.formMetaData.total_amount;
//                });
//
//                //一行总价
//                var countRowAmount = function(index, price, num, discount){
//                    if(discount === undefined || parseInt(discount) === 0) {
//                        discount = 100;
//                    };
//                    $scope.formData[index].amount = Number(parseFloat(num * price * discount / 100).toFixed(2));
//                };
//                var recountTotalAmount = function() {
//                    var totalAmount = 0;
//                    angular.forEach($scope.formData, function(row){
//                        totalAmount += Number(row.amount);
//                    });
//                    $scope.formMetaData.total_amount = totalAmount;
//                };
//                $scope.onNumberBlur = function(event){
//                    var context = getInputContext(event.target);
//
//                    if($scope.formData[context.trid] && $scope.formData[context.trid].goods_id) {
//                        var gid = $scope.formData[context.trid].goods_id.split("_");
//                        var goods = GoodsRes.get({
//                            id: gid[1]
//                        }).$promise.then(function(data){
//                            $scope.formData[context.trid].unit_price = Number(data.price);
//                        });
//                    }
//                    if($scope.formMetaData.customerInfo) {
//                        $scope.formData[context.trid].discount = $scope.formMetaData.customerInfo.discount;
//                    }
//                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
//                    recountTotalAmount();
//                };
//
//                $scope.onUnitPriceBlur = function(event){
//                    var context = getInputContext(event.target);
//                    countRowAmount(context.trid, $scope.formData[context.trid].unit_price, $scope.formData[context.trid].num, $scope.formData[context.trid].discount);
//                };
                
                
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "StockinEditModel", "ComView", "$routeParams", "TypesRes",
            function($scope, StockinRes, StockinEditModel, ComView, $routeParams, TypesRes) {
                ComView.makeDefaultPageAction($scope, "JXC/stockin", null, StockinEditModel);
                
                $scope.workflowAble = true;
                $scope.selectAble = false;
                $scope.showWeeks = true;
                
                ComView.displayBill($scope, StockinEditModel, StockinRes, {
                    id: $routeParams.id
                });
                
                //入库类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "type_id"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.type_id",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "stockin"
                        }
                    }
                };
                
                
                $scope.formMetaData = {};
                $scope.formMetaData.inputTime = new Date();
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        .controller("JXCStockoutEditCtl", ["$scope", "StockoutRes", "StockoutEditModel", "ComView", "$routeParams", "$route",
            function($scope, res, model, ComView, $routeParams, $route) {
                ComView.makeDefaultPageAction($scope, "JXC/stockout", [], model);
                $scope.workflowAble = true;
                $scope.selectAble = false;
                
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id
                });
                
                $scope.doSubmit = function() {};
                
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
        //BOM单详情
        .controller("ProductTplDetailCtl", ["$scope", "ProductTplDetailRes", "ProductTplDetailModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams){
                $scope.formMetaData = {};
                $scope.selectAble = false;
                $routeParams.id = $routeParams.pid;
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.pid,
                    module: "/JXC/ProductTplDetail",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])
        .controller("StockWarningCtl", ["$scope", "StockWarningRes", "StockWarningModel", "ComView", 
            function($scope, res, model, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "deafult",
                        href  : "/JXC/export/StockWarning"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayGrid($scope, model, res);
                
            }])
        ;