(function(window, ones, angular){
    'use strict';

    /**
     * ONES表单模块
     *
     * */
    angular.module("ones.formModule", [
            "ones.formFieldsModule"
        ])
        .service("ones.form.api", [function() {
            this.scope = {};
        }])
        .service("ones.form", [
            'Home.SchemaAPI',
            'ones.form_fields_factory',
            '$q',
            '$timeout',
            '$parse',
            '$routeParams',
            'RootFrameService',
            '$injector',
            'ones.form.api',
            function(schemaAPI, fields_factory, $q, $timeout, $parse, $routeParams, RootFrameService, $injector, form_api) {

                var self = this;

                /**
                 * 表单配置初始化
                 * */
                this.init = function($scope, config) {

                    self.config = {
                        app_info: ones.app_info,
                        columns : 1,
                        model_prefix: 'form_'+randomString(6)
                    };

                    angular.extend(self.config, config);

                    self.defer = $q.defer();

                    form_api.scope = this.scope = $scope;
                    this.parentScope = $scope.$parent;

                    this.data_model_fields = undefined;

                    // 是否是编辑表单
                    if(this.config.isEdit !== false) {
                        this.config.isEdit = this.config.isEdit === undefined ? (this.config.id ? true : false) : this.config.isEdit;
                    }

                    this.config.form_name = this.scope.form_name = 'id_'+this.config.model_prefix;

                    this.model_config = this.config.model.config;
                    this.model_config.fields = this.model_config.fields || {};

                    ones.DEBUG  && console.debug('model_config: ', this.model_config);
                    // 是否字段分组
                    if(this.model_config.fields_groups) {
                        this.scope.$parent.has_fields_groups = true;
                        this.scope.$parent.fields_groups = this.model_config.fields_groups;
                        this.scope.$parent.active_fields_group = this.model_config.fields_groups[0].name;
                    }

                    ones.DEBUG && console.debug('fields_group', this.scope.$parent.has_fields_groups, this.scope.$parent.fields_groups);

                    // 检测是否有分组或者是否字段在分组中可显示
                    this.scope.check_is_in_active_group = function(field) {
                        // 未分组情况全部显示
                        if(!self.scope.$parent.has_fields_groups) {
                            return true;
                        }
                        var field_config = self.scope.$parent.form_fields_define[field];
                        if(!field_config) {
                            return true;
                        }
                        // 字段未明确指定分组则默认为第一分组
                        if(!field_config.group && self.model_config.fields_groups[0].name === self.scope.$parent.active_fields_group) {
                            return true;
                        }
                        if(field_config.group && field_config.group === self.scope.$parent.active_fields_group) {
                            return true;
                        }
                        return false;
                    };

                    // 切换字段分组
                    this.scope.$parent.switch_form_fields_group = function(group_name) {
                        self.scope.$parent.active_fields_group = group_name;
                    };

                    angular.extend(self.config, this.model_config);

                    this.scope.edit_data_source = {};

                    this.parentScope.panel_title =
                        this.parentScope.panel_title || (
                            _('common.'+(this.config.isEdit ? 'Edit' : 'Add New')) + ' ' + _(ones.app_info.app+'.'+camelCaseSpace(this.model_config.module))
                        );

                    this.load_schema();

                    return self.defer;
                };

                /**
                 * 取得需编辑的数据
                 * */
                this.load_edit_data = function() {
                    this.config.resource.get({
                        id: this.config.id,
                        _df: this.data_model_fields
                    }).$promise.then(function(data){
                            self.scope.edit_data_source = data;
                            self.scope.$broadcast('form.dataLoaded', data);
                        });
                };


                /**
                 * 加载数据表结构
                 * */
                this.load_schema = function() {
                    var ablename = self.config.isEdit ? 'editable' : "addable";
                    schemaAPI.get_schema({
                        app: self.model_config.app,
                        table: self.model_config.table,
                        exclude_meta: true,
                        schema: self.config.schema,
                        callback: function(result) {

                            result = result[self.model_config.table].structure || {};

                            if(!result) {
                                return false;
                            }

                            var schema = {};
                            angular.forEach(result, function(v) {
                                schema[v.field] = v;
                            });

                            //angular.extend(schema, self.model_config.fields);
                            angular.forEach(self.model_config.fields, function(item, field){
                                if(!(field in schema)) {
                                    schema[field] = item;
                                }
                            });

                            var fields_define = self.scope.$parent.form_fields_define = {};

                            angular.forEach(schema, function(config, field) {

                                //console.log(field, config);
                                if(field in self.model_config.fields) {
                                    config = angular.deep_extend(config, self.model_config.fields[field]);
                                }

                                if(field === '_data_model_fields_') {
                                    self.data_model_fields = config.value;
                                }

                                /**
                                 * 使用model中字段的配置覆盖schema配置
                                 * */
                                angular.deep_extend(config, self.model_config.fields ? self.model_config.fields[field] : {});


                                config.ng_model = config.ng_model ? config.ng_model : '';

                                self.model_config.fields = self.model_config.fields || {};


                                var field_config = self.model_config.fields[field] || {};

                                // label
                                if(!config.label) {
                                    config.label = _(ones.app_info.app+'.'+ camelCaseSpace(field));
                                    if(config.label === camelCaseSpace(field) && config.comment) {
                                        config.label = config.comment;
                                    }
                                }

                                field = field_config.map || field;

                                if(field == 'company_id') {
                                    return;
                                }

                                /**
                                 * addable, editable
                                 * */
                                if(field_config[ablename] === false
                                    || (self.model_config['un'+ablename]
                                    && self.model_config['un'+ablename].indexOf(field) >= 0)) {
                                    return;
                                }

                                if(['id', 'is_platform_reviewed'].indexOf(field) >= 0) {
                                    return;
                                }

                                /**
                                 * widget
                                 * */
                                config.widget = config.widget || 'text';
                                if(!field_config.widget) {
                                    if(['decimal', 'integer', 'money'].indexOf(config.type) >= 0) {
                                        config.widget = 'number';
                                    }
                                } else {
                                    config.widget = field_config.widget;
                                }


                                /**
                                 * ng_model
                                 * */
                                config.field_model = (config.ng_model || field_config.ng_model || field);
                                config['ng-model'] = self.config.model_prefix + '.' + config.field_model;

                                // ui event, ui.utils
                                config['ui-event'] = config['ui_event'] || undefined;

                                config['class'] = config['css_class'] || undefined;

                                config['id'] = config['id'] || self.config.model_prefix+"_"+field;
                                config['name'] = config.field_model;

                                config['required'] = config['required'] === false || config['blank'] === true ? false : 'required';

                                // 最大长度
                                config['maxlength'] = config.limit || undefined;

                                config['ensure-unique'] = config.ensureUnique || config['ensure-unique'] || undefined;

                                fields_define[field] = config;
                            });



                            // 扩展字段
                            if($routeParams.extra) {
                                var extra = parse_arguments($routeParams.extra);
                                angular.forEach(extra, function(value, field) {
                                    if(field in fields_define) {
                                        return;
                                    }

                                    fields_define[field] = {
                                        'ng-model': self.config.model_prefix + '.' + field,
                                        id: self.config.model_prefix+"_"+field,
                                        required: false,
                                        value: value,
                                        name: field,
                                        widget: 'hidden'
                                    };
                                });
                            }

                            /**
                             * 编辑模式取得数据
                             * */
                            if(self.config.isEdit) {
                                self.load_edit_data();
                            }


                            // 修改源数据
                            self.scope.$watch('edit_data_source', function(data) {
                                if(!data) return;
                                format_data_form_rest(data, fields_define, self.scope, $parse);
                            });

                            /*
                             * 扩展操作
                             * */
                            var ext_method = self.config.isEdit ? 'on_edit' : 'on_add';
                            if(typeof self.config.model[ext_method] === 'function') {
                                self.config.model[ext_method]({
                                    scope: self.scope,
                                    extra_params: self.config.opts.extra_params || {},
                                    config: self.config,
                                    fields_define: fields_define
                                });
                            }

                            /**
                             * 拼接最终HTML
                             * */
                            var html = sprintf(FORM_CONTAINER_TPL, {
                                form_name: self.config.form_name,
                                form_class: self.model_config.form_class || '',
                                html: fields_factory.make_fields(self.scope, fields_define, self.config)
                            });

                            self.defer.resolve(html);

                            self.makeSubmitAction(fields_define);

                            // 重置
                            self.parentScope.doFormReset = function() {
                                var form = self.scope[self.config.form_name];
                                if(!form.$dirty) {
                                    return;
                                }
                                angular.forEach(fields_define, function(config) {
                                    fields_factory.set_default_value(config, self.scope, true);
                                });

                                // 设置状态
                                form.$setPristine(true);
                            };

                            // 关闭
                            self.parentScope.doFormClose = function() {
                                var form = self.scope[self.config.form_name];
                                if(!form.$pristine) {
                                    RootFrameService.confirm(_('common.Form is dirty, close will lost everything'), function() {
                                        RootFrameService.close(window.current_frame);
                                    });
                                } else {
                                    RootFrameService.close(window.current_frame);
                                }
                            };

                         }
                    });
                };



                this.makeSubmitAction = function(fields_define) {

                    /**
                     * 提交
                     * @todo 覆盖默认方法
                     * */
                    self.parentScope.doFormSubmit = function(add_another) {
                        var form = self.scope[self.config.form_name];

                        if(!form.$valid) {
                            angular.forEach(form, function(v, k) {
                                if(k[0] == '$') {
                                    return;
                                }
                                if(!v.$valid) {
                                    v.$setDirty(true);
                                }
                            });

                            RootFrameService.alert(_('common.Please fill out the form correctly'));
                            return;
                        }

                        var callback = function(response_data) {
                            // message center
                            if(is_app_loaded('messageCenter')) {
                                try {
                                    var mc = $injector.get('ones.MessageCenter');
                                    mc.emit('some_data_changed', {
                                        sign_id: ones.caches.getItem('company_sign_id'),
                                        user_id: ones.user_info.id,
                                        app: ones.app_info.app,
                                        module: ones.app_info.module
                                    });
                                } catch(e) {}
                            }

                            if(typeof self.parentScope.form_submit_callback === 'function') {
                                self.parentScope.form_subnmit_callback(response_data);
                                return;
                            }

                            if(!response_data.error && !response_data.msg) {
                                RootFrameService.alert({
                                    type: 'success',
                                    content: _('common.Operation Success')
                                });
                            }
                            if(add_another) {
                                self.parentScope.doFormReset();
                            } else {
                                RootFrameService.close();
                            }
                        };
                        var get_params = self.config.isEdit ? {id: self.config.id} : {};
                        angular.extend(get_params, self.config.opts && self.config.opts.extra_params || {});

                        var data = angular.copy(self.scope[self.config.model_prefix]) || {};

                        data = post_data_format(data, fields_define, $injector);

                        if(self.parentScope.form_submit_action) {
                            var result = self.parentScope.form_submit_action(get_params, data);
                            if(result && typeof result.then === 'function') {
                                result.then(callback)
                            }
                        } else {
                            if(self.config.isEdit) {
                                self.config.resource.update(get_params, data).$promise.then(callback);
                            } else {
                                self.config.resource.save(get_params, data).$promise.then(callback);
                            }
                        }
                    };

                }
            }
        ])
        .directive('formView', [
            "$compile",
            "$timeout",
            "ones.form",
            "$filter",
            function($compile, $timeout, form, $filter){
                return {
                    restrict: "E",
                    replace: true,
                    transclusion: true,
                    scope: {
                        config: "="
                    },
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function ($scope, iElement, iAttrs, controller) {
                                form.init($scope, $scope.config).promise.then(function(html){
                                    angular.element(element).append($compile(html)($scope));
                                });
                            }
                        };
                    }
                };
            }
        ])

    ;

})(window, window.ones, window.angular);