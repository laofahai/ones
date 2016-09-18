(function(window, ones, angular){
    angular.module('ones.i18nModule', [
        'ones.configModule'
    ])
        .filter('_', function () {
            return function (key, params) {
                return _(key, params);
            };
        })
        .filter('lang', function () {
            return function (key, params) {
                return _(key, params);
            };
        });
})(window, window.ones, window.angular);


/**
 * 语言包初始化
 * debug模式：存入当前页面变量
 * 非debug模式：存入localStorage
 * 
 * @todo 动态切换当前语言
 * @todo 默认会有6个基础应用语言包被加载
 * */
function i18n_init(apps, callback) {

    var cached = ones.caches.getItem('ones.lang') || {};
    if (ones.DEBUG || Object.keys(cached).length < 8) {

        if(ones.load_all_i18n) {
            apps = ['all'];
        } else {
            apps = angular.isArray(apps) ? apps : [apps];
        }

        ones.DEBUG && console.debug('loading i18n:'+ apps.join());
        
        $.ajax({
            type: "EVENT",
            url: ones.remote_entry+'home/i18n/index/apps/'+apps.join(),
            beforeSend: function(request) {
                request.setRequestHeader("Client-Language", ones.caches.getItem('user.client_language') || ones.default_language);
                request.setRequestHeader("Token", ones.caches.getItem('user.session_token'));
                request.setRequestHeader("API-Version", ones.api_version);
            },
            success: function(data) {
                ones.caches.setItem('ones.lang', data, ones.DEBUG ? -1 : 1);
                if (typeof callback === "function") {
                    callback();
                }
            },
            error: function(response) {
                switch(response.status) {
                    case 401:
                        if(location.hash !== '#redirected') {
                            window.top.location.href = 'index.html#redirected';
                        } else {
                            alert('Error when load I18N: unauthed');
                        }
                        break;
                }
            }
        });
    } else {
        ones.caches.getItem('ones.lang');
        if (typeof callback === "function") {
            callback();
        }
    }

}
/**
 * 读取语言包
 * @param key 
 * eg: _('action.submit')
 * */
function _(key, params) {
    
    var key_items = key.split('.');

    if(key_items.length === 1) {
        key_items.unshift(ones.app_info.app);
    }

    try{
        var app = key_items.shift();
        var lang = ones.caches.getItem('ones.lang');
        lang = lang[app];
    } catch(e) {
        return apply_sprintf(key_items.pop(), params);
    }


    
    for(var i=0; i<key_items.length; i++) {
        try {
            // 不存在
            if(lang[key_items[i]]) {
                lang = lang[key_items[i]];
            } else {
                // 尝试使用common
                if(app === "common") {
                    return apply_sprintf(key_items.pop(), params);
                }
                key_items.unshift('common');
                return _(key_items.join('.'), params);
            }
        } catch(e) {
            // 尝试使用common
            if(app === "common") {
                return apply_sprintf(key_items.pop(), params);
            }
            key_items.unshift('common');
            return _(key_items.join('.'), params);
        }
        
    }
    
    return apply_sprintf(lang, params);
}