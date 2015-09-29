/**
 * ONES Frame模块，用于实现多选项卡并对选项卡内容iframe初始化。
 * frame 需通过ones.require模块异步加载
 *  1、 nav或其他controller冒泡新增/关闭frame事件
 *  2、 main controller接收事件，并广播至frame controller
 *  3、 frame controller调用ones.frames service，进行操作
 * 
 *  0、 解析模块配置
 *  1、 异步加载JS、CSS
 *  2、 异步加载依赖应用静态文件
 *  3、 页面跳转至 # 路由
 *  4、 启动angular
 * */

angular.module('ones.framesModule', [
    'ones.pluginsModule'
])

    .service('ones.frames', [
        "$rootScope", 
        "$timeout",
        "pluginExecutor",
        function($rootScope, $timeout, plugin) {

            var self = this;

            this.activeFrame = 0;
            this.frames = [];
            //Frame key数组
            this.framesKeys = [];

            this.max_id=0;

            //切换Frame
            this.switchFrame = function(id) {
                this.activeFrame = id;
            };

            //关闭Frame
            this.closeFrame = function(id) {
                //ones.plugin.before_frame_close
                if(!id) return;
                self.frames.splice(id, 1);
                self.framesKeys.splice(id, 1);
                self.activeFrame = id-1;
                
                $rootScope.$broadcast('main_frames_changed', {
                    frames: self.frames,
                    active: self.activeFrame
                });
                
                //ones.plugin.after_frame_close
            };
            this.close = this.closeFrame;


            //Frame 默认参数
            this.opts = {
                closeable: true
            };

            // 广播事件
            this.broadcastFramesChanged = function() {
                $rootScope.$broadcast('main_frames_changed', {
                    frames: self.frames,
                    active: self.activeFrame
                });
            };

            /**
             * @param key string 选项卡唯一标识 =》 app.module.action
             * @param opts object 选项卡配置
             *  src: app.module.action.param
             *  singleton: 是否单例模式（相同action仅存一个）
             *  closeable: 是否可关闭
             * */
            this.add = function (opts, callback) {

                //ones.plugin.before_frame_add
                var defaultOpts = angular.copy(self.opts);
                opts = angular.extend(defaultOpts, opts);
                
                if(!opts.src) {
                    return;
                }

                if(opts.src.indexOf('frame.html#') < 0) {
                    opts.src = 'frame.html#/'+opts.src;
                }

                //已存在则跳转至Frame
                var is_exists = this.framesKeys.indexOf(opts.src);
                if(is_exists >= 0) {
                    self.activeFrame = is_exists;
                    this.broadcastFramesChanged();
                    return;
                }

                // singleton 是否单例
                // 验证src前三个元素
                if(opts.singleton) {
                    var new_key = opts.src.slice(12,opts.src.length).split('/').slice(0,3);
                    for(var i=0;i<self.framesKeys.length;i++) {
                        var exists_key = self.framesKeys[i].slice(12,opts.src.length).split('/').slice(0,3);
                        if(exists_key.join() === new_key.join()) {
                            self.closeFrame(i);
                            break;
                        }
                    }
                }

                self.frames.push(opts);  
                self.framesKeys.push(opts.src);
                
                //默认设置新打开的Frame为显示
                this.activeFrame = this.frames.length-1;
                this.broadcastFramesChanged();

                if(typeof callback === 'function') {
                    callback(opts);
                }

                //ones.plugin.after_frame_add
                opts.index = self.max_id;
                opts.id = 'frame_id_'+opts.index;
                opts.link = opts.src.slice(12,opts.src.length);

                $timeout(function(){
                    $(window.top.frames[this.activeFrame]).ready(function() {
                        plugin.callPlugin('after_frame_add', opts);
                    });
                });


                self.max_id++;
            };


        }])
;
