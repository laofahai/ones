'use strict';

angular.module("erp.home.services", [])
         .service("DataModelModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    name: {
                        displayName: i18n.lang.name
                    },
                    type: {
                        displayName: i18n.lang.type
                    }
                };
            };
            obj.getFields = function($scope){
                return obj.getFieldsStruct($scope.i18n);
            };
            return obj;
         })
         .service("TypesModel", function(){
             var obj = {};
             obj.getFieldsStruct = function(i18n){
                 return {
                     id: {
                         primary: true
                     },
                     type: {
                         inputType: "select",
                         dataSource: [
                             {id: "purchase", name:i18n.lang.types.purchase},
                             {id: "sale", name:i18n.lang.types.sale},
                             {id: "returns", name:i18n.lang.types.returns},
                             {id: "shipment", name:i18n.lang.types.shipment},
                             {id: "freight", name:i18n.lang.types.freight},
                             {id: "receive", name:i18n.lang.types.receive},
                             {id: "pay", name:i18n.lang.types.pay},
                             {id: "voucher", name:i18n.lang.types.voucher}
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
         })
         .service("DataModelFieldsModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    display_name: {
                        displayName: i18n.lang.displayName
                    },
                    field_name: {
                        displayName: i18n.lang.name
                    },
                    type: {
                        displayName: i18n.lang.type,
                        inputType: "select",
                        dataSource: [
                            {
                                id: "text",
                                name: i18n.lang.inputType.text
                            },
                            {
                                id: "number",
                                name: i18n.lang.inputType.number
                            },
                            {
                                id: "select",
                                name: i18n.lang.inputType.select
                            }
                        ]
                    }
                };
            };
            obj.getFields = function($scope){
                return obj.getFieldsStruct($scope.i18n);
            };
            return obj;
         })
         .service("DataModelDataModel", function() {
            var obj = {};
            obj.getFieldsStruct = function(i18n){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    data: {
                        displayName: i18n.lang.data
                    },
                    model_name: {
                        displayName: i18n.lang.modelName,
                        hideInForm: true
                    },
                    display_name: {
                        displayName: i18n.lang.displayName,
                        hideInForm: true
                    },
                    field_name: {
                        displayName: i18n.lang.name,
                        hideInForm: true
                    },
                    field_id: {
                        displayName: i18n.lang.field,
                        listable: false,
                        inputType:"select",
                        nameField: "display_name"
                    }
                };
            };
            obj.getFields = function(){
                var $scope = arguments[0];
                var DataModelFieldsRes = arguments[1][1];
                var modelId = arguments[1][0];
                DataModelFieldsRes.query({modelId:modelId}, function(data){
                    var fields = obj.getFieldsStruct($scope.i18n);
                    fields.field_id.dataSource = data;
                    $scope.$broadcast("foreignDataLoaded", fields);
                });
                
            };
            return obj;
         })