'use strict';
(function(){
    angular.module("ones.common.filters", [])
        .filter("sprintf", function() {
            var filterFun = function(fmt, argv, _argv) {
                return sprintf(fmt, argv, _argv);
            };

            return filterFun;

        })
        .filter("rmbToBig", function() {
            return function(amount) {
                amount = amount || 0.00;
                return rmbToBig(amount);
            };
        })
        .filter('propsFilter', function() {
            return function(items, props) {
                var out = [];

                if (angular.isArray(items)) {
                    items.forEach(function(item) {
                        var itemMatches = false;

                        var keys = Object.keys(props);
                        for (var i = 0; i < keys.length; i++) {
                            var prop = keys[i];
                            var text = props[prop].toLowerCase();
                            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                                itemMatches = true;
                                break;
                            }
                        }

                        if (itemMatches) {
                            out.push(item);
                        }
                    });
                } else {
                    // Let the output be the input untouched
                    out = items;
                }

                return out;
            };
        })
        .filter("dateFormat", function() {
            return function(timestamp, noTime) {
                return toDate(timestamp, noTime);
            };
        })
        .filter("idFormat", function(){
            return function(id, pre) {
                return "#"+id;
            };
        })
        /**
         * 加个冒号
         * */
        .filter("colon", function(){
            return function(str, CJK) {
                return str + (CJK ? "：" : ":");
            };
        })
        //label 包围
        .filter("labelAble", function(){
            return function(str, cls) {
                if(!str || str === undefined) {
                    return "";
                }
                return sprintf('<label class="label label-%s">%s</label>', cls, str);
            }
        })
        //.filter("append|prepend")
        .filter("lang", [function(){
            return function(str, section, def) {
                if(!str) {
                    return def;
                }

                var rs = toLang(str, section);

                if(rs === undefined || str.slice(0-rs.length).toLowerCase() === rs) {
                    return def ? def : rs;
                } else {
                    return rs;
                }
            };
        }])
        .filter("toError", ["$rootScope", function($rootScope){
            return function(field) {
                if(!field) {
                    return;
                }

                var errors = field.$error;
                if(!errors) {
                    return;
                }

                var tips = [];
                try {
                    var i18n = l('lang');
                    angular.forEach(errors, function(err, k){
                        if(!err || k === "false") {
                            return;
                        }
//                        tips.push(sprintf(toLang(k, "errors", $rootScope), field.$viewValue));
                        if(k.toLowerCase() in i18n.errors) {
                            tips.push(i18n.errors[k]);
                        } else {
                            tips.push(k);
                        }

                    });
                } catch(e) {}
                return tips.join(", ");
            };
        }])
        .filter("toLink", [function(){
            return function(text, link) {
                if(!link) {
                    return text;
                }
                var pre = "";
                if(!ones.useHTML5) {
                    pre = "#/";
                }
                return sprintf('<a href="%s%s">%s</a>', pre, link, text);
            };
        }])
        .filter("toImg", [function(){
            return function(src) {
                var allow = ["png", "jpg", "jpeg", "gif"];
                if(!src || allow.indexOf(src.split(".").pop().toLowerCase()) < 0) {
                    return;
                }
                return sprintf('<img src="%s" class="img-responsive" />', ones.basePath+src);
            };
        }])
        .filter("toAuthNodeName", ["$rootScope", function($rootScope){
            return function(text) {
                return getAuthNodeName(text, $rootScope);
            };
        }])
        .filter('toTrustedHTML', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }])
        .filter('toYesOrNo', [function () {
            return function (text) {
                var lang = text == 1 ? "yes" : "no";
                return l("lang."+lang);
            };
        }])
        .filter("toCurrency", [function(){
            return function(text) {
                return text ? "￥"+String(parseFloat(text).toFixed(2)) : "";
            }
        }])
        .filter("toDateObject", [function(){
            return function(timestamp){
                if(String(timestamp) <= 10) {
                    timestamp = parseInt(timestamp)*1000;
                }

                return new Date(timestamp);
            };
        }])
        .filter("nl2br", [function(){
            return function(str){
                return nl2br(str);
            };
        }])
        .filter("colorize", [function(){
            return function(str, color) {
                return sprintf('<span class="%s">%s</span>', color, str);
            };
        }])
        .filter("default", [function(){
            return function(source, placeholder) {
                return source || placeholder;
            }
        }])
    ;

})();
