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
        .controller("JXCStockinCtl", ["$scope", "StockinRes", "StockinModel", "$location",
            function($scope, StockinRes, StockinModel, $location) {
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
            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "GoodsRes", "StockinModel", "$location",
            function($scope, StockinRes, GoodsRes, StockinModel, $location) {
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
                
                var opts = {};
                
                CommonView.displayBill({
                    scope: $scope,
                    res: GoodsRes
                }, StockinModel, opts);
                
                
                $scope.today = function() {
                    $scope.dt = new Date();
                  };
                  $scope.today();

                  $scope.showWeeks = true;
                  $scope.toggleWeeks = function () {
                    $scope.showWeeks = ! $scope.showWeeks;
                  };

                  $scope.clear = function () {
                    $scope.dt = null;
                  };

                  // Disable weekend selection
                  $scope.disabled = function(date, mode) {
//                    return ( mode === "day" && ( date.getDay() === 0 || date.getDay() === 6 ) );
                  };

                  $scope.toggleMin = function() {
                    $scope.minDate = ( $scope.minDate ) ? null : new Date();
                  };
                  $scope.toggleMin();

                  $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = true;
                  };

                  $scope.dateOptions = {
                    "starting-day": 1
                  };

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