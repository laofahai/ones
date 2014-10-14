(function(){
    angular.module("ones.purchase",[])
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
            config: {
                isBill: true,
                workflowAlias: "purchase",
                rowsModel: "PurchaseEditModel",
                relateMoney: true
            },
            getStructure: function(){
                return {
                    bill_id: {
                        cellFilter: "toLink:purchase/editBill/purchase/id/+id"
                    },
                    purchase_type: {
                        listAble: false
                    },
                    purchase_type_label: {
                        displayName: l('lang.type')
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
                        cellFilter: "dateFormat:0"
                    },
                    status_text: {
                        displayName: l('lang.status'),
                        field: "processes.status_text"
                    }
                };
            }
        };
    }])
    .service("PurchaseEditModel", ["$rootScope", "GoodsRes", "pluginExecutor",
        function($rootScope, GoodsRes, plugin){
            return {
                config: {
                    isBill: true,
                    relateMoney: true,
                    workflowAlias: "purchase"
                },
                getStructure: function(){
                    var i18n = l('lang');
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
                            width: "20%",
                            dynamicAddOpts: {
                                model: "GoodsModel"
                            }
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

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: fields,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

    .controller("JXCPurchaseEditCtl", ["$scope", "PurchaseRes", "GoodsRes", "PurchaseModel", "ComView", "$routeParams",
        function($scope, res, GoodsRes, model, ComView, $routeParams) {

            $scope.workflowAble = true;
            $scope.selectAble = false;
            if(!$scope.formMetaData) {
                $scope.formMetaData = {
                    inputTime: new Date(),
                    total_amount_real: 0
                };

            }

            $routeParams.group = "purchase";
            $routeParams.module = "purchase";

            $scope.config = {
                model: model,
                resource: res
            };

            //客户选择字段定义
            $scope.customerSelectOpts = {
                context: {
                    field: "supplier_id"
                },
                fieldDefine: {
//                        "ui-event": "{blur: 'afterNumBlur($event)'}",
                    inputType: "select3",
                    "ng-model": "formMetaData.supplier_id",
                    dataSource: "RelationshipCompanyRes",
                    dynamicAddOpts: {
                        model: "RelationshipCompanyModel"
                    }
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
                    dataSource: "HOME.TypesAPI",
                    queryParams: {
                        type: "purchase"
                    }
                }
            };

        }])
    ;
})();