(function(window, ones, angular) {
    // REST请求调试信息
    window.top.__DEBUG_REMOTE_INFO = window.top.__DEBUG_REMOTE_INFO || {};
    window.top.__DEBUG_REMOTE_URIS = window.top.__DEBUG_REMOTE_URIS || [];

    window.set_debugger_info = function(uri, info) {
        if(!ones.DEBUG || !uri || !info) {
            return;
        }

        if(window.top.__DEBUG_REMOTE_URIS.indexOf(uri) >= 0) {
            window.top.__DEBUG_REMOTE_URIS.remove(uri);
        }
        window.top.__DEBUG_REMOTE_URIS.push(uri);
        window.top.__DEBUG_REMOTE_INFO[uri] = info;
    };
    
})(window, window.ones, window.angular);