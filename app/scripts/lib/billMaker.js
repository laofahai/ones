var billMaker = function($scope, $compile) {
    
    var defaultOpts = {
        minRows: 1,
        dataName: "formData",
        autoFocusNext: true,
        methods: {}
    };
    
    this.opts = $.extend(defaultOpts, $scope.config);
    this.scope = $scope;
    this.compile = $compile;
    
    this.scope[this.opts.dataName] = [];
    
    this.opts.templates = this.templates = {
        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                '<thead><tr><th></th>%(headHTML)s</tr></thead>'+
                '<tbody>%(bodyHTML)s</tbody></table>{{formData}}',
        'bills/fields/rowHead.html': '<td>%(i)s</td><td class="center"><label class="rowHead">'+
                                '<i class="icon icon-plus" ng-click="billAddRow($event.target)"></i> '+
                                '<i class="icon icon-trash" ng-click="billRemoveRow($event.target)"></i> '+
                            '</label></td>',
        'bills/fields/td.html': '<td class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"><label %(event)s></label></td>',
        'bills/fields/text.html' : '<input type="text" value="%s" [defaultAttr] />',
        'bills/fields/number.html' : '<input type="number" value="%s" [defaultAttr] />',
        'bills/fields/email.html' : '<input type="number" value="%s" [defaultAttr] />',
        'bills/fields/typeahead.html': '<input type="typeahead" value="%s" [defaultAttr] />',
        'bills/fields/typeaheadList.html': '<ul class="typeAheadList editAble" ng-show="%(data)s.length">'+
                '<li ng-repeat="%(v)s in %(data)s" type="typeahead" data-typeahead-value="%(v)s.%(valueField)s" '+
                'ng-click="billTypeaheadClick($event)">{{%(v)s.%(labelField)s}}</li></ul>'
    };
    
    this.fieldMaker = new billFieldsMaker(this);
};

billMaker.prototype = {
    makeHTML : function(){
        var head = this.makeHead(this.opts.fieldsDefine);
        var body = [];
        for(var i=0;i<this.opts.minRows;i++) {
            body.push(this.makeRow(this.opts.fieldsDefine));
        }
        this.bindEvents();
        return sprintf(this.templates["bills/box.html"], {
            headHTML : head,
            bodyHTML : body.join("")
        });
    },
    //表头 thead
    makeHead : function(fieldsDefine){
        var html = [];
        var self = this;
        angular.forEach(fieldsDefine, function(item, key){
            if(item.billAble!==false) {
                html.push(sprintf('<th>%s</th>', item.displayName));
            }
        });
        return html.join("");
    },
    //每行数据
    makeRow: function(fieldsDefine, data){
        var self = this;
        var html = [this.templates['bills/fields/rowHead.html']];
        angular.forEach(fieldsDefine, function(item, field){
            if(item.billAble!==false) {
                item.inputType = item.inputType ? item.inputType : "text";
                html.push(sprintf(self.templates['bills/fields/td.html'], {
                    field: field,
                    type: item.inputType,
                    tdClass: false !== item.editAble ? "tdEditAble" : "",
                    event: false !== item.editAble ? 'ng-dblclick="billFieldEdit($event.target)" ' : ""
                }));
            }
        });
        
        return sprintf('<tr>%s</tr>', html.join(""));
        return html.join("");
    },
    //绑定事件
    bindEvents: function(){
        var self = this;
        self.scope.editing = false;
        //创建可编辑区域，element应为label
        this.scope.$parent.billFieldEdit = function(element){
            if(self.scope.editing) {
                return;
            }
            var type = $(element).parent().data("input-type");
            type = type ? type : "text";
            var method = type+"Maker";
            if(method in self.fieldMaker) {
                self.fieldMaker[method]($(element).parent());
            } else {
                return;
            }
            self.scope.editing = true;
        };
        //结束编辑 ele 应为td子元素
        this.scope.$parent.billEndEdit = function(ele, isBlur, data){
            var td = $(ele).parent();
            var next = false;
            var tdEditAbles = td.parent().find(".tdEditAble");
            var tds = [];
            angular.forEach(tdEditAbles, function(td){
                tds.push(td);
            });
            if(tds.length > 1 && tds.indexOf(td[0])+1 < tds.length) {
                next = $(tds).eq(tds.indexOf(td[0])+1);
            }
            var method = $(ele).parent().find(".editAble").eq(0).attr("type")+"SetData";
            //设置数据值至scope
            
            data = data ? data : {};
            if(!(method in self.fieldMaker)) {
                method = "setData";
            }
            setTimeout(function(){
                self.fieldMaker[method](ele, data);
            }, 200);
            
            
            //自动跳到下一可编辑元素
            if(self.opts.autoFocusNext && !isBlur) {
                if(!next) { //当前行无下一元素
                    if(td.parent().index()+1 >= $("#billTable tbody tr").length) { //无更多行 自动增加一行
                        self.scope.$parent.billAddRow(null, true);
                    }
                    next = $("#billTable tbody tr").eq(td.parent().index()+1).find("td.tdEditAble").eq(0);//跳到下一行
                }
                setTimeout(function(){
                    self.scope.$parent.billFieldEdit($(next).find("label"));
                });
            }
            self.scope.editing = false;
        };
        //键盘按下事件，event应该发生在input元素上
        this.scope.$parent.billFieldKeyDown = function(event) {
            var inputType = $(event.target).parent().data("input-type");
            var method = inputType+"OnKeyDown" ;
            if(method in self.fieldMaker) {
                self.fieldMaker[method](event, self.opts.fieldsDefine[$(event.target).parent().data("bind-model")]);
            }
            if(event.keyCode == "13") {
                self.scope.$parent.billEndEdit(event.target, false);
            }
        };
        //增删行
        this.scope.$parent.billAddRow = function(element, isTbody) {
            var html = self.makeRow(self.opts.fieldsDefine);
//            console.log(html);
            html = self.compile(html)(self.scope.$parent);
            if(true === isTbody) {
                $("#billTable tbody").append(html);
            } else {
                $(element).parent().parent().parent().before(html);
            }
        };
        this.scope.$parent.billRemoveRow = function(element) {
            if($("#billTable tbody tr").length < 3) {
                alert("at least 2 rows");
                return;
            }
            $(element).parents("tr").remove();
        };
        //监听typeahead类型点击事件
        this.scope.billTypeaheadClick = function(event) {
            var ele = $(event.target);
            var td = ele.parent().parent();
//            console.log(this.scope.billEndEdit);
            self.scope.$parent.billEndEdit(td.find("ul.editAble"), false, {
                label: ele.html(),
                value: ele.data("typeahead-value")
            });
        };
    }
};

