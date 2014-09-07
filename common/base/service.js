(function(){
    'use strict';
    angular.module("ones.common.services", [])

        .service("HOME.TypesAPI", ["$rootScope", "ones.dataAPI", function($rootScope, res){
            return  {
                api: res.getResourceInstance({
                    uri: "home/types",
                    extraMethod: {
                        update: {method: "PUT"}
                    }
                }),
                structure: {
                    id: {
                        primary: true
                    },
                    type: {
                        inputType: "select",
                        dataSource: []
                    },
                    alias: {},
                    name: {},
                    listorder: {
                        inputType: "number",
                        value: 99
                    }
                },
                getStructure : function() {
                    var self = this;
                    angular.forEach($rootScope.i18n.lang.types, function(item, k){
                        self.structure.type.dataSource.push({
                            id: k,
                            name: item
                        });
                    });

                    return this.structure;
                }
            };
        }])
        .service("HOME.ConfigAPI", ["$rootScope", "ones.dataAPI", function($rootScope, res){
            return {
                api: res.getResourceInstance({
                    uri: "home/config",
                    extraMethod: {
                        update: {method: "PUT"}
                    }
                }),
                structure: {
                    id: {primary: true},
                    alias: {},
                    name: {},
                    value: {
                        inputType: "textarea"
                    },
                    description: {
                        inputType: "textarea",
                        required: false
                    }
                },
                getStructure : function() {
                    return this.structure;
                }
            };
        }])
        .service("HOME.AppsAPI", ["$rootScope", "ones.dataAPI", function($rootScope, res){
            return {
                editAble: false,
                deleteAble: false,
                viewDetailAble: true,

                api: res.getResourceInstance({
                    uri: "home/apps",
                    extraMethod: {
                        update: {method: "PUT"}
                    }
                }),

                structure: {
                    name: {},
                    alias: {
                        listable: false
                    },
                    version: {
                        listable: false
                    },
                    author: {},
                    description: {},
                    status_text: {
                        cellFilter: "lang",
                        displayName: toLang("status", "", $rootScope)
                    }
                },

                getStructure : function() {
                    return this.structure;
                },

                get: function(params) {
                    return this.api.get(params);
                }
            };
        }])
    ;
})();