(function(window, ones, angular){
    'use strict';
    /**
     * ONES静态文件异步加载器
     * @todo 可加入后端远程处理、是否min等选项
     * 
     * @param path string 静态文件路径。 eg: apps/goods/main. 如果参数为数组则遍历处理
     * */

    ones.included_static = [];

    ones.include_js = function(path, callback) {
        
        if(!path) {
            return;
        }
        if(ones.included_static.indexOf(path) >= 0) {
            return;
        }
        ones.included_static.push(path);
        
        var __include = function(path, is_last) {
            $.ajax({
                url: path+'.js',
                dataType: "script",
                success: function(data) {
                    if(is_last && typeof callback === 'function') {
                        callback();
                    }
                },
                error: function(event, type, error) {
                    console.error('cannot load js file: '+path+".js");
                    console.error(type, error);
                }
            });
        };
        
        if(angular.isArray(path)) {
            var i = 0;
            var is_last = false;
            angular.forEach(path, function(p) {
                i++;
                if(i >= path.length) {
                    is_last = true;
                }
                __include(p, is_last);
            });
        } else {
            __include(path, true);
        }
        
    };
    
    ones.include_css = function(path) {
        
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
        
    };
    
})(window, window.ones, window.angular);