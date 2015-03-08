(function(){

    /**
     * 绑定数据模型至模型数据结构插件
     * 接受参数： structure 标识模型数据结构
     *          type 标识数据模型的类型
     * */
    ones.plugins.bind_dataModel_to_structure = function(injector, defer,  params){
        var res = injector.get("DataModelFieldsRes");
        //模型字段位置
        var modelFieldsPosition = params.after || "goods_id";
        var result = {};
        var structure = angular.copy(params.structure);

        for(name in structure) {
            result[name] = structure[name];
            delete(structure[name]);
            if(name == modelFieldsPosition) {
                break;
            }
        }

        //查询模型字段
        res.query({
            modelAlias: params.alias
        }, function(data){
            var extraConfigure = {};

            angular.forEach(data, function(item){
                var tmp;
                var tmpConfig;
                var labelConfigure = {};

                tmp = item.extra_data.split("\n");
                for(var i=0;i<tmp.length;i++) {
                    if(!tmp[i]) {
                        continue;
                    }
                    tmpConfig = tmp[i].split("::");
                    extraConfigure[tmpConfig[0]] = eval([tmpConfig[0]]+"="+tmpConfig[1]);
                }

                var defaultConfigure = {
                    inputType: item.input_type,
                    nameField: "data",
                    editAbleRequire: params.require || [],
                    dataSource: injector.get("DataModelDataRes"),
                    queryWithExistsData: params.queryExtra || [],
                    autoQuery: !params.autoQuery || true,
                    queryParams: {
                        fieldAlias: item.field_name
                    },
                    width: "auto",
                    hideInDetail: true
                };


                defaultConfigure = $.extend(defaultConfigure, extraConfigure);

                defaultConfigure = $.extend(defaultConfigure, params.config || {});


                if(!defaultConfigure.displayName || defaultConfigure.display == undefined) {
                    defaultConfigure.displayName = item.display_name;
                }

                //显示绑定到_label字段
                if(defaultConfigure.bindToLabel) {
                    var labelConfigure = $.extend({}, defaultConfigure);
                    labelConfigure.listAble = extraConfigure.listAble === undefined ? true : extraConfigure.listAble;
                    labelConfigure.hideInForm = true;
                    labelConfigure.billAble = false;
                    result[item.field_name+"_label"] = labelConfigure;
//                     console.log(labelConfigure);
                    defaultConfigure.listAble = false;
                }

                result[item.field_name] = defaultConfigure;

            });

            result = $.extend(result, structure);
            defer.resolve(result);
        });

        ones.pluginScope.set("defer", defer);

    };

    ones.pluginRegister("bind_dataModel_to_structure", "bind_dataModel_to_structure");

    angular.module("ones.dataModel", [])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when('/dataModel/viewChild/dataModel/pid/:pid', {
                templateUrl: "common/base/views/grid.html",
                controller: "DataModelFieldsCtl"
            })
            ;
        }])
        .factory("DataModelRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "dataModel/dataModel/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("DataModelFieldsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "dataModel/dataModelFields/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("DataModelDataRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "dataModel/dataModelData/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .service("DataModelModel", function() {
            var obj = {
                config: {
                    subAble: true,
                    addSubAble: false,
                    viewSubAble: true,
                    subTpl: '/%(group)s/%(action)s/'
                }
            };
            obj.getStructure = function(){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    alias: {},
                    name: {},
                    type: {
                        value: "product"
                    }
                };
            };
            return obj;
        })
        .service("DataModelFieldsModel", ["$rootScope", "$routeParams", function($rootScope, $routeParams) {
            var obj = {
                config: {
                    returnPage: sprintf("/dataModel/viewChild/dataModel/pid/"+$routeParams.pid),
                    columns: 1
                }
            };
            obj.getStructure = function(){
                var i18n = l('lang');
                var structure = {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    display_name: {
                        displayName: l('lang.displayName')
                    },
                    field_name: {
                        displayName: i18n.alias,
                        helpText: l('lang.helpTexts.field_alias')
                    },
                    input_type: {
                        inputType: "select",
                        dataSource: []
                    },
                    listorder: {
                        value: 99
                    },
                    extra_data: {
                        displayName: toLang("extra_configure", null, $rootScope),
                        inputType: "textarea",
                        required: false,
                        style: "height:120px;",
                        helpText: l("lang.dataModel_extraConfig_tip"),
                        listAble: false
                    }
                };

                angular.forEach(l('lang.inputTypes'), function(type, k){
                    structure.input_type.dataSource.push({
                        id: k,
                        name: toLang(k, "inputTypes", $rootScope)
                    });
                });

                return structure;
            };
            return obj;
        }])

        .service("DataModelDataModel", ["$rootScope", "$q", "DataModelFieldsRes", "$routeParams",
            function($rootScope, $q, DataModelFieldsRes, $routeParams) {
                var obj = {};
                var i18n = l('lang');
                obj.structure = {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    model_id: {
                        listAble: false,
                        inputType: "hidden"
                    },
                    data: {},
                    pinyin: {
                        required: false,
                        displayName: l('lang.firstChar'),
                        onlyInEdit: true
                    },
                    model_name: {
                        displayName: l('lang.model_name'),
                        hideInForm: true
                    },
                    display_name: {
                        displayName: l('lang.displayName'),
                        hideInForm: true
                    },
                    field_id: {
                        displayName: i18n.field,
                        listAble: false,
                        inputType: "select",
                        nameField: "display_name",
                        dataSource: "DataModelFieldsRes",
                        queryParams: {
                            modelId: $routeParams.modelId
                        }
                    }
                };
                obj.getStructure = function(structOnly){

                    if($routeParams.modelAlias) {
                        this.structure.field_id.queryParams.modelAlias = $routeParams.modelAlias;
                    }

                    return this.structure;
                };
                return obj;
            }])
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "ComView", "$routeParams", "DataModelModel",
            function($scope, res, model, ComView, $routeParams, dataModelModel) {
                $routeParams.group = "dataModel";
                $routeParams.module = "DataModelFields";
                var actions = l('urlMap.dataModel.modules.DataModelFields.actions');
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid, dataModelModel);
                ComView.makeGridSelectedActions($scope, model, res, "dataModel", "DataModelFields", "/pid/"+$routeParams.pid);
                ComView.displayGrid($scope,model,res, {
                    queryExtraParams: {
                        modelId: $routeParams.pid
                    },
                    module: "/dataModel/DataModelFields",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])
    ;
})();