(function(){
    angular.module("ones.workflow", [])
    .config(["$routeProvider", function($route){
        $route.when('/workflow/viewChild/workflow/pid/:pid', {
            templateUrl: "common/base/views/grid.html",
            controller: "WorkflowNodeCtl"
        });
    }])
    .factory("WorkflowProcessRes", ["$resource", "ones.config", function($resource, cnf) {
        return $resource(cnf.BSU + "workflow/workflowProcess/:id.json", {type: "@type"});
    }])

    .service("Workflow.WorkflowAPI", ["$rootScope", "ones.dataApiFactory", "ComView", "$location", function($rootScope, dataAPI, ComView, $location){
        this.config = {
            subAble: true,
            addSubAble: false,
            viewSubAble: true
        };
        this.structure = {
            id: {
                primary: true
            },
            alias : {},
            name: {},
            workflow_file: {
                displayName: toLang("workflowAssitFile", "", $rootScope)
            },
            memo: {
                required: false,
                inputType: "textarea"
            }
        };
        this.getStructure = function(){
            return this.structure;
        };
        this.api = dataAPI.getResourceInstance({
            uri: "workflow/workflow"
        });

        this.doWorkflow = function(resource, node_id, mainrow_id) {
            resource.doWorkflow({
                workflow: true,
                node_id: node_id,
                id: mainrow_id
            }).$promise.then(function(data){
                if(data.type) {
                    switch(data.type) {
                        case "redirect":
                            $location.url(data.location);
                            return;
                            break;
                        case "message":
                            ComView.alert(ComView.toLang(data.msg, "messages"), data.error ? "danger" : "warning");
                            return;
                            break;
                    }
                }
            });
        };
    }])
    .service("Workflow.WorkflowNodeAPI", ["$rootScope", "ones.dataApiFactory", "$routeParams", "$q",
        function($rootScope, res, $route, $q){
            return {
                extraParams: {
                    pid: $route.pid
                },
                listUrl: sprintf("/workflow/viewChild"),

                api: res.getResourceInstance({
                    uri: "workflow/workflowNode"
                }),
                structure: {
                    id: {primary: true},
                    name: {},
                    type: {
                        inputType: "select",
                        dataSource: $rootScope.i18n.lang.workflowTypes
                    },
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
                        listAble: false,
                        required: false,
                        dataSource: "AuthGroupRes",
                        inputType: "select",
                        multiple: "multiple",
                        nameField: "title"
                    },
                    executor_department: {
                        listAble: false,
                        required: false,
                        dataSource: "Department.DepartmentAPI",
                        inputType: "select",
                        multiple: "multiple"
                    },
                    executor_user: {
                        listAble: false,
                        required: false,
                        dataSource: "Department.UserAPI",
                        inputType: "select",
                        multiple: "multiple",
                        nameField: "truename"
                    },
                    cond: {
                        listAble: false,
                        required: false
                    },
                    is_default: {
                        listAble: false,
                        inputType: "select",
                        dataSource: [
                            {id: 1, name: $rootScope.i18n.lang.yes},
                            {id: 0, name: $rootScope.i18n.lang.no}
                        ]
                    },
                    remind: {
                        listAble: false
                    },
                    status_text: {},
                    memo: {
                        required: false
                    }
                },
                getStructure: function(structureOnly){
                    var self = this;
                    if(!structureOnly) {
                        var defer = $q.defer();
                        var queryParams = {};
                        if($route.extra) {
                            var extraParams = $route.extra.split("/");
                            if(extraParams[0] === "pid") {
                                struct.workflow_id = {
                                    value: extraParams[1],
                                    inputType: "hidden",
                                    listAble: false
                                };
                                queryParams.pid = extraParams[1];
                            }
                        } else if($route.id) {
                            queryParams.by_node_id = $route.id;
                        }
                        this.api.query(queryParams, function(data){
                            data = filterDataFields(data);
                            self.structure.prev_node_id.dataSource = data;
                            self.structure.next_node_id.dataSource = data;
                            defer.resolve(self.structure);
                        });
                        return defer.promise;
                    } else {
                        return this.structure;
                    }
                }
            };
        }])
        .controller("WorkflowNodeCtl", ["$scope", "ComView", "$routeParams", "ones.dataApiFactory",
            function($scope, ComView, $routeParams, dataAPI){
                $routeParams.group = "workflow";
                $routeParams.module = "workflowNode";

                dataAPI.init($routeParams.group, $routeParams.module);

                var actions = $scope.$parent.i18n.urlMap.workflow.modules.WorkflowNode.actions;

                ComView.makeGridLinkActions($scope, actions, false, "pid/"+$routeParams.pid, dataAPI.model);
                ComView.makeGridSelectedActions($scope, dataAPI.model, dataAPI.resource, "workflow", "WorkflowNode");
                ComView.displayGrid($scope,dataAPI.model,dataAPI.resource, {
                    queryExtraParams: {
                        workflow_id: $routeParams.pid
                    },
                    module: "/workflow/WorkflowNode",
                    editExtraParams: "/pid/"+$routeParams.pid
                });
            }])
    ;
})();