'use strict';

angular.module("ones.home.services", [])
        .service("UserDesktopModel", function(){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {primary: true},
                        name: {},
                        template: {},
                        width: {
                            value: 6,
                            max: 12,
                            inputType: "number"
                        },
                        listorder: {
                            inputType: "number",
                            value: 99
                        }
                    };
                } 
            };
        })
         .service("DataModelModel", function() {
            var obj = {
                subAble: true,
                addSubAble: false,
                subTpl: '/%(group)s/%(action)s/'
            };
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
         .service("DataModelFieldsModel", ["$rootScope", "$routeParams", function($rootScope, $routeParams) {
            var obj = {
                returnPage: sprintf("/HOME/viewChild/dataModel/pid/"+$routeParams.pid)
            };
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
                        model_id: {
                            listable: false,
                            inputType: "hidden"
                        },
                        data: {},
                        pinyin: {
                            required: false,
                            displayName: i18n.firstChar
                        },
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
                            inputType: "select",
                            nameField: "display_name"
                        }
                    };

                    if(structOnly) {
                        return struct;
                    } else {
                        var defer = $q.defer();
                        var params = {
                            modelId:$routeParams.modelId
                        };
                        console.log($routeParams);
                        DataModelFieldsRes.query(params, function(data){
                            struct.field_id.dataSource = data;
                            defer.resolve(struct);
                        });
                        return defer.promise;
                    }
                };
                return obj;
             }])
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
                             {id: "voucher", name:i18n.types.voucher},
                             {id: "produce", name:i18n.types.produce},
                             {id: "stockin", name:i18n.types.stockin}
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

        return {
            getFieldsStruct: function(){
                return {
                    id: {primary: true},
                    name: {},
                    age: {inputType: "number"},
                    phone: {required: false},
                    department_id: {
                        inputType: "select",
                        displayName: $rootScope.i18n.lang.department,
                        dataSource: DepartmentRes
                    }
                };
            }
        };
         }])
        .service("WorkflowModel", ["$rootScope", function($rootScope){
            return {
                subAble: true,
                addSubAble: false,
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        alias : {},
                        name: {},
                        workflow_file: {
                            displayName: $rootScope.i18n.lang.workflowAssitFile
                        },
                        memo: {}
                    };
                }
            };
        }])
        .service("WorkflowNodeModel", ["$rootScope", "WorkflowNodeRes", "$routeParams", "$q",
            function($rootScope, res, $route, $q){
                var service = {
                    extraParams: {
                        pid: $route.pid
                    },
                    listUrl: sprintf("/HOME/viewChild"),
                    getFieldsStruct: function(structOnly){
                        var struct = {
                            id: {primary: true},
                            name: {},
                            type: {},
                            execute_file: {
                                listable: false
                            },
                            listorder: {
                                value: 99
                            },
                            prev_node_id: {
                                inputType: "select",
                                required: false,
                                multiple: "multiple"
                            },
                            next_node_id: {
                                inputType: "select",
                                required: false,
                                multiple: "multiple"
                            },
                            executor: {
                                listable: false,
                                required: false
                            },
                            cond: {
                                listable: false,
                                required: false
                            },
                            'default': {
                                listable: false,
                                inputType: "select",
                                dataSource: [
                                    {id: 1, name: $rootScope.i18n.lang.yes},
                                    {id: -1, name: $rootScope.i18n.lang.no}
                                ]
                            },
                            remind: {
                                listable: false
                            },
                            status_text: {},
                            memo: {
                                required: false
                            }
                        };

                        if(!structOnly) {
                            var defer = $q.defer();
                            var queryParams = {
                                
                            };
                            if($route.extra) {
                                var extraParams = $route.extra.split("/");
                                if(extraParams[0] === "pid") {
                                    struct.workflow_id = {
                                        value: extraParams[1],
                                        inputType: "hidden",
                                        listable: false
                                    };
                                    queryParams.pid = extraParams[1];
                                }
                            } else if($route.id) {
                                queryParams.by_node_id = $route.id;
                            }
                            res.query(queryParams, function(data){
                                struct.prev_node_id.dataSource = data;
                                struct.next_node_id.dataSource = data;
                                defer.resolve(struct);
                            });
                            return defer.promise;
                        } else {
                            return struct;
                        }
                    }
                };

                return service;
            }])
        ;