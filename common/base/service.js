(function(){
    'use strict';
    angular.module("ones.common.services", [])

        .service("HOME.TypesAPI", ["$rootScope", "ones.dataApiFactory", function($rootScope, res){
            return  {
                config: {
                    columns: 1
                },
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
                        cellFilter: "lang:'types'"
                    },
                    alias: {
                        required: false
                    },
                    name: {},
                    listorder: {
                        inputType: "number",
                        value: 99
                    }
                },
                getStructure : function() {
                    var self = this;
                    self.structure.type.dataSource = [];
                    angular.forEach(l("lang.types"), function(item, k){
                        self.structure.type.dataSource.push({
                            id: k,
                            name: item
                        });
                    });

                    return this.structure;
                }
            };
        }])
        .service("HOME.ConfigAPI", ["$rootScope", "ones.dataApiFactory", function($rootScope, res){
            return {
                config: {
                    columns: 1
                },
                api: res.getResourceInstance({
                    uri: "home/config",
                    extraMethod: {
                        update: {method: "PUT"}
                    }
                }),
                structure: {
                    id: {
                        primary: true,
                        sortAble: true
                    },
                    alias: {
                        sortAble: true,
                        onlyInAdd: true
                    },
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
        .service("HOME.AppsAPI", ["$rootScope", "ones.dataApiFactory", function($rootScope, res){
            return {

                config: {
                    editAble: false,
                    deleteAble: false,
                    viewDetailAble: true
                },

                api: res.getResourceInstance({
                    uri: "home/apps",
                    extraMethod: {
                        update: {method: "PUT"}
                    }
                }),

                structure: {
                    name: {},
                    alias: {
                        listAble: false
                    },
                    version: {
                        listAble: false
                    },
                    author: {},
                    description: {},
                    status_text: {
                        cellFilter: "lang",
                        displayName: l("status")
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