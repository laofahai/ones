(function(window, ones, angular) {
    angular.module('ones.servicesModule', [])
        .service('Home.SchemaAPI', [
            'ones.dataApiFactory',
            function (dataAPI) {
                this.config = {};
                this.resource = dataAPI.getResourceInstance({
                    uri: "home/schema",
                    extra_methods: ['api_query', 'api_get']
                });

                this.get_schema = function (opts) {

                    if (opts.schema) {
                        return opts.callback(opts.schema);
                    }

                    var queryParams = {
                        app: opts.app,
                        table: opts.table
                    };
                    var schema = this.resource.api_get(queryParams).$promise;

                    if (typeof opts.callback === "function") {
                        ones.DEBUG && console.debug('loading schema');
                        return schema.then(opts.callback);
                    }

                    return schema;
                };

            }
        ])

        .service('Home.NavAPI', [
            'ones.dataApiFactory',
            function (dataAPI) {
                this.config = {};
                this.resource = dataAPI.getResourceInstance({
                    uri: "home/nav",
                    extra_methods: ['api_query', 'api_get']
                });
            }
        ])

        /*
         * 页面选中项目操作
         * */
        .service('PageSelectedActions', [
            '$timeout',
            '$rootScope',
            'RootFrameService',
            '$injector',
            '$location',
            function($timeout, $rootScope, RootFrameService, $injector, $location) {

                var self = this;
                this.selected_actions = [];

                this.generate = function(model, scope) {

                    model = angular.copy(model);
                    self.selected_actions = [];

                    this.scope = scope;

                    self.app_info = {
                        app: model.config.app,
                        module: model.config.module,
                        alias: model.config.app + '.' + model.config.module
                    };

                    var group = self.app_info.app;
                    var module = self.app_info.module;

                    model = model || self.options.model;
                    var extraParams = model.config.link_extra_params || '';

                    //编辑
                    if (model.config.editable === undefined || model.config.editable) {
                        self.selected_actions.push({
                            name: "edit",
                            label: _('common.Edit'),
                            icon: "pencil",
                            action: function (evt, selected, theItem) {

                                var item = theItem || self.scope.$parent.gridSelected[0];

                                if (!item.id) {
                                    return;
                                }
                                if (model.config.editable === false) {
                                    return false;
                                }
                                var action = "edit";
                                //如果是单据形式的
                                if (model.config.is_bill) {
                                    action = "edit/bill";
                                }

                                RootFrameService.open_frame({
                                    src: sprintf('%s/%s/%s/%s', self.app_info.app, self.app_info.module, action, item.id),
                                    label: _("common.Edit") + _(self.app_info.app+'.'+camelCaseSpace(self.app_info.module)),
                                    singleton: true
                                });
                            },
                            class: "default",
                            multiple: false,
                            auth_node: "put"
                        });
                    }
                    //增加/查看 子项
                    if(model.config.subable) {
                        if(false !== model.config.add_subable) {
                            self.selected_actions.push({
                                name: "addChild",
                                label: _('common.Add New')+' '+_('common.Sub Category'),
                                class: "primary",
                                multiple: false,
                                icon: "plus",
                                auth_node: "post",
                                action: function(evt, selected, theItem){
                                    theItem = theItem || {};
                                    $location.url(sprintf('/%(group)s/%(module)s/add/pid/%(id)d', {
                                            group : group,
                                            module: self.app_info.module,
                                            id: Number(theItem.id||self.scope.$parent.gridSelected[0].id)
                                        })+extraParams);
                                }
                            });
                        }

                        //查看子项
                        if(false !== model.config.view_subable) {
                            self.selected_actions.push({
                                name: "viewChild",
                                label: _('common.View Child'),
                                class: "primary",
                                multiple: false,
                                icon: "eye",
                                auth_node: "get",
                                action: function(evt, selected, theItem){
                                    theItem = theItem || {};
                                    $location.url(sprintf('/%(group)s/viewChild/%(module)s/pid/%(id)d', {
                                            group : group,
                                            module: module,
                                            id: Number(theItem.id||self.scope.$parent.gridSelected[0].id)
                                        })+extraParams);
                                }
                            });
                        }
                    }
                    //查看详情
                    if(model.config.detail_able) {
                        self.selected_actions.push({
                            name: "viewDetail",
                            label: _('common.View Detail'),
                            class: "primary",
                            icon: "eye",
                            multiple: false,
                            auth_node: "get",
                            action: function(evt, selected, theItem){
                                theItem = theItem || {};
                                var action = model.config.is_bill ? "view/bill" : "view";

                                if(model.config.detail_split) {
                                    action = 'view/split';
                                }

                                var src =sprintf('%s/%s/%s/%s', ones.app_info.app, ones.app_info.module, action, theItem.id);
                                RootFrameService.open_frame({
                                    src: src,
                                    label: _('common.View %s Detail', _(ones.app_info.app + "." + camelCaseSpace(ones.app_info.module))),
                                    singleton: false
                                });
                            }
                        });
                    }

                    //删除
                    if(model.config.deleteable === undefined || model.config.deleteable) {
                        self.selected_actions.push({
                            name: "delete",
                            label: _('common.Delete'),
                            icon: "trash-o",
                            auth_node: "delete",
                            btn_type: 'danger',
                            action: function(evt, selected, theItem){
                                var ids = [];
                                var items = theItem ? [theItem] : self.scope.$parent.gridSelected;

                                if(model.config.deleteable === false) {
                                    return false;
                                }

                                RootFrameService.confirm(_("common.Confirm delete the %s items?", items.length), function() {
                                    angular.forEach(items, function(item){
                                        ids.push(item.id);
                                    });
                                    if(!ids) return;

                                    var method = ids.length > 1 ? 'remove' : 'delete';

                                    model.resource[method]({
                                        id: ids,
                                        _df: self.data_model_fields
                                    }, function() {
                                        self.scope.$parent.$broadcast("gridData.changed", true);
                                    });
                                });

                            },
                            class: "danger",
                            multiple: true
                        });
                    }

                    //其他扩展操作，在model中定义
                    if(model.config.extra_selected_actions) {
                        angular.forEach(model.config.extra_selected_actions, function(item){
                            item.scope = self.scope;
                            self.selected_actions.push(item);
                        });
                    }

                    // 插件插入控制菜单
                    $injector.get('pluginExecutor').callPlugin(
                        sprintf('extra.selected.actions.%s.%s', ones.app_info.app, ones.app_info.module),
                        model.config.extra_selected_actions
                    );

                    var exists = [];
                    var mirror = [];
                    angular.forEach(self.selected_actions, function(item, k){

                        if(exists.indexOf(item.label) >= 0) {
                            return;
                        }
                        exists.push(item.label);

                        if(false === item.auth_node) {
                            mirror.push(item);
                            return;
                        }

                        var authKey;

                        if(item.auth_node && item.auth_node.indexOf(".") >= 0) {
                            authKey = item.auth_node;
                        } else {
                            authKey = sprintf("%s.%s.%s", ones.app_info.app, ones.app_info.module, item.auth_node);
                        }

                        /**
                         * @todo platform 管理权限
                         * */
                        if(!is_node_authed(authKey) && !window.in_platform){
                            return false;
                        }
                        mirror.push(item);
                    });

                    return self.selected_actions = mirror;

                };

            }
        ])

    ;
})(window, window.ones, window.angular);