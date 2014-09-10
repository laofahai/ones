(function(){
    angular.module("ones.workflow", [])
    .config(["$routeProvider", function($route){
        $route.when('/workflow/viewChild/workflow/pid/:pid', {
            templateUrl: "common/base/views/grid.html",
            controller: "WorkflowNodeCtl"
        });
    }])
    .factory("WorkflowRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "workflow/workflow/:id.json", null, {'update': {method: 'PUT'}});
    }])
    .factory("WorkflowNodeRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "workflow/workflowNode/:id.json", null, {'update': {method: 'PUT'}});
    }])
    .factory("WorkflowProcessRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "workflow/workflowProcess/:id.json", {type: "@type"});
    }])

    .service("WorkflowModel", ["$rootScope", function($rootScope){
        return {
            subAble: true,
            addSubAble: false,
            getStructure: function(){
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
                listUrl: sprintf("/workflow/viewChild"),
                getStructure: function(structOnly){
                    var struct = {
                        id: {primary: true},
                        name: {},
                        type: {},
                        execute_file: {},
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
                        executor_group: {
                            listable: false,
                            required: false,
                            dataSource: "AuthGroupRes",
                            inputType: "select",
                            multiple: "multiple",
                            nameField: "title"
                        },
                        executor_department: {
                            listable: false,
                            required: false,
                            dataSource: "DepartmentRes",
                            inputType: "select",
                            multiple: "multiple"
                        },
                        executor_user: {
                            listable: false,
                            required: false,
                            dataSource: "Department.UserAPI",
                            inputType: "select",
                            multiple: "multiple",
                            nameField: "truename"
                        },
                        cond: {
                            listable: false,
                            required: false
                        },
                        is_default: {
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
                        var queryParams = {};
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
        .controller("WorkflowNodeCtl", ["$scope", "WorkflowNodeRes", "WorkflowNodeModel", "ComView", "$routeParams",
            function($scope, WorkflowNodeRes, WorkflowNodeModel, ComView, $routeParams){
                $routeParams.group = "HOME";
                $routeParams.module = "workflowNode";
                var actions = $scope.$parent.i18n.urlMap.workflow.modules.WorkflowNode.actions;
                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid);
                ComView.makeGridSelectedActions($scope, WorkflowNodeModel, WorkflowNodeRes, "workflow", "WorkflowNode");
                ComView.displayGrid($scope,WorkflowNodeModel,WorkflowNodeRes, {
                    queryExtraParams: {
                        workflow_id: $routeParams.pid
                    },
                    module: "/workflow/WorkflowNode",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])
    ;
})();