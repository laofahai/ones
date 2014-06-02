/**
 * 模拟PHP获得GET数据
 * */
function uriParamsGet(key) {
    var args = new Object();
    var query = location.search.substring(1);//获取查询串   
    var pairs = query.split("&");//在逗号处断开   
    for (var i = 0; i < pairs.length; i++)
    {
        var pos = pairs[i].indexOf('=');//查找name=value   
        if (pos == -1)
            continue;//如果没有找到就跳过   
        var argname = pairs[i].substring(0, pos);//提取name   
        var value = pairs[i].substring(pos + 1);//提取value   
        args[argname] = unescape(value);//存为属性   
    }
    return key ? args[key] : args;
}
//解析参数  pid/1/other/value
function parseParams(str) {
    if(!str) {
        return {};
    }
    var params = {};
    str = str.split("/");
    if(str.length > 1) {
//        console.log(str);
        for(var i=0;i<str.length;i++) {
            if((i+1) % 2 == 0) {
                continue;
            }
//            console.log(str[1]);
            params[str[i]] = str[i+1];
        }
    }
    return params;
}

Array.prototype.in_array = function(e)
{
    for (i = 0; i < this.length; i++)
    {
        if (this[i] == e)
            return true;
    }
    return false;
}
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val)
            return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

String.prototype.ucfirst = function() {

    // Split the string into words if string contains multiple words.
    var x = this.split(/\s+/g);

    for (var i = 0; i < x.length; i++) {

        // Splits the word into two parts. One part being the first letter,
        // second being the rest of the word.
        var parts = x[i].match(/(\w)(\w*)/);

        // Put it back together but uppercase the first letter and
        // lowercase the rest of the word.
        x[i] = parts[1].toUpperCase() + parts[2];
    }

    // Rejoin the string and return.
    return x.join(' ');
};

/**
 * 格式化表单中得数据，比如input number之类的
 * */
var dataFormat = function(fieldsDefine, data) {
    if (data instanceof Array) {
        for (var i = 0; i < data.length; i++) {
            data[i] = dataFormat(fieldsDefine, data[i]);
        }

        return data;
    }
    for (var f in fieldsDefine) {
        var struct = fieldsDefine[f];
        switch (struct.inputType) {
            case "number":
                if (false === isNaN(data[f])) {
                    data[f] = Number(data[f]);
                }
                break;
            default:
                data[f] = data[f];
                break;
        }
    }
    return data;
};


//获取当前input的上下文数据
var getInputContext = function(element) {
    var context = {};
    context.ele = $(element);
    context.eleValue = context.ele.val();
    context.td = context.ele.parent();
    context.label = context.td.find("label");
    context.tr = context.td.parent();
    context.trid = context.index = context.tr.data("trid");
    context.field = context.td.data("bind-model");
    context.inputType = context.td.data("input-type");
    context.inputAble = context.td.find("input");

    return context;
};
var getLabelContext = function(element) {
    var context = {};
    context.ele = $(element);
    context.td = context.ele.parent();
    context.tr = context.td.parent();
    context.trid = context.index = context.tr.data("trid");
    context.field = context.td.data("bind-model");
    context.text = context.ele.text();
    context.inputType = context.td.data("input-type");
    context.inputAble = context.td.find("input");
    return context;
};


/* 
 DoubleClick row plugin
 NG-GRID row 双击插件
*/
function ngGridDoubleClick() {
    var self = this;
    self.$scope = null;
    self.myGrid = null;

    // The init method gets called during the ng-grid directive execution.
    self.init = function(scope, grid, services) {
        // The directive passes in the grid scope and the grid object which
        // we will want to save for manipulation later.
        self.$scope = scope;
        self.myGrid = grid;
        // In this example we want to assign grid events.
        self.assignEvents();
    };
    self.assignEvents = function() {
        // Here we set the double-click event handler to the header container.
        self.myGrid.$viewport.on('dblclick', self.onDoubleClick);
    };
    // double-click function
    self.onDoubleClick = function(event) {
        self.myGrid.config.dblClickFn(self.$scope.gridSelected[0]);
        self.$scope.$apply();
    };
}




