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
                    });
        })

        .controller("JXCStockinCtl", function($scope) {
            $scope.message = "hi, i am stockin";
        })

        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", "JXCGoodsModel", "$rootScope", "$location",
            function($scope, GoodsRes, JXCGoodsModel, $rootScope, $location) {
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
                var fields = JXCGoodsModel.getFieldsStruct($rootScope.i18n);
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
                $scope.filterAble = false;
                var opts = {
                    name: "JXCGoodsEdit",
                    id: $routeParams["id"],
                    dataLoadedEvent : "goods_category_loaded",
                };
                CommonView.displayForm({
                    scope : $scope,
                    resource: GoodsRes,
                    foreignResource: GoodsCategoryRes,
                    location: $location
                }, JXCGoodsModel, opts);
            }])
