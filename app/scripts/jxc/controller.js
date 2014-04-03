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
        }])
        .controller("JXCStockCtl", ["$scope", "StockModel", "StockRes", "$location", "ComView",
            function($scope, StockModel, StockRes, $location, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Stock/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Stock"
                    }
                ];
                ComView.displayGrid($scope, StockModel, StockRes);
            }])
        .controller("JXCStockEditCtl", ["$scope", "StockModel", "StockRes", "$routeParams", "ComView",
            function($scope, StockModel, StockRes, $routeParams, ComView) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/JXC/Stock/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/JXC/Stock"
                    }
                ];
                $scope.selecteAble = false;
                var opts = {
                    name: "StockEdit",
                    id: $routeParams["id"]
                };
                
                ComView.displayForm($scope, StockModel, StockRes, opts, true);
                
            }])
        //入库单
        .controller("JXCStockinCtl", ["$scope", "StockinRes", "StockinModel", "WorkflowNodeRes", "$location", "ComView",
            function($scope, StockinRes, StockinModel, WorkflowNodeRes, $location, ComView) {
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
                ComView.displayGrid($scope, StockinModel, StockinRes);
                
                $scope.workflowAble = true;
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
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "StockinEditModel", "ComView",
            function($scope, StockinRes, StockinEditModel, ComView) {
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
                
                $scope.workflowAble = true;
                $scope.selecteAble = false;
                $scope.showWeeks = true;
                
                ComView.displayBill($scope, StockinEditModel, StockinRes);
                
                
                
                $scope.formMetaData = {};
                $scope.formMetaData.inputTime = new Date();
                $scope.maxDate = new Date();
                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
                $scope.format = $scope.formats[0];
                
            }])
        //商品管理
        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", "JXCGoodsModel", "ComView",
            function($scope, GoodsRes, JXCGoodsModel, ComView) {
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
                ComView.displayGrid($scope, JXCGoodsModel, GoodsRes);
            }])
        .controller("JXCGoodsEditCtl", ["$scope", "JXCGoodsModel", "GoodsRes", "$routeParams", "ComView",
            function($scope, JXCGoodsModel, GoodsRes, $routeParams, ComView) {
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
                $scope.selecteAble = false;
                
                var opts = {
                    name: "JXCGoodsCategoryEdit",
                    id: $routeParams["id"]
                };
                ComView.displayForm($scope, model, res, opts, true);
                
            }])
        
        //库存列表
        .controller("StockProductsCtl", ["$scope", "StockProductsRes", "StockProductModel", "ComView",
            function($scope, StockProductsRes, StockProductModel, ComView) {
                $scope.selecteAble = false;
                ComView.displayGrid($scope, StockProductModel, StockProductsRes);
            }])