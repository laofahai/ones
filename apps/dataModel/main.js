(function(){

    /**
     * 绑定数据模型至模型数据结构插件
     * 接受参数： structure 标识模型数据结构
     *          type 标识数据模型的类型
     * */
     ones.plugins.binDataModelToStructure = function(injector, defer,  params){
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
             angular.forEach(data, function(item){
                 result[item.field_name] = {
                     inputType: item.input_type,
                     nameField: "data",
                     editAbleRequire: params.require || [],
                     dataSource: injector.get("DataModelDataRes"),
                     queryWithExistsData: params.queryExtra || [],
                     autoQuery: !params.autoQuery || true,
                     queryParams: {
                         fieldAlias: item.field_name
                     }
                 };
             });

             result = $.extend(result, params.structure);


             defer.resolve(result);
         });

         ones.pluginScope.defer = defer;

    };

    ones.pluginRegister("binDataModelToStructure", "binDataModelToStructure");

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

        .controller("DataModelFieldsEditCtl", ["$scope", "DataModelFieldsModel", "DataModelFieldsRes", "ComView", "$routeParams",
            function($scope, DataModelFieldsModel, DataModelFieldsRes, ComView, $routeParams) {
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelEdit",
                    module: "/dataModel/DataModelFields",
                    returnPage: "/dataModel/viewChild/dataModel/pid/"+$routeParams.pid,
                    id: $routeParams.id
                };
                ComView.displayForm($scope, DataModelFieldsModel, DataModelFieldsRes, opts);
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
                    $location.url("/dataModel/list/DataModelData/modelId/"+data.id+"/source_id/"+$routeParams.catid);
                });
            }])
        .controller("DataModelDataCtl", ["$scope", "DataModelDataRes", "DataModelDataModel", "ComView", "$routeParams",
            function($scope, DataModelDataRes, DataModelDataModel, ComView, $routeParams) {
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/dataModel/DataModelData/add/"+$routeParams.modelId
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/dataModel/DataModelData/"+$routeParams.modelId
                    }
                ];
                ComView.displayGrid($scope, DataModelDataModel, DataModelDataRes, {
                    module: "/dataModel/DataModelData",
                    subModule: $routeParams.modelId,
                    queryExtraParams: {modelId:$routeParams.modelId}
                });
            }])
        .controller("DataModelDataEditCtl", ["$scope", "DataModelDataModel", "DataModelDataRes","DataModelFieldsRes", "ComView", "$routeParams",
            function($scope, DataModelDataModel, DataModelDataRes, DataModelFieldsRes, ComView, $routeParams) {

                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/dataModel/DataModelData/add/"+$routeParams.modelId
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/dataModel/DataModelData/"+$routeParams.modelId
                    }
                ];
                $scope.selectAble = false;
                var opts = {
                    name: "DataModelDataEdit",
                    module: "/dataModel/DataModelData",
                    returnPage: "/dataModel/DataModelData/"+$routeParams.modelId,
                    id: $routeParams.id,
                    dataLoadedEvent: "foreignDataLoaded"
                };
                ComView.displayForm($scope,DataModelDataModel,DataModelDataRes,opts, true);
            }])
    ;
})();