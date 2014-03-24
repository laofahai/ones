'use strict'

angular.module("erp.jxc", ['erp.jxc.services', 'ngGrid', 'erp.common.directives'])
        .config(function($routeProvider) {
            $routeProvider
                    .when('/JXC/Stockin', {
                        templateUrl: 'views/jxc/stockin/index.html',
                        controller: 'JXCStockinCtl'
                    })
                    .when('/JXC/Goods', {
                        templateUrl: 'views/jxc/goods/index.html',
                        controller: 'JXCGoodsCtl'
                    })
                    .when('/JXC/Goods/add', {
                        templateUrl: 'views/jxc/goods/edit.html',
                        controller: 'JXCGoodsEditCtl'
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
        })

        .controller("JXCStockinCtl", function($scope) {
            $scope.message = "hi, i am stockin";
        })

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
        .controller("JXCGoodsEditCtl", ["$scope", "JXCGoodsModel", "GoodsRes", "GoodsCategoryRes", "$location", "$routeParams",
            function($scope, JXCGoodsModel, GoodsRes, GoodsCategoryRes, $location, $routeParams) {
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
                    foreignResource: GoodsCategoryRes,
                    location: $location,
                    routeParams: $routeParams
                }, JXCGoodsModel, opts);
            }])
        .controller("JXCGoodsCategoryCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "$location",
            function($scope, model, res, $location){
                var fields = model.getFieldsStruct($scope.i18n);
                CommonView.displyGrid({
                    scope : $scope,
                    resource: res,
                    location: $location
                }, fields);
                
                $scope.addChildAble = true;
                
                $scope.doAddChild = function(){
                    $location.url("/JXC/GoodsCategory/add/pid/"+$scope.selectedItems[0].id);
                };
            }])
        .controller("JXCGoodsCategoryEditCtl", ["$scope", "JXCGoodsCategoryModel", "GoodsCategoryRes", "$location", "$routeParams",
            function($scope, model, res, $location, $routeParams) {
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
                CommonView.displayForm({
                    scope : $scope,
                    resource: res,
                    location: $location,
                    routeParams: $routeParams
                }, model, opts);
            }])
