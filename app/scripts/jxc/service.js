angular.module("ones.jxc.services", [])
        .service("GoodsModel", ["$rootScope", "GoodsCategoryRes", "$q", "$location", "$modal",
        function($rootScope, GoodsCategoryRes, $q, $location, $modal) {
            var obj = {};
            obj.extraSelectActions = [
                {
                    label: $rootScope.i18n.lang.actions.viewCraft,
                    action: function($event, selectedItems){
                        var scope = obj.extraSelectActions[0].scope;
                        var injector = obj.extraSelectActions[0].injector;
                        var item = selectedItems[0];
                        var res = injector.get("GoodsCraftRes");
                        
                        res.query({goods_id: item.id}).$promise.then(function(data){
                            scope.craftsList = data;
                        });
                        
                        var theModal = $modal({
                            scope: scope,
                            title: sprintf($rootScope.i18n.lang.widgetTitles._product_craft, item.name),
                            contentTemplate: 'views/produce/productCraft.html',
                            show: false
                        });
                        theModal.$promise.then(theModal.show);
                        
                        scope.doSaveCraft = function(){
                            res.update({id: item.id}, scope.craftsList, function(data){
                                theModal.hide();
                            });
                        };
                    }
                }
            ];
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                var struct = {
                    id: {
                        primary: true
                    },
                    factory_code: {
                        ensureunique: "GoodsRes"
                    },
                    name: {},
                    pinyin: {
                        displayName: i18n.firstChar,
                        required: false
                    },
                    measure: {},
                    price: {
                        inputType: "number",
                        cellFilter: "currency:'￥'",
                        value: 0.00
                    },
                    cost: {
                        inputType: "number",
                        cellFilter: "currency:'￥'",
                        value: 0.00
                    },
                    goods_category_id: {
                        displayName: i18n.category,
                        inputType: "select",
                        valueField: "id",
                        nameField : "prefix_name",
                        listable: false
                    },
                    category_name: {
                        displayName: i18n.category,
                        inputType: false,
                        hideInForm: true
                    },
                    store_min: {
                        inputType: "number",
                        value: 0
                    },
                    store_max: {
                        inputType: "number",
                        value: 0
                    }
//                    image: {
//                        inputType: "file",
//                        multiple: "multiple",
//                        whitelist: "gif|png|jpg|jpeg"
//                    }
                };
                if(structOnly) {
                    return struct;
                } else {
                    var defer = $q.defer();
                    GoodsCategoryRes.query(function(data){
                        struct.goods_category_id.dataSource = data;
                        defer.resolve(struct);
                    });
                    return defer.promise;
                }
            };
            return obj;
        }])
        .service("GoodsCategoryModel", ["$rootScope","$q","DataModelRes",function($rootScope,$q,DataModelRes) {
            var obj = {
                subAble: true,
                viewSubAble: false,
                extraSelectActions: [
                    {
                        label: $rootScope.i18n.lang.actions.viewDataModel,
                        action: function($event, selectedItems){
                            var scope = this.scope;
                            var injector = this.injector;
                            var location = injector.get("$location");
                            if(!selectedItems.length) {
                                return;
                            }
                            location.url("/HOME/DataModelData/catid/"+selectedItems[0].id);
                        }
                    }
                ]
            };
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                var struct = {
                    id : {
                        primary: true
                    },
                    name: {
                        displayName: i18n.category,
                        listable: false
                    },
                    prefix_name: {
                        hideInForm: true,
                        displayName: i18n.category
                    },
                    bind_model_name: {
                        displayName: i18n.bindDataModel,
                        hideInForm:true
                    },
                    pinyin: {
                        displayName: i18n.firstChar,
                        required: false
                    },
                    bind_model: {
                        displayName: i18n.bindDataModel,
                        inputType: "select",
                        listable: false
                    },
                    listorder: {
                        inputType: "number",
                        value: 99
                    }
                };
                
                if(structOnly) {
                    return struct;
                } else {
                    var defer = $q.defer();
                    DataModelRes.query(function(data){
                        struct.bind_model.dataSource = data;
                        defer.resolve(struct);
                    });
                    return defer.promise;
                }
            };
            return obj;
        }])
        .service("StockModel", ["$rootScope", "UserRes", "$q", function($rootScope, userRes, $q){
            var obj = {};
            obj.getFieldsStruct = function(structOnly){
                var defer = $q.defer();
                var fieldsStruct = {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    name: {
                        ensureunique: "StockRes"
                    },
                    managers_name: {
                        displayName: $rootScope.i18n.lang.stockManager,
                        hideInForm:true
                    },
                    managers: {
                        displayName: $rootScope.i18n.lang.stockManager,
                        nameField: "truename",
                        valueField: "id",
                        inputType: "select",
                        multiple: "multiple",
                        remoteDataField: "managers",
                        listable:false
                    },
                    total_num: {
                        displayName: $rootScope.i18n.lang.total,
                        hideInForm: true
                    }
                };
                if(structOnly) {
                    return fieldsStruct;
                } else {
                    userRes.query().$promise.then(function(data){
                        fieldsStruct.managers.dataSource = data;
                        defer.resolve(fieldsStruct);
                    });
                }
                
                return defer.promise;
            };
            
            return obj;
        }])
        .service("StockProductListModel", ["$rootScope", "$q", "DataModelRes", function($rootScope, $q, DataModelRes) {
            var obj = {
                deleteAble: false,
                exportAble: true
            };
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                return {
                    factory_code_all: {
                        hideInForm: true
                    },
                    goods_name: {
                        inputType: "static",
                        hideInForm: true
                    },
                    standard: {
                        inputType: "static",
                        hideInForm: true
                    },
                    version: {
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
                        hideInForm: true,
                    },
                    store_min: {
                        hideInForm: true,
                    },
                    store_max: {
                        hideInForm: true,
                    }
                };
                
            };
            return obj;
        }])
    .service("StockProductEditModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function(){
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
    .service("StockProductExportModel", ["$rootScope", "StockRes", "GoodsCategoryRes", "$q", 
        function($rootScope, StockRes, GoodsCategoryRes, $q) {
            var service = {
                getFieldsStruct : function() {
                    var i18n = $rootScope.i18n.lang;
                    var struct = {
                        stock: {
                            inputType: "select",
                            required: false,
                            multiple: true,
                            dataSource: StockRes
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
        .service("StockTransferModel", ["$rootScope", function($rootScope){
            var obj = {
                isBill: true,
                workflowAlias: "stocktransfer"
            };
            obj.getFieldsStruct= function() {
                var i18n = $rootScope.i18n.lang;
                return {
                    bill_id: {
                        displayName: i18n.billId
                    },
                    subject: {},
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
                    stock_manager: {
                        displayName: i18n.stockManager
                    }
                };
            };
            
            return obj;
        }])
        .service("StockinModel", ["$rootScope", function($rootScope){
            var obj = {
                isBill: true,
                printAble: true,
                workflowAlias: "stockin"
            };
            obj.getFieldsStruct= function() {
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
                    stock_manager: {
                        displayName: i18n.stockManager
                    }
                };
            };
            
            return obj;
        }])
        .service("StockinEditModel", ["$rootScope", "GoodsRes","StockRes","DataModelDataRes", 
            function($rootScope, GoodsRes, StockRes, DataModelDataRes) {
                var obj = {
                    printAble: true
                };
                obj.getFieldsStruct = function() {
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
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        stock: {
                            editAbleRequire: ["goods_id", "standard", "version"],
                            inputType: "select3",
                            dataSource: StockRes,
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


                    return fields;
                };


                return obj;
            }])
        .service("OrdersModel", ["$rootScope", function($rootScope){
            var obj = {
                isBill: true,
                workflowAlias: "order"
            };
            obj.getFieldsStruct= function() {
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
        .service("OrdersEditModel", ["$rootScope", "GoodsRes", "StockRes", "DataModelDataRes", 
            function($rootScope, GoodsRes, StockRes, DataModelDataRes) {
                var obj = {
                    relateMoney: true
                };
                obj.getFieldsStruct = function() {
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
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
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


                    return fields;
                };


                return obj;
            }])
        .service("ReturnsModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                workflowAlias: "returns",
                getFieldsStruct: function(){
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
        .service("ReturnsEditModel", ["$rootScope", "GoodsRes", "StockRes", "DataModelDataRes", 
            function($rootScope, GoodsRes, StockRes, DataModelDataRes) {
                var obj = {
                    relateMoney: true,
                    workflowAlias: "returns"
                };
                obj.getFieldsStruct = function() {
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
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
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


                    return fields;
                };


                return obj;
            }])
        .service("StockWarningModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function(){
                    return {
                        factory_code_all: {
                            displayName: $rootScope.i18n.lang.factoryCodeAll
                        },
                        goods_name: {
                            displayName: $rootScope.i18n.lang.name
                        },
                        standard: {},
                        version: {},
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
                }
            };
        }])
        .service("OutsideModel", ["$rootScope", "GoodsRes", "DataModelDataRes", "StockRes",
            function($rootScope, GoodsRes, DataModelDataRes, StockRes){
                var obj = {};
                obj.getFieldsStruct = function() {
                    var i18n = $rootScope.i18n.lang;
                    var fields = {
                        id : {
                            primary: true,
                            billAble: false
                        },
                        goods_id: {
                            displayName: i18n.goods,
                            inputType: "select3",
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        stock: {
                            editAbleRequire: ["goods_id", "standard", "version"],
                            inputType: "select3",
                            dataSource: StockRes
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


                    return fields;
                };
            }])
        .service("ProductTplModel", ["$rootScope", "GoodsRes", "DataModelDataRes", function($rootScope, GoodsRes,DataModelDataRes){
            return {
//                extraSelectActions : [
//                    {
//                        label: $rootScope.i18n.lang.actions.viewCraft,
//                        action: function($event, selectedItems){
//                            var scope = this.scope;
//                            var injector = this.injector;
//                            var item = selectedItems[0];
//                            var res = injector.get("GoodsCraftRes");
//
//                            res.query({goods_id: item.id}).$promise.then(function(data){
//                                scope.craftsList = data;
//                            });
//
//                            var theModal = $modal({
//                                scope: scope,
//                                title: sprintf($rootScope.i18n.lang.widgetTitles._product_craft, item.name),
//                                contentTemplate: 'views/produce/productCraft.html',
//                                show: false
//                            });
//                            theModal.$promise.then(theModal.show);
//
//                            scope.doSaveCraft = function(){
//                                res.update({id: item.id}, scope.craftsList, function(data){
//                                    theModal.hide();
//                                });
//                            };
//                        }
//                    }
//                ],
                subAble: true,
                addSubAble: false,
                viewSubAble : true,
                getFieldsStruct: function(structOnly) {
                    var struct = {
                        id: {primary:true},
                        factory_code_all: {
                            hideInForm:true
                        },
                        goods_name: {
                            hideInForm: true
                        },
                        goods_id: {
                            displayName: $rootScope.i18n.lang.goods,
                            listable: false,
                            inputType: "select3",
                            dataSource: GoodsRes
                        },
                        measure: {
                            hideInForm: true,
                        },
                        standard: {
                            field: "standard_label",
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            field: "version_label",
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        }
                    };
                    
                    return struct;
                }
            };
        }])
        .service('ProductTplEditModel', ["$rootScope", "StockRes", "GoodsRes", 
            function($rootScope, StockRes, GoodsRes){
                return {
                    getFieldsStruct: function(){
                        return {
                            factory_code_all: {
                                hideInForm:true
                            },
                            goods_name: {
                                hideInForm:true
                            },
                            goods_id: {
                                displayName: $rootScope.i18n.lang.goods,
                                listable: false,
                                dataSource: GoodsRes
                            },
                            num: {},
                            stock_id: {
                                displayName: $rootScope.i18n.lang.stock,
                                inputType: "select",
                                dataSource: StockRes
                            }
                        };
                    }
                };
            }])
        .service('ProductTplDetailModel', ["$rootScope", "StockRes", "GoodsRes","DataModelDataRes", 
            function($rootScope,StockRes,GoodsRes,DataModelDataRes){
                return {
                    getFieldsStruct: function() {
                        var i18n = $rootScope.i18n.lang;
                        return {
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
                            standard: {
                                nameField: "data",
                                valueField: "id",
                                labelField: true,
                                inputType: "select3",
                                editAbleRequire: "goods_id",
                                dataSource: DataModelDataRes,
                                queryWithExistsData: ["goods_id"],
                                autoQuery: true,
                                autoReset: true,
                                autoHide: true,
                                queryParams: {
                                    fieldAlias: "standard"
                                }
                            },
                            version: {
                                nameField: "data",
                                valueField: "id",
                                labelField: true,
                                inputType: "select3",
                                editAbleRequire: "goods_id",
                                dataSource: DataModelDataRes,
                                queryWithExistsData: ["goods_id"],
                                autoQuery: true,
                                autoReset: true,
                                autoHide: true,
                                queryParams: {
                                    fieldAlias: "version"
                                }
                            },
//                            stock: {
//                                editAbleRequire: ["goods_id", "standard", "version"],
//                                inputType: "select3",
//                                dataSource: StockRes,
//                                autoQuery: true,
//                                autoHide: true
//    //                            "ui-event": '{mousedown: onStockBlur(window.this, $event, this), keydown:  onStockBlur(window.this, $event, this)}'
//                            },
                            num: {
                                inputType: "number",
                                totalAble: true
                            },
                            memo: {}
                        };
                    }
                };
            }])
        .service('StockoutModel', ["$rootScope", function($rootScope){
            return {
                isBill: true,
                printAble: true,
                workflowAlias: "stockout",
                getFieldsStruct: function(){
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
        .service("StockoutEditModel", ["$rootScope", "GoodsRes","StockRes","DataModelDataRes", 
            function($rootScope, GoodsRes, StockRes, DataModelDataRes) {
                var obj = {
                    isBill: true,
                    printAble: true
                };
                obj.getFieldsStruct = function() {
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
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        stock: {
                            editAbleRequire: ["goods_id", "standard", "version"],
                            inputType: "select3",
                            dataSource: StockRes,
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


                    return fields;
                };


                return obj;
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
                            standard: {
                                nameField: "data",
                                valueField: "id",
                                labelField: true,
                                inputType: "select3",
                                editAbleRequire: "goods_id",
                                dataSource: DataModelDataRes,
                                queryWithExistsData: ["goods_id"],
                                autoQuery: true,
                                autoReset: true,
                                autoHide: true,
                                queryParams: {
                                    fieldAlias: "standard"
                                }
                            },
                            version: {
                                nameField: "data",
                                valueField: "id",
                                labelField: true,
                                inputType: "select3",
                                editAbleRequire: "goods_id",
                                dataSource: DataModelDataRes,
                                queryWithExistsData: ["goods_id"],
                                autoQuery: true,
                                autoReset: true,
                                autoHide: true,
                                queryParams: {
                                    fieldAlias: "version"
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


                        return fields;
                    }
                };
            }])
        .service("CraftModel", ["$rootScope", function($rootScope){
                return {
                    getFieldsStruct: function(){
                        return {
                            id: {primary: true},
                            name: {},
                            listorder: {
                                inputType: "number",
                                placeholder: 0,
                                required: false
                            },
                            memo: {
                                inputType: "textarea",
                                required: false
                            }
                        };
                    }
                };
            }])
        .service("ShipmentModel", ["$rootScope", "TypesRes", function($rootScope, TypesRes) {
                var i18n = $rootScope.i18n.lang;
                return {
                    printAble: true,
                    getFieldsStruct: function() {
                        return {
                            id: {primary: true},
                            shipment_type: {
                                field: "shipment_type_label",
                                inputType: "select",
                                dataSource: TypesRes,
                                queryParams: {
                                    type: "shipment"
                                }
                            },
                            to_company: {
                                displayName: i18n.shipment_to_company
                            },
                            to_name: {
                                displayName: i18n.shipment_to_name
                            },
                            to_phone: {
                                displayName: i18n.shipment_to_phone,
                                listable:false
                            },
                            to_address: {
                                displayName: i18n.shipment_to_address
                            },
                            from_company: {
                                displayName: i18n.shipment_from_company,
                                listable:false
                            },
                            from_name: {
                                displayName: i18n.shipment_from_name,
                                listable:false
                            },
                            from_phone: {
                                displayName: i18n.shipment_from_phone,
                                listable:false
                            },
                            from_address: {
                                displayName: i18n.shipment_from_address,
                                listable:false
                            },
                            freight_type: {
                                field: "freight_type_label",
                                inputType: "select",
                                dataSource: TypesRes,
                                queryParams: {
                                    type: "freight"
                                },
                                required: false,
                                listable:false
                            },
                            freight: {
                                inputType: "number",
                                required: false,
                                listable:false
                            },
                            weight: {
                                required: false
                            },
                            total_num: {
                                displayName: i18n.totalNum,
                                required: false
                            }
                        };
                    }
                };
        }])
        ;