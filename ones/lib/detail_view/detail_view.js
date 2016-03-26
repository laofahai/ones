(function(window, angular, ones){

    /**
     * 显示数据详情界面
     * 使用bootstrap grid系统布局，通过columns设定宽度
     * */

    angular.module('ones.detailViewModule', [
        'ones.detailViewWidgetModule'
    ])
        .service('ones.detail_view', [
            '$q',
            'Home.SchemaAPI',
            'ones.detail_view_widgets',
            '$timeout',
            '$filter',
            'Account.UserPreferenceAPI',
            function($q, schemaAPI, detail_widgets, $timeout, $filter, user_preference) {

                var self = this;
                this.config = {
                    app_info: ones.app_info,
                    columns : 2,
                    model_prefix: 'detail_'+randomString(6),
                    query_params: {}
                };

                this.deferred = $q.defer();

                this.init = function(scope, config) {

                    angular.extend(this.config, config || {});

                    this.scope = scope;

                    this.scope.column_defs = {};

                    this.scope.model_prefix = this.config.model_prefix;

                    this.parentScope = scope.$parent;

                    this.model_config = self.config.model.config;

                    this.make_link_actions();

                    this.run();

                    return this.deferred;
                };

                this.make_link_actions = function() {
                    var link_actions = [];
                    link_actions.push({
                        label: _("common.Add New") + _(ones.app_info.app+'.'+camelCaseSpace(ones.app_info.module)),
                        src: sprintf('%s/%s/add', ones.app_info.app, ones.app_info.module),
                        singleton: true
                    });
                    self.scope.$root.link_actions = link_actions;
                };


                /**
                 * 载入数据
                 * */
                this.load_data = function(column_defs, callback) {
                    ones.DEBUG && console.debug('loading detail data');
                    if(!self.config.data) {
                        self.config.resource[self.config.query_method||'query'](self.config.query_params).$promise.then(function(data){
                            self.scope[self.config.model_prefix] = data;
                            callback(data);
                        });
                    } else {
                        self.scope[self.config.model_prefix] = self.config.data;
                        callback(self.config.data);
                    }
                };

                this.run = function() {
                    self.load_data(self.scope.column_defs, function() {
                        /**
                         * 载入数据结构
                         * */
                        schemaAPI.get_schema({
                            app: self.model_config.app,
                            table: self.model_config.table,
                            exclude_meta: true,
                            callback: function (result) {
                                result = result[self.model_config.table].structure || {};

                                if(!result) {
                                    return false;
                                }

                                var schema = {};
                                angular.forEach(result, function(v) {
                                    schema[v.field] = v;
                                });

                                angular.deep_extend(schema, self.model_config.fields);

                                var html = [];
                                var ignore = [
                                    '_data_model_fields_',
                                    'company_id'
                                ];

                                var human_date_display = user_preference.get_preference('human_date_display');

                                angular.forEach(schema, function(config, field) {

                                    if(field === '_data_model_fields_') {
                                        self.config.query_params._df = config.value;
                                        return;
                                    }

                                    if(ignore.indexOf(field) >= 0) {
                                        return;
                                    }

                                    if(field in self.model_config.fields) {
                                        config = angular.deep_extend(config, self.model_config.fields[field] || {})
                                    } else {
                                        self.model_config.fields[field] = field;
                                    }

                                    if(false === config.detail_able || (self.model_config.undetail_able && self.model_config.undetail_able.indexOf(field) >= 0)) {
                                        return;
                                    }

                                    if(human_date_display !== 2
                                        && !config.cell_filter
                                        && (['datetime', 'date', 'time'].indexOf(config.widget) >= 0
                                        || config.field == 'created')
                                    ) {
                                        config.cell_filter = 'to_human_date';
                                    }

                                    config.widget = config.detail_widget || 'static';
                                    config.field = config.map || (config.field ? config.field : field);
                                    config.bind_model = self.config.model_prefix + '.' + (config.bind_model || config.field);
                                    config.column_width = 12/(config.detail_columns || self.config.columns || 1);


                                    if(!config.label && config.field.slice(-3) === "_id") {
                                        config.label =
                                            _(
                                                sprintf('%s.%s', ones.app_info.app, camelCaseSpace(config.field.slice(0, -3)))
                                            );
                                    } else {
                                        var label_field = config.label || (field ? field : config.field);
                                        config.label = _(ones.app_info.app+'.'+(config.label||camelCaseSpace(label_field)).ucfirst());
                                    }

                                    var cell_filter = config && (config.detail_filter || config.cell_filter);
                                    if(cell_filter) {
                                        var filters = cell_filter;
                                        if(!angular.isArray(cell_filter)) {
                                            filters = [cell_filter];
                                        }

                                        for(var j=0;j<filters.length;j++) {
                                            var argv = filters[j].split(':');
                                            var filter_name = argv.shift();
                                            argv.unshift(self.scope[self.config.model_prefix][config.field]);
                                            self.scope[self.config.model_prefix][config.field + '__label__'] = $filter(filter_name).call(null, argv);
                                        }
                                    }

                                    self.scope.column_defs[field] = config;
                                    html.push(detail_widgets.make_widget(self.scope, config));
                                });

                                self.deferred.resolve(html.join(''));

                            }
                        });
                    });
                 };

             }
        ])
        .service('ones.detail_view_split', [
            '$timeout',
            '$routeParams',
            'pluginExecutor',
            function($timeout, $routeParams, plugin) {
                this.config = {};
                var self = this;
                this.config = {};
                this.actions = {};

                /*
                 * 分栏详情
                 * */
                this.init = function(scope, config) {
                    this.scope = scope;
                    angular.deep_extend(this.actions, config.opts && config.opts.actions || {});
                    try{
                        delete(config.opts.actions);
                    } catch(e) {}

                    angular.deep_extend(this.config, config.opts);

                    scope.basic_data = {};

                    // 调用插件 扩展操作
                    var plugin_key = sprintf('extend_%s_%s_detail_split_actions', ones.app_info.app, ones.app_info.module);
                    plugin.callPlugin(plugin_key);

                    angular.deep_extend(this.actions, ones.pluginScope.get(plugin_key) || {});

                    // 当前action
                    var current_action = $routeParams.action || 'basic';

                    // 当前活动action
                    scope.active_action = current_action;
                    // 当前活动选项卡信息
                    scope.current_action_info = this.actions[current_action];

                    scope.no_padding = scope.current_action_info.no_padding || false;

                    // 模板
                    if(scope.current_action_info.view) {
                        scope.template = scope.current_action_info.view.indexOf('/') >=0
                            ? scope.current_action_info.view
                            : appView(ones.app_info.module+'_detail_view/'+scope.current_action_info.view+".html");
                    } else {
                        scope.template = appView(ones.app_info.module+'_detail_view/'+current_action+".html");
                    }
                    scope.template =
                        scope.current_action_info.view || appView(ones.app_info.module+'_detail_view/'+current_action+".html");

                    // actions
                    scope.actions = [];
                    angular.forEach(this.actions, function(item, k) {
                        scope.actions.push({
                            action: k,
                            label: item.label,
                            href : item.href || sprintf('#/%(app)s/%(module)s/view/split/%(id)d/%(action)s', {
                                app: ones.app_info.app,
                                module: ones.app_info.module,
                                id: parseInt($routeParams.id),
                                action: k
                            })
                        });
                    });

                    // 基础数据
                    this.actions.basic.resource !== undefined && this.actions.basic.resource.get({
                        id: $routeParams.id
                    }).$promise.then(function(data) {
                            scope.basic_data = data;
                            scope.$parent.global_title = data[self.config.global_title_field||'name'] || undefined;
                            scope.$parent.global_title = scope.$parent.global_title
                                ? _('common.View %s Detail',
                                    _(ones.app_info.app+'.'+camelCaseSpace(ones.app_info.module)))+
                                    ' '+scope.$parent.global_title
                                : undefined;

                            // action init
                            scope.current_action_info.init(scope, $routeParams.id, data);
                        });

                    // 延迟更新右侧导航高度
                    $timeout(function() {
                        scope.main_height = angular.element("#detail_view_main").height();
                    });

                    scope.link_actions = [];
                    angular.forEach(scope.current_action_info.link_actions, function(item, alias) {
                        if(item.auth_node === false) {
                            scope.link_actions.push(item);
                            return;
                        }
                        var auth_node = item.auth_node || '';
                        if(auth_node.indexOf('.') < 0) {
                            auth_node = sprintf('%s.%s.%s', ones.app_info.app, ones.app_info.module, auth_node);
                        }

                        if(is_node_authed(auth_node)) {
                            scope.link_actions.push(item);
                        }
                    });

                    scope.aside_title = this.config.title;
                };

            }
        ])
        .directive('detailView', [
            "$compile",
            "$timeout",
            "ones.detail_view",
            "$filter",
            function($compile, $timeout, detail_view, $filter){
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
                                $timeout(function(){
                                    detail_view.init($scope, $scope.config).promise.then(function(html){
                                        angular.element(element).append($compile(html)($scope));
                                    });
                                }, 500);
                            }
                        };
                    }
                };
            }
        ])
        /*
        * 带边栏的详情查看
        * 右侧边栏可切换详情内容，支持插件
        * */
        .directive('detailViewSplit', [
            "$compile",
            "$timeout",
            "ones.detail_view_split",
            "$filter",
            function($compile, $timeout, detail_view, $filter) {
                return {
                    restrict: "E",
                    replace: true,
                    transclusion: true,
                    scope: {
                        config: "="
                    },
                    templateUrl: "views/detailSplitTemplate.html",
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function ($scope, iElement, iAttrs, controller) {
                                detail_view.init($scope, $scope.config);
                            }
                        };
                    }
                };
            }
        ])
    ;
})(window, window.angular, window.ones);