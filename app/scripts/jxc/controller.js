'use strict'

angular.module("erp.jxc", ['erp.jxc.services', 'ngGrid', 'erp.common.directives'])
        .config(function($routeProvider) {
            $routeProvider
                    //入库
                    .when('/JXC/Stockin', {
                        templateUrl: 'views/jxc/stockin/index.html',
                        controller: 'JXCStockinCtl'
                    })
                    .when('/JXC/Stockin/add', {
                        templateUrl: 'views/jxc/stockin/edit.html',
                        controller: 'JXCStockinEditCtl'
                    })
                    //商品基础
                    .when('/JXC/Goods', {
                        templateUrl: 'views/jxc/goods/index.html',
                        controller: 'JXCGoodsCtl'
                    })
                    .when('/JXC/Goods/add', {
                        templateUrl: 'views/jxc/goods/edit.html',
                        controller: 'JXCGoodsEditCtl'
                    })
                    .when('/JXC/Goods/edit/dataModel/id/:id', {
                        templateUrl: 'views/jxc/goods/editDataModel.html',
                        controller: 'JXCGoodsEditModelCtl'
                    })
                    .when('/JXC/Goods/edit/id/:id', {
                        templateUrl: 'views/jxc/goods/edit.html',
                        controller: 'JXCGoodsEditCtl'
                    })
                    .when('/JXC/GoodsCategory', {
                        templateUrl: 'views/jxc/goodsCategory/index.html',
                        controller: 'JXCGoodsCategoryCtl'
                    })
                    .when('/JXC/GoodsCategory/add/pid/:pid', {
                        templateUrl: 'views/jxc/goodsCategory/edit.html',
                        controller: 'JXCGoodsCategoryEditCtl'
                    })
                    .when('/JXC/GoodsCategory/edit/id/:id', {
                        templateUrl: 'views/jxc/goodsCategory/edit.html',
                        controller: 'JXCGoodsCategoryEditCtl'
                    })
                    //仓库管理
                    .when('/JXC/Stock', {
                        templateUrl: 'views/jxc/stock/index.html',
                        controller: 'JXCStockCtl'
                    })
                    //库存列表
                    .when('/JXC/StockProductList', {
                        templateUrl: 'views/jxc/stock/products.html',
                        controller: 'StockProductsCtl'
                    })
        })
        //入库单
        .controller("JXCStockinCtl", ["$scope", "StockinRes", "StockinModel", "WorkflowNodeRes", "$location",
            function($scope, StockinRes, StockinModel, WorkflowNodeRes, $location) {
                
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Stockin/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Stockin"
                    }
                ];
                var fields = StockinModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope : $scope,
                    resource: StockinRes,
                    location: $location
                }, fields);
                
                $scope.workflowAble = true;
                WorkflowNodeRes.query({workflow_alias: "stockin"}).$promise.then(function(data){
                    $scope.workflowActionList = data;
                });
                
                $scope.doWorkflow = function(event, id) {
                    $scope.selectedItems = [];
                    return $scope.$parent.doWorkflow(event, id, $scope.selectedItems, StockinRes);
                };
                $scope.workflowActionDisabled = function(id){
                    return $scope.$parent.workflowActionDisabled(id, $scope.selectedItems);
                };
                //@todo 判断 两条数据 下步操作相同情况
                $scope.workflowDisabled = function(){
                    return $scope.$parent.workflowActionDisabled($scope.selectedItems);
                };
            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "GoodsRes", "StockProductsRes", "StockRes", "StockinEditModel", "DataModelDataRes", "$location",
            function($scope, StockinRes, GoodsRes, StockProductsRes, StockRes, StockinEditModel, DataModelDataRes, $location) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Stockin/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Stockin"
                    }
                ];
                
                $scope.selecteAble = false;
                $scope.showWeeks = true;
                
                var opts = {
                    res : {
                        stockProduct: StockProductsRes
                    }
                };
                
                $scope.$on("billFieldEdited", function(event, data){
                    $scope.formData = data;
                });
                
                CommonView.displayBill({
                    name: "stockinScript",
                    scope: $scope,
                    modelRes: StockinRes,
                    res: {
                        goods: GoodsRes,
                        stock: StockRes,
                        dataModelData: DataModelDataRes
                    }
                }, StockinEditModel, opts);
                
                
                
                $scope.formMetaData = {};
                $scope.formMetaData.inputTime = new Date();
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        //商品管理
        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", "JXCGoodsModel", "$location",
            function($scope, GoodsRes, JXCGoodsModel, $location) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Goods/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Goods"
                    }
                ];
                var fields = JXCGoodsModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope : $scope,
                    resource: GoodsRes,
                    location: $location
                }, fields);
            }])
        .controller("JXCGoodsEditCtl", ["$scope", "JXCGoodsModel", "GoodsRes", "GoodsCategoryRes", "DataModelRes", "$location", "$routeParams",
            function($scope, JXCGoodsModel, GoodsRes, GoodsCategoryRes, DataModelRes, $location, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Goods/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Goods"
                    }
                ];
                $scope.selecteAble = false;
                var opts = {
                    name: "JXCGoodsEdit",
                    id: $routeParams["id"],
                    dataLoadedEvent : "goods_category_loaded",
                };
                CommonView.displayForm({
                    scope : $scope,
                    resource: GoodsRes,
                    foreignResource: [GoodsCategoryRes, DataModelRes],
                    location: $location,
                    routeParams: $routeParams
                }, JXCGoodsModel, opts);
                
            }])
        
        //商品分类管理
        .controller("JXCGoodsCategoryCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "$location",
            function($scope, model, res, $location){
                var fields = model.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope : $scope,
                    resource: res,
                    location: $location
                }, fields);
                
                $scope.addChildAble = true;
                $scope.viewDataAble = true;
                
                $scope.doAddChild = function(){
                    $location.url("/JXC/GoodsCategory/add/pid/"+$scope.selectedItems[0].id);
                };
            }])
        .controller("JXCGoodsCategoryEditCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "DataModelRes", "$location", "$routeParams",
            function($scope, model, res, DataModelRes, $location, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/GoodsCategory"
                    }
                ];
                $scope.selecteAble = false;
                var opts = {
                    name: "JXCGoodsCategoryEdit",
                    dataLoadedEvent: "dataModelLoaded",
                    id: $routeParams["id"]
                };
                CommonView.displayForm({
                    scope : $scope,
                    resource: res,
                    foreignResource: DataModelRes, //可以作为数组传入，通过arguments获取
                    location: $location,
                    routeParams: $routeParams
                }, model, opts);
            }])
        
        //库存列表
        .controller("StockProductsCtl", ["$scope", "StockProductsRes", "StockProductModel", "$location",
            function($scope, StockProductsRes, StockProductModel, $location) {
                $scope.selecteAble = false;
                var fields = StockProductModel.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope : $scope,
                    resource: StockProductsRes,
                    location: $location
                }, fields);
            }])