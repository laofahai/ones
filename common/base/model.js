(function(){
    angular.module("ones.common.models", [])
        .service("TypesModel", ["$rootScope",function($rootScope){
            var obj = {};
            obj.getFieldsStruct = function(){
                var i18n = $rootScope.i18n.lang;
                var structure = {
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
                };

                angular.forEach($rootScope.i18n.lang.types, function(item, k){
                    structure.type.dataSource.push({
                        id: k,
                        name: item
                    });
                });

                return structure;
            };
            return obj;
        }])
        .service("ConfigModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct : function(){
                    return {
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
                    };
                }
            };
        }])

        .service("AppsModel", ["$rootScope", function($rootScope){
            return {
                editAble: false,
                deleteAble: false,
                viewDetailAble: true,
                getFieldsStruct: function() {
                    return {
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
                    };
                }
            };
        }])
    ;
})();