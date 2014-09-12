(function(){

    //桌面图标
    ones.pluginRegister("hook.dashboard.appBtn", function(injector, defer, $scope) {
        var ComView = injector.get("ComView");
        var stockInRes = injector.get("StockinRes");

        ones.pluginScope.append("dashboardAppBtns", {
            label: ComView.toLang("stockout"),
            name: "stockoutList",
            icon: "sign-out",
            link: "store/list/stockout",
            sort: 6
        });

        ones.pluginScope.append("dashboardAppBtns", {
            label: ComView.toLang("stockin"),
            name: "stockinList",
            icon: "sign-in",
            link: "store/list/stockin",
            sort: 4
        });

        //未处理入库单
        stockInRes.query({
            unhandled: true,
            onlyCount: true
        }).$promise.then(function(data){
            var count = parseInt(data[0].count);
            if(count <= 0) {
                return;
            }
            ones.pluginScope.get("dashboardSetBtnTip")("stockinList", count);
        });

        var stockOutRes = injector.get("StockoutRes");

        //未处理出库单
        stockOutRes.query({
            unhandled: true,
            onlyCount: true
        }).$promise.then(function(data){
            var count = parseInt(data[0].count);
            if(count <= 0) {
                return;
            }
            ones.pluginScope.get("dashboardSetBtnTip")("stockoutList", count);
        });

        ones.pluginScope.set("defer", defer);
    });

    angular.module("ones.store", [])
        .config(["$routeProvider", function($route){
            $route
                //入库
                .when('/store/addBill/stockin', {
                    templateUrl: appView("stockin/edit.html", "store"),
                    controller: 'JXCStockinEditCtl'
                })
                .when('/store/editBill/stockin/id/:id', {
                    templateUrl: appView("stockin/edit.html", "store"),
                    controller: 'JXCStockinEditCtl'
                })
                //出库
                .when('/store/editBill/stockout/id/:id', {
                    templateUrl: appView("stockout/edit.html", "store"),
                    controller: 'JXCStockoutEditCtl'
                })
                //库存列表
                .when('/store/export/stockProductList', {
                    templateUrl: appView("stockProductList/export.html", "store"),
                    controller: 'StockProductsExportCtl'
                })
                //库存警告
                .when('/store/list/StockWarning', {
                    templateUrl: 'common/base/views/grid.html',
                    controller: 'StockWarningCtl'
                })
                //工作流
                .when('/doWorkflow/Stockout/confirm/:nodeId/:id', {
                    controller: "WorkflowConfirmStockoutCtl",
                    templateUrl: appView("stockout/confirmStockout.html", "store")
                })
                .when('/doWorkflow/Stockin/confirm/:nodeId/:id', {
                    controller: "WorkflowConfirmStockinCtl",
                    templateUrl: appView("stockin/confirmStockin.html", "store")
                })
            ;
        }])
        .factory("StockWarningRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "store/stockWarning.json");
        }])
        .factory("StockinRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "store/stockin/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])
        .factory("StockProductListRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "store/stockProductList/:id.json", null, {'update': {method: 'PUT'}});
        }])

        .factory("StockoutRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "store/stockout/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])

        .service("Store.StockAPI", ["$rootScope", "$q", "ones.dataApiFactory", function($rootScope, $q, dataApiFactory){
            this.structure = {
                id: {
                    primary: true,
                    displayName: "ID"
                },
                name: {
                    ensureunique: "Store.StockAPI"
                },
                managers_name: {
                    displayName: toLang("stockManager", "", $rootScope),
                    hideInForm:true
                },
                managers: {
                    displayName: toLang("stockManager", "", $rootScope),
                    nameField: "truename",
                    valueField: "id",
                    inputType: "select",
                    multiple: "multiple",
                    remoteDataField: "managers",
                    listable:false,
                    dataSource: "Department.UserAPI"
                },
                total_num: {
                    displayName: $rootScope.i18n.lang.total,
                    hideInForm: true
                }
            };
            this.getStructure = function(){
                return this.structure;
            };
            this.api = dataApiFactory.getResourceInstance({
                uri: "store/stock"
            });
        }])
        .service("StockProductListModel", ["$rootScope", "pluginExecutor", function($rootScope, plugin) {
            var obj = {
                deleteAble: false,
                exportAble: true
            };
            obj.getStructure = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                var fields = {
                    factory_code_all: {
                        hideInForm: true
                    },
                    goods_name: {
                        inputType: "static",
                        hideInForm: true
                    },
                    unit_price: {
                        cellFilter: "currency:'￥'",
                        inputType: "number"
                    },
                    cost: {
                        cellFilter: "currency:'￥'",
                        inputType: "number"
                    },
                    category_name: {
                        hideInForm: true,
                        displayName: i18n.category
                    },
                    stock_name: {
                        inputType: "static",
                        displayName: i18n.stock,
                        hideInForm: true
                    },
                    num: {
                        hideInForm: true,
                        displayName: i18n.storeNum
                    },
                    measure: {
                        hideInForm: true
                    },
                    store_min: {
                        hideInForm: true
                    },
                    store_max: {
                        hideInForm: true
                    }
                };

                plugin.callPlugin("bind_dataModel_to_structure", {
                    structure: fields,
                    after: "goods_name",
                    alias: "product",
                    require: ["goods_id"],
                    queryExtra: ["goods_id"],
                    config: {
                        hideInForm: true
                    }
                });

                return ones.pluginScope.get("defer").promise;

            };
            return obj;
        }])
        .service("StockProductEditModel", ["$rootScope", function($rootScope){
            return {
                getStructure: function(){
                    return {
                        id: {primary: true},
                        unit_price: {
                            inputType: "number"
                        },
                        cost: {
                            inputType: "number"
                        }
                    };
                }
            };
        }])
        .service("StockProductExportModel", ["$rootScope", "GoodsCategoryRes", "$q",
            function($rootScope, GoodsCategoryRes, $q) {
                var service = {
                    getStructure : function() {
                        var i18n = $rootScope.i18n.lang;
                        var struct = {
                            stock: {
                                inputType: "select",
                                required: false,
                                multiple: true,
                                dataSource: "Store.StockAPI"
                            },
                            category: {
                                inputType: "select",
                                multiple: true,
                                nameField: "prefix_name"
                            },
                            stockWarningOnly: {
                                inputType: "select",
                                dataSource: [
                                    {
                                        id: 1,
                                        name: i18n.yes
                                    },
                                    {
                                        id: -1,
                                        name: i18n.no
                                    }
                                ],
                                required: false
                            }
                        };
                        var defer = $q.defer();
                        GoodsCategoryRes.query(function(data){
                            struct.category.dataSource = data;
                            defer.resolve(struct);
                        });
                        return defer.promise;
                    }
                };
                return service;
            }])
        .service("StockinModel", ["$rootScope", function($rootScope){
            var timestamp = Date.parse(new Date());
            var startTime = timestamp-3600*24*30*1000;
            var obj = {
                isBill: true,
                printAble: true,
                workflowAlias: "stockin",
                filters: {
                    between: {
                        field: "dateline",
                        defaultData: [startTime, timestamp],
                        inputType: "datepicker"
                    }
                }
            };
            obj.getStructure= function() {
                var i18n = $rootScope.i18n.lang;
                return {
                    bill_id: {
                        displayName: i18n.billId
                    },
                    subject: {},
                    source_model: {
                        cellFilter: "lang"
                    },
                    total_num: {
                        displayName: i18n.totalNum
                    },
                    dateline: {
                        cellFilter: "dateFormat"
                    },
                    status_text: {
                        displayName: i18n.status,
                        field: "processes.status_text"
                    },
                    sponsor: {},
                    stock_manager_name: {
                        displayName: i18n.stockManager
                    }
                };
            };

            return obj;
        }])
        .service("StockinEditModel", ["$rootScope", "GoodsRes","pluginExecutor",
            function($rootScope, GoodsRes, plugin) {
                var obj = {
                    printAble: true
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
                        stock: {
                            editAbleRequire: ["goods_id"],
                            inputType: "select3",
                            dataSource: "Store.StockAPI",
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true
//                            "ui-event": '{mousedown: onStockBlur(window.this, $event, this), keydown:  onStockBlur(window.this, $event, this)}'
                        },
                        store_num: {
                            displayName: i18n.storeNum,
                            editAble:false,
                            min: -9999
                        },
                        num: {
                            inputType: "number",
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
        .service("StockWarningModel", ["$rootScope", "pluginExecutor", function($rootScope, plugin){
            return {
                getStructure: function(){
                    var fields = {
                        factory_code_all: {
                            displayName: $rootScope.i18n.lang.factoryCodeAll
                        },
                        goods_name: {
                            displayName: $rootScope.i18n.lang.name
                        },
                        measure: {},
                        category_name: {
                            displayName: $rootScope.i18n.lang.category
                        },
                        stock_name: {
                            displayName: $rootScope.i18n.lang.stock
                        },
                        num: {},
                        store_min: {},
                        store_max: {}
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: fields,
                        alias: "product"
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])
        .service('StockoutModel', ["$rootScope", function($rootScope){
            var timestamp = Date.parse(new Date());
            var startTime = timestamp-3600*24*30*1000;
            return {
                isBill: true,
                printAble: true,
                workflowAlias: "stockout",
                filters: {
                    between: {
                        field: "dateline",
                        defaultData: [startTime, timestamp],
                        inputType: "datepicker"
                    }
                },
                getStructure: function(){
                    return {
                        bill_id : {},
                        source_model: {
                            cellFilter: "lang"
                        },
                        total_num: {},
                        stock_manager: {},
                        dateline: {
                            cellFilter: "dateFormat"
                        },
                        status_text: {
                            displayName: $rootScope.i18n.lang.status,
                            field: "processes.status_text"
                        },
                        outtime: {
                            displayName: $rootScope.i18n.lang.outStockTime,
                            cellFilter: "dateFormat"
                        }
                    };
                }
            };
        }])
        .service("StockoutEditModel", ["$rootScope","pluginExecutor",
            function($rootScope, plugin) {
                var obj = {
                    isBill: true,
                    printAble: true
                };
                obj.getStructure = function() {
                    var i18n = $rootScope.i18n.lang;
                    var fields = {
                        id : {
                            primary: true,
                            billAble: false
                        },
                        factory_code_all: {
                            editAble: false
                        },
                        goods_id: {
                            displayName: i18n.goods,
                            labelField: true,
                            inputType: "select3",
                            dataSource: "GoodsRes",
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        stock: {
                            editAbleRequire: ["goods_id"],
                            inputType: "select3",
                            dataSource: "Store.StockAPI",
                            autoQuery:true,
                            alwaysQueryAll: true
//                            "ui-event": '{mousedown: onStockBlur(window.this, $event, this), keydown:  onStockBlur(window.this, $event, this)}'
                        },
                        store_num: {
                            displayName: i18n.storeNum,
                            editAble:false
                        },
                        num: {
                            inputType: "number",
                            totalAble: true
                        },
                        memo: {
                            editAble:false
                        }

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
        .controller("StockWarningCtl", ["$scope", "StockWarningRes", "StockWarningModel", "ComView",
            function($scope, res, model, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.export,
                        class : "deafult",
                        href  : "/store/export/stockProductList"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayGrid($scope, model, res);

            }])
        .controller("JXCStockinEditCtl", ["$scope", "StockinRes", "StockinEditModel", "ComView", "$routeParams",
        function($scope, StockinRes, StockinEditModel, ComView, $routeParams) {
            ComView.makeDefaultPageAction($scope, "store/stockin", null, StockinEditModel);

            $scope.workflowAble = true;
            $scope.selectAble = false;
            $scope.showWeeks = true;

            ComView.displayBill($scope, StockinEditModel, StockinRes, {
                id: $routeParams.id
            });

            //入库类型字段定义
            $scope.typeSelectOpts = {
                context: {
                    field: "type_id"
                },
                fieldDefine: {
                    inputType: "select",
                    "ng-model": "formMetaData.type_id",
                    dataSource: "HOME.TypesAPI",
                    queryParams: {
                        type: "stockin"
                    }
                }
            };


            $scope.formMetaData = {};
            $scope.formMetaData.inputTime = new Date();
            $scope.maxDate = new Date();
            $scope.formats = ["yyyy-MM-dd", "yyyy-mm-dd", "shortDate"];
            $scope.format = $scope.formats[0];

        }])
        .controller("JXCStockoutEditCtl", ["$scope", "StockoutRes", "StockoutEditModel", "ComView", "$routeParams", "$route",
            function($scope, res, model, ComView, $routeParams, $route) {
                ComView.makeDefaultPageAction($scope, "store/stockout", [], model);
                $scope.workflowAble = true;
                $scope.selectAble = false;

                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id
                });

                $scope.doSubmit = function() {};

            }])
        .controller("StockProductsExportCtl", ["$scope", "StockProductExportModel", "ComView", "$http", "ones.config",
            function($scope, StockProductExportModel, ComView, $http, cnf) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/store/list/stockProductList"
                    }
                ];
                $scope.selectAble = false;
                ComView.displayForm($scope, StockProductExportModel);

                $scope.doSubmit = function(){
//                    console.log($scope);return;
                    var url = cnf.BSU+'store/stockProductList/export/%s.json';
                    var params = {};
                    if($scope.formData.stock) {
                        params.stock = $scope.formData.stock;
//                        url+= "/stock/"+$scope.formData.stock.join('_');
                    }
                    params.category = $scope.formData.category;
//                    url+= "/category/"+$scope.formData.category.join('_');
//                    url+= "/warningonly/"+$scope.formData.stockWarningOnly;
                    params.warningonly = $scope.formData.stockWarningOnly;

                    url = sprintf(url, base64encode(angular.toJson(params)));
                    console.log(url);return;
                    window.open(url);
                };
            }])

        //确认出库
        .controller("WorkflowConfirmStockoutCtl", ["$scope", "$routeParams", "ComView", "StockoutRes", "StockoutEditModel", "$location",
            function($scope, $routeParams, ComView, res, model, $location){
                $scope.selectAble= false;
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id,
                    queryExtraParams: {includeSource: true, workflowing: true}
                });
                $scope.doSubmit = function() {
                    $scope.formMetaData.rows = $scope.formData;
                    res.doPostWorkflow({
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true,
                        data: $scope.formMetaData
                    }).$promise.then(function(data){
//                    console.log(data);return;
                            $location.url("/store/list/stockout");
                        });
                };
            }])
        //确认入库
        .controller("WorkflowConfirmStockinCtl", ["$scope", "$routeParams", "ComView", "StockinRes", "StockinEditModel", "$location", "$injector",
            function($scope, $routeParams, ComView, res, model, $location, $injector){
                $scope.selectAble= false;
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id,
                    queryExtraParams: {includeSource: true, workflowing: true}
                });

                $scope.doSubmit = function() {

                    $scope.formMetaData.rows = $scope.formData;
                    var data = {
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true,
                        data: $scope.formMetaData
                    };
                    res.doPostWorkflow(data).$promise.then(function(data){
                        $location.url("/store/list/stockin");
                    });
                };
            }])
    ;
})();