(function(window, ones, angular){
    'use strict';
    /**
     * ONES静态文件异步加载器
     *
     * @param path string 静态文件路径。 eg: apps/goods/main. 如果参数为数组则遍历处理
     * */

    ones.included_static = [];

    ones.include_js = function(path, outer_callback, check_other_include) {
        
        if(!path) {
            return;
        }
        if(ones.included_static.indexOf(path) >= 0) {
            return;
        }
        ones.included_static.push(path);

        var include_paths = [];
        var inited = false;

        var callback = function() {
            ones.pluginExecutor('after_js_loaded');
            var need_load_other = ones.pluginScope.get('need_include_js');
            if(need_load_other && false !== check_other_include) {
                ones.include_js(need_load_other, outer_callback, false);
            } else {
                outer_callback();
            }
        };

        path = array_unique(path);
        if(ones.DEBUG) {
            angular.forEach(path, function(p) {
                if(include_paths.indexOf(p) >= 0) {
                    return;
                }
                $.ajax({
                    url: p+'.js',
                    dataType: "script",
                    success: function(data) {
                        include_paths.push(p);
                        if(!inited && include_paths.length === path.length && typeof callback === 'function') {
                            inited = true;
                            callback();
                        }
                    },
                    error: function(event, type, error) {
                        console && console.error(event, type, error);
                    }
                });
            });
        } else {
            var cleared = [];
            angular.forEach(path, function(p) {
                if(include_paths.indexOf(p) >= 0) {
                    return;
                }
                cleared.push(p);
                include_paths.push(p);
            });

            if(!cleared) {
                callback();
                return;
            }

            var compiled_script_path = 'runtime_compiled/'+hex_md5(cleared.join())+'.js';

            $.ajax({
                url: compiled_script_path,
                dataType: "script",
                success: function(data) {
                    if(!inited && include_paths.length === path.length && typeof callback === 'function') {
                        inited = true;
                        callback();
                    }
                },
                error: function(event, type, error) {
                    $.ajax({
                        url: ones.remote_entry+'home/static&t=js&f='+encodeURIComponent(cleared.join()),
                        dataType: "script",
                        success: function(data) {
                            if(!inited && include_paths.length === path.length && typeof callback === 'function') {
                                inited = true;
                                callback();
                            }
                        },
                        error: function(event, type, error) {
                            console && console.log(type, error);
                        }
                    });
                }
            });
        }


        ones.DEBUG && console.debug('Load js: ', include_paths);

        //$.ajax({
        //    url: sprintf('%shome/static&t=js&f=%s', ones.remote_entry, include_paths.join()),
        //    dataType: "script",
        //    success: function(data) {
        //        ones.DEBUG && console.debug('Load js: ', include_paths);
        //        if(typeof callback === 'function') {
        //            callback();
        //        }
        //    },
        //    error: function(event, type, error) {
        //        console && console.log(type, error);
        //    }
        //});

    };
    
    ones.include_css = function(path, check_other_include) {
        
        if(!path) {
            return;
        }

        if(ones.included_static.indexOf(path) >= 0) {
            return;
        }
        ones.included_static.push(path);
        
        var ext = '';
        if(ones.DEBUG) {
            ext = '?' + Math.random();
        }

        var element = "";
        
        var tpl = '<link href="%s.css%s" type="text/css" rel="stylesheet" data-path="%s" />';

        var __include = function(path) {
            element = sprintf(tpl,
                path,
                ext,
                path.replace('/', '.'));
            angular.element('head').append(element);
        };
        
        if(angular.isArray(path)) {
            angular.forEach(path, function(p) {
                __include(p);
            });
        } else {
            __include(path);
        }

        ones.pluginExecutor('after_css_loaded');
        var need_load_other = ones.pluginScope.get('need_include_css');
        if(need_load_other && false !== check_other_include) {
            ones.include_css(need_load_other, false);
        }
        
    };
    
})(window, window.ones, window.angular);