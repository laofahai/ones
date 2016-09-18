(function (window, angular) {

    // 注册至frame添加结束后插件
    ones.pluginRegister('after_frame_add', function(injector, defered, frame_opts) {
        injector.get('$timeout')(function() {
            var frame = document.getElementById(frame_opts.id);
            frame.onload = function() {
                window.$broadcast_frame(frame_opts.index, {
                    event: 'frame_link_info',
                    opts: frame_opts
                });
            }
        });

    });

    angular.module('ones', ['ones.framesModule', 'ones.configModule', 'ones.global'])
    .run(['$timeout', function($timeout) {
            $timeout(function() {
                $('#loading-cover').hide();
            }, 2000);
        }])
        .service('Home.HeartBeatAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'home/heartBeat',
                    extra_methods: ['api_get']
                });
            }
        ])
    /**
     * 主控制器
     * */
    .controller('MainCtrl', [
        '$scope',
        '$timeout',
        '$interval',
        'ones.frames',
        'ones.dataApiFactory',
        '$injector',
        'Home.NavAPI',
        'Home.HeartBeatAPI',
        function ($scope, $timeout, $interval, frames, dataAPI, $injector, nav, heart_beat_api) {

            $scope.safeApply = function(fn){
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && ( typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            /**
             * 向frame广播事件
             * */
            window.$broadcast_frame = function(index, data) {
                $timeout(function(){
                    ('$on_root' in window.frames[index]) && window.frames[index].$on_root(data);
                });
            };

            /**
             * 接收frame冒泡事件
             * opts:
             *  event: 是否需广播事件
             *  data: 存在event则广播数据，否则赋值进$scope
             *  callback: 回调函数
             *  window: 冒泡来源frame window对象
             * */
            window.$on_frame = function(opts) {
                if(opts.event) {
                    $scope.safeApply(function() {
                        $scope.$broadcast(opts.event, opts.data);
                    });
                } else {
                    angular.forEach(opts.data, function(item, k) {
                        $scope.safeApply(function(){
                            $scope[k] = item;
                        });
                    });
                }

                if(typeof opts.callback === 'function') {
                    opts.callback();
                }

            };
            
            //新增控制面板标签
            $timeout(function(){
                frames.add({
                    src: 'dashboard',
                    label: _('dashboard.Dashboard'),
                    closeable: false,
                    signton: true
                });
            });

            /**
             * 标签iframe emit事件
             * */
            $scope.$on("open_frame", function(evt, data) {
                $timeout(function(){
                    frames.add(data);
                });
            });
            $scope.$on("close_frame", function(evt, data) {
                $timeout(function(){
                    frames.close(data.id);
                });
            });
            $scope.$on("modal_confirm", function(evt, data) {
                $scope.confirmMsg = data.msg;
                $scope.doConfirm = data.callback;
                var modal = $injector.get("$modal")({
                    scope: $scope,
                    title: _("common.Confirm"),
                    template: "views/confirm.html"
                });
            });
            $scope.$on('global_alert', function(evt, opts) {
                if(!angular.isObject(opts)) {
                    opts = {
                        content: opts,
                        type: 'info'
                    };
                }
                var default_opts = {
                    show: true,
                    container: '#alert-container',
                    delay: {show: 200, hide: 200},
                    auto_hide: 5000
                };

                if(opts.content.msg) {
                    opts.content = opts.content.msg;
                }
                if(opts.content.error) {
                    opts.type = 'danger';
                }

                opts = angular.deep_extend(default_opts, opts);

                var alert = $injector.get('$alert')(opts);

                $timeout(function(){
                    alert.hide()
                }, opts.auto_hide);
            });

            if(is_app_loaded('messageCenter')) {
                $injector.get('ones.MessageCenter');
            }

            // ones 版本
            $scope.ones_version = ones.version;
            $scope.navs = [];
            $scope.subNavs = [];

            nav.resource.api_query().$promise.then(function(data){
                $scope.navs = data;
                $scope.subNavs = data[0] && data[0].children || [];
            });


            // logout
            $scope.doLogout = function() {
                dataAPI.init('account', 'userInfo/logout');
                dataAPI.resource.get().$promise.then(function(data) {
                    ones.caches.removeItem('user.session_token');
                    window.location.href = 'index.html';
                });
            };

            // 新开窗口
            $scope.addFrame = function(label, src, icon) {
                frames.add({
                    label: label,
                    src: src,
                    icon: icon
                });
            };

            // 心跳检测后端登录是否已超时
            $interval(function(){
                heart_beat_api.resource.api_get().$promise.then(function(response_data) {
                    if(response_data.logged_out) {
                        window.location.href = 'index.html';
                    }
                });
            }, 60000);

            $scope._ = _;

        }
    ])
    .controller('MainTopNavCtrl', [
        '$scope',
        "$timeout",
        function($scope, $timeout) {
            $scope.active_nav = 0;
            $scope.toggleLeftNavItems = function($index, alias, subNavs) {
                if($index == $scope.active_nav) {
                    return;
                }
                $scope.$parent.subNavs = [];
                $timeout(function() {
                    $scope.$parent.subNavs = subNavs;
                });

                $scope.active_nav = $index;
            };
        }
    ])
    .controller('LeftSidebarCtrl', [
        '$scope',
        'ones.frames',
        function($scope, frames) {
            /**
             * 新增窗口
             * */
            $scope.addFrame = function (alias, nav) {
                if(nav.children && !nav.link) {
                    if(nav.children) {
                        nav.expand === undefined ? nav.expand = false : nav.expand = !nav.expand;
                    }
                    return false;
                }
                frames.add({
                    label:nav.label || _(nav.app+'.'+alias),
                    src: nav.link,
                    icon: nav.icon
                });
            };
        }
    ])
    .controller('MainFramesCtrl', [
        '$scope',
        'ones.frames',
        function($scope, frames) {
            $scope.$on('main_frames_changed', function(evt, data) {
                $scope.frames = data.frames;
                $scope.activeFrame = data.active;
                evt.preventDefault();
            });
            
            $scope.switchFrame = function(id) {
                $scope.activeFrame = id;
                frames.activeFrame = id;
            };
            
            $scope.closeFrame = function(id) {
                frames.closeFrame(id);
            };
        }
    ])
    ;
})(window, window.angular);