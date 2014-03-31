/**
 * 通用表单字段生成器
 * */

var formFieldsMaker = function(scope, opts) {
    
    var defaultOpts = {};
    
    
    this.scope = scope;
    this.opts = $.extend(defaultOpts, opts);
    this.templates = {
        "fields/text": '<input type="text" %s />',
        "fields/number": '<input type="number" %s />',
        "fields/select": '<select %(attr)s ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s"><option><option></select>',
        'fields/email' : '<input type="number" %s />',
        'fields/typeahead' : '<input type="text" '+
                'typeahead-on-select="showselected(this)" typeahead-editable="false" typeahead-min-length="0" '+
                'typeahead="%(key)s as %(key)s.label for %(key)s in %(data)s($viewValue)| filter:{label:$viewValue}" %(attr)s />'
    };
    
    this.maker = new fieldsMakerFactory(this, this.opts);
};

var fieldsMakerFactory = function(fieldsMaker, opts) {
    this.$parent = fieldsMaker;
    var defaultOpts = {
        multi: false
    };
    this.opts = $.extend(defaultOpts, opts);
    this.opts.disabledAttrs = ["dataSource"];
};
fieldsMakerFactory.prototype = {
    
    /**
     * 字段生成器工厂方法，
     * @name 字段name
     * @fieldDefine 字段属性
     * @scope 作用域对象
     * @events 单个字段的事件列表，eg: ngBlur: doTextEndEdit; 
     * */
    factory: function(name, fieldDefine, $scope, value, events) {
        var method = "_"+(fieldDefine.inputType ? fieldDefine.inputType : "text");
        //事件绑定
        if(events) {
            angular.forEach(events, function(func, event){
                fieldDefine[event] = func+"($event)";
            });
        }
        if(value) {
            fieldDefine.value = value;
        }
        if(!fieldDefine.displayName) {
            fieldDefine.displayName = this.$parent.scope.$parent.i18n.lang[name];
        }
        if (method in this) {
            return this[method](name, fieldDefine, $scope);
        } else {
            return false;
        }
    },
    
    /**
     * 生成字段属性
     * 包括表单项的事件绑定
     * */
    _attr: function(name, fieldDefine) {
        var k, v, html = [];
        //多行数据 如bill
        if(!this.opts.multi) {
            fieldDefine.id = "id_"+name;
            fieldDefine.name = name;
        }
        for (k in fieldDefine) {
            if(this.opts.disabledAttrs.indexOf(k) >= 0) {
                continue;
            }
            v = fieldDefine[k];
            html.push(sprintf('%s="%s"', k, v));
        }
        return html.join(" ");
    },
    _text: function(name, fieldDefine) {
        return sprintf(this.$parent.templates["fields/text"], this._attr(name, fieldDefine));
    },
    //数字
    _number: function(name, fieldDefine) {
        fieldDefine["min"] = undefined != fieldDefine["min"] ? fieldDefine["min"] : 0;
        return sprintf(this.$parent.templates["fields/number"], this._attr(name, fieldDefine));
    },
    //多选框
    _checkbox: function(name, fieldDefine){
        
    },
    //下拉框选择
    _select: function(name, fieldDefine, $scope){
        var valueField = fieldDefine.valueField || "id";
        var nameField  = fieldDefine.nameField  || "name";
        var data = [];
        
        fieldDefine.chosen = "chosen";
        fieldDefine.remoteDataField = fieldDefine.remoteDataField || name;
        
        if(fieldDefine.dataSource instanceof Array) {
            for(var item in fieldDefine.dataSource) {
                if(!item || !fieldDefine.dataSource[item][valueField]) {
                    continue;
                }
                data.push({
                    value : fieldDefine.dataSource[item][valueField],
                    name  : fieldDefine.dataSource[item][nameField]
                });
            }
//            delete(fieldDefine.dataSource);
            $scope.$parent[fieldDefine.remoteDataField+"sSelect"] = data;
            
        } else if(typeof(fieldDefine.dataSource) == "function") {
            var queryParams = fieldDefine.queryParams || {};
            fieldDefine.dataSource.query(queryParams).$promise.then(function(result){
                angular.forEach(result, function(item){
                    data.push({
                        value : item[valueField],
                        name  : item[nameField]
                    });
                });
                $scope.$parent[fieldDefine.remoteDataField+"sSelect"]= data;
            });
        }
        
        return sprintf(this.$parent.templates["fields/select"], {
            attr: this._attr(name, fieldDefine),
            key : name+"item",
            data: fieldDefine.remoteDataField+"sSelect"
        });
        
        
    },
    _typeahead: function(name, fieldDefine, $scope) {
        var methodName = name+"DataSource";
        var nameField = fieldDefine.nameField || "name";
        var valueField= fieldDefine.valueField|| "id";
        var queryParams;
        $scope.$parent[methodName] = function(val){
            queryParams = $.extend(fieldDefine.queryParams || {}, {typeahead: val});
            return fieldDefine.dataSource.query(queryParams).$promise.then(function(data){
                var dataList = [];
                angular.forEach(data, function(item){
                    dataList.push({
                        label:item[nameField],
                        value:item[valueField],
                        category: item.goods_category_id,
                        factory_code: item.factory_code
                    });
                });
                return dataList;
            });
        };
        //设置默认值
        if(fieldDefine.value) {
            $scope.$parent[name+"TAIT"] = fieldDefine.value;
        }
        //@todo 设置默认显示
//        if(fieldDefine.autoQuery) {
//            $scope.$parent.versionTAIT = "*";
//            $scope.$parent[methodName]();
//        }
        
        var html = sprintf(this.$parent.templates["fields/typeahead"], {
            key: name+"item",
            data: methodName,
            attr: this._attr(name, fieldDefine)
        });
        return html;
    }
};

//var fieldsDefine = {"id":{"primary":true,"displayName":"ID"},"factory_code":{"displayName":"基础原厂编码"},"name":{"displayName":"名称"},"pinyin":{"displayName":"拼音首字母","required":false},"measure":{"displayName":"计量单位"},"price":{"displayName":"价格","inputType":"number","value":0},"goods_category_id":{"displayName":"分类","inputType":"select","valueField":"id","nameField":"prefix_name","ng-change":"loadDataModel()","listable":false,"dataSource":[{"id":"1","pid":"0","name":"主节点（不要删除）","bind_model":"0","pinyin":null,"lft":"1","rgt":"14","listorder":"99","bind_model_name":null,"prefix":"","deep":0,"prefix_name":"主节点（不要删除）"},{"id":"2","pid":"1","name":"成品系列","bind_model":"1","pinyin":"CPXL","lft":"2","rgt":"5","listorder":"99","bind_model_name":"基本产品模型","prefix":"|---","deep":1,"prefix_name":"|---成品系列"},{"id":"4","pid":"2","name":"成品A","bind_model":"1","pinyin":"CPA","lft":"3","rgt":"4","listorder":"98","bind_model_name":"基本产品模型","prefix":"|------","deep":2,"prefix_name":"|------成品A"},{"id":"3","pid":"1","name":"成品零部件","bind_model":"0","pinyin":"CPLBJ","lft":"6","rgt":"9","listorder":"99","bind_model_name":null,"prefix":"|---","deep":1,"prefix_name":"|---成品零部件"},{"id":"5","pid":"3","name":"成品零部件A","bind_model":"0","pinyin":"CPLBJA","lft":"7","rgt":"8","listorder":"99","bind_model_name":null,"prefix":"|------","deep":2,"prefix_name":"|------成品零部件A"},{"id":"6","pid":"1","name":"零部件系列","bind_model":"0","pinyin":"LBJXL","lft":"10","rgt":"13","listorder":"99","bind_model_name":null,"prefix":"|---","deep":1,"prefix_name":"|---零部件系列"},{"id":"7","pid":"6","name":"零部件A","bind_model":"1","pinyin":"LBJA","lft":"11","rgt":"12","listorder":"99","bind_model_name":"基本产品模型","prefix":"|------","deep":2,"prefix_name":"|------零部件A"}]},"category_name":{"displayName":"分类","inputType":false,"hideInForm":true},"store_min":{"displayName":"库存下限","inputType":"number","value":0},"store_max":{"displayName":"库存上限","inputType":"number","value":0}};
//
//var test = new formFieldsMaker();
//var rs = test.maker.factory("id", fieldsDefine.goods_category_id, {});
//
//console.log(rs);