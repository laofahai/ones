(function(){
    /**
     * hooksName: {
     *  "whenDoSth" : [
     *      'doPlugin',
     *      'doOtherThink',
     *      'andMore...'
     *  ]
     * };
     * */
    window.loadedPlugins = {};


    window.pluginExecutor = {};

    window.plugin = function() {};

    window.plugin.prototype = {
        callPlugin: function(hook) {
            var args = arguments.slice(1);
            if(window.loadedPlugins[hook].length) {
                return;
            }
            var p = window.loadedPlugins[hook];
            for(var i=0; i< p.length; i++) {
                window.pluginer[p[i]].apply(null, args);
            }

        }
    };

})();