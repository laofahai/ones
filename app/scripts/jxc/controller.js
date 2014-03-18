'use strict'

angular.module("erp.jxc", ['erp.jxc.services', 'ngGrid'])
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
                        templateUrl: 'views/jxc/goods/add.html',
                        controller: 'JXCGoodsAddCtl'
                    });
        })

        .controller("JXCStockinCtl", function($scope) {
            $scope.message = "hi, i am stockin";
        })

        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", function($scope, GoodsRes) {
                
                $scope.selectedItems = [];
                
                var columnDefs = [
                    {field: 'id', displayName: 'ID', resizable: false},
                    {field: 'factory_code', displayName: "系统编码"},
                    {field: 'name', displayName: '产品名称'},
                    {field: 'measure', displayName: '计量单位'},
                    {field: 'category_name', displayName: '所属分类'},
                    {field: 'price', displayName: "基本价格"},
                    {
                        displayName: "基础操作",
                        sortable: false,
                        cellTemplate :  '<div class="ngCellText" ng-class="col.colIndex()">'+
                                        '<div class="btn-group"><button class="btn btn-xs btn-info"><i class="icon icon-edit"></i></button>'+
                                        '<button class="btn btn-xs btn-danger"><i class="icon icon-trash"></i></button>'+
                                        '</div></div>'
                    },
                    {
                        displayName: "工作流操作", sortable: false
                    },
                ];
                
                var options = {
                    afterSelectionChange: function(rowitem, items){
                        $scope.selectedItems = items;
                    }
                };
                
                CommonView.displyGrid($scope, GoodsRes, columnDefs, options);
            }])
        .controller("JXCGoodsAddCtl", function($scope, JXCGoodsModel){
            console.log(JXCGoodsModel);
        })
