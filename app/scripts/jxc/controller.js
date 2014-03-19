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
                        templateUrl: 'views/jxc/goods/add.html',
                        controller: 'JXCGoodsAddCtl'
                    });
        })

        .controller("JXCStockinCtl", function($scope) {
            $scope.message = "hi, i am stockin";
        })

        .controller("JXCGoodsCtl", ["$scope", "GoodsRes", "JXCGoodsModel", function($scope, GoodsRes, JXCGoodsModel) {
                
                $scope.selectedItems = [];
                
                var fields = JXCGoodsModel.getFields($scope.i18n);
                var columnDefs = [];
                for(var f in fields) {
                    fields[f].field = f;
                    columnDefs.push(fields[f]);
                }
                
                columnDefs.push({
                    displayName: "基础操作",
                    sortable: false,
                    cellTemplate :  '<div class="ngCellText" ng-class="col.colIndex()">'+
                                    '<div class="btn-group"><button class="btn btn-xs btn-info"><i class="icon icon-edit"></i></button>'+
                                    '<button class="btn btn-xs btn-danger"><i class="icon icon-trash"></i></button>'+
                                    '</div></div>'
                });
                
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
        .controller("JXCGoodsAddCtl", function($scope, JXCGoodsModel){
            
            var fields = JXCGoodsModel.getFields($scope.$parent.i18n);
    
            $scope.config = {
                extraClass : "ng-form",
                fieldsDefine: fields,
                name: "JXCGoodsAdd"
            };
            
            $scope.doSubmit = function(){
                console.log($scope.JXCGoodsAddData);
            };
            
            
//            setInterval(function(){
//                console.log($scope.JXCGoodsAdd);
//            }, 2000);
            
            CommonView.displayForm(fields);
        })
