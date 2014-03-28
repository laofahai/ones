var formMaker = function($scope, defaultData) {
    defaultData = $scope.$parent.defaultData || {};
    var config = $scope.$parent.config || {};
    if (!config.fieldsDefine) {
        return false;
    }
    
    //字段方法列表
    formMaker.methods = {};
    formMaker.init();

    var defaultOpts = {
        class: "form-horizontal",
        submitAction: "doSubmit",
        fieldsDefine: {},
        templates: formMaker.loadDefaultTemplate()
    };
    
    

    formMaker.opts = $.extend(true, defaultOpts, config);
    
//    console.log(JSON.stringify(formMaker.opts.fieldsDefine));
    
    var field, dataBindName, fieldHTML, boxHTML, finalHTML = [];
    boxHTML = formMaker.opts.templates["commonForm/box.html"];
    dataBindName = formMaker.opts.name + "Data";
    $scope.$parent[dataBindName] = $scope.$parent[dataBindName] || {};
    $scope[dataBindName] = {};
    
    for (var key in formMaker.opts.fieldsDefine) {
        field = formMaker.opts.fieldsDefine[key];
        if (field.primary || field.hideInForm) {
            continue;
        }
        /**
         * 默认
         * */
        field.required = false === field.required ? false : true;
        
        field.inputType = field.inputType ? field.inputType : "text";
        field["ng-model"] = dataBindName + "." +key;
        /**
         * 绑定默认数据
         * */
        if(key in defaultData) {
            
            field.value = $scope.$parent[dataBindName][key] = defaultData[key];
        } else if("value" in field) {
            field.value = $scope.$parent[dataBindName][key] = field.value;
        }
        
        /***/
        fieldHTML = formMaker.fieldFactory(key, field, $scope);

        if (!fieldHTML) {
            continue;
        }

        finalHTML.push(sprintf(boxHTML, {
            formname: formMaker.opts.name,
            fieldname: field.name ? field.name : key,
            label: field.displayName,
            inputHTML: fieldHTML
        }));
    }
    finalHTML.push(formMaker.makeActions());
    return sprintf(formMaker.opts.templates["commonForm/form.html"], {
        name : formMaker.opts.name,
        html : finalHTML.join("")
    });
};

/**
 * 默认表单模板
 * */
formMaker.loadDefaultTemplate = function() {
    return {
        "commonForm/form.html": '<form class="form-horizontal" name="%(name)s" novalidate>%(html)s</form>',
        "commonForm/footer.html": '<div class="clearfix form-actions">' +
                '<div class="col-md-offset-2 col-md-9">' +
                    '<button id="submitbtn" class="btn btn-primary" ng-click="%(action)s();" type="button">' +
                        '<i class="icon-ok bigger-110"></i>' +
                        '{{%(langsubmit)s}}' +
                    '</button>' +
                    '&nbsp; &nbsp; &nbsp;' +
                    '<button class="btn" type="reset">' +
                        '<i class="icon-undo bigger-110"></i>' +
                        '{{%(langreset)s}}' +
                    '</button>' +
                    '&nbsp; &nbsp; &nbsp;' +
                    '<button class="btn btn-info" onclick="history.back()">' +
                        '<i class="icon-undo bigger-110"></i>' +
                        '{{%(langreturn)s}}' +
                    '</button>' +
                '</div>' +
                '</div>',
        "commonForm/box.html": '<div class="form-group" ng-class="{\'has-error\': %(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid}">' +
                '<label class="col-sm-3 control-label no-padding-right">%(label)s</label>' +
                '<div class="col-xs-12 col-sm-4">%(inputHTML)s</div>' +
                '<div class="help-block col-xs-12 col-sm-reset" ng-show="%(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid">{{%(formname)s.%(fieldname)s.$error}}</div>' +
                '</div>',
        "text": '<input type="text" %s />',
        "number": '<input type="number" %s />',
        "select": '<select %(attr)s ng-options="%(value)s as %(name)s for %(key)s in %(data)s"></select>',
    };
};

formMaker.init = function() {
    /**
     * 生成表单action按钮
     * */
    formMaker.makeActions = function() {
        return sprintf(formMaker.opts.templates["commonForm/footer.html"], {
            action: formMaker.opts.submitAction,
            langsubmit: "i18n.lang.actions.submit",
            langreset: "i18n.lang.actions.reset",
            langreturn: "i18n.lang.actions.return"
        });
    };
    
    /**
     * 生成字段属性
     * */
    formMaker.makeAttrs = function(name, fieldDefine) {
        var k, v, html = [];
        var defaultAttr = {
            class: "width-100",
            required: "true",
            id: "id_" + name,
            name: name
        };
        var attrOpts = $.extend(defaultAttr, fieldDefine);
        for (k in attrOpts) {
            v = attrOpts[k];
            html.push(sprintf('%s="%s"', k, v));
        }
        return html.join(" ");
    };

    /**
     * 各字段定义
     * */
    formMaker.methods.text = 
    formMaker.methods = {
        //普通文本
        text : function(name, fieldDefine) {
            return sprintf(formMaker.opts.templates["text"], formMaker.makeAttrs(name, fieldDefine));
        },
        //数字
        number: function(name, fieldDefine) {
            fieldDefine["min"] = undefined != fieldDefine["min"] ? fieldDefine["min"] : 0;
            return sprintf(formMaker.opts.templates["number"], formMaker.makeAttrs(name, fieldDefine));
        },
        //下拉框选择
        select: function(name, fieldDefine, $scope){
            var valueField = fieldDefine.valueField || "id";
            var nameField  = fieldDefine.nameField  || "name";
            var data = [];
            for(var item in fieldDefine.dataSource) {
                if(!item || !fieldDefine.dataSource[item][valueField]) {
                    continue;
                }
                data.push({
                    value : fieldDefine.dataSource[item][valueField],
                    name  : fieldDefine.dataSource[item][nameField]
                });
            }
            delete(fieldDefine.dataSource);
            $scope.$parent[name+"s"] = data;
            var rs= sprintf(formMaker.opts.templates["select"], {
                attr: formMaker.makeAttrs(name, fieldDefine),
                key : name+"item",
                data: name+"s",
                name: name+"item.name",
                selectPlease: "select please",
                value: name+"item.value"
            });
            return rs;
        }
    };

    /**
     * 字段工厂方法
     * */
    formMaker.fieldFactory = function(name, fieldDefine, $scope) {
        if (fieldDefine.inputType in formMaker.methods) {
            return formMaker.methods[fieldDefine.inputType](name, fieldDefine, $scope);
        } else {
            return false;
        }
    };
};

/**
 * 数据格式化方法
 * eg: "123.2" => 123.2
 * select字段
 * */
formMaker.dataFormat = function(fieldsDefine, data) {
    
    var getArrayValue = function(data, value, valueField, getField){
        for(var i=0;i<data.length;i++) {
            if(String(data[i][valueField]) == String(value)) {
                return data[i][getField];
            }
        }
        return false;
    };
    var ResultData = {};
    for(var f in fieldsDefine) {
        var struct = fieldsDefine[f];
        switch(struct.inputType) {
            case "number":
                if(false === isNaN(data[f])) {
                    ResultData[f] = Number(data[f]);
                }
                break;
            default:
                ResultData[f] = data[f];
                break;
        }
    }
    return ResultData;
};



