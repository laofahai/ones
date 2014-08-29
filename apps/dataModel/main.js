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

         for(name in params.structure) {
             result[name] = params.structure[name];
             delete(params.structure[name]);
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
                 var defaultConfigure = {};
                 var labelConfigure = {};

                 tmp = item.extra_data.split("\n");
                 for(var i=0;i<tmp.length;i++) {
                     tmpConfig = tmp[i].split("::");
                     extraConfigure[tmpConfig[0]] = eval(tmpConfig[1]);
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
                     width: "auto"
                 };



                 defaultConfigure = $.extend(defaultConfigure, extraConfigure);


                 if(!defaultConfigure.displayName || defaultConfigure.display == undefined) {
                     defaultConfigure.displayName = item.display_name;
                 }

                 //显示绑定到_label字段
                 if(defaultConfigure.bindToLabel) {
                     var labelConfigure = $.extend({}, defaultConfigure);
                     labelConfigure.listable = extraConfigure.listable === undefined ? true : extraConfigure.listable;
                     labelConfigure.hideInForm = true;
                     labelConfigure.billAble = false;
                     result[item.field_name+"_label"] = labelConfigure;
//                     console.log(labelConfigure);
                     defaultConfigure.listable = false;
                 } else {

                 }

                 result[item.field_name] = defaultConfigure;
             });

             result = $.extend(result, params.structure);

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
            .when('/dataModel/DataModelData/catid/:catid', {
                templateUrl: "common/base/views/blank.html",
                controller: "DataModelDataCatidCtl"
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
                returnPage: sprintf("/dataModel/viewChild/dataModel/pid/"+$routeParams.pid)
            };
            obj.getFieldsStruct = function(){
                var i18n = $rootScope.i18n.lang;
                var structure = {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    display_name: {
                        displayName: i18n.displayName
                    },
                    field_name: {
                        displayName: i18n.alias,
                        helpText: "field_alias"
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
                        helpText: toLang("dataModel_extraConfig_tip", null, $rootScope),
                        listable: false
                    }
                };

                angular.forEach(i18n.inputTypes, function(type, k){
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
    //                        console.log($routeParams);
                        DataModelFieldsRes.query(params, function(data){
                            struct.field_id.dataSource = data;
                            defer.resolve(struct);
                        });
                        return defer.promise;
                    }
                };
                return obj;
            }])
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams) {
                $routeParams.group = "dataModel";
                $routeParams.module = "DataModelFields";
                var actions = $scope.$parent.i18n.urlMap.dataModel.modules.DataModelFields.actions;
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                ComView.makeGridSelectedActions($scope, model, res, "dataModel", "DataModelFields", "/pid/"+$routeParams.pid);
                ComView.displayGrid($scope,model,res, {
                    queryExtraParams: {
                        modelId: $routeParams.pid
                    },
                    module: "/dataModel/DataModelFields",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])

        .controller("DataModelDataCatidCtl", ["$scope", "$location", "DataModelRes", "$routeParams",
            function($scope, $location, res, $routeParams){
                res.get({
                    id: 0,
                    cat_id: $routeParams.catid
                }).$promise.then(function(data){
                    if(!data.id) {
                        return;
                    }
                    var lastPage = angular.fromJson(localStorage.lastPage);
//                    $location.url(lastPage[0]);
                    $location.url("/dataModel/list/DataModelData/modelId/"+data.id+"/source_id/"+$routeParams.catid);
                });
            }])
    ;
})();