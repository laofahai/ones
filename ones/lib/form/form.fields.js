(function(window, ones, angular){
    'use strict';

    /**
     * ONES字段生成器模块
     *
     * @plugin extend_fields_maker
     * @pluginScope
     *  form.fields.tpl
     *  form.fields.maker 对应tpl
     * */
    angular.module("ones.formFieldsModule", [])
        .service("ones.form_fields_factory", [
            "pluginExecutor",
            "$injector",
            "$compile",
            "$parse",
            "$timeout",
            "$routeParams",
            function(plugin, $injector, $compile, $parse, $timeout, $routeParams) {

                var self = this;

                // 可用HTML元素属性
                this.available_attrs = [
                    'auto-close',
                    'class',
                    'data-ng-model',
                    'ensure-unique',
                    'id',
                    'max',
                    'min-view',
                    'max-view',
                    'maxlength',
                    'minlength',
                    'min',
                    'multiple',
                    'name',
                    'ng-blur',
                    'ng-class',
                    'ng-click',
                    'ng-dblclick',
                    'ng-focus',
                    'ng-keydown',
                    'ng-keypress',
                    'ng-keyup',
                    'ng-model',
                    'ng-model-options',
                    'ng-readonly',
                    'placeholder',
                    'readonly',
                    'required',
                    'style',
                    'view',
                    'ui-event'
                ];

                this.opts = {};

                this.scope = {};

                this.set_field_data_source = function(config, data_source_key) {
                    var getter = $parse(config['ng-model']);

                    if(angular.isArray(config.data_source)) {
                        // 数组数据源
                        self.scope[data_source_key] = config.data_source;
                        if(!self.opts.isEdit && undefined !== config.value) {
                            $timeout(function() {
                                getter.assign(self.scope, config.value);
                            });
                        }
                    } else {
                        var data_source = $injector.get(config.data_source);
                        var valueField = data_source.config.value_field||'id';
                        var param = config.data_source_query_param || {};
                        data_source.resource.api_query(param).$promise.then(function(data){
                            // select 默认值
                            if(data.length && !self.opts.isEdit) {
                                getter.assign(self.scope, data[0][valueField]);
                            }
                            angular.forEach(data, function(item) {
                                self.scope[data_source_key].push({
                                    value: item[valueField],
                                    label: typeof data_source.unicode === 'function' ? data_source.unicode(item) : item[data_source.config.label_field||'name']
                                });
                            });
                        });
                    }
                };

                /*
                * 设置默认值方法
                * */
                this.set_default_value = function(config) {
                    var value = config.value !== undefined ? config.value : config.default;

                    if(undefined === value || null === value) {
                        return;
                    }

                    // datetime
                    if(value === 'CURRENT_TIMESTAMP') {
                        value = new Date(moment().format());
                    }

                    $timeout(function(){
                        var gt = $parse(config['ng-model']);
                        gt.assign(self.scope, value);
                    });
                };

                /**
                 * 字段生成器具体字段方法
                 *
                 * @return 每个成员方法返回拼接好的字符串
                 * */
                this.fields_maker = {
                    text: function(config) {
                        this.html = sprintf(FORM_FIELDS_TPL.COMMON_INPUT, 'text', self.make_field_attr(config));
                    },
                    number: function(config) {
                        this.html = sprintf(FORM_FIELDS_TPL.COMMON_INPUT, 'number', self.make_field_attr(config));
                    },
                    password: function(config) {
                        this.html = sprintf(FORM_FIELDS_TPL.COMMON_INPUT, 'password', self.make_field_attr(config));
                    },
                    email: function(config) {
                        this.html = sprintf(FORM_FIELDS_TPL.COMMON_INPUT, 'email', self.make_field_attr(config));
                    },
                    select: function(config) {
                        var data_source_key = config.field+"_select_"+randomString(6);

                        self.scope[data_source_key] = [];
                        self.set_field_data_source(config, data_source_key);

                        delete(config.maxlength);

                        this.html = sprintf(FORM_FIELDS_TPL.select, {
                            attr: self.make_field_attr(config),
                            data : data_source_key
                        });
                    },
                    radio: function(config) {
                        var tpl = config.inline ? FORM_FIELDS_TPL.radio_inline : FORM_FIELDS_TPL.radio;

                        var data_source_key = config.field+"_radio_"+randomString(6);

                        self.scope[data_source_key] = [];
                        self.set_field_data_source(config, data_source_key);

                        this.html = sprintf(tpl, {
                            data_name: data_source_key,
                            attrs: self.make_field_attr(config)
                        });

                    },
                    checkbox: function(config) {},
                    input_with_checkbox: function(config) {},
                    datetime: function(config) {
                        //config['data-ng-model'] = config['ng-model'];
                        //delete(config['ng-model']);
                        //config['auto-close'] = config['auto-close'] === false ? 'false' : 'true';
                        this.html = sprintf(FORM_FIELDS_TPL.datetime_picker, {
                            attr: self.make_field_attr(config)
                        });
                    },
                    date: function(config) {
                        //config['data-ng-model'] = config['ng-model'];
                        //delete(config['ng-model']);
                        //config['auto-close'] = config['auto-close'] === false ? 'false' : 'true';
                        this.html = sprintf(FORM_FIELDS_TPL.date_picker, {
                            attr: self.make_field_attr(config)
                        });
                    },
                    textarea: function(config) {
                        this.html = sprintf(FORM_FIELDS_TPL.textarea, self.make_field_attr(config));
                    },
                    hidden: function(config) {
                        this.group_tpl = '<div style="display:none;">%(input)s</div>';
                        this.html = sprintf(FORM_FIELDS_TPL.COMMON_INPUT, 'hidden', self.make_field_attr(config));
                    },

                    // item_select
                    item_select: function(config) {
                        var show_modal_method = 'show_item_select_modal_'+config['field'];
                        config['ng-click'] = show_modal_method+"($event)";

                        this.config = config;

                        var $item_select = this;
                        this.selected_model = $item_select.config['ng-model']+'__item_selected__';

                        this.data_source = $injector.get(this.config.data_source);


                        var selected = [];
                        var selected_ids = [];

                        this.$filter = $injector.get('$filter');

                        // 非编辑默认值
                        if(this.config.value || $routeParams[config.field]) {
                            var id = this.config.value || $routeParams[config.field];
                            id = angular.isArray(id) ? id : String(id).split(',');
                            this.data_source.unicode_lazy(id).then(function(data) {
                                angular.forEach(data, function(item) {
                                    selected.push({
                                        label: $item_select.data_source.unicode(item),
                                        id: item.id
                                    });
                                    selected_ids.push(item.id);
                                });
                                $item_select.set_value(selected, selected_ids);
                            });
                        }


                        this.html = sprintf(FORM_FIELDS_TPL.item_select, {
                            attr: self.make_field_attr(this.config),
                            selected_model: this.selected_model
                        });

                        this.set_value = function(selected, selected_ids) {
                            var selected_getter = $parse(this.selected_model);
                            var value_getter = $parse(this.config['ng-model']);
                            selected_getter.assign(self.scope, selected);
                            value_getter.assign(self.scope, selected_ids);
                        };

                        /*
                         * 编辑时 默认值
                         * */
                        self.scope.$on('form.dataLoaded', function(evt, data) {

                            if(!data[$item_select.config.field]) {
                                return;
                            }

                            selected = [];
                            selected_ids = String(data[$item_select.config.field]).split(',');

                            selected_ids = angular.isArray(selected_ids) ? selected_ids : [selected_ids];

                            if(!selected_ids) {
                                return;
                            }
                            $item_select.data_source.unicode_lazy(selected_ids).then(function(data) {
                                if(!data) {
                                    return;
                                }
                                if(!angular.isArray(data)) {
                                    data = [data];
                                }
                                angular.forEach(data, function(item) {
                                    selected.push({
                                        label: $item_select.data_source.unicode(item),
                                        id: id
                                    });
                                });
                                if(selected) {
                                    $item_select.set_value(selected, selected_ids);
                                }
                            });

                            //angular.forEach(selected_ids, function(id) {
                            //    selected.push({
                            //        realname: $filter('to_user_fullname')(id),
                            //        id: id
                            //    });
                            //});
                            //selected_getter.assign(self.scope, selected);
                            //value_getter.assign(self.scope, selected_ids);
                        });

                        /*
                         * model选择框
                         * */
                        self.scope[show_modal_method] = function($event) {
                            var model = angular.copy($item_select.data_source);
                            if(!$item_select.config.multiple) {
                                model.config.multi_select = false;
                            }
                            model.config.list_display = $item_select.config.data_source_list_display || model.config.list_display;

                            self.scope.grid_config = {
                                model: model,
                                resource: model.resource,
                                opts: {
                                    ignore_selected_actions: true
                                }
                            };
                            $injector.get("$modal")({
                                scope: self.scope,
                                template: 'views/itemSelectModal.html',
                                show: true
                            });

                            self.scope.$modal_title = config.label;
                        };
                        /*
                         * 删除选中项目
                         * */
                        self.scope.removeFromSelected = function(id) {
                            selected = selected.splice(id, 1);
                            selected_ids = selected_ids.splice(id, 1);
                            $item_select.set_value(selected, selected_ids);
                        };

                        self.scope.$on('grid.selectedChanged', function(evt, all, item, app_info) {
                            var model = angular.copy($item_select.data_source);

                            if(model.config.app !== app_info.app || model.config.module !== app_info.module) {
                                return;
                            }

                            if(true === $item_select.config.multiple) {
                                var data = all;
                            } else {
                                var data = [item];
                            }

                            selected = [];
                            selected_ids = [];
                            angular.forEach(data, function(item) {
                                selected.push({
                                    label: model.unicode(item),
                                    id: item.id
                                });
                                selected_ids.push(item.id);
                            });

                            $item_select.set_value(selected, selected_ids);
                        });

                        return this;
                    },

                    // select3
                    select3: function(config) {
                        var model = config['ng-model'];
                        var label_model = model + '__label__';
                        var items_model = model + '__select3_items__';
                        var selected_item_model = model+'__select3_selected__';

                        var label_getter = $parse(label_model);
                        var model_getter = $parse(model);
                        var items_getter = $parse(items_model);
                        var selected_getter = $parse(selected_item_model);

                        var runtime_scope = config.scope || self.scope;

                        self.select3_fields = self.select3_fields || [];

                        delete(config['ng-model']);

                        // ui 事件
                        config['ng-keydown'] = 'do_select3_keydown($event)';
                        // debounce
                        config['ng-model-options'] = '{debounce: 300}';
                        this.html = sprintf(FORM_FIELDS_TPL.select3, {
                            attr: self.make_field_attr(config)
                            , model: model
                            , label: config.label || _(ones.app_info.app+'.'+ camelCaseSpace(field))
                        });

                        var temp_label='';
                        var data_source = $injector.get(config.data_source);


                        /*
                        * 失去焦点
                        * */
                        $('body').delegate('#'+config.id, 'blur', function() {
                            var ele = $(this);
                            $timeout(function() {
                                ele.parent().removeClass('active');
                                ele.parent().find('ul.items').addClass('hide');
                            }, 300);

                            return;
                            var process_func = function() {
                                $timeout(function() {
                                    items_getter.assign(runtime_scope, []);

                                    var selected = runtime_scope.$eval(selected_item_model);
                                    if(!selected) {
                                        return;
                                    }
                                    // 再次确认
                                    if(ele.val() && ele.val() === selected.label) {
                                        do_select3_item_select(selected);
                                    } else {
                                        do_select3_item_select({});
                                    }
                                    ele.parent().addClass('hide');
                                }, 50);
                            };

                            if(runtime_scope.$root.$$phase != '$apply' && runtime_scope.$root.$$phase != '$digest') {
                                runtime_scope.$apply(process_func);
                            } else {
                                process_func();
                            }
                        });
                        $('body').delegate('#'+config.id, 'focus', function() {
                            var ele = $(this);
                            $timeout(function() {
                                var keyword = $.trim(ele.val());

                                ele.parent().addClass('active');
                                ele.parent().find('ul.items').removeClass('hide');

                                if(runtime_scope.$root.$$phase != '$apply' && runtime_scope.$root.$$phase != '$digest') {
                                    runtime_scope.$apply(function() {
                                        select3_init(ele, keyword);
                                        do_select3_query(keyword);
                                    });
                                } else {
                                    select3_init(ele, keyword);
                                    do_select3_query(keyword);
                                }
                            });
                        });

                        // 控件初始化
                        var select3_init = function(ele, keyword) {
                            //if(self.select3_fields.indexOf(model) >= 0) {
                            //    return;
                            //}
                            //self.select3_fields.push(model);

                            runtime_scope.active_select3_index = 0;

                            if(ele.parent('.select3-container').find('ul.items').length <= 0) {
                                var tpl = sprintf(FORM_FIELDS_TPL.select3_items, {
                                    items_model: items_model
                                });
                                ele.parent('.select3-container').append($compile(tpl)(runtime_scope));
                            }

                            $timeout(function() {
                                ele.parent('.select3-container').css({
                                    //paddingTop: ele.height() + 1,
                                    top: 0,
                                    left: 0
                                }).find('ul.items').css({
                                    marginTop: ele.height()
                                });
                            });

                        };

                        // 选中项目
                        var do_select3_item_select = function(item, auto_hide) {

                            if(!item.value || !item.label) {
                                return;
                            }

                            runtime_scope[selected_item_model] = item;
                            label_getter.assign(runtime_scope, item.label);
                            model_getter.assign(runtime_scope, item.value);
                            selected_getter.assign(runtime_scope, item);

                            if(auto_hide) {
                                $('#'+config.id).trigger('blur');
                            }

                        };

                        runtime_scope.do_select3_item_select = do_select3_item_select;

                        // 上下键索引
                        runtime_scope.do_select3_keydown = function($event) {
                            switch($event.keyCode) {
                                case KEY_CODES.DOWN:
                                    runtime_scope.active_select3_index =
                                        runtime_scope.active_select3_index+1 > (runtime_scope.$eval(items_model) || []).length - 1
                                            ? 0
                                            : runtime_scope.active_select3_index+1;
                                    selected_getter.assign(runtime_scope, runtime_scope.$eval(items_model)[runtime_scope.active_select3_index]);
                                    break;
                                case KEY_CODES.UP:
                                    runtime_scope.active_select3_index =
                                        runtime_scope.active_select3_index-1 < 0
                                            ? (runtime_scope.$eval(items_model) || []).length - 1
                                            : runtime_scope.active_select3_index-1;
                                    selected_getter.assign(runtime_scope, runtime_scope.$eval(items_model)[runtime_scope.active_select3_index]);
                                    break;
                                case KEY_CODES.ENTER:
                                    do_select3_item_select(runtime_scope.$eval(items_model)[runtime_scope.active_select3_index], true);
                                    break;
                                default:
                                    return;
                            }

                            $event.preventDefault();
                        };

                        // 查询
                        var do_select3_query = function(keyword) {

                            runtime_scope.active_select3_index = 0;
                            // && !$('input.input_widget_select3:focus').length
                            if(!keyword && !config.auto_query) {
                                items_getter.assign(runtime_scope, []);
                                return;
                            }

                            temp_label = keyword;
                            var query_params = {_kw: temp_label};
                            var valueField = config.data_source_value_field||data_source.config.value_field||'id';

                            // 根据已有数据查询
                            if(config.data_source_query_with) {
                                var _mf = [];
                                var _mv = [];
                                if(!angular.isArray(config.data_source_query_with)) {
                                    config.data_source_query_with = [config.data_source_query_with];
                                }
                                for(var i=0;i<config.data_source_query_with.length;i++) {
                                    var req = config.data_source_query_with[i];
                                    var exists_model = config['ng-model'].split('.').slice(0, -1).join('.') + '.' + req;

                                    _mf.push(req);
                                    _mv.push(runtime_scope.$eval(exists_model));
                                }

                                query_params._mf = _mf.join();
                                query_params._mv = _mv.join();
                            }


                            data_source.resource.api_query(query_params).$promise.then(function(data) {
                                if(!data) {
                                    //items_getter.assign(runtime_scope, []);
                                    return false;
                                }

                                items_getter.assign(runtime_scope, []);
                                var items = [];
                                angular.forEach(data, function(item) {
                                    items.push({
                                        value: item[valueField],
                                        label: typeof data_source.unicode === 'function' ?
                                            data_source.unicode(item) :
                                            item[data_source.config.label_field||'name']
                                    });
                                });
                                items_getter.assign(runtime_scope, items || []);

                            });
                        };

                        // 输入时后端查询
                        runtime_scope.$watch(label_model, do_select3_query);
                    }
                };


                /**
                 * 扩展字段
                 * */
                plugin.callPlugin('extend_fields_maker',
                    //this.fields_maker, // 字段生成器对象
                    FORM_FIELDS_TPL,
                    this
                );

                FORM_FIELDS_TPL = ones.pluginScope.get('form.fields.tpl') || FORM_FIELDS_TPL;
                this.fields_maker = ones.pluginScope.get('form.fields.maker') || this.fields_maker;

                this.widgets = [];
                angular.forEach(this.fields_maker, function(func, widget) {
                    self.widgets.push(widget);
                });

                /**
                 * 字段属性
                 * */
                this.make_field_attr = function(config) {
                    var attrs = [];
                    // 默认class
                    config['class'] = config['class'] || '';
                    var classname = 'form-control input_widget_'+config.widget;
                    if(config['class'].indexOf(classname) < 0) {
                        config['class'] += ' '+classname;
                    }

                    // 默认ng-model
                    config['ng-model'] = config['ng-model'] || self.global_opts.form_name+'.'+config.field;

                    angular.forEach(config, function(v, k) {

                        if(k === 'required' && false === v) {
                            return;
                        }

                        if(v === undefined) {
                            return;
                        }

                        if(self.available_attrs.indexOf(k) >= 0 && v !== undefined) {
                            var attr_str = sprintf('%s="%s"', k, v);
                            attrs.push(attr_str);
                        }
                    });
                    return attrs.join(' ');
                };

                /**
                 * 生成字段widget
                 * */
                this.make_fields = function(scope, fields, opts) {

                    self.scope = scope;
                    self.opts = opts || {};

                    var htmls = [];

                    self.opts.columns = self.opts.columns || 1;

                    scope[self.opts.form_name+'_config'] = {};

                    angular.forEach(fields, function(config, field) {
                        config.is_edit = self.opts.isEdit;
                        htmls.push(self.make_field(scope, field, config, self.opts));
                    });

                    return htmls.join('');
                };

                this.make_field = function(scope, field, config, opts) {

                    self.scope = scope;

                    opts = opts || {};

                    // 自定义外部container
                    var CUSTOME_GROUP_TPL;
                    // 默认用text
                    if(!(config.widget in self.fields_maker)) {
                        config.widget = 'text';
                    }

                    var maker = self.fields_maker[config.widget];

                    if(config.columns) {
                        opts.columns = config.columns;
                    } else {
                        opts.columns = opts.columns || 2;
                    }

                    self.global_opts = opts;

                    var fm = new maker(config);
                    var html = fm.html;
                    if(fm.group_tpl) {
                        CUSTOME_GROUP_TPL = fm.group_tpl;
                    }

                    // 默认值
                    self.set_default_value(config);

                    //console.log(config, opts.columns);

                    var column_width = 12/opts.columns;

                    config.required = config.required === false ? false : true;

                    // 帮助文字
                    var help_text_key = "_form_help_text."+field;
                    var getter = $parse(help_text_key);
                    getter.assign(self.scope, config.help_text);

                    config.field = field;

                    scope[opts.form_name+'_config'] = scope[opts.form_name+'_config'] || {};
                    scope[opts.form_name+'_config'][field] = config;
                    return sprintf(config.group_tpl || opts.container_tpl || CUSTOME_GROUP_TPL || FORM_GROUP_TPL, {
                        ng_class: sprintf("{'has-error': %(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid}",
                            {
                                formname: opts.form_name,
                                fieldname: config.field_model
                            }),
                        group_class: 'col-sm-'+column_width,
                        id: config.id,
                        label: config.label || _(ones.app_info.app+'.'+ camelCaseSpace(field)),
                        input: html,
                        help_text: help_text_key,
                        app: opts.app_info && opts.app_info.app || ones.app_info.app,
                        form_field: opts.form_name+'.'+config.field_model,
                        field_config: opts.form_name+'_config.'+field
                    });
                };

            }

        ])

        // 确认唯一
        .directive('ensureUnique', ['$http', "$injector", "$timeout","$parse", function($http, $injector, $timeout, $parse) {
            return {
                require: 'ngModel',
                link: function(scope, ele, attrs, c) {
                    var inited = {};
                    scope.$watch(attrs.ngModel, function(newVal, oldVal) {

                        if(!inited[attrs.ngModel]) {
                            inited[attrs.ngModel] = true;
                            return;
                        }

                        if(!newVal) {
                            var getter = $parse(attrs.ngModel);
                            getter.assign(scope, c.$viewValue);
                        }

                        var res = $injector.get(attrs.ensureUnique);
                        var queryParams = {
                            _ei:  $injector.get("$routeParams").id || 0,
                            _mf: attrs.name,
                            _fd: attrs.name
                        };

                        queryParams._mv = scope.$eval(attrs.ngModel);

                        res.resource.api_get(queryParams).$promise.then(function(data){
                            if(data[attrs.name]) {
                                c.$setValidity('unique', false);

                            } else {
                                c.$setValidity('unique', true);
                            }
                        }, function(){
                            c.$setValidity('unique', false);
                        });


                    });
                }
            };
        }])

        .directive("inputField", [
            "$compile",
            "ones.form_fields_factory",
            "$timeout",
            function($compile, field_factory, $timeout) {
                return {
                    restrict: "E",
                    replace: true,
                    scope: {
                        config: "=",
                        ngReadonly: "="
                    },
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                $timeout(function() {
                                    var config = $scope.$parent.$eval(iAttrs.config);

                                    if(!config) {
                                        return;
                                    }

                                    if(iAttrs.ngReadonly) {
                                        config['ng-readonly'] = iAttrs.ngReadonly;
                                    }

                                    var html = field_factory.make_field($scope.$parent, config.field, config, config.opts);

                                    iElement.after($compile(html)($scope.$parent));
                                    iElement.remove();
                                });

                            }
                        };
                    }
                };
            }
        ])
    ;

})(window, window.ones, window.angular);