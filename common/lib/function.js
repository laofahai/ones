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

/**
 * 根据APP和MODULE获得真实的数据API名称
 * */
var toAPIName = function(group, module) {
    return group.ucfirst()+"."+module.ucfirst()+"API";
};

var toDate = function(timestamp, noTime) {
    if(!timestamp) {
        return;
    }

    if(String(timestamp).length > 10) {
        timestamp = timestamp/1000;
    }

    var d = new Date(parseInt(timestamp) * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();

    var rs = sprintf("%s-%s-%s", year, month, date);
    if(noTime !== true && parseInt(noTime)===0) {
        rs = rs+ sprintf(" %s:%s:%s", hour, minute, second);
    }

    return rs;
}

function notify(content, title, iconUrl) {

    if(!content) {
        return;
    }

    title = title || "ONES Notify";
    iconUrl = iconUrl || "./common/statics/images/logo_mini_blue.png";

    if (window.webkitNotifications) {
        //chrome老版本
        if (window.webkitNotifications.checkPermission() == 0) {
            var notif = window.webkitNotifications.createNotification(iconUrl, title, content);
            notif.display = function() {}
            notif.onerror = function() {}
            notif.onclose = function() {}
            notif.onclick = function() {this.cancel();}
            notif.replaceId = 'Meteoric';
            notif.show();
        } else {
            window.webkitNotifications.requestPermission($jy.notify);
        }
    }
    else if("Notification" in window){
        // 判断是否有权限
        if (Notification.permission === "granted") {
            var notification = new Notification(title, {
                "icon": iconUrl,
                "body": content,
            });
        }
        //如果没权限，则请求权限
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
                // Whatever the user answers, we make sure we store the
                // information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                //如果接受请求
                if (permission === "granted") {
                    var notification = new Notification(title, {
                        "icon": iconUrl,
                        "body": content,
                    });
                }
            });
        }
    }
}

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
/**
 * base64编码
 * @param {Object} str
 */
function base64encode(str){
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}
/**
 * base64解码
 * @param {Object} str
 */
function base64decode(str){
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c1 == -1);
        if (c1 == -1)
            break;
        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c2 == -1);
        if (c2 == -1)
            break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        }
        while (i < len && c3 == -1);
        if (c3 == -1)
            break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        }
        while (i < len && c4 == -1);
        if (c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}

//是否空对象
var isEmptyObject=function(v){
    if(Object.prototype.toString.apply(v)!=='[object Object]')return false;
    for(var p in v)if(v.hasOwnProperty(p))return false;
    return true
};

//app view
//获得应用的view路径
var appView = function(viewPath, app){
    if(app) {
        return sprintf("apps/%s/views/%s", app, viewPath);
    } else {
        return "apps/"+viewPath;
    }

}

//判断APP是否加载
var isAppLoaded = function(app) {
    return ones.BaseConf.LoadedApps.indexOf(app) >= 0;
};

