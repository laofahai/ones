angular.module("ones.filtersModule", [])
    /**
     * 默认值
     * */
    .filter("default", [function(){
        return function(source, placeholder) {
            return source || placeholder;
        };
    }])
    /**
     * 转驼峰
     * */
    .filter("camel", [function() {
        return function(str) {
            if(!angular.isString(str)) return;
            return camelCase(str).ucfirst();
        }
    }])
    .filter("camelSpace", [function() {
        return function(str) {
            if(!angular.isString(str)) return;
            return camelCaseSpace(str).ucfirst();
        }
    }])
    /**
     * sprintf
     * */
    .filter("sprintf", [function() {
        return function(str, params) {
            return apply_sprintf(str, params);
        }
    }])
    /*
    * 返回应用locale name
    * */
    .filter("to_app_name", [function() {
        return function(app_alias) {
            return to_app_name(app_alias);
        };
    }])
    /**
     * 输出错误信息
     * */
    .filter("toError", [function() {
        return function(field, config) {
            if (!field || field.$valid) {
                return;
            }

            var errors = {};

            var tips = [];
            try {
                angular.forEach(field.$error, function(err, k){
                    if(!err || k === "false") {
                        return;
                    }

                    if(!(k in errors)) {
                        tips.push(_("common.ERRORS."+k));
                    } else {
                        tips.push(
                            apply_sprintf(_("common.ERRORS."+k), [])
                        );
                    }
                });
            } catch(e) {}

            return tips.join(", ");
        }
    }])

    .filter('to_date_object', [function() {
        return function(str) {
            return new Date(str);
        }
    }])
    /*
    * 获得时间的项目，年，月，日等
    * */
    .filter('get_date_item', [function() {
        return function(date, item) {
            var d = new Date(date);

            switch(item) {
                case "year":
                    return d.getFullYear();
                break;
                case "month":
                    var month = d.getMonth()+1;
                    if(month < 10) {
                        month = '0'+month;
                    }
                    return month;
                break;
                case "day":
                    var day = d.getDate();
                    if(day < 10) {
                        day = '0' + day;
                    }
                    return day;
            }

        }
    }])

    .filter('to_open_frame_link', [function() {
        return function(link, title, label) {
            return sprintf(
                '<a href="%s" onclick="return false;">%s</a>',
                link,
                label
            );
        };
    }])

    .filter('to_human_date', [function() {
        return function(time) {
            return sprintf('<span title="%s">%s</span>', String(time), moment(new Date(time)).fromNow());
        }
    }])

;