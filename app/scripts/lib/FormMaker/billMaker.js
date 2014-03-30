var billFormMaker = function($scope, $compile){
    
    var defaultOpts = {
        minRows: 9,
        dataName: "formData",
        autoFocusNext: true,
        methods: {}
    };
    
    this.opts = $.extend(defaultOpts, $scope.config);
    this.scope = $scope;
    this.compile = $compile;
    this.scope.$parent[this.opts.dataName] = this.scope[this.opts.dataName] = [];
    
    this.opts.templates = this.templates = {
        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                '<thead><tr><th>#</th><th></th>%(headHTML)s</tr></thead>'+
                '<tbody>%(bodyHTML)s</tbody><tfoot><tr>%(footHTML)s</tr></tfoot></table>{{$parent.formData}}',
        'bills/fields/rowHead.html': '<th>%(i)s</th><td class="center"><label class="rowHead">'+
                                '<i class="icon icon-plus" ng-click="billAddRow($event.target)"></i> '+
                                '<i class="icon icon-trash" ng-click="billRemoveRow($event.target)"></i> '+
                            '</label></td>',
        'bills/fields/td.html': '<td class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"><label %(event)s></label></td>',
        'bills/fields/typeaheadList.html': '<ul class="typeAheadList editAble" />'+
                '<li ng-repeat="%(v)s in %(data)s" type="typeahead" data-typeahead-value="%(v)s.%(valueField)s" '+
                'ng-click="billTypeaheadClick($event)">{{%(v)s.%(labelField)s}}</li></ul>'
        
    };
    
    this.fm = new formFieldsMaker($scope, {
        multi: true
    });
    
};

