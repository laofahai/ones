angular.module("erp.jxc.services", [])
        .service("GoodsModel", ["$rootScope", "GoodsCategoryRes", "$q", function($rootScope, GoodsCategoryRes, $q) {
            var obj = {};
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                var struct = {
                    id: {
                        primary: true
                    },
                    factory_code: {},
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
                viewSubAble: false
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
                    name: {},
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
                deleteAble: false
            };
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                return {
                    factory_code_all: {
                        hideInForm: true
                    },
                    goods_name: {
                        inputType: "static"
                    },
                    standard: {
                        inputType: "static"
                    },
                    version: {
                        inputType: "static"
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
                        displayName: i18n.stock
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
        .service("StockinModel", ["$rootScope", function($rootScope){
            var obj = {
                isBill: true,
                workflowAlias: "stockin"
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
        .service("StockinEditModel", ["$rootScope", "GoodsRes","StockRes","DataModelDataRes", 
            function($rootScope, GoodsRes, StockRes, DataModelDataRes) {
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
                    total_amount_real: {},
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
                            stock: {
                                editAbleRequire: ["goods_id", "standard", "version"],
                                inputType: "select3",
                                dataSource: StockRes,
                                autoQuery: true,
                                autoHide: true
    //                            "ui-event": '{mousedown: onStockBlur(window.this, $event, this), keydown:  onStockBlur(window.this, $event, this)}'
                            },
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
                workflowAlias: "stockout",
                getFieldsStruct: function(){
                    return {
                        bill_id : {},
                        source_model: {},
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
                    isBill: true
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
                            editAble: false
                        },
                        standard: {
                            editAble: false
                        },
                        version: {
                            editAble: false
                        },
                        stock: {
                            editAbleRequire: ["goods_id", "standard", "version"],
                            inputType: "select3",
                            dataSource: StockRes,
                            autoQuery:true
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