function rmbToBig(currencyDigits) {
// Constants:
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
    var CN_SYMBOL = "人民币 ";
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
//        alert("Empty input!");
        return "";
    }
    if (currencyDigits.match(/[^,.\d]/) != null) {
//        alert("Invalid characters in the input string!");
        return "";
    }
    if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
//        alert("Illegal format of digit number!");
//        return "";
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


/*! sprintf.js | Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro> | 3 clause BSD license */(function(e) {
    function r(e) {
        return Object.prototype.toString.call(e).slice(8, -1).toLowerCase()
    }
    function i(e, t) {
        for (var n = []; t > 0; n[--t] = e)
            ;
        return n.join("")
    }
    var t = function() {
        return t.cache.hasOwnProperty(arguments[0]) || (t.cache[arguments[0]] = t.parse(arguments[0])), t.format.call(null, t.cache[arguments[0]], arguments)
    };
    t.format = function(e, n) {
        var s = 1, o = e.length, u = "", a, f = [], l, c, h, p, d, v;
        for (l = 0; l < o; l++) {
            u = r(e[l]);
            if (u === "string")
                f.push(e[l]);
            else if (u === "array") {
                h = e[l];
                if (h[2]) {
                    a = n[s];
                    for (c = 0; c < h[2].length; c++) {
                        if (!a.hasOwnProperty(h[2][c]))
                            throw t('[sprintf] property "%s" does not exist', h[2][c]);
                        a = a[h[2][c]]
                    }
                } else
                    h[1] ? a = n[h[1]] : a = n[s++];
                if (/[^s]/.test(h[8]) && r(a) != "number")
                    throw t("[sprintf] expecting number but found %s", r(a));
                switch (h[8]) {
                    case"b":
                        a = a.toString(2);
                        break;
                    case"c":
                        a = String.fromCharCode(a);
                        break;
                    case"d":
                        a = parseInt(a, 10);
                        break;
                    case"e":
                        a = h[7] ? a.toExponential(h[7]) : a.toExponential();
                        break;
                    case"f":
                        a = h[7] ? parseFloat(a).toFixed(h[7]) : parseFloat(a);
                        break;
                    case"o":
                        a = a.toString(8);
                        break;
                    case"s":
                        a = (a = String(a)) && h[7] ? a.substring(0, h[7]) : a;
                        break;
                    case"u":
                        a >>>= 0;
                        break;
                    case"x":
                        a = a.toString(16);
                        break;
                    case"X":
                        a = a.toString(16).toUpperCase()
                }
                a = /[def]/.test(h[8]) && h[3] && a >= 0 ? "+" + a : a, d = h[4] ? h[4] == "0" ? "0" : h[4].charAt(1) : " ", v = h[6] - String(a).length, p = h[6] ? i(d, v) : "", f.push(h[5] ? a + p : p + a)
            }
        }
        return f.join("")
    }, t.cache = {}, t.parse = function(e) {
        var t = e, n = [], r = [], i = 0;
        while (t) {
            if ((n = /^[^\x25]+/.exec(t)) !== null)
                r.push(n[0]);
            else if ((n = /^\x25{2}/.exec(t)) !== null)
                r.push("%");
            else {
                if ((n = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t)) === null)
                    throw"[sprintf] huh?";
                if (n[2]) {
                    i |= 1;
                    var s = [], o = n[2], u = [];
                    if ((u = /^([a-z_][a-z_\d]*)/i.exec(o)) === null)
                        throw"[sprintf] huh?";
                    s.push(u[1]);
                    while ((o = o.substring(u[0].length)) !== "")
                        if ((u = /^\.([a-z_][a-z_\d]*)/i.exec(o)) !== null)
                            s.push(u[1]);
                        else {
                            if ((u = /^\[(\d+)\]/.exec(o)) === null)
                                throw"[sprintf] huh?";
                            s.push(u[1])
                        }
                    n[2] = s
                } else
                    i |= 2;
                if (i === 3)
                    throw"[sprintf] mixing positional and named placeholders is not (yet) supported";
                r.push(n)
            }
            t = t.substring(n[0].length)
        }
        return r
    };
    var n = function(e, n, r) {
        return r = n.slice(0), r.splice(0, 0, e), t.apply(null, r)
    };
    e.sprintf = t, e.vsprintf = n
})(typeof exports != "undefined" ? exports : window);