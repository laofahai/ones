(function(){

    //桌面按钮
    ones.pluginRegister("hook.dashboard.appBtn", function(injector, defer) {
        var ComView = injector.get("ComView");
        ones.pluginScope.append("dashboardAppBtns", {
            label: ComView.toLang("Orders"),
            name: "Orders",
            icon: "pencil",
            link: "sale/list/orders"
        });

        ones.pluginScope.set("defer", defer);
    });

    //综合搜索
    ones.pluginRegister("hook.multiSearch.items", function(inject, defer, params){
        ones.pluginScope.append("ones.multiSearch.items", {
            name: "Orders",
            dataSource: "OrdersRes",
            labelField: "bill_id",
            linkTpl: "sale/editBill/orders/id/+id",
            link: "sale/list/orders"
        });
    });

    angular.module("ones.sale", [])
        .config(["$routeProvider", function($route){
            $route
                //订单
                .when('/sale/addBill/orders', {
                    templateUrl: appView('orders/edit.html', "sale"),
                    controller: 'OrdersEditCtl'
                })
                .when('/sale/editBill/orders/id/:id', {
                    templateUrl: appView('orders/edit.html', "sale"),
                    controller: 'OrdersEditCtl'
                })
                //订单退货
                .when('/sale/addBill/returns', {
                    templateUrl: appView('returns/edit.html', "sale"),
                    controller: 'ReturnsEditCtl'
                })
                .when('/sale/editBill/returns/id/:id', {
                    templateUrl: appView('returns/edit.html', "sale"),
                    controller: 'ReturnsEditCtl'
                })
            ;
        }])
        .factory("OrdersRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "sale/orders/:id.json", null, {'doWorkflow': {method: 'GET'}, 'update': {method: 'PUT'}});
        }])
        .factory("ReturnsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "sale/returns/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])

        .service("OrdersModel", ["$rootScope", function($rootScope){
            var obj = {
                isBill: true,
                workflowAlias: "orders"
            };
            obj.getStructure= function() {
                var i18n = $rootScope.i18n.lang;
                return {
                    bill_id: {
                        displayName: i18n.billId
                    },
                    sale_type_label: {
                        displayName: i18n.type,
                        hideInForm:true
                    },
                    sale_type: {
                        displayName: i18n.type,
                        listable: false
                    },
                    customer: {
                        hideInForm: true
                    },
                    customer_id: {
                        listable: false
                    },
                    total_num: {
                        displayName: i18n.totalNum
                    },
                    total_amount_real: {
                        cellFilter: "currency:'￥'",
                    },
                    dateline: {
                        cellFilter: "dateFormat"
                    },
                    status_text: {
                        displayName: i18n.status,
                        field: "processes.status_text"
                    },
                    sponsor: {}
                };
            };

            return obj;
        }])
        .service("OrdersEditModel", ["$rootScope", "GoodsRes", "pluginExecutor",
            function($rootScope, GoodsRes, plugin) {
                var obj = {
                    relateMoney: true,
                    workflowAlias: "orders"
                };
                obj.getStructure = function() {
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
                            "ui-event": "{blur: 'afterNumBlur($event)'}",
                        },
                        discount: {
                            inputType: "number"
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
                };


                return obj;
            }])
        .service("ReturnsModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                workflowAlias: "returns",
                getStructure: function(){
                    return {
                        bill_id: {},
                        returns_type_label: {
                            displayName: $rootScope.i18n.lang.type
                        },
                        saler: {},
                        customer: {},
                        total_num: {},
                        total_amount: {},
                        total_amount_real: {},
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
        .service("ReturnsEditModel", ["$rootScope", "GoodsRes", "pluginExecutor",
            function($rootScope, GoodsRes, plugin) {
                var obj = {
                    relateMoney: true,
                    workflowAlias: "returns",
                    isBill: true
                };
                obj.getStructure = function() {
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
                            "ui-event": "{blur: 'afterNumBlur($event)'}",
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
                };


                return obj;
            }])

        .controller("OrdersEditCtl", ["$scope", "OrdersRes", "GoodsRes", "OrdersEditModel", "ComView", "RelationshipCompanyRes", "$routeParams",
            function($scope, OrdersRes, GoodsRes, OrdersEditModel, ComView, RelationshipCompanyRes, $routeParams) {

                ComView.makeDefaultPageAction($scope, "sale/orders");

                $routeParams.group = "sale";
                $routeParams.module = "orders";

                $scope.workflowAble = true;
                $scope.selectAble = false;
                if(!$scope.formMetaData) {
                    $scope.formMetaData = {
                        inputTime: new Date(),
                        total_amount_real: 0
                    };
                }
//                $scope.formMetaData.inputTime = new Date();

                ComView.displayBill($scope, OrdersEditModel, OrdersRes, {
                    id: $routeParams.id
                });
                //客户选择字段定义
                $scope.customerSelectOpts = {
                    context: {
                        field: "customer_id"
                    },
                    fieldDefine: {
//                        "ui-event": "{blur: 'afterNumBlur($event)'}",
                        inputType: "select3",
                        "ng-model": "formMetaData.customer_id",
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
                        "ng-model": "formMetaData.sale_type",
                        dataSource: "HOME.TypesAPI",
                        queryParams: {
                            type: "sale"
                        }
                    }
                };

                //客户ID变动时 更新当前的折扣率
                $scope.$watch('formMetaData.customer_id', function(){
                    if($scope.formMetaData.customer_id) {
                        RelationshipCompanyRes.get({
                            id: $scope.formMetaData.customer_id
                        }, function(data){
                            data.discount = parseInt(data.discount);
                            $scope.formMetaData.customerInfo = {
                                id: data.id,
                                name: data.name,
                                discount: parseInt(data.discount)
                            };
                            angular.forEach($scope.formData, function(item, k) {
                                if(!item.goods_id || item.discount) {
                                    return;
                                }
                                $scope.formData[k].discount = parseInt(data.discount);
//                                console.log(data.discount);
//                                console.log(item);
                                $scope.recountTotalAmount(k);
                            });
                        });
                    }
                });
                $scope.maxDate = new Date();
//                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
//                $scope.format = $scope.formats[0];

            }])
        .controller("ReturnsEditCtl", ["$scope", "ReturnsRes", "GoodsRes", "ReturnsEditModel", "ComView", "RelationshipCompanyRes", "$routeParams",
            function($scope, OrdersRes, GoodsRes, ReturnsEditModel, ComView, RelationshipCompanyRes, $routeParams) {
                ComView.makeDefaultPageAction($scope, "sale/returns", [], ReturnsEditModel);

                $routeParams.group = "sale";
                $routeParams.module = "returns";

                $scope.workflowAble = true;
                if(!$scope.formMetaData) {
                    $scope.formMetaData = {
                        inputTime: new Date(),
                        total_amount_real: 0
                    };
                }
//                $scope.formMetaData.inputTime = new Date();

                ComView.displayBill($scope, ReturnsEditModel, OrdersRes, {
                    id: $routeParams.id
                });
                //客户选择字段定义
                $scope.customerSelectOpts = {
                    context: {
                        field: "customer_id"
                    },
                    fieldDefine: {
//                        "ui-event": "{blur: 'afterNumBlur($event)'}",
                        inputType: "select3",
                        "ng-model": "formMetaData.customer_id",
                        dataSource: RelationshipCompanyRes
                    }
                };
                //销售类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "returns_type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.returns_type",
                        dataSource: "HOME.TypesAPI",
                        queryParams: {
                            type: "returns"
                        }
                    }
                };



                $scope.maxDate = new Date();
//                $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
//                $scope.format = $scope.formats[0];

            }])
    ;
})();