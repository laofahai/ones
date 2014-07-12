(function(){
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
                    name: {},
                    type: {}
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
        .controller("DataModelFieldsCtl", ["$scope", "DataModelFieldsRes", "DataModelFieldsModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams) {
                $routeParams.group = "HOME";
                $routeParams.module = "DataModelFields";
                var actions = $scope.$parent.i18n.urlMap.dataModel.modules.DataModelFields.actions;
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                ComView.makeGridSelectedActions($scope, model, res, "HOME", "DataModelFields", "/pid/"+$routeParams.pid);
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