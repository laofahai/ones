'use strict';

angular.module("erp.home.services", [])
         .service("DataModelModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    name: {},
                    type: {}
                };
            };
            return obj;
         })
         .service("TypesModel", ["$rootScope",function($rootScope){
             var obj = {};
             obj.getFieldsStruct = function(){
                 var i18n = $rootScope.i18n.lang;
                 return {
                     id: {
                         primary: true
                     },
                     type: {
                         inputType: "select",
                         dataSource: [
                             {id: "purchase", name:i18n.types.purchase},
                             {id: "sale", name:i18n.types.sale},
                             {id: "returns", name:i18n.types.returns},
                             {id: "shipment", name:i18n.types.shipment},
                             {id: "freight", name:i18n.types.freight},
                             {id: "receive", name:i18n.types.receive},
                             {id: "pay", name:i18n.types.pay},
                             {id: "voucher", name:i18n.types.voucher}
                         ]
                     },
                     alias: {},
                     name: {},
                     listorder: {
                         inputType: "number",
                         value: 99
                     },
                     status: {
                         inputType: "checkbox"
                     }
                 };
             };
             return obj;
         }])
         .service("DataModelFieldsModel", ["$rootScope", function($rootScope) {
            var obj = {};
            obj.getFieldsStruct = function(){
                var i18n = $rootScope.i18n.lang;
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    display_name: {
                        displayName: i18n.displayName
                    },
                    field_name: {
                        displayName: i18n.name
                    },
                    type: {
                        inputType: "select",
                        dataSource: [
                            {
                                id: "text",
                                name: i18n.inputType.text
                            },
                            {
                                id: "number",
                                name: i18n.inputType.number
                            },
                            {
                                id: "select",
                                name: i18n.inputType.select
                            }
                        ]
                    }
                };
            };
            return obj;
         }])
         .service("DataModelDataModel", ["$rootScope", "$q", "DataModelFieldsRes", "$routeParams",
            function($rootScope, $q, DataModelFieldsRes, $routeParams) {
                var obj = {};
                obj.getFieldsStruct = function(structOnly){
                    var i18n = $rootScope.i18n.lang;
                    var struct = {
                        id: {
                            primary: true,
                            displayName: "ID"
                        },
                        data: {},
                        model_name: {
                            displayName: i18n.modelName,
                            hideInForm: true
                        },
                        display_name: {
                            displayName: i18n.displayName,
                            hideInForm: true
                        },
                        field_name: {
                            displayName: i18n.name,
                            hideInForm: true
                        },
                        field_id: {
                            displayName: i18n.field,
                            listable: false,
                            inputType:"select",
                            nameField: "display_name"
                        }
                    };

                    if(structOnly) {
                        return struct;
                    } else {
                        var defer = $q.defer();
                        DataModelFieldsRes.query({modelId:$routeParams.modelId}, function(data){
                            struct.field_id.dataSource = data;
                            defer.resolve(struct);
                        });
                        return defer.promise;
                    }
                };
                return obj;
             }])