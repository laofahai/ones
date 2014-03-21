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
                
                $scope.selectedItems = [];
                
                var fields = JXCGoodsModel.getFieldsStruct($rootScope.i18n);
                var columnDefs = [];
                for(var f in fields) {
                    fields[f].field = f;
                    columnDefs.push(fields[f]);
                }
                
                $scope.doEditSelected = function(){
                    if($scope.selectedItems.length) {
                        $location.url("/JXC/Goods/edit/id/"+$scope.selectedItems[0].id);
                    }
                }
                
//                console.log(columnDefs);
                
//                var columnDefs = [
//                    {field: 'id', displayName: 'ID', resizable: false},
//                    {field: 'factory_code', displayName: "系统编码"},
//                    {field: 'name', displayName: '产品名称'},
//                    {field: 'measure', displayName: '计量单位'},
//                    {field: 'category_name', displayName: '所属分类'},
//                    {field: 'price', displayName: "基本价格"},
//                    {
//                        displayName: "基础操作",
//                        sortable: false,
//                        cellTemplate :  '<div class="ngCellText" ng-class="col.colIndex()">'+
//                                        '<div class="btn-group"><button class="btn btn-xs btn-info"><i class="icon icon-edit"></i></button>'+
//                                        '<button class="btn btn-xs btn-danger"><i class="icon icon-trash"></i></button>'+
//                                        '</div></div>'
//                    },
//                    {
//                        displayName: "工作流操作", sortable: false
//                    },
//                ];
                
                var options = {
                    afterSelectionChange: function(rowitem, items){
                        $scope.selectedItems = items;
                    }
                };
                
                CommonView.displyGrid($scope, GoodsRes, columnDefs, options);
            }])
        .controller("JXCGoodsEditCtl", ["$scope", "JXCGoodsModel", "GoodsRes", "$rootScope", "GoodsCategoryRes", "$location", "$routeParams",
            function($scope, JXCGoodsModel, GoodsRes, $rootScope, GoodsCategoryRes, $location, $routeParams) {
                
                JXCGoodsModel.getFields($rootScope, GoodsCategoryRes);
                
                $scope.$on("goods_category_loaded", function(event, data){
                    $scope.config = {
                        fieldsDefine: data,
                        name: "JXCGoodsAdd"
                    };
                    
                        //edit
                    if(parseInt($routeParams["id"]) > 0) {
                        GoodsRes.get({id: $routeParams["id"]}).$promise.then(function(defaultData){
                            $scope.JXCGoodsAddData = formMaker.dataFormat(data, defaultData);
                        });
                    }

                    $scope.$broadcast("commonForm.data.ready");
                });

                $scope.doSubmit = function(){
                    GoodsRes.save($scope.JXCGoodsAddData).$promise.then(function(data){
                        if(data.error) {
                            $rootScope.alert = {msg: data.msg, type: "danger"};
                        } else {
                            $location.url("/JXC/Goods");
                        }
                    });
                };

            }])
