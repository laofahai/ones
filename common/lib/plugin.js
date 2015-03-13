(function(){

    /**
     * ONES前端插件实现
     * 使用：在模块的angular.module之前定义
     *
     *  ones.pluginExecutor.registerHook("whenSthHappen", "doSomeOtherThing");
     *  ones.plugins.doSomeOtherThing = function(){}
     *
     * 在angular.module合适位置定义调用hook
     *  ones.pluginExecutor.callPlugin("whenSthHappen", param1, param2, param3);
     * */


    /**
     *  "whenDoSth" : [
     *      'doPlugin',
     *      'doOtherThink',
     *      'andMore...'
     *  ]
     *
     *  插件钩子/事件列表
     * */
    ones.pluginHooks = {};

    /**
     * 插件注册对象，所有插件需定义到此对象中
     * eg: ones.plugins.foo = function(args) {}
     * */
    ones.plugins = {};

    /**
     * ONES插件作用域
     * ones.pluginVariables
     * */
    ones.pluginVariables = {};
    ones.pluginScope = {
        get: function(k) {
            return ones.pluginVariables[k];
        },
        set: function(k,v) {
            ones.pluginVariables[k] = v;
            return v;
        },
        clear: function() {
            ones.pluginVariables = {};
        },
        remove: function(k){
            delete(ones.pluginVariables[k]);
        },
        append: function(k, v) {
            try {
                if(!ones.pluginVariables[k]) {
                    ones.pluginVariables[k] = [];
                }
                ones.pluginVariables[k].push(v);
            } catch(e) {}
        }
    };

    /**
     * 插件注册器
     * */
    ones.pluginRegister = function(hookName, callback) {

        if(!ones.pluginHooks[hookName]) {
            ones.pluginHooks[hookName] = [];
        }

        var funcName = callback;

        if(typeof(callback) === "function") {
            funcName = "f" + md5.createHash(String(Math.random()));
            ones.plugins[funcName] = callback;
        }

        ones.pluginHooks[hookName].push(funcName);
    };


    /**
     * angular服务方式调用插件
     * */
    angular.module("ones.pluginsModule", [])
        .service("pluginExecutor", ["$injector", "$q", function($injector, $q){
            return {
                setDefer: function(defer) {
                    this.defer = defer;
                },
                resetDefer: function() {
                    this.defer = undefined;
                },
                /**
                 * 调用插件，需插件已加载
                 * */
                callPlugin: function(hookName) {

                    var args = Array.prototype.slice.call(arguments, 1);

                    var p = ones.pluginHooks[hookName];

                    if(!p) {
                        return false;
                    }

                    var defer = this.defer ? this.defer : $q.defer();
                    args.unshift(defer);
                    args.unshift($injector);

                    for(var i=0; i< p.length; i++) {
                        ones.plugins[p[i]].apply(null, args);
                    }

                    return defer;
                }
            };
        }])
        .directive("callPlugin", ["$injector", "pluginExecutor", function($injector, plugin){
        	return {
        		restrict: "E",
        		scope: {
        			hook: "="
        		},
        		replace: true,
                transclusion: true,
                compile: function(element, attrs) {
                	plugin.callPlugin(attrs.hook);
                	html = ones.pluginScope.get(attrs['var']);
                	if(html){
                		html = html.join();
                	}
                	angular.element(element).after(html).remove();
                }
        	};
        }])
    ;

})();