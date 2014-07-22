(function(){
    angular.module("ones.purchase",[
        "ones.crm",
            "ones.department",
            "ones.workflow",
            "ones.goods",
            "ones.dataModel",
            "ones.store"
    ])
    .config(["$routeProvider", function($route){
        $route //采购
            .when('/purchase/addBill/purchase', {
                templateUrl: appView('purchase/edit.html', "purchase"),
                controller: 'JXCPurchaseEditCtl'
            })
            .when('/purchase/editBill/purchase/id/:id', {
                templateUrl: appView('purchase/edit.html', "purchase"),
                controller: 'JXCPurchaseEditCtl'
            })
    }])
    .factory("PurchaseRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "purchase/purchase/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
    }])

    .service("PurchaseModel", ["$rootScope", function($rootScope){
        return {
            isBill: true,
            workflowAlias: "purchase",
            getFieldsStruct: function(){
                return {
                    bill_id: {},
                    purchase_type: {
                        listable: false
                    },
                    purchase_type_label: {
                        displayName: $rootScope.i18n.lang.type
                    },
                    buyer: {},
                    supplier: {
                        field: "supplier_id_label"
                    },
                    total_num: {},
                    total_amount: {
                        cellFilter: "currency:'￥'"
                    },
                    total_amount_real: {
                        cellFilter: "currency:'￥'"
                    },
                    dateline: {
                        cellFilter: "dateFormat"
                    },
                    status_text: {
                        displayName: $rootScope.i18n.lang.status,
                        field: "processes.status_text"
                    }
                };
            }
        };
    }])
    .service("PurchaseEditModel", ["$rootScope", "GoodsRes", "DataModelDataRes", "StockRes",
        function($rootScope, GoodsRes, DataModelDataRes, StockRes){
            return {
                isBill: true,
                relateMoney: true,
                workflowAlias: "purchase",
                getFieldsStruct: function(){
                    var i18n = $rootScope.i18n.lang;
                    var fields = {
                        id : {
                            primary: true,
                            billAble: false
                        },
                        goods_id: {
                            displayName: i18n.goods,
                            labelField: true,
                            inputType: "select3",
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        num: {
                            inputType: "number",
                            totalAble: true,
                            "ui-event": "{blur: 'afterNumBlur($event)'}"
                        },
                        unit_price: {
                            inputType: "number",
                            "ui-event": "{blur: 'afterUnitPriceBlur($event)'}",
                            cellFilter: "currency:'￥'"
                        },
                        amount: {
                            inputType: "number",
                            cellFilter: "currency:'￥'",
                            totalAble: true
                        },
                        memo: {}

                    };

                    var rs = plugin.callPlugin("binDataModelToStructure", {
                        structure: fields,
                        type: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return rs.defer.promise;
                }
            };
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
            $scope.maxDate = new Date();
            $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
            $scope.format = $scope.formats[0];

        }])
    ;
})();