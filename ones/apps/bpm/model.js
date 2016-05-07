(function(window, angular, ones, io) {
    'use strict';

    ones.global_module
        .service('Bpm.WorkflowAPI', [
            'ones.dataApiFactory',
            '$location',
            'Bpm.WorkflowNodeAPI',
            '$rootScope',
            function(dataAPI, $location, node_service, $rootScope) {

                var self = this;

                this.config = {
                    app: 'bpm',
                    module: 'workflow',
                    table: 'workflow',
                    fields: {
                        name: {
                            search_able: true
                        },
                        module: {
                            search_able: true
                        },
                        is_default: {
                            widget: 'radio',
                            inline: true,
                            get_display: function(value, item) {
                                return to_boolean_icon(value > 0);
                            },
                            data_source: window.BOOLEAN_DATASOURCE,
                            value: 0
                        },
                        user_info_id: {
                            addable: false,
                            editable: false
                        },
                        locked: {
                            widget: 'radio',
                            inline: true,
                            label: _('common.Is Locked'),
                            get_display: function(value, item) {
                                return to_boolean_icon(value > 0);
                            },
                            data_source: window.BOOLEAN_DATASOURCE,
                            value: 0
                        }
                    },
                    list_hide: ['process'],
                    uneditable: ['module','app_id','created','last_update', 'process'],
                    unaddable: ['created','last_update', 'process'],
                    filters: {
                        is_default: {
                            type: 'link'
                        },
                        app_id: {
                            type: 'link',
                            get_display: function(item) {
                                return to_app_name(item.alias);
                            },
                            value_field: 'app_id'
                        }
                    },
                    extra_selected_actions: [{
                        label: _('bpm.Workflow Design'),
                        icon: 'pencil-square-o',
                        auth_node: 'bpm.workflowBuilder.put',
                        action: function(event, selected, item) {
                            item = item ? item : selected[0];

                            if(!item) {
                                return;
                            }

                            $location.url('/bpm/builder/'+item.id);
                        }
                    }]
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: 'bpm/workflow',
                    extra_methods: ['api_get', 'api_query']
                });

                this.builder_resource = dataAPI.getResourceInstance({
                    uri: 'bpm/workflowBuilder'
                });

                /**
                 * 获得某模块的所有可用工作流
                 * */
                this.get_all_workflow = function(module, _fd) {
                    _fd = _fd || 'id,name';
                    return self.resource.query({
                        _mf: 'module',
                        _mv: module,
                        _fd: _fd
                    }).$promise;
                };

                /**
                 * 开始执行工作流
                 * */
                $rootScope.bpm_start_workflow = this.start_workflow = function(workflow_id, source_id) {
                    var params = {
                        _m: 'start_workflow'
                    };
                    var data = {
                        workflow_id: workflow_id,
                        source_id: source_id,
                        source_model: ones.app_info.app + '.' + ones.app_info.module
                    };
                    self.resource.save(params, data).$promise.then(function(response_data) {
                        window.location.reload();
                    });
                };

                /*
                * 获取工作流信息，包括基本信息和节点信息
                * */
                this.get_full_data = function(id) {
                    var params = {
                        id: id,
                        _m: 'get_full_data'
                    };
                    return this.resource.get(params).$promise;
                };

                /*
                * 根据模块及当前数据获得下一/N工作流按钮
                * @param integer workflow_id
                * @param integer source_id
                * @param array|string 需获取的字段
                * */
                this.get_next_nodes = function(workflow_id, source_id, fields) {
                    var params = {
                        _m: 'get_next_nodes',
                        workflow_id: workflow_id,
                        source_id: source_id
                    };

                    if(fields) {
                        fields = angular.isArray(fields) ? fields.join() : fields;
                        params._fd = fields;
                    }
                    return this.resource.api_query(params).$promise;
                };

                /*
                * 获得工作流进程
                * */
                this.get_progress = function(workflow_id, source_id) {
                    var params = {
                        _m: 'get_progress',
                        workflow_id: workflow_id,
                        source_id: source_id,
                        module: ones.app_info.alias
                    };
                    return this.resource.api_query(params).$promise;
                };

                /*
                * 执行工作流节点
                * @param integer node_id 节点ID
                * @param integer source_id 源数据ID
                * */
                this.execute = function(node_id, source_id) {
                    var params = {
                        _m: 'execute_node',
                        node_id: node_id,
                        source_id: source_id
                    };
                    this.resource.api_get(params).$promise.then(function(response) {
                        self.parse_response(response);
                    });
                };

                /*
                * 工作流POST
                * */
                this.post = function(node_id, source_id, data, callback) {
                    var params = {
                        _m: 'node_post',
                        node_id: node_id,
                        source_id: source_id,
                        workflow_submit: true
                    };

                    this.resource.save(params, data).$promise.then(function(response) {
                        if(typeof callback === 'function') {
                            callback(response);
                        } else {
                            self.parse_response(response);
                        }
                    });

                };

                /*
                * 解析响应
                * 支持redirect, alert等等
                *
                * @param object response
                * */
                this.parse_response = function(response, callback) {
                    switch(response.type) {
                        // 跳转
                        case "redirect":
                            $location.url(response.url);
                            break;
                        default:
                            typeof callback === 'function' ? callback() : window.location.reload();
                    }
                };

                /**
                 * 根据描述语言返回节点执行者
                 * */
                this.get_executor = function(str, node_alias) {
                    str = str.split("\n\n");

                    if(node_alias) {
                        node_alias = angular.isArray(node_alias) ? node_alias : [node_alias];
                    } else {
                        node_alias = [];
                    }

                    var node_config, process, executor_line, cleared_executor={};

                    executor_line = str[2] ? str[2].split("\n") : {};

                    for(var i=0; i<executor_line.length; i++) {
                        var tmp = executor_line[i].split('=>');
                        cleared_executor[tmp[0]] = {};
                        var each_executor_group = tmp[1].split('|');

                        for(var j=0; j<each_executor_group.length; j++) {
                            var s = each_executor_group[j].split(':');
                            cleared_executor[tmp[0]][s[0]] = cleared_executor[tmp[0]][s[0]] || [];
                            if(!s[1]) {
                                continue;
                            }
                            var ids = s[1].split(',');
                            for(var h=0; h<ids.length; h++) {
                                if(ids[h] > 0) {
                                    cleared_executor[tmp[0]][s[0]].push(parseInt(ids[h]));
                                } else {
                                    cleared_executor[tmp[0]][s[0]].push(ids[h]);
                                }
                            }
                        }
                    }

                    if(node_alias.length > 0) {
                        var r = {};
                        angular.forEach(cleared_executor, function(item, key) {
                            if(node_alias.indexOf(key) >= 0) {
                                r[key] = item;
                            }
                        });
                        return r;
                    } else {
                        return cleared_executor;
                    }


                };

                this.to_executor_str = function(executors) {
                    var tpl = "%(node_alias)s=>%(content)s";
                    var lines = [];
                    var roles_items;
                    angular.forEach(executors, function(content, node_alias) {
                        roles_items = [];
                        angular.forEach(content, function(ids, role) {
                            if(ids.length < 1) {
                                return;
                            }
                            roles_items.push(role + ':' + ids.join());
                        });
                        lines.push(sprintf(tpl, {
                            node_alias: node_alias,
                            content: roles_items.join('|')
                        }));
                    });

                    return lines.join("\n");
                };

                this.get_define_str = function(desc_language) {
                    if(!desc_language) {
                        return desc_language;
                    }
                    return desc_language.split("\n\n").splice(0, 2).join("\n\n");
                };


                this.shower_config = {
                    'x': 0,
                    'y': 0,
                    'line-width': 3,
                    'line-length': 50,
                    'text-margin': 10,
                    'font-size': 14,
                    'font-color': 'black',
                    'line-color': 'black',
                    'element-color': 'black',
                    'fill': 'white',
                    'yes-text': _('common.Yes'),
                    'no-text': _('common.No'),
                    'arrow-end': 'block',
                    'scale': 1,
                    'symbols': {
                        'start': {
                            'class': 'start-element'
                        },
                        'end':{
                            'class': 'end-element'
                        }
                    },
                    'flowstate' : {
                        'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
                        'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
                        'future' : { 'fill' : '#FFFF99'},
                        'invalid': {'fill' : '#444444'},
                        'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
                        'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
                    }
                };

            }
        ])
        .service('Bpm.WorkflowNodeAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.config = {
                    app: 'bpm',
                    module: 'workflowNode',
                    table: 'workflow_node',
                    fields: {},

                    label_field: 'status_label'
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: 'bpm/workflowNode',
                    extra_methods: ['api_get', 'api_query']
                });
            }
        ])
    ;
})(window, window.angular, window.ones, window.io);