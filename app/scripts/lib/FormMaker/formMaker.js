/**
 * 通用表单生成器，依赖formFieldsMaker
 * */

var formMaker = function($scope, defaultData) {
    this.scope = $scope;
    defaultData = $scope.$parent.defaultData || {};
    var config = $scope.$parent.config || {};
    if (!config.fieldsDefine) {
        return false;
    }

    var defaultOpts = {
        class: "form-horizontal",
        submitAction: "doSubmit",
        fieldsDefine: {},
        templates: this.loadDefaultTemplate(),
        dataBindName: ""
    };
    
    this.opts = $.extend(true, defaultOpts, config);
    //this.fieldsMaker
    this.fm = new formFieldsMaker($scope);
    
    this.opts.dataBindName = this.opts.dataBindName ? this.opts.dataBindName : this.opts.name+"Data";
    
    $scope.$parent[this.opts.dataBindName] = $scope.$parent[this.opts.dataBindName] || {};
    $scope[this.opts.dataBindName] = {};
};

formMaker.prototype = {
    makeHTML : function() {
        var self = this;
        var fieldHTML, finalHTML = [];
        var boxHTML = this.opts.templates["commonForm/box.html"];
        angular.forEach(this.opts.fieldsDefine, function(struct, field){
            struct.class = "width-100";
            struct["ng-model"] = self.opts.dataBindName+"."+field;
            if(struct.required !== false) {
                struct.required = "required";
            } else {
                delete(struct.required);
            }
            if(!struct.hideInForm && !struct.primary) {
                fieldHTML = self.fm.maker.factory(field, struct, self.scope);
                if (false != fieldHTML) {
                    finalHTML.push(sprintf(boxHTML, {
                        formname: self.opts.name,
                        fieldname: struct.name ? struct.name : field,
                        label: struct.displayName,
                        inputHTML: fieldHTML
                    }));
                }
            }
        });
        
        finalHTML.push(this.makeActions());
        return sprintf(self.opts.templates["commonForm/form.html"], {
            name : self.opts.name,
            html : finalHTML.join("")
        });
    },
    makeActions: function(){
        return sprintf(this.opts.templates["commonForm/footer.html"], {
            action: this.opts.submitAction,
            langsubmit: "i18n.lang.actions.submit",
            langreset: "i18n.lang.actions.reset",
            langreturn: "i18n.lang.actions.return"
        });
    },
    loadDefaultTemplate: function(){
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
                    '<div class="help-block col-xs-12 col-sm-reset" ng-hide="!%(formname)s.%(fieldname)s.$dirty||%(formname)s.%(fieldname)s.$valid">{{%(formname)s.%(fieldname)s.$error}}</div>' +
                    '</div>',
            "text": '<input type="text" %s />',
            "number": '<input type="number" %s />',
            "select": '<select %(attr)s ng-options="%(value)s as %(name)s for %(key)s in %(data)s"></select>',
        };
    }
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