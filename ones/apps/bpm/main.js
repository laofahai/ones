(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.bpm.main', [
        'ones.app.bpm.model',
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
            'BPM.Renderer',
            '$timeout',
            '$modal',
            'pluginExecutor',
            'Bpm.WorkflowAPI',
            'ones.dataApiFactory',
            '$routeParams',
            'RootFrameService',
            function($scope, renderer, $timeout, $modal, plugin, workflow, dataAPI, $routeParams, RootFrameService) {

                var temp_cache_key = 'ones.bpm.temp';

                /*
                 * 动作类型
                 * */
                $scope.action_types = [
                    {label: _('bpm.Do Nothing'), value: 'n'},
                    {label: _('bpm.Execute a service API'), value: 'e'},
                    {label: _('bpm.Edit main row data'), value: 'u'}
                ];

                // 节点类型
                $scope.node_types = [
                    'general' // 通用
                    ,'start' // start
                    ,'end'
                    ,'cond' // condition
                ];

                var start_node_seted = false;

                // service api
                plugin.callPlugin('bpm_service_api');

                // 默认人员
                $scope.roles = [
                    {label: _('bpm.Data Owner'), value: 'a:o'}, // auto owner
                    {label: _('bpm.Auto Execute'), value: 'a:a'}, // auto, nothing
                    {label: _('bpm.Wait for outside'), value: 'w:o'} // wait, outside
                ];

                $scope.set_add_to_role = function(role) {
                    $scope.add_widget_to_role = role.value;
                    $scope.add_widget_to_role_label = role.label;
                };
                // 默认添加控件至
                $scope.set_add_to_role($scope.roles[1]);
                angular.forEach($scope.roles, function(role) {
                    renderer.add_group(role);
                });

                // 控件
                $scope.widgets = renderer.widgets;

                $scope.lines = renderer.lines;

                // 新增控件
                $scope.add_widget = function(type) {
                    if(type === 'start') {
                        // 只允许一个开始节点存在
                        if(start_node_seted) {
                            RootFrameService.alert({
                                content: _('bpm.Only 1 start node can exists'),
                                type: 'danger'
                            });
                            return false;
                        } else {
                            start_node_seted = true;
                        }
                    }

                    renderer.add_widget(type, $scope.add_widget_to_role);

                    ones.caches.setItem(temp_cache_key, $scope.widgets, 1);
                };

                // 控件点击事件
                $scope.do_widget_click = function(event, widget) {
                    $scope.active_widget = renderer.active_widget = widget;
                    $scope.active_line = renderer.active_line = {};
                };
                $scope.do_line_canvas_click = function(event, line) {
                    $scope.active_line = renderer.active_line = line;
                    $scope.active_widget = renderer.active_widget = {};
                };

                 //缓存本地临时数据
                //var cached = ones.caches.getItem(temp_cache_key) || {};
                //if(cached) {
                //    console.log(cached);
                //    angular.forEach(cached, function(item, group) {
                //        //renderer.add_widget_exists(item);
                //    });
                //    //renderer.widget_id += 1;
                //    //$scope.widgets = renderer.widgets;
                //}
                // 取得工作流信息
                workflow.get_full_data($routeParams.id).then(function(response) {
                    var service_apis = ones.pluginScope.get('bpm_service_api') || [];
                    $scope.service_apis = filter_array_by_field(service_apis, 'module', response.module);

                    // 可更新字段
                    plugin.callPlugin('bpm_editable_fields_'+response.module);
                    $scope.editable_fields_config = ones.pluginScope.get('bpm_editable_fields');
                    $scope.editable_fields = [];
                    angular.forEach($scope.editable_fields_config, function(item, k) {
                        $scope.editable_fields.push(item.field);
                        $scope.editable_fields_config[k].group_tpl = '%(input)s';
                        $scope.editable_fields_config[k]['ng-model'] = 'node_settings.edit_field.'+item.field;
                    });

                    var role_label_map = {};
                    angular.forEach($scope.roles, function(role) {
                        role_label_map[role.value] = role.label;
                    });

                    angular.forEach(response.nodes, function(node) {
                        node.group.label = role_label_map[node.group.value];
                        renderer.add_widget_exists(node);
                    });
                    renderer.widget_id += 1;
                    $scope.widgets = renderer.widgets;
                });


                // 控件被拖动
                $scope.$on('bpm.widget_moved', function(evt, target){
                    // 改变控件位置
                    var data = target.data();
                    angular.forEach(renderer.widgets, function(group, group_value) {
                        angular.forEach(group.widgets, function(item, key){
                            // 被移动widget
                            if(item.id === data.widgetId) {
                                renderer.widgets[group_value].widgets[key].position = {
                                    left: target.position().left,
                                    top: target.position().top
                                };
                                if (target.after_width) {
                                    renderer.widgets[group_value].widgets[key].size = {
                                        width: target.after_width,
                                        height: target.after_height
                                    };
                                }

                                // 下一节点
                                if (item.next_nodes) {
                                    angular.forEach(item.next_nodes, function(n) {
                                        renderer.draw_line(item, n, 'moved');
                                    });
                                }

                                // 所移动元素是某一元素的下级元素
                                if(item.prev_nodes) {
                                    angular.forEach(item.prev_nodes, function(p) {
                                        renderer.draw_line(p, item, 'moved');
                                    });
                                }
                            }
                        });

                        ones.caches.setItem(temp_cache_key, $scope.widgets);
                    });

                });

                // 全局按键事件
                $(document).keydown(function(event) {

                    if(event.keyCode === 8 && event.target.tagName !== 'INPUT') {
                        event.preventDefault();

                        // 节点相关检测列表
                        var check_list = {
                            next_nodes: ['next_node_ids', 'prev_node_ids'],
                            prev_nodes: ['prev_node_ids', 'next_node_ids'],
                            condition_true: ['condition_true_ids', 'cond_check_ids'],
                            condition_false: ['condition_false_ids', 'cond_check_ids']
                        };

                        // 删除控件 一并删除涉及到的控件联系
                        if($scope.active_widget && $scope.active_widget.id >= 0) {
                            for(var i=0; i<$scope.widgets[$scope.active_widget.group].widgets.length;i++) {
                                var widget = $scope.widgets[$scope.active_widget.group].widgets[i];
                                if($scope.active_widget.id === widget.id) {
                                    $scope.$apply(function(){
                                        $scope.widgets[$scope.active_widget.group].widgets.splice(i, 1);
                                        ones.caches.setItem(temp_cache_key, $scope.widgets);
                                    });
                                    break;
                                }
                            }

                            // 相关控件联系
                            // 下一节点
                            if($scope.active_widget.next_nodes
                                    || $scope.active_widget.prev_nodes
                                    || $scope.active_widget.condition_true
                                    || $scope.active_widget.condition_false
                            ) {
                                angular.forEach($scope.widgets, function(item, group_value) {
                                    for(var i=0; i<item.widgets.length; i++) {
                                        angular.forEach(check_list, function(check_var, items_var) {
                                            var ids_var = check_var[0]; // 当前遍历至控件与活动项的相关项
                                            var prev_var = check_var[1]; // 活动控件的相关项
                                            if(item.widgets[i][ids_var] && item.widgets[i][ids_var].indexOf($scope.active_widget.id) >= 0) {
                                                for(var j=0; j<item.widgets[i][items_var].length; j++) {
                                                    var tmp = item.widgets[i][items_var][j];
                                                    if(tmp.id === $scope.active_widget.id) {
                                                        $scope.$apply(function(){
                                                            $scope.widgets[group_value].widgets[i][ids_var].splice(item.widgets[i][ids_var].indexOf($scope.active_widget.id));
                                                            $scope.widgets[group_value].widgets[i][items_var].splice(j, 1);
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }

                            ones.caches.setItem(temp_cache_key, $scope.widgets);

                        } else if(undefined !== $scope.active_line.id) {
                            // 删除线段
                            for(var i=0; i<$scope.lines.length;i++) {
                                if($scope.active_line.id === $scope.lines[i].id) {
                                    var from_widget = $scope.active_line.from_widget;
                                    var to_widget = $scope.active_line.to_widget;
                                    var from_widget_index, to_widget_index;

                                    // 删除from widget的next_widget
                                    angular.forEach($scope.widgets[from_widget.group].widgets, function(widget, k) {
                                        if(widget.id === from_widget.id) {
                                            if(!widget.next_nodes) {
                                                return;
                                            }
                                            for(var i=0;i<widget.next_nodes.length;i++) {
                                                if(widget.next_nodes[i].id === to_widget.id) {
                                                    $scope.$apply(function(){
                                                        $scope.widgets[widget.group].widgets[k].next_node_ids.splice(
                                                            $scope.widgets[widget.group].widgets[k].next_node_ids.indexOf(to_widget.id), 1);
                                                        $scope.widgets[widget.group].widgets[k].next_nodes.splice(i, 1);
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                    });

                                    // 删除to widget的prev_widget
                                    angular.forEach($scope.widgets[to_widget.group].widgets, function(widget, k) {
                                        if(widget.id === to_widget.id) {
                                            if(!widget.prev_nodes) {
                                                return;
                                            }
                                            for(var i=0;i<widget.prev_nodes.length;i++) {
                                                if(widget.prev_nodes[i].id === from_widget.id) {
                                                    $scope.$apply(function(){
                                                        $scope.widgets[widget.group].widgets[k].prev_node_ids.splice(
                                                            $scope.widgets[widget.group].widgets[k].prev_node_ids.indexOf(from_widget.id), 1);
                                                        $scope.widgets[widget.group].widgets[k].prev_nodes.splice(i, 1);
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                    });

                                    $scope.$apply(function() {
                                        // 删除连线
                                        $scope.lines.splice(i, 1);
                                    });
                                    break;
                                }
                            }

                            ones.caches.setItem(temp_cache_key, $scope.widgets);
                        }

                    }

                });

                $(document).click(function(event) {
                    if(!$(event.target).hasClass('bpm-widget') && !$(event.target).parent().hasClass('bpm-line')) {
                        $scope.$apply(function(){
                            $scope.active_widget = {};
                            $scope.active_line = {};
                        });
                    }

                });

                // 获得role label
                var get_role = function(value) {
                    for(var i=0;i<$scope.roles.length;i++) {
                        if($scope.roles[i].value === value) {
                            return $scope.roles[i];
                        }
                    }
                };

                $scope.clear_bpm_temp = function() {
                    ones.caches.removeItem(temp_cache_key);
                    location.reload();
                };

                // 右键菜单
                $scope.show_widget_actions = function(evt, widget) {
                    var context_menus = [
                        {
                            label: _('bpm.Node settings'),
                            icon: 'cog',
                            action: function(event, selected, item) {
                                $scope.edit_widget_config(event, item);
                            }
                        },
                        {
                            label: _('bpm.Next node is'),
                            icon: 'level-down',
                            children: []
                        },
                        //{
                        //    label: _('bpm.Branch to node'),
                        //    icon: 'code-fork',
                        //    children: []
                        //},
                        {
                            label: _('bpm.Condition True'),
                            icon: 'check-circle',
                            children: []
                        }
                        ,
                        {
                            label: _('bpm.Condition False'),
                            icon: 'times-circle',
                            children: []
                        }
                    ];
                    // 添加至下一节点/分支/判断条件
                    var has_children = [1,2,3];
                    angular.forEach($scope.widgets, function(config, group) {

                        angular.forEach(has_children, function(i) {
                            context_menus[i].children.push({
                                label: get_role(group).label,
                                is_header: true
                            });

                            angular.forEach(config.widgets, function(child) {
                                if(child.id === widget.id || !child.label) {
                                    return;
                                }
                                context_menus[i].children.push({
                                    label: child.label,
                                    next_node_type: i,
                                    action: function(event, selected, item) {
                                        var unique = true;
                                        switch(this.next_node_type) {
                                            case 1: //下一节点
                                                renderer.set_node_config(item, 'next_nodes', child, true);
                                                renderer.set_node_config(item, 'next_node_ids', child.id, true);

                                                renderer.set_node_config(child, 'prev_nodes', item, true);
                                                renderer.set_node_config(child, 'prev_node_ids', item.id, true);
                                                break;
                                            //case 2: //下一分支
                                            //    unique = false;
                                            //    renderer.set_node_config(item, 'next_branches', child, true);
                                                break;
                                            case 2: //判断节点 true
                                                renderer.set_node_config(item, 'condition_true', child, true);
                                                renderer.set_node_config(item, 'condition_true_ids', child.id, true);

                                                renderer.set_node_config(child, 'prev_nodes', item, true);
                                                renderer.set_node_config(child, 'prev_node_ids', item.id, true);
                                                break;
                                            case 3: //判断节点 true
                                                renderer.set_node_config(item, 'condition_false', child, true);
                                                renderer.set_node_config(item, 'condition_false_ids', child.id, true);

                                                renderer.set_node_config(child, 'prev_nodes', item, true);
                                                renderer.set_node_config(child, 'prev_node_ids', item.id, true);
                                        }

                                        renderer.draw_line(item, child, unique);

                                        ones.caches.setItem(temp_cache_key, $scope.widgets, 1);
                                    }
                                });
                            });
                        });

                    });

                    var emit_menus = angular.copy(context_menus);
                    // 非条件判断节点
                    if(widget.type !== 'cond') {
                        emit_menus.splice(2, 2);
                    }

                    $scope.active_widget = widget;
                    $scope.$emit('contextMenu', {
                        items:emit_menus,
                        left: evt.clientX,
                        top: evt.clientY,
                        selectedItems: [],
                        currentItem: widget
                    });
                };

                var to_service_api_label = function(api) {
                    for(var i=0; i<$scope.service_apis.length; i++) {
                        if($scope.service_apis[i].value == api) {
                            return $scope.service_apis[i].label;
                        }
                    }
                };

                // widget配置
                $scope.edit_widget_config = function($event, widget) {
                    $scope.node_settings = widget;
                    $modal({
                        scope: $scope,
                        template: appView('node_setting.html')
                    });

                    $scope.$watch(function() {
                        return $scope.node_settings.service_api;
                    }, function(service_api) {
                        if(service_api && $scope.node_settings.label[0] === '#') {
                            $scope.node_settings.label = to_service_api_label(service_api);
                        }
                    });
                };

                $scope.complete_edit_widget_config = function() {
                    for(var i=0; i<$scope.widgets[$scope.node_settings.group].widgets;i++) {
                        if($scope.widgets[$scope.node_settings.group].widgets[i].id === $scope.node_settings.id) {
                            $scope.widgets[$scope.node_settings.group].widgets[i] = $scope.node_settings;
                            $scope.node_settings = {};
                        }
                    }

                    ones.caches.setItem(temp_cache_key, $scope.widgets);
                };

                $scope.do_save_workflow = function() {
                    dataAPI.init('bpm', 'workflowBuilder');
                    dataAPI.resource.update({id: $routeParams.id}, $scope.widgets).$promise.then(function(data) {

                    });
                };

                // container 对象
                var container = $('#bpm-shower-container');

                // widget container 对象
                var widget_container = $("#bpm-content");
                widget_container.css({
                    width: container.width() - 60,
                    height: container.height()
                });

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);