billFormMaker.prototype = {
    makeHTML: function() {
        this.bindEvents(this.scope);
        return sprintf(this.opts.templates["bills/box.html"], {
            headHTML : this.makeHead(this.opts.fieldsDefine),
            bodyHTML : this.makeBody(this.opts.fieldsDefine),
            footHTML : this.makeFoot(this.opts.fieldsDefine)
        });
    },
    makeHead: function(fieldsDefine){
        var html = [];
        angular.forEach(fieldsDefine, function(item){
            if(item.billAble!==false) {
                html.push(sprintf('<th>%s</th>', item.displayName));
            }
        });
        return html.join("");
    },
    makeBody: function(fieldsDefine){
        var html = [];
        for(var i=0;i<this.opts.minRows;i++) {
            html.push(this.makeRow(fieldsDefine, i));
            this.scope.$parent[this.opts.dataName][i] = {};
        }
        return html.join("");
    },
    makeFoot: function(fieldsDefine){
        var html = ['<td colspan="2" align="center">'+this.scope.$parent.i18n.lang.total+'</td>'];
        angular.forEach(fieldsDefine, function(item, field){
            if(item.billAble !== false) {
                if(item.totalAble) {
                    html.push(sprintf('<td class="tdTotalAble" tdname="%s" id="tdTotalAble%s">0</td>', field, field));
                } else {
                    html.push("<td></td>");
                }
            }
        });
        return sprintf("<tr>%s</tr>", html.join(""));
    },
    makeRow: function(fieldsDefine,i){
        var self = this;
        var html = [this.opts.templates['bills/fields/rowHead.html']];
        angular.forEach(fieldsDefine, function(item, field){
            if(item.billAble!==false) {
                item.inputType = item.inputType ? item.inputType : "text";
                html.push(sprintf(self.templates['bills/fields/td.html'], {
                    field: field,
                    type: item.inputType,
                    tdClass: false !== item.editAble ? "tdEditAble" : "",
                    event: false !== item.editAble ? 'ng-click="billFieldEdit($event.target)"' : ""
                }));
            }
        });
        
        this.maxTrId = i;
        return sprintf('<tr data-trid="%s">%s</tr>', i, sprintf(html.join(""), {
            i: i+1
        }));
    },
    bindEvents: function(scope){
        var self = this;
        scope.$parent.billFieldEdit = function(ele){
            var context = self.getLabelContext(ele);
            
            //已经存在
            
            if(context.td.find(".editAble").length) {
                context.td.find(".editAble").removeClass("hide").eq(0).focus();
                return;
            }
            var struct = self.opts.fieldsDefine[context.field];
            struct.class="width-100 editAble";
            struct["ng-model"] = sprintf("%s[%d].%s", self.opts.dataName, context.trid, context.field);
            if(struct.editAbleRequire) {
                if(struct.editAbleRequire instanceof Array) {
                    for(var i=0;i<struct.editAbleRequire.length;i++) {
                        struct.editAbleRequire[i];
                        if(!scope[self.opts.dataName][context.trid] || !scope[self.opts.dataName][context.trid][struct.editAbleRequire[i]]) {
                            return false;
                        }
                    }
                } else {
                    if(!scope[self.opts.dataName][context.trid] || !scope[self.opts.dataName][context.trid][struct.editAbleRequire]) {
                        return false;
                    }
                }
            }
            
            //支持的事件列表
            var eventsList = ["blur", "click", "keydown", "focus"];
            var events = {};
            angular.forEach(eventsList, function(e){
                var m = sprintf("on%s%s%s", context.field.ucfirst(), context.inputType.ucfirst(), e.ucfirst());
                if(m in scope.$parent) {
                    events["ng-"+e] = m;
                } else {
                    m = sprintf("on%s%s", context.inputType.ucfirst(), e.ucfirst());
                    if(m in scope.$parent) {
                        events["ng-"+e] = m;
                    }
                }
            }); 
            
            var html = self.fm.maker.factory(context.field, struct, scope, context.text, events);
            html = self.compile(html)(scope.$parent);
            context.td.append(html);
            context.td.find(".editAble").focus(function(){
                var method = "after"+struct.inputType.ucfirst()+"Focus";
                if(method in scope.$parent) {
                    scope.$parent[method]($(this), struct);
                }
            }).select();
            
            return;
//            var td = $(ele).parent();
//            var trid = td.parent().data("trid");
//            var field = td.data("bind-model");
//            var type = td.data("input-type");
//            var struct = self.opts.fieldsDefine[field];
//            struct.class="width-100 editAble";
//
//            //支持的事件列表
//            var eventsList = ["blur", "click", "keydown", "focus"];
//            var events = {};
//            angular.forEach(eventsList, function(e){
//                var m = sprintf("on%s%s%s", field.ucfirst(), type.ucfirst(), e.ucfirst());
//                if(m in scope.$parent) {
//                    events["ng-"+e] = m;
//                } else {
//                    m = sprintf("on%s%s", type.ucfirst(), e.ucfirst());
//                    if(m in scope.$parent) {
//                        events["ng-"+e] = m;
//                    }
//                }
//            }); 
//            var html = self.fm.maker.factory(field, struct, scope, $(ele).text(), events);
//            html = self.compile(html)(scope.$parent);
//            td.append(html);
//            td.find(".editAble").focus(function(){
//                var method = "after"+struct.inputType.ucfirst()+"Focus";
//                if(method in scope.$parent) {
//                    scope.$parent[method]($(this), struct);
//                }
//            }).select();
        };
        
        //结束编辑 ele 应为td子元素
        /**
         * @todo 回调方法
         * */
        scope.$parent.billEndEdit = function(td, isBlur){
            var next = false;
            var tdEditAbles = td.parent().find(".tdEditAble");
//            console.log(tdEditAbles);
            var tds = [];
            angular.forEach(tdEditAbles, function(td){
                tds.push(td);
            });
            if(tds.length > 1 && tds.indexOf(td[0])+1 < tds.length) {
                next = $(tds).eq(tds.indexOf(td[0])+1);
            }
            
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
        
        //增删行
        scope.$parent.billAddRow = function(element, isTbody) {
            var html = self.makeRow(self.opts.fieldsDefine, self.maxTrId+1);
            html = self.compile(html)(self.scope.$parent);
            if(true === isTbody) {
                $("#billTable tbody").append(html);
            } else {
                $(element).parent().parent().parent().before(html);
            }
            self.reIndexTr();
        };
        scope.$parent.billRemoveRow = function(element) {
            if($("#billTable tbody tr").length < 3) {
                alert("at least 2 rows");
                return;
            }
            var tr = $(element).parents("tr");
            scope[self.opts.dataName][tr.data("trid")] = {};
            tr.remove();
            self.reIndexTr();
        };
        
        //不同字段不同事件
        scope.$parent.onTextBlur = function(event) {
            var ele = $(event.target);
            scope.$parent.billEndEdit(ele.parent(), true);
            self.setData(ele, ele.val(), true);
        };
        scope.$parent.onTextKeydown = function(event) {
            if(event.keyCode == 9 && !event.shiftKey) {
                window.event.returnValue=false;
                var ele = $(event.target);
                self.setData(ele, ele.val());
            } else if(event.keyCode == 13) {
                var ele = $(event.target);
                self.setData(ele, ele.val());
            } else if((event.shiftKey) && (event.keyCode==9)) {
                window.event.returnValue=false;
                console.log("shift tab");
            }
        };
        scope.$parent.onNumberBlur = function(event) {
            var ele = $(event.target);
            scope.$parent.billEndEdit(ele.parent(), true);
            self.setNumberData(ele, ele.val());
        };
        scope.$parent.onNumberKeydown = function(event) {
            if(event.keyCode == 9 && !event.shiftKey) {
                window.event.returnValue=false;
                var ele = $(event.target);
                self.setNumberData(ele, ele.val());
            } else if(event.keyCode == 13) {
                var ele = $(event.target);
                self.setNumberData(ele, ele.val());
            } else if((event.shiftKey) && (event.keyCode==9)) {
                window.event.returnValue=false;
                console.log("shift tab");
            }
        };
        scope.$parent.onTypeaheadBlur = function(event){
            var ele = $(event.target);
            self.setTypeaheadData(ele, self.scope, true);
        };
        scope.$parent.onTypeaheadKeydown = function(event) {
            if(event.keyCode == 9) {
                window.event.returnValue=false;
                var ele = $(event.target);
                self.setTypeaheadData(ele, self.scope);
            } else if(event.keyCode == 13) {
                var ele = $(event.target);
                self.setTypeaheadData(ele, self.scope);
            }
        };
        scope.$parent.onStockTypeaheadBlur = function(event){
            self.scope.$parent.onTypeaheadBlur(event);
            setTimeout(function(){
                var context = self.getInputContext(event.target);
                var tmp = self.scope[self.opts.dataName][context.trid];
                self.opts.res.stockProduct.get({
                    factory_code_all: sprintf("%s-%s-%s", tmp.goods_id.factory_code, tmp.standard.value, tmp.version.value),
                    id: self.scope[self.opts.dataName][context.trid].stock.value
                }).$promise.then(function(data){
                    context.tr.find("[data-bind-model=store_num] label").text(data.num||0);
    //                self.scope[self.opts.dataName][context.trid].store_num=data.num;
                });
            },100);
        };
        
    },
    //获取当前input的上下文数据
    getInputContext : function(element){
        var context = {};
        context.ele = $(element);
        context.eleValue = context.ele.val();
        context.td = context.ele.parent();
        context.label = context.td.find("label");
        context.tr = context.td.parent();
        context.trid = context.index = context.tr.data("trid");
        context.field = context.td.data("bind-model");
        context.inputType = context.td.data("input-type");
        return context;
    },
    getLabelContext: function(element) {
        var context = {};
        context.ele = $(element);
        context.td =  context.ele.parent();
        context.tr = context.td.parent();
        context.trid = context.index = context.tr.data("trid");
        context.field = context.td.data("bind-model");
        context.text = context.ele.text();
        context.inputType = context.td.data("input-type");
        return context;
    },
    //重置TR的行数，并且重新计算数据
    reIndexTr: function() {
        var trs = $("#billTable tbody tr");
        var index = 1;
        angular.forEach(trs, function(tr){
            $(tr).find("th:first").html(index);
            index++;
        });
    },
    setNumberData: function(element, data, isBlur) {
        if($(element).attr("totalAble")) {
            var total = 0;
            var context = this.getInputContext(element);
            angular.forEach(this.scope[this.opts.dataName], function(item){
                if(context.field in item) {
                    total += parseFloat(item[context.field]);
                }
            });
            total = total.toFixed(2);
            $("#tdTotalAble"+context.field).text(total);
            this.scope.$parent.formMetaData["total"+context.field] = total;
            this.setData(element, data, isBlur);
        } else {
            this.setData(element, data, isBlur);
        }
        
    },
    setData: function(element, data, isBlur) {
        var context = this.getInputContext(element);
        context.ele.remove();
        context.label.html(data);
//        
//        //设置在作用于中得数据对象
//        if(!this.scope[this.opts.dataName][context.trid]) {
//            this.scope[this.opts.dataName][context.trid] = {};
//        }
//        this.scope[this.opts.dataName][context.trid][context.field] = data;
//        this.scope.$emit("billFieldEdited", this.scope[this.opts.dataName]);
//        
        this.scope.$parent.billEndEdit(context.td, isBlur);
    },
    setTypeaheadData: function(ele, scope, isBlur) {
        var val;
        var context = this.getInputContext(ele);
        var self = this;
        setTimeout(function(){
            if(scope.$parent[self.opts.dataName][context.trid][context.field]) {
                val = context.ele.val();
            } else {
                context.ele.val('');
            }
            context.td.find("label").text(val);
            context.td.find(".editAble").addClass("hide");
            scope.$parent.billEndEdit(context.td, isBlur);
        }, 200);
//        
//        return;
//        setTimeout(function(){
//            
//            
//            if(!(context.dataName in scope.$parent)) {
//                context.td.find("label").text("");
//                context.td.find("*").not("label").remove();
//                return;
//            }
//            
//            if(!self.scope[self.opts.dataName][context.trid]) {
//                self.scope[self.opts.dataName][context.trid] = {};
//            }
//            if(typeof(self.scope.$parent[context.dataName]) == "object") {
//                if(!self.scope[self.opts.dataName][context.trid]) {
//                    self.scope[self.opts.dataName][context.trid] = {};
//                }
//                self.scope[self.opts.dataName][context.trid][context.field] = scope.$parent[context.dataName];
//                context.label.text(context.eleValue);
//            }
//            
//            scope.$parent.$broadcast("billFieldEdited", scope[self.opts.dataName]);
//            
//            context.td.find("*").not("label").remove();
//            delete(scope.$parent[context.dataName]);
//            
//            scope.$parent.billEndEdit(context.td);
//        }, timeout);
        
    }
};