(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.bpm.main', [
        'ones.gridViewModule'
    ])
        .config(['$routeProvider', function($route){
            $route.when('/bpm/builder/:id', {
                controller: 'BpmBuilderCtrl',
                templateUrl: appView('builder.html')
            });
        }])
        .controller('BpmBuilderCtrl', [
            '$scope',
            '$timeout',
            '$modal',
            'pluginExecutor',
            'Bpm.WorkflowAPI',
            '$routeParams',
            'RootFrameService',
            '$modal',
            function($scope, $timeout, $modal, plugin, workflow_api, $routeParams, RootFrameService) {

                $scope.reloading = false;

                $scope.back_able = true;

                // 刷新预览图
                function re_drawing() {
                    var diagram_div = $("#bpm-show-container");
                    try {
                        var language = $scope.bpm_description_language.split("\n\n");
                        language = language[0]+"\n\n"+language[1];
                        var diagram = flowchart.parse(language);
                        $scope.reloading = true;

                        $timeout(function() {
                            diagram_div.html('');
                            $scope.reloading = false;
                            diagram.drawSVG('bpm-show-container', workflow_api.shower_config);
                            diagram_div.find('a').attr("href", "javascript:void(0);");
                        }, 500);
                    } catch(err) {
                        throw err;
                    }
                }

                // 自动刷新预览
                $scope.$watch('bpm_description_language', function(description_language, old_value) {
                    if(!description_language) {
                        return;
                    }
                    if(workflow_api.get_define_str(description_language) == workflow_api.get_define_str(old_value)) {
                        return;
                    }
                    re_drawing();
                });

                // 显示编辑器
                $scope.show_editor = true;
                $scope.toggle_editor = function() {
                    $scope.show_editor = !$scope.show_editor;
                };

                // 提交
                $scope.submit = function() {
                    workflow_api.builder_resource.update({
                        id: $routeParams.id,
                        data: $scope.bpm_description_language
                    });
                };

                // 载入数据
                workflow_api.get_full_data($routeParams.id).then(function(response_data) {
                    $scope.bpm_description_language = response_data.workflow;
                    $scope.executors = workflow_api.get_executor(response_data.workflow);
                });

                // 特殊的角色
                $scope.special_roles = [
                    {id: 'auto', name: _('bpm.Auto execute')},
                    {id: 'wait', name: _('bpm.Waiting for outside response')},
                    {id: 'owner', name: _('bpm.Data owner')}
                ];

                // 绑定节点事件
                var roles_inited = false;
                var node_setting_modal;

                $('#bpm-show-container').delegate('text', 'dblclick', function() {
                    var source_ele = $(this);
                    var ele = $(this).prev();
                    var node_alias = ele.attr('id');
                    $scope.$apply(function() {
                        $scope.current_node_executor = $scope.executors[node_alias] || {};
                        $scope.current_node_alias = node_alias;
                        $scope.current_node_label = source_ele.text();

                        if(!roles_inited) {
                            workflow_api.resource.api_get({_m: 'get_addable_roles'}).$promise.then(function(response_data) {
                                $scope.addable_roles = response_data;
                            });
                            roles_inited = true;
                        }
                        node_setting_modal = $modal({
                            title: _('bpm.Node Setting'),
                            template: appView('node_setting.html', 'bpm'),
                            show: true,
                            scope: $scope
                        });
                    });
                });

                $scope.toggle_role = function(type, label, value) {
                    $scope.executors[$scope.current_node_alias] = $scope.current_node_executor;
                    $scope.executors[$scope.current_node_alias][type] = $scope.executors[$scope.current_node_alias][type] || [];

                    if($scope.executors[$scope.current_node_alias][type].indexOf(value) >= 0) {
                        $scope.executors[$scope.current_node_alias][type].remove(value);
                    } else {
                        $scope.executors[$scope.current_node_alias][type].push(value);
                    }

                    var executor_str = workflow_api.to_executor_str($scope.executors);
                    var define_string = $scope.bpm_description_language.split("\n\n").splice(0, 2).join("\n\n");

                    $scope.bpm_description_language = define_string+"\n\n"+executor_str;
                };

                $scope.is_role_enabled = function(type, value) {
                    $scope.current_node_executor[type] = $scope.current_node_executor[type] || [];
                    return $scope.current_node_executor[type].indexOf(value) >= 0;
                };

            }
        ])

    ;

})(window, window.angular, window.ones, window.io);