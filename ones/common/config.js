/**
 * ONES Config 定义
 * */

/*------可配置项目开始------*/
/*
* 是否开启调试模式
* */
ones.DEBUG = true;


/*
* 哪些公司可显示DEBUG BAR
* */
window.top.__DEBUGGER_ENABLE_FOR = [1];

/*
* 默认语言
* */
ones.default_language = 'zh-cn';

/*
* 后端根目录
* */
ones.remote_base = '../server/';
/*
* 后端Restful接口地址
* */
ones.remote_entry = ones.remote_base + 'gateway.php?s=/';
/*
* 使用接口版本
* */
ones.api_version = 'v_1';
/*
* 消息中心地址
* */
ones.mc_socket = 'ws://'+window.location.hostname+':7610';

/*
* 主框架入口页面
* */
ones.APP_ENTRY = 'app.html';

/*------可配置项目结束------*/

ones.global_module = angular.module("ones.global", []);

ones.company_profile = {};
ones.user_info = {};
ones.system_preference = {};
ones.user_preference = {};

// 常用按键
window.KEY_CODES = {
    DOWN: 40
    , UP: 38
    , ENTER: 13
};

ones.stars_data_source = [
    {value:1, label: '-'},
    {value:2, label: '☆'},
    {value:3, label: '★'},
    {value:4, label: '★☆'},
    {value:5, label: '★★'},
    {value:6, label: '★★☆'},
    {value:7, label: '★★★'},
    {value:8, label: '★★★☆'},
    {value:9, label: '★★★★'},
    {value:10, label: '★★★★☆'},
    {value:11, label: '★★★★★'}
];

ones.app_info = {};
ones.user_info = {};

/*
* bootstrap config
* */
function config_init(apps, callback) {

    var uri = ones.remote_entry+'home/config/bootstrap';

    $.ajax({
        type: "EVENT",
        url: uri,
        beforeSend: function(request) {
            request.setRequestHeader("Client-Language", ones.caches.getItem('user.client_language') || ones.default_language);
            request.setRequestHeader("Token", ones.caches.getItem('user.session_token'));
            request.setRequestHeader("API-Version", ones.api_version);
        },
        success: function(data) {
            for(var k in data) {
                if(k == '__DEBUG__') {
                    continue;
                }
                ones[k] = data[k];
            }

            // 未登录直接访问
            if(window.location.href.indexOf(ones.APP_ENTRY) >= 0 && !ones.company_profile) {
                window.location.href = './';
                return false;
            }

            window.set_debugger_info(uri, data.__DEBUG__);

            // app.html
            if(window.location.href.indexOf(ones.APP_ENTRY) >= 0 && ones.main_include) {
                var include_callback = function() {
                    if(typeof callback == 'function') {
                        callback();
                    }
                };
                ones.main_include.css && ones.include_js(ones.main_include.css);
                if(ones.main_include.js) {
                    ones.include_js(ones.main_include.js, include_callback);
                } else {
                    include_callback();
                }
            } else if(typeof callback == 'function') {
                callback();
            }

            // 设定moment语言包
            moment.locale(ones.default_language)
        },
        error: function(response) {
            if(response.status === 401) {
                ones.caches.removeItem('user.session_token');
                window.location.href = "index.html";
            } else {
                var response_content = {};

                if(response.responseText) {
                    response_content = angular.fromJson(response.responseText);
                }

                if(response_content.error && response_content.msg) {
                    alert(response_content.msg);
                } else {
                    alert('Something is wrong when loading bootstrap config, please open Developer Tool see more details.');
                }
                console.error('You can get help here: http://forum.ng-erp.com');
            }
        }
    });
};

/**
 * 获取配置文件信息
 * */
function C(key) {
    key = key.split('.');
    var app = key.shift();
    

    var cache_key = 'ones.app.config.' + app;
    var config = ones.caches.getItem(cache_key) || {};

    if(!config) {
        return;
    }

    var returnValue = config;

    var len = key.length;

    if (key.length === 0) {
        return config;
    }

    for (var i = 0; i < len; i++) {
        var current = key.shift();
        if (!current in config) {
            throw "can't get app config: " + key.join('.');
            return undefined;
        }
        returnValue = returnValue[current];
    }

    return returnValue;
}

/*
* 载入APP配置
* */
function LoadConfig(app, callback) {
    var config_path = sprintf('%shome/config/app/app_name/%s', ones.remote_entry, app);
    $.ajax({
        type: "EVENT",
        url: config_path,
        beforeSend: function(request) {
            request.setRequestHeader("Client-Language", ones.caches.getItem('user.client_language') || ones.default_language);
            request.setRequestHeader("Token", ones.caches.getItem('user.session_token'));
            request.setRequestHeader("API-Version", ones.api_version);
        },
        success: function(data) {
            window.set_debugger_info(config_path, data.__DEBUG__);
            ones.caches.setItem('ones.app.config.' + app, data);
            if(typeof(callback) === 'function') {
                callback();
            }
        }
    });
}

angular.module("ones.configModule", [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',

        'mgcrea.ngStrap',
        'btford.socket-io',

        'ones.i18nModule',
        'ones.filtersModule',
        'ones.servicesModule',
        'ones.pluginsModule',
        'ones.configModule',
        'ones.debuggerModule',

        'ones.app.account.main',

        'ones.global'
    ])
    .config([
        "$httpProvider",
        "$locationProvider",
        "$alertProvider",
        function ($httpProvider, $locationProvider, $alertProvider) {
            //请求及响应拦截中间件
            var reqInterceptor = ['$q', '$rootScope', function ($q, $rootScope) {
                return {
                    'request': function (config) {
                        $rootScope.ajax_ing = window.ajax_ing = true;
                        return config;
                    },
                    'response': function (response) {
                        var __DEBUG__ = {};
                        if(angular.isArray(response.data)) {
                            __DEBUG__ = (response.data[0] && response.data[0].__DEBUG__) || {};
                        } else {
                            __DEBUG__ = response.data.__DEBUG__ || {};
                        }

                        if(__DEBUG__) {
                            window.set_debugger_info(__DEBUG__.REQUEST_URI, __DEBUG__);
                        }

                        $rootScope.ajax_ing = window.ajax_ing = false;
                        if (response.data.error || parseInt(response.data.error) > 0) {
                            $rootScope.$broadcast('event:serverError', response.data.msg);
                            return $q.reject(response);
                        } else if(response.data.error === 0 && response.data.msg) {
                            window.$emit_root !== undefined && window.$emit_root({
                                event: "global_alert",
                                data : {
                                    type: "success",
                                    content: response.data.msg
                                }
                            });
                            return response;
                        } else {
                            return response;
                        }
                        return response;
                    },
                    'responseError': function (response) {
                        // @todo debug
                        var status = response.status;
                        switch (status) {
                            case 401:
                                $rootScope.$broadcast('event:loginRequired', response.data);
                                break;
                            case 403:
                                $rootScope.$broadcast('event:permissionDenied', response.data);
                                break;
                            case 404:
                                $rootScope.$broadcast('event:itemNotFound', response.data);
                            case 500:
                                $rootScope.$broadcast('event:serverError', response.data);
                                break;
                            default:
                                break;
                        }
                        $rootScope.ajax_ing = window.ajax_ing = false;
                        return $q.reject(response);
                    }
                };
            }];

            //HTML5模式
            if (ones.useHTML5) {
                $locationProvider.html5Mode(true);
            }

            $httpProvider.interceptors.push(reqInterceptor);

            // alert 默认
            angular.extend($alertProvider.defaults, {
                animation: 'am-fade-and-slide-top'
            });

        }
    ])
    .service("ones.dataApiFactory", [
        "$resource", 
        "$injector",
        function($resource, $injector){

            this.resource = {};
            this.model = {};

            this.getResourceInstance = function(opts){
                var extra_methods = {};
                opts.extra_methods = opts.extra_methods || [];
                opts.extra_methods.push('update');
                angular.forEach(opts.extra_methods, function(method) {
                    switch(method) {
                        case "update":
                            extra_methods.update = {
                                method: "PUT"
                            };
                            break;
                        case "api_query":
                            extra_methods.api_query = {
                                method: "EVENT",
                                isArray: true
                            };
                            break;
                        case "api_get":
                            extra_methods.api_get = {
                                method: "EVENT_GET",
                                isArray: false
                            };
                            break;
                    }
                });

                var resUri = sprintf("%s%s/:id", ones.remote_entry, opts.uri);
                return $resource(resUri, opts.opts||{}, extra_methods||{});
            };
            

            this.init = function(group, module) {
                var apiName;
                try {
                    //尝试使用DataAPI模式
                    apiName = group.ucfirst()+"."+module.ucfirst()+"API";

                    this.model = $injector.get(apiName);
                    this.resource = this.model.resource;
                    this.modelName = apiName;
                } catch(e) {
                    ones.DEBUG && console.debug("Load defined data api failed: "+ apiName, e);
                    try {
                        var uri = sprintf("%s%s/%s/:id", ones.remote_entry, group, module);
                        //尝试使用动态定义资源
                        this.resource = $resource(uri, null, {
                            update: {method: "PUT"}, api_query: {method: 'EVENT'}, api_get: {method: 'EVENT_GET'}
                        });
                    } catch(e) {
                        ones.DEBUG && console.error("Can't load data api: "+ group + '/' + module);
                    }
                }

                return this;
            };

        }])

    .run([
        "$http", "$rootScope", "ones.dataApiFactory",
        function($http, $rootScope, dataAPI) {
            $http.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
            //$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            
            // 设置语言
            // @todo 客户端选择语言
            $http.defaults.headers.common["Client-Language"] = ones.caches.getItem('user.client_language') || ones.default_language;
            
            // session key
            var session_token = ones.caches.getItem('user.platform_session_token') || ones.caches.getItem('user.session_token');
            if(session_token) {
                $http.defaults.headers.common["Token"] = session_token;
            }

            // API接口版本
            $http.defaults.headers.common['API-Version'] = ones.api_version;

            $rootScope.user_info = ones.user_info;

        }])
;