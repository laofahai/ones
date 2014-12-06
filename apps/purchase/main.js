(function(){

    //桌面按钮
    ones.pluginRegister("hook.dashboard.appBtn", function(injector, defer) {
        var ComView = injector.get("ComView");
        ones.pluginScope.append("dashboardAppBtns", {
            label: ComView.toLang("Purchase"),
            name: "Purchase",
            icon: "shopping-cart",
            link: "purchase/list/purchase"
        });

        ones.pluginScope.set("defer", defer);
    });

    //综合搜索
    ones.pluginRegister("hook.multiSearch.items", function(inject, defer, params){
        ones.pluginScope.append("ones.multiSearch.items", {
            name: "Purchase",
            dataSource: "PurchaseRes",
            labelField: "bill_id",
            linkTpl: "purchase/editBill/purchase/id/+id",
            link: "purchase/list/purchase"
        });
    });

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
        return $resource(cnf.BSU + "purchase/purchase/:id.json", null, {
            'doWorkflow': {method: 'GET'},
            'doPostWorkflow': {method: 'POST'},
            'update': {method: 'PUT'}
        });
    }])

    .service("PurchaseModel", ["$rootScope", function($rootScope){
        var startTime = new Date();
        var endTime = new Date();
        startTime.setMonth(startTime.getMonth()-1);
        return {
            config: {
                isBill: true,
                workflowAlias: "purchase",
                rowsModel: "PurchaseEditModel",
                relateMoney: true,
                filters: {
                    between: {
                        field: "dateline",
                        defaultData: [getDateForInput(startTime), getDateForInput(endTime)],
                        inputType: "datetime"
                    },
                    workflow: "purchase"
                }
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
                        cellFilter: "toCurrency:'￥'"
                    },
                    total_amount_real: {
                        cellFilter: "toCurrency:'￥'"
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
                            uiEvents: {
                                blur: function($events, scope) {
                                    //console.log(arguments);
                                }
                            }
                        },
                        unit_price: {
                            inputType: "number",
                            "ui-event": "{blur: 'afterUnitPriceBlur($event)'}",
                            cellFilter: "toCurrency:'￥'"
                        },
                        amount: {
                            inputType: "number",
                            cellFilter: "toCurrency:'￥'",
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
                    inputTime: getDateForInput(),
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

            $scope.unitPriceField = "cost";

            ComView.makeGridSelectedActions($scope, model, res, "purchase", "purchase");

        }])
    ;
})();