function HTMLEncode(html)
{
    var temp = document.createElement ("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    var output = temp.innerHTML;
    temp = null;
    return output;
}
function HTMLDecode(text)
{
    var temp = document.createElement("div");
    temp.innerHTML = text;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

/**
 * 根据KEY返回语言包字段，优先使用当前APP的语言包
 * */
var toLang = function(key, section, $rootScope) {
    section = section ? "lang."+section : "lang";
    var appAlias;
    try {
        appAlias = $rootScope.currentPage.app;
    } catch(e) {
        appAlias = "HOME";
    }
    var langStr = "";
    var appSection = "App"+appAlias.ucfirst();
    var lang;

    langStr = sprintf("i18n.%s.%s.%s", section, appSection, key);

    try {
        lang = $rootScope.$eval(langStr);
        if(lang === undefined) {

            langStr = sprintf("i18n.%s.%s", section, key);
            lang = $rootScope.$eval(langStr);
        }
    } catch(e) {
        return key;
    }


    //通过递归合并的数组元素会追加成为新数组，返回最后一个元素
    if(angular.isArray(lang)) {
        return lang.pop();
    } else {
//        console.log(langStr);
        return lang === undefined ? key : lang;
    }
}

//判断资源对象是否是数据API
var isDataApi = function(resource) {
    return "api" in resource && typeof(resource.api) == "function";
};

//获得resource请求之后的promise
var getDataApiPromise = function(dataSource, method, params) {
    var promise;
    var args = Array.prototype.slice.call(arguments, 2);

    try {
        if(method in dataSource && typeof(dataSource[method]) === "function") {
            promise = dataSource[method].apply(null, args).$promise;
        } else {
            promise = dataSource.api[method].apply(null, args).$promise;
        }
    } catch(e) {
        console.log(e);
    }

//    try {
//        //首先尝试使用dataAPI.method
//        //dataSource为resource对象时或者dataAPI.method时
//        promise = dataSource[method].apply(null, args).$promise;
//        //promise = dataSource[method](params).$promise;
//    } catch(e) {
//        //尝试使用dataAPI.api.method
//        promise = dataSource.api[method].apply(null, args).$promise;
////        promise = dataSource.api[method](params).$promise;
//    }
    return promise;
};

var nl2br = function(str) {
    return str.replace(/\n/ig, "<br />");
};

//过滤数据对象/数组，仅保留需包含的字段
var filterDataFields = function(data, fields) {
    fields = angular.isArray(fields) ? fields : ["id", "name", "alias"];

    if(angular.isArray(data)) {
        var returned = [];
        var tmp;
        for(var i=0; i<data.length; i++) {
            tmp = {};
            for(var j=0;j<fields.length;j++) {
                if(data[i][fields[j]] !== undefined) {
                    tmp[fields[j]] = data[i][fields[j]];
                }
            }
            returned.push(tmp);
        }
        return returned;
    } else {
        var returned = {};
        for(var i=0;i<fields.length;i++) {
            if(data[fields[i]] !== undefined) {
                returned[fields[i]] = data[fields[i]];
            }
        }
        return returned;
    }
}

var toLower = function(str) {
    return str.toLowerCase();
}
/* *
 * 根据权限节点返回当前的节点名称
 * 首先判断是否存在真实的节点路径
 * 如果不存在根据add,read,edit,delete四种操作处理
 */
var getAuthNodeName = function(node, $rootScope) {

    var source = node;
    if($rootScope.i18n.lang[node]) {
        return $rootScope.i18n.lang[node];
    }

    node = node.split(".");
    var action = node[2];


    node = sprintf("%s.%s", node[0], node[1]);

    if($rootScope.i18n.lang[node]) {
        return sprintf($rootScope.i18n.lang[node], $rootScope.i18n.lang.actions[action]);
    }

    return source;

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
Array.prototype.delRepeat=function(){
    var newArray=[];
    var provisionalTable = {};
    for (var i = 0, item; (item= this[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
}

/**
 * 按照某字段排序数组
 * array.sort(arraySortBy(id));
 * */
var arraySortBy = function(name, minor)
{
    return function(o, p)
    {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p)
        {
            a = o[name] || 99;
            b = p[name] || 99;
            if (a === b) {return typeof minor==='function' ? minor(o,p):0;}
            if (typeof a === typeof b) { return a < b ? -1 : 1;}
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error when sorting array.");
        }
    }
}


var reIndex = function(data) {
    var a = [];
    angular.forEach(data, function(item){
        a.push(item);
    });
    return a;
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
        var checkbox = $(event.target).parents(".ngRow").find("input[type='checkbox']:first");
//        console.log(checkbox);
        self.myGrid.config.dblClickFn(self.$scope.gridSelected[0]);
        self.$scope.$apply();
    };
}


/**
 * MD5
 * */
var md5 = {

    createHash: function(str) {

        var xl;

        var rotateLeft = function(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        };

        var addUnsigned = function(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        };

        var _F = function(x, y, z) {
            return (x & y) | ((~x) & z);
        };
        var _G = function(x, y, z) {
            return (x & z) | (y & (~z));
        };
        var _H = function(x, y, z) {
            return (x ^ y ^ z);
        };
        var _I = function(x, y, z) {
            return (y ^ (x | (~z)));
        };

        var _FF = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var _GG = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var _HH = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var _II = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        var convertToWordArray = function(str) {
            var lWordCount;
            var lMessageLength = str.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = new Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };

        var wordToHex = function(lValue) {
            var wordToHexValue = "",
                wordToHexValue_temp = "",
                lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexValue_temp = "0" + lByte.toString(16);
                wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
            }
            return wordToHexValue;
        };

        var x = [],
            k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22,
            S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20,
            S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23,
            S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;

        //str = this.utf8_encode(str);
        x = convertToWordArray(str);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;

        xl = x.length;
        for (k = 0; k < xl; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }

        var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

        return temp.toLowerCase();
    }

};


/**
 * 人民币大写
 * */
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
        return f.join("").replace("[PCT]", "%");
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