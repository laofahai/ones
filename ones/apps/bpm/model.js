(function(window, angular, ones, io) {
    'use strict';

    ones.global_module
        .service('Bpm.WorkflowAPI', [
            'ones.dataApiFactory',
            '$location',
            'Bpm.WorkflowNodeAPI',
            function(dataAPI, $location, node_service) {

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
                            data_source: [
                                {value: 1, label: _('common.Yes')},
                                {value: -1, label: _('common.No')}
                            ],
                            value: -1
                        },
                        app_id: {
                            widget: 'select',
                            data_source: 'Home.CompanyActiveApps',
                            get_display: function(value, item) {
                                return to_app_name(item.app_alias);
                            },
                            label: _('common.Belongs To App')
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
                            data_source: [
                                {value: 1, label: _('common.Yes')},
                                {value: -1, label: _('common.No')}
                            ],
                            value: -1
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

                /*
                * 获取工作流信息，包括基本信息和节点信息
                *
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
                        source_id: source_id
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
                        self.parse_response(response);
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
                        'request' : { 'fill' : 'blue'},
                        'invalid': {'fill' : '#444444'},
                        'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : _('common.Yes'), 'no-text' : _('common.No') },
                        'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : _('common.Yes'), 'no-text' : _('common.No') }
                    }
                };

            }
        ])
        .service('Bpm.WorkflowNodeAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                var self = this;

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