/**
 * ONES Config 定义
 * */

/*------可配置项目开始------*/
/*
* 是否开启调试模式
* */
ones.DEBUG = true;
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
ones.mc_socket = 'ws://127.0.0.1:7610';

/*
* 主框架入口页面
* */
ones.APP_ENTRY = 'app.html';

/*------可配置项目结束------*/


ones.global_module = angular.module("ones.global", []);

// 常用按键
KEY_CODES = {
    DOWN: 40
    , UP: 38
    , ENTER: 13
};

ones.app_info = {};
ones.user_info = {};

/*
* bootstrap config
* */
function config_init(apps, callback) {
    $.ajax({
        type: "EVENT",
        url: ones.remote_entry+'home/config/bootstrap',
        beforeSend: function(request) {
            request.setRequestHeader("Client-Language", ones.caches.getItem('user.client_language') || ones.default_language);
            request.setRequestHeader("Token", ones.caches.getItem('user.session_token'));
            request.setRequestHeader("API-Version", ones.api_version);
        },
        success: function(data) {
            for(var k in data) {
                ones[k] = data[k];
            }

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
                window.location.href = "index.html";
            } else {
                alert('Something is wrong when loading bootstrap config, please open Developer Tool see more details.');
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

        'ones.app.account.main'
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
                        return config;
                    },
                    'response': function (response) {
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
        "Account.UserPreferenceAPI",
        function($http, $rootScope, dataAPI, user_preference_api) {
            $http.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
            //$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            
            // 设置语言
            // @todo 客户端选择语言
            $http.defaults.headers.common["Client-Language"] = ones.caches.getItem('user.client_language') || ones.default_language;
            
            // session key
            $http.defaults.headers.common["Token"] = ones.caches.getItem('user.session_token');

            // API接口版本
            $http.defaults.headers.common['API-Version'] = ones.api_version;

            $rootScope.user_info = ones.user_info;


        }])
;