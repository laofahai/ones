var location_hash_info_source = location.hash.slice(2, location.hash.length).split('/');
var frame_app_load_failed = function(title) {
    var msg = _("common.Can't load:")+" "+location_hash_info_source.join('/');
    $("#frame_bger").text(msg);
    alert(title+"\n"+msg);
};

/**
 * 框架内容初始化
 * */
var frame_init = function() {
    !ones.DEBUG && !window.top.window.$on_frame && (window.location.href = ones.APP_ENTRY);
    window.current_frame = -1;
    try {
        var info = angular.copy(location_hash_info_source);
        var app = info.shift();
        var module = info.shift() || 'index';
        var action = info.shift() || 'index';
        var params = {};
        
        for(var i=0; i<info.length; i++) {
            if((i+1) % 2 === 0) {
                continue;
            }
            params[info[i]] = info[i+1];
        }
        
        /**
         * 当前路由信息
         * */
        ones.app_info = {
            app: app,
            module: module,
            action: action,
            params: params
        };

        /**
         * 加载框架配置
         * */
        LoadConfig(app, function() {
            var config = C(app);

            ones.DEBUG && console.debug('loding frame config', config);
            
            if(!config || !angular.isObject(config)) {
                // 不能加载应用配置， 输出错误信息
                frame_app_load_failed('load_config');
                return false;
            }

            ones.app_info.config = config;

            // copy
            if(ones.app_info.config.author) {
                angular.element('#footer-copy-link').text(ones.app_info.config.author || 'TEam Swift');
                angular.element('#footer-copy-link').attr('href', ones.app_info.config.link || 'javascript:void(0)');
            }

            //依赖应用
            config.requirements = config.requirements || [];
            
            var load_apps = [app];

            for(var i=0; i < config.requirements.length; i++) {
                load_apps.push(config.requirements[i]);
            }

            ones.load_all_i18n = config.load_all_i18n;



            var include_callback = function() {
                var angular_app_name = 'ones.app.'+app+ (app.indexOf('.') >= 0 ? '' : '.main'); // 支持导入非main模块
                ones.DEBUG && console.debug('loading app: '+angular_app_name);
                var boot_strap_module = [
                    'ones.i18nModule',
                    'ones.frameInnerModule',
                    angular_app_name,
                    'ones.commonViewModule'
                ];

                if(config.load_modules) {
                    angular.forEach(config.load_modules, function(m) {
                        boot_strap_module.push(m);
                    });
                }

                angular.module("ones.frameInnerModule", [
                    'localytics.directives',

                    'ones.global',

                    'ones.pluginsModule',
                    'ones.configModule',
                    'ones.filtersModule',
                    'ones.servicesModule',
                    'ones.i18nModule',
                    'ones.dataModelModule',
                    'ones.directiveModule',

                    'ones.app.account.model',

                    'btford.markdown',

                    'naif.base64'
                ])
                    .run(['$timeout', function($timeout) {
                        window.current_frame = $(window.top.window.document).find('iframe:visible').index();
                    }])

                    /**
                     * 框架内部主控制器
                     * */
                    .controller('MainFrameCtrl', [
                        "$scope",
                        "$timeout",
                        "$injector",
                        "$aside",

                        "RootFrameService",
                        "Account.UserPreferenceAPI",
                        function($scope, $timeout, $injector, $aside, RootFrameService, preference) {
                            //监听全局事件
                            $scope.$on("event:loginRequired", function() {
                                window.top.location.href = "./";
                            });

                            $scope.$on("event:permissionDenied", function(evt, msg) {
                                RootFrameService.alert({
                                    type: 'danger',
                                    content: msg
                                });
                            });

                            $scope.$on("event:serverError", function(evt, msg) {
                                RootFrameService.alert({
                                    type: 'danger',
                                    content: msg
                                });
                            });

                            // 右键事件
                            $scope.hideContextMenu = function() {
                                $timeout(function(){
                                    $scope.contextMenu = {};
                                }, 50);
                            };
                            $scope.$on("contextMenu", function(evt, param) {

                                param.top += document.body.scrollTop;

                                $scope.contextMenu = param;

                                angular.element(document).click(function(){
                                    $scope.$apply(function(){
                                        $scope.contextMenu = {};
                                    });
                                });
                            });

                            // 帮助链接
                            var search_link = 'http://ones_manual.mydoc.io/?q=%s %s&p=search';
                            $scope.help_link = ones.app_info.config.document || sprintf(
                                search_link, ones.app_info.app, to_app_name(ones.app_info.app)
                            );

                            /**
                             * 链接打开新窗口
                             * */
                            $scope.$root.link_open_frame = function(opts) {
                                RootFrameService.open_frame(opts);
                            };

                            // 用户首选项
                            var common_nav = ones.user_preference.common_nav || [];

                            // 判断当前是否在常用操作中
                            $scope.exists_in_common = false;
                            angular.forEach(common_nav, function(nav) {
                                if(nav.link === ones.frame_info.link) {
                                    $scope.exists_in_common = true;
                                }
                            });
                            $scope.common_nav = common_nav;

                            // 切换当前页面是否存在于常用操作中
                            $scope.toggle_common_nav = function() {

                                var common_nav = $scope.common_nav || [];

                                var exists_in_common = false;

                                for(var i=0;i<common_nav.length;i++) {
                                    if(common_nav[i].link === ones.frame_info.link) {
                                        exists_in_common = true;
                                        common_nav.splice(i, 1);
                                        break;
                                    }
                                }

                                if(!exists_in_common) {
                                    common_nav.push({
                                        app: ones.app_info.app,
                                        icon: ones.frame_info.icon,
                                        link: ones.frame_info.link,
                                        label: ones.frame_info.label
                                    });
                                }

                                preference.set_preference('common_nav', common_nav);

                                $scope.exists_in_common = !$scope.exists_in_common;
                            };

                            /**
                             * 接受$root页面事件广播
                             * @override
                             * */
                            window.$on_root = function(data) {

                            };

                            /*
                            * 查看工作流进程
                            * */
                            $scope.view_workflow_progress = function(source_row) {
                                var workflow_service = $injector.get('Bpm.WorkflowAPI');
                                if(!source_row.workflow_id || !source_row.id) {
                                    RootFrameService.alert({
                                        content: _('common.Params Error'),
                                        type: 'danger'
                                    });
                                    return false;
                                }
                                workflow_service.get_progress(source_row.workflow_id, source_row.id).then(function(progresses) {
                                    $scope.workflow_progress = progresses;
                                    $aside({
                                        scope: $scope,
                                        contentTemplate: appView('progress_aside.html', 'bpm'),
                                        title: _('bpm.Workflow Progress')
                                    });
                                });
                            };
                            /*
                            * 执行工作流进程
                            * */
                            $scope.execute_workflow_node = function(node_id, workflow_id, source_id) {
                                var workflow_service = $injector.get('Bpm.WorkflowAPI');
                                workflow_service.execute(node_id, source_id);
                            };

                        }
                    ])
                    /**
                     * 与主框架交互服务
                     * */
                    .service("RootFrameService", [
                        function() {

                            var self = this;

                            /**
                             * 当前frame index
                             * */
                            this.frame_index = window.current_frame;

                            /**
                             * 新建frame标签快捷方式
                             * */
                            this.open_frame = function(opts) {
                                window.$emit_root({
                                    event: "open_frame",
                                    data: opts
                                });
                            };

                            /**
                             * 关闭当前frame
                             * */
                            this.close = function(id){
                                window.$emit_root({
                                    event: "close_frame",
                                    data: {id: id || this.frame_index}
                                });
                            };

                            /**
                             * confirm
                             * */
                            this.confirm = function(msg, callback) {
                                window.$emit_root({
                                    event: "modal_confirm",
                                    data : {
                                        msg: msg,
                                        callback: callback
                                    }
                                });
                            };

                            this.alert = function(opts) {
                                opts = angular.isObject(opts) ? opts : {content: opts, type: 'info'};
                                window.top.window.$on_frame ?
                                    window.$emit_root({
                                        event: "global_alert",
                                        data : opts
                                    }) : alert(opts.content);
                            }
                        }
                    ])
                    /*
                    * 页面选中项目操作
                    * */
                    .service('PageSelectedActions', [
                        '$timeout',
                        '$rootScope',
                        'RootFrameService',
                        function($timeout, $rootScope, RootFrameService) {

                            var self = this;
                            this.selected_actions = [];

                            this.generate = function(model, scope) {

                                this.scope = scope;

                                self.app_info = {
                                    app: model.config.app,
                                    module: model.config.module
                                };

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
                                            label: _('common.Add Child'),
                                            class: "primary",
                                            multiple: false,
                                            icon: "plus",
                                            auth_node: "post",
                                            action: function(evt, selected, theItem){
                                                theItem = theItem || {};
                                                $location.url(sprintf('/%(group)s/%(module)s/addChild/pid/%(id)d', {
                                                        group : group,
                                                        module: module,
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
                                if(model.config.detailable) {
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

                                    if(!is_node_authed(authKey)){
                                        return false;
                                    }
                                    mirror.push(item);
                                });

                                return self.selected_actions = mirror;

                            };

                        }
                    ])
                ;


                try {
                    bootstrap(boot_strap_module, load_apps);
                } catch(e) {
                    frame_app_load_failed("bootstrap");
                }
            };

            //引用静态文件
            config.include && config.include.css && ones.include_css(config.include.css);
            config.include && config.include.js && ones.include_js(config.include.js, include_callback);

            //无需引用静态文件时
            if(!config.include || !config.include.js) {
                include_callback();
            }
        });
        
    } catch(e) {} 
};


ones.frame_info = {};
/**
 * 接受$root页面事件广播
 * */
window.$on_root = function(data) {
    if(data.event === 'frame_link_info') {
        ones.frame_info = data.opts;
    }
};

/**
 * 向$root页面冒泡事件
 *
 * opts:
 *  event: undefined 需top window中 angular主controller广播的事件名称 无则标识非广播事件
 *  data: {}  如存在event则作为事件广播参数，否则将赋值至top window的angular主ctrl $scope中。
 *  callback: undefined 回调函数
 *
 * */
window.$emit_root = function(opts) {
    opts.window = window;
    window.top.window.$on_frame(opts);
};
