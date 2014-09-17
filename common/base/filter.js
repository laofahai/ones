'use strict';
(function(){
    angular.module("ones.common.filters", [])
        .filter("sprintf", function() {
            var filterFun = function(fmt, argv, _argv) {
                return sprintf(fmt, argv, _argv);
            };

            return filterFun;

//            var filterfun = function(person, sep) {
//                sep = sep || " ";
//                person = person || {};
//                person.first = person.first || "";
//                person.last = person.last || "";
//                return person.first + sep + person.last;
//            };
//            return filterfun;
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
            return function(id) {
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
        //.filter("append|prepend")
        .filter("lang", ["$injector", function($injector){
            return function(str) {
                var rootScope = $injector.get("$rootScope");
                return rootScope.i18n.lang[str] || str;
            };
        }])
        .filter("toError", ["$rootScope", function($rootScope){
            return function(errors) {
//                    console.log(errors);
                if(!errors) {
                    return;
                }

                var tips = [];
                try {
                    var i18n = $rootScope.i18n.lang;
                    angular.forEach(errors, function(err, k){
                        if(!err || k === "false") {
                            return;
                        }
                        if(k in i18n.errors) {
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
            return function(text, link, target) {
                target = target || "_self";
                return sprintf('<a href="%s" target="%s">%s</a>', link, target, text);
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
        .filter('toYesOrNo', ['$rootScope', function ($rootScope) {
            return function (text) {
                var lang = text == 1 ? "yes" : "no";
                return toLang(lang, "", $rootScope);
            };
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
    ;

})();
