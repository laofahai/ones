var billMaker = function($scope, $compile) {
    
    var defaultOpts = {
        minRows: 1,
        dataName: "formData",
        autoFocusNext: true,
        fieldsDefine: {
            goods: {
                displayName: "商品",
                inputType: "typeahead"
            },
            measure: {
                displayName: "计量单位",
                editAble: false,
            },
            price: {
                displayName: "单价",
                inputType: "number"
            },
            name: {
                inputType: "number",
                displayName: "数量"
            },
            total: {
                displayName: "合计",
                editAble: false
            }
        },
        methods: {}
    };
    
    this.opts = defaultOpts;
    this.scope = $scope;
    this.compile = $compile;
    
    this.scope[this.opts.dataName] = [];
    
    this.opts.templates = this.templates = {
        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                '<thead><tr><th></th>%(headHTML)s</tr></thead>'+
                '<tbody>%(bodyHTML)s</tbody></table>',
        'bills/fields/rowHead.html': '<td class="center"><label class="rowHead">'+
                                '<i class="icon icon-plus" ng-click="billAddRow($event.target)"></i> '+
                                '<i class="icon icon-trash" ng-click="billRemoveRow($event.target)"></i> '+
                            '</label></td>',
        'bills/fields/td.html': '<td %(event)s class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"></td>',
        'bills/fields/text.html' : '<input type="text" value="%s" [defaultAttr] />',
        'bills/fields/number.html' : '<input type="number" value="%s" [defaultAttr] />',
        'bills/fields/email.html' : '<input type="number" value="%s" [defaultAttr] />',
        'bills/fields/typeahead.html': '<input type="typeahead" value="%s" [defaultAttr] />'
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
        angular.forEach(fieldsDefine, function(item){
            html.push(sprintf('<th>%s</th>', item.displayName));
        });
        return html.join("");
    },
    //每行数据
    makeRow: function(fieldsDefine, data){
        var self = this;
        var html = [this.templates['bills/fields/rowHead.html']];
        angular.forEach(fieldsDefine, function(item, field){
            item.inputType = item.inputType ? item.inputType : "text";
            html.push(sprintf(self.templates['bills/fields/td.html'], {
                field: field,
                type: item.inputType,
                tdClass: false !== item.editAble ? "tdEditAble" : "",
                event: false !== item.editAble ? 'ng-dblclick="billFieldEdit($event.target)" ' : ""
            }));
        });
        
        return sprintf('<tr>%s</tr>', html.join(""));
        return html.join("");
    },
    //绑定事件
    bindEvents: function(){
        var self = this;
        this.scope.$parent.billFieldEdit = function(element){
            var type = $(element).data("input-type");
            type = type ? type : "text";
            var method = type+"Maker";
            if(method in self.fieldMaker) {
                self.fieldMaker[method](element);
            } else {
                return;
            }
        };
        //结束编辑
        this.scope.$parent.billEndEdit = function(ele, isBlur){
            var value = $(ele).val();
            var parent = $(ele).parent();
            var next = false;
            var tdEditAbles = parent.parent().find(".tdEditAble");
            var tds = [];
            angular.forEach(tdEditAbles, function(td){
                tds.push(td);
            });
            if(tds.length > 1 && tds.indexOf(parent[0])+1 < tds.length) {
                next = $(tds).eq(tds.indexOf(parent[0])+1);
            }
            //设置数据值至scope
            self.setData(ele, value);
            $(ele).parent().html(value);
            //自动跳到下一可编辑元素
            if(self.opts.autoFocusNext && !isBlur) {
                if(!next) { //当前行无下一元素
                    if(parent.parent().index()+1 >= $("#billTable tbody tr").length) { //无更多行 自动增加一行
                        self.scope.$parent.billAddRow(null, true);
                    }
                    next = $("#billTable tbody tr").eq(parent.parent().index()+1).find("td.tdEditAble").eq(0);//跳到下一行
                }
                self.scope.$parent.billFieldEdit(next);
            }
            
        };
        this.scope.$parent.billFieldKeyDown = function(event) {
            var inputType = $(event.target).parent().data("input-type");
            var method = inputType+"OnKeyDown" ;
            if(method in self.fieldMaker) {
                self.fieldMaker[method](event, self.opts.fieldsDefine[$(event.target).parent().data("bind-model")]);
            }
            if(event.keyCode == "13") {
                self.scope.$parent.billEndEdit(event.target);
            }
        };
        this.scope.$parent.billAddRow = function(element, isTbody) {
            var html = self.makeRow(self.opts.fieldsDefine);
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
        
        //@todo 绑定默认输入框完成之后的动作
    },
    //设置表单数据
    setData: function(element, data) {
        var index = $(element).parent().parent().index();
        var field = $(element).parent().data("bind-model");
        if(!this.scope[this.opts.dataName][index]) {
            this.scope[this.opts.dataName][index] = {};
        }
        this.scope[this.opts.dataName][index][field] = data;
        
        console.log(this.scope.formData);
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
        setTimeout(function(){
            console.log(field);
            console.log(event.target.value);
        });
        
    },
    initInput: function(element, html) {
        html = html.replace("[defaultAttr]", this.opts.defaultAttr);
        html = this.compile(html)(this.scope.$parent);
        $(element).append(html);
        $(element).find(".editAble").focus();
    }
};