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
    // 返回余额方向符号
    .filter("to_balance_direction_icon", [function() {
        return function(direction) {
            var $class = 'fa fa-';
            switch(direction) {
                case 1:
                    $class += 'plus-square text-success';
                    break;
                case 2:
                    $class += 'minus-square text-danger';
                    break;
                default:
                    return direction;
            }

            return sprintf('<i class="%s"></i> ', $class);
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
    .filter('to_locale_date', [function(){
        return function(time_object, type) {
            type = type || 'lll';
            return moment(time_object).format(type);
        };
    }])
    .filter('to_human_date', [function() {
        return function(time) {
            return sprintf('<span title="%s">%s</span>', String(time), moment(new Date(time)).fromNow());
        };
    }])
    // 返回星级
    .filter('to_stars', [function() {
        return function(value) {
            var color;
            var html = [];

            if(value >= 8) {
                color = 'primary';
            } else if(value >= 5) {
                color = 'success';
            } else if(value < 3) {
                color = 'default';
            } else if(value === 0) {
                color = 'muted';
            }

            var fa = '<i class="fa text-'+color+' fa-%s"></i>';
            if(value === 1) {
                html.push(sprintf(fa, ''));
            } else {
                var stars = parseInt(value / 2) - 1;
                for(var i=0;i<stars;i++) {
                    html.push(sprintf(fa, 'star'));
                }
                if(value % 2 === 0) {
                    html.push(sprintf(fa, 'star-o'));
                }
            }

            return html.join('');
        };
    }])

    // 返回ONES变量
    .filter('to_ones_var', [function() {
        return function(str) {
            var return_var = ones;

            str = str.split('.');

            for(var i=0;i<str.length;i++) {
                return_var = return_var[str[i]];
            }

            return return_var;

        }
    }])

    // 人民币转大写
    .filter("money_to_cny", [function() {
        return function(currencyDigits) {
            var MAXIMUM_NUMBER = 99999999999.99;
// Predefine the radix characters and currency symbols for output:
            var CN_ZERO = "零";
            var CN_ONE = "壹";
            var CN_TWO = "贰";
            var CN_THREE = "叁";
            var CN_FOUR = "肆";
            var CN_FIVE = "伍";
            var CN_SIX = "陆";
            var CN_SEVEN = "柒";
            var CN_EIGHT = "捌";
            var CN_NINE = "玖";
            var CN_TEN = "拾";
            var CN_HUNDRED = "佰";
            var CN_THOUSAND = "仟";
            var CN_TEN_THOUSAND = "万";
            var CN_HUNDRED_MILLION = "亿";
            var CN_SYMBOL = "人民币";
            var CN_DOLLAR = "元";
            var CN_TEN_CENT = "角";
            var CN_CENT = "分";
            var CN_INTEGER = "整";

// Variables:
            var integral; // Represent integral part of digit number.
            var decimal; // Represent decimal part of digit number.
            var outputCharacters; // The output result.
            var parts;
            var digits, radices, bigRadices, decimals;
            var zeroCount;
            var i, p, d;
            var quotient, modulus;

// Validate input string:
            currencyDigits = currencyDigits.toString();
            if (currencyDigits == "") {
                alert("Empty input!");
                return "";
            }
            if (currencyDigits.match(/[^,.\d]/) != null) {
                alert("Invalid characters in the input string!");
                return "";
            }
            if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
                alert("Illegal format of digit number!");
                return "";
            }

// Normalize the format of input digits:
            currencyDigits = currencyDigits.replace(/,/g, ""); // Remove comma delimiters.
            currencyDigits = currencyDigits.replace(/^0+/, ""); // Trim zeros at the beginning.
// Assert the number is not greater than the maximum number.
            if (Number(currencyDigits) > MAXIMUM_NUMBER) {
                alert("Too large a number to convert!");
                return "";
            }

// Process the coversion from currency digits to characters:
// Separate integral and decimal parts before processing coversion:
            parts = currencyDigits.split(".");
            if (parts.length > 1) {
                integral = parts[0];
                decimal = parts[1];
// Cut down redundant decimal digits that are after the second.
                decimal = decimal.substr(0, 2);
            }
            else {
                integral = parts[0];
                decimal = "";
            }
// Prepare the characters corresponding to the digits:
            digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
            radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
            bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
            decimals = new Array(CN_TEN_CENT, CN_CENT);
// Start processing:
            outputCharacters = "";
// Process integral part if it is larger than 0:
            if (Number(integral) > 0) {
                zeroCount = 0;
                for (i = 0; i < integral.length; i++) {
                    p = integral.length - i - 1;
                    d = integral.substr(i, 1);
                    quotient = p / 4;
                    modulus = p % 4;
                    if (d == "0") {
                        zeroCount++;
                    }
                    else {
                        if (zeroCount > 0)
                        {
                            outputCharacters += digits[0];
                        }
                        zeroCount = 0;
                        outputCharacters += digits[Number(d)] + radices[modulus];
                    }
                    if (modulus == 0 && zeroCount < 4) {
                        outputCharacters += bigRadices[quotient];
                    }
                }
                outputCharacters += CN_DOLLAR;
            }
// Process decimal part if there is:
            if (decimal != "") {
                for (i = 0; i < decimal.length; i++) {
                    d = decimal.substr(i, 1);
                    if (d != "0") {
                        outputCharacters += digits[Number(d)] + decimals[i];
                    }
                }
            }
// Confirm and return the final output string:
            if (outputCharacters == "") {
                outputCharacters = CN_ZERO + CN_DOLLAR;
            }
            if (decimal == "") {
                outputCharacters += CN_INTEGER;
            }
            outputCharacters = CN_SYMBOL + outputCharacters;
            return outputCharacters;
        }
    }])

;