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
                    fields_name: {
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