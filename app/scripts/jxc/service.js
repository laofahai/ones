angular.module("erp.jxc.services", [])
        .service("JXCGoodsModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n) {
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    factory_code: {
                        displayName: i18n.lang.factory_code
                    },
                    name: {
                        displayName: i18n.lang.name
                    },
                    pinyin: {
                        displayName: i18n.lang.firstChar,
                        required: false
                    },
                    measure: {
                        displayName: i18n.lang.measure
                    },
                    price: {
                        displayName: i18n.lang.price,
                        inputType: "number",
                        value: 0
                    },
                    goods_category_id: {
                        displayName: i18n.lang.category,
                        inputType: "select",
                        valueField: "id",
                        nameField : "prefix_name",
                        "ng-change": "loadDataModel()",
                        listable: false
                    },
                    category_name: {
                        displayName: i18n.lang.category,
                        inputType: false,
                        hideInForm: true
                    },
                    store_min: {
                        displayName: i18n.lang.store_min,
                        inputType: "number",
                        value: 0
                    },
                    store_max: {
                        displayName: i18n.lang.store_max,
                        inputType: "number",
                        value: 0
                    }
                };
            };
            obj.getFields = function($scope, reses){
                var GoodsCategoryRes = reses[0];
                var DataModelRes = reses[1];
                GoodsCategoryRes.query(function(data){
                    var fields = obj.getFieldsStruct($scope.i18n);
                    fields.goods_category_id.dataSource = data;
                    $scope.$broadcast("goods_category_loaded", fields);
                });
            };
            
            return obj;
        })
        .service("JXCGoodsCategoryModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n) {
                return {
                    id : {
                        primary: true,
                        displayName: "ID"
                    },
                    name: {
                        displayName: i18n.lang.category,
                        listable: false
                    },
                    prefix_name: {
                        hideInForm: true,
                        displayName: i18n.lang.category
                    },
                    bind_model_name: {
                        displayName: i18n.lang.bindDataModel,
                        hideInForm:true
                    },
                    bind_model: {
                        displayName: i18n.lang.bindDataModel,
                        inputType: "select",
                        listable: false
                    },
                    listorder: {
                        inputType: "number",
                        value: 99,
                        displayName: i18n.lang.listorder
                    }
                };
            };
            
            obj.getFields = function($scope, DataModelRes){
                DataModelRes.query(function(data){
                    var fields = obj.getFieldsStruct($scope.i18n);
                    fields.bind_model.dataSource = data;
                    $scope.$broadcast("dataModelLoaded", fields);
                });
            };
            
            return obj;
        })
        .service("StockProductModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n) {
                return {
                    id : {
                        primary: true,
                        displayName: "ID"
                    },
                    factory_code_all: {
                        displayName: i18n.lang.factoryCodeAll
                    },
                    goods_name: {
                        displayName: i18n.lang.name
                    },
                    category_name: {
                        displayName: i18n.lang.category
                    },
                    stock_name: {
                        displayName: i18n.lang.stock
                    },
                    standard: {
                        displayName: i18n.lang.standard
                    },
                    version: {
                        displayName: i18n.lang.version
                    },
                    num: {
                        displayName: i18n.lang.storeNum
                    },
                    measure: {
                        displayName: i18n.lang.measure
                    }
//                    store_min: {
//                        displayName: i18n.lang.store_min,
//                    },
//                    store_max: {
//                        displayName: i18n.lang.store_min,
//                    },
                    
                };
            };
            
            obj.getFields = function($scope, DataModelRes){
                DataModelRes.query(function(data){
                    var fields = obj.getFieldsStruct($scope.i18n);
                    fields.bind_model.dataSource = data;
                    $scope.$broadcast("dataModelLoaded", fields);
                });
            };
            
            return obj;
        })
        .service("StockinModel", function(){
            var obj = {};
            obj.getFieldsStruct= function(i18n) {
                return {
                    bill_id: {
                        displayName: i18n.lang.billId
                    },
                    subject: {
                        displayName: i18n.lang.subject
                    },
                    total_num: {
                        displayName: i18n.lang.totalNum
                    },
                    dateline: {
                        displayName: i18n.lang.dateline,
                        cellFilter: "dateFormat"
                    },
                    status_text: {
                        displayName: i18n.lang.status,
                        field: "processes.status_text"
                    },
                    sponsor: {
                        displayName: i18n.lang.sponsor
                    },
                    stock_manager: {
                        displayName: i18n.lang.stockManager
                    }
                };
            };
            
            return obj;
        })
        .service("StockinEditModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n) {
                var fields = {
                    id : {
                        primary: true,
                        displayName: "ID",
                        billAble: false
                    },
                    goods_id: {
                        displayName: i18n.lang.goods,
                        inputType: "typeahead",
                        listAble: false
                    },
                    standard: {
                        displayName: i18n.lang.standard,
                        nameField: "data",
                        valueField: "id",
                        inputType: "typeahead",
                        autoQuery: true,
                        queryWithExistsData: ["goods_id"],
                        queryParams: {
                            fieldAlias: "standard"
                        }
                    },
                    version: {
                        displayName: i18n.lang.version,
                        nameField: "data",
                        valueField: "id",
                        inputType: "typeahead",
                        autoQuery: true,
                        queryWithExistsData: ["goods_id"],
                        queryParams: {
                            fieldAlias: "version"
                        }
                    },
                    stock: {
                        displayName: i18n.lang.stock
                    },
                    store_num: {
                        displayName: i18n.lang.storeNum,
                        editAble:false
                    },
                    num: {
                        displayName: i18n.lang.num,
                        inputType: "number",
                        totalAble: true
                    },
                    memo: {
                        displayName: i18n.lang.memo
                    }
//                    store_min: {
//                        displayName: i18n.lang.store_min,
//                    },
//                    store_max: {
//                        displayName: i18n.lang.store_min,
//                    },
                    
                };
                // GoodsRes
                if(arguments[1].goods) {
                    fields.goods_id.dataSource = arguments[1].goods;
                }
                if(arguments[1].dataModelData) {
                    fields.standard.dataSource = arguments[1].dataModelData;
                    fields.version.dataSource = arguments[1].dataModelData;
                }
                
                return fields;
            };
            
            obj.getFields = function($scope){
                return obj.getFieldsStruct();
            };
            
            return obj;
        })