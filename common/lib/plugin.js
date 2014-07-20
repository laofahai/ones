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

    //pluginExecutor执行对象
    ones.pluginExecutor = {
        /**
         * 调用插件，需插件已加载
         * */
        callPlugin: function(hookName) {

            var args = Array.prototype.slice.call(arguments,1);
            if(!ones.pluginHooks[hookName].length) {
                return;
            }
            var p = ones.pluginHooks[hookName];
            for(var i=0; i< p.length; i++) {
                ones.plugins[p[i]].apply(null, args);
            }
        },
        /**
         * main.js 中开头定义： 需定义在angular.module()之前
         * */
        register: function(hookName, callback) {
            if(!ones.pluginHooks[hookName]) {
                ones.pluginHooks[hookName] = [];
            }

            if(callback) {
                ones.pluginHooks[hookName].push(callback);
            }
        }
    };
})();