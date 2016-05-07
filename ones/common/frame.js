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
            params: params,
            alias: app + '.' + module
        };

        /**
         * 加载框架配置
         * */
        LoadConfig(app, function() {
            var config = C(app);
            ones.pluginExecutor('after_base_config_loaded', config);

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
                        "$rootScope",
                        "$timeout",
                        "$injector",
                        "$aside",

                        "RootFrameService",
                        "Account.UserPreferenceAPI",
                        function($scope, $rootScope, $timeout, $injector, $aside, RootFrameService, preference) {

                            $rootScope.typeof = function(cond) {
                                return typeof cond;
                            };

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

                            // 全局按键事件
                            $scope.main_frame_keydown = function($event) {
                                switch($event.keyCode) {
                                    case 82: // ctrl + r 刷新frame
                                        if($event.ctrlKey) {
                                            location.reload();
                                        }
                                        break;
                                }
                            };

                            // 帮助链接
                            var search_link = 'http://ones_manual.mydoc.io/?q=%s %s&p=search';
                            $scope.help_link = ones.app_info.config.document || 'http://ones_manual.mydoc.io' || sprintf(
                                search_link, ones.app_info.app, to_app_name(ones.app_info.app)
                            );

                            /**
                             * 链接打开新窗口
                             * */
                            $scope.$root.link_open_frame = function(opts) {

                                if(typeof opts.action === 'function') {
                                    opts.action();
                                }

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
                                if(!ones.frame_info.link || !ones.frame_info.label) {
                                    return;
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
                                window.top.window.$on_frame ? window.$emit_root({
                                    event: "modal_confirm",
                                    data : {
                                        msg: msg,
                                        callback: callback
                                    }
                                }) : do_confirm(msg, callback);

                                var do_confirm = function(msg) {
                                    if(confirm(msg)) {
                                        if(typeof callback === 'function') {
                                            callback();
                                        }
                                    }
                                };
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
        ones.frame_info = data.opts || {};
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