var billFieldsMaker = function(bill){
    this.opts = bill.opts;
    this.scope = bill.scope;
    this.compile = bill.compile;
    
    this.opts.defaultAttr = 'class="editAble" ng-blur="billEndEdit($event.target, true)" ng-keydown="billFieldKeyDown($event)"';
};
billFieldsMaker.prototype = {
    textMaker: function(element){
        var html = sprintf(this.opts.templates['bills/fields/text.html'], $(element).text());
        this.initInput(element, html);
    },
    numberMaker: function(element){
        var html = sprintf(this.opts.templates['bills/fields/number.html'], $(element).text());
        this.initInput(element, html);
    },
    typeaheadMaker: function(element){
        var html = sprintf(this.opts.templates['bills/fields/typeahead.html'], $(element).text());
        this.initInput(element, html);
    },
    typeaheadOnKeyDown: function(event, field){
        var td = $(event.target).parent();
        var self = this;
        setTimeout(function(){
            switch(event.keyCode) {
                case "13":
                    break;
                case "38": //方向上
                    break;
                case "40": //方向下
                    break;
            }
            if(field.dataSource && event.target.value) {
                field.dataSource.query({typeahead: event.target.value}).$promise.then(function(data){
                    self.scope.typeaheadData = data;
                    var html = sprintf(self.opts.templates['bills/fields/typeaheadList.html'], {
                        data: "typeaheadData",
                        v: "v",
                        valueField: "id",
                        labelField: "name"
                    });
                    td.find("ul.typeAheadList").remove();
                    td.append(self.compile(html)(self.scope));
                    
                });
            }
        });
    },
    typeaheadSetData: function(element, data){
//        console.log(arguments);
        var parent = $(element).parent();
        var index = parent.parent().index();
        var field = parent.data("bind-model");
        parent.find("label").html(data);
        parent.find(".editAble").remove();
        console.log(this.scope[this.opts.dataName][index]);
        console.log(data);
        this.scope[this.opts.dataName][index][field] = data.label;
    },
    //设置表单数据 element应为input
    setData: function(element) {
        var data = $(element).val();
        var index = $(element).parent().parent().index();
        var field = $(element).parent().data("bind-model");
        if(!this.scope[this.opts.dataName][index]) {
            this.scope[this.opts.dataName][index] = {};
        }
        var parent = $(element).parent();
//        console.log(parent);
        parent.find("label").html(data);
        parent.find(".editAble").remove();
        
        this.setScopeData(field, data, index);
        this.scope[this.opts.dataName][index][field] = data;
    },
    setScopeData: function(field, data, index) {
        if(!this.scope[this.opts.dataName][index]) {
            this.scope[this.opts.dataName][index] = {};
        }
        
        console.log(this.scope[this.opts.dataName][0]);
        
        this.scope[this.opts.dataName][index][field] = data;
    },
    // init input element应该为td
    initInput: function(element, html) {
        html = html.replace("[defaultAttr]", this.opts.defaultAttr);
        html = this.compile(html)(this.scope.$parent);
//        console.log("initInput:", element);
        $(element).append(html);
        $(element).find(".editAble").focus();
    }
};