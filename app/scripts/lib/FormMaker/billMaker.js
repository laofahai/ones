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
    this.scope[this.opts.dataName] = [];
    
    this.opts.templates = this.templates = {
        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                '<thead><tr><th>#</th><th></th>%(headHTML)s</tr></thead>'+
                '<tbody>%(bodyHTML)s</tbody></table>{{$parent.formData}}',
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
            bodyHTML : this.makeBody(this.opts.fieldsDefine)
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
        }
        return html.join("");
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
            var td = $(ele).parent();
            var field = td.data("bind-model");
            var type = td.data("input-type");
            var struct = self.opts.fieldsDefine[field];
            struct.class="width-100 editAble";
            
            //支持的事件列表
            var eventsList = ["blur", "click", "keydown", "focus"];
            var events = {};
            angular.forEach(eventsList, function(e){
                var m = sprintf("on%s%s%s", field.ucfirst(), type.ucfirst(), e.ucfirst());
                if(m in scope.$parent) {
                    events["ng-"+e] = m;
                } else {
                    m = sprintf("on%s%s", type.ucfirst(), e.ucfirst());
                    if(m in scope.$parent) {
                        events["ng-"+e] = m;
                    }
                }
            }); 
            var html = self.fm.maker.factory(field, struct, scope, $(ele).text(), events);
            html = self.compile(html)(scope.$parent);
            td.append(html);
            td.find(".editAble").focus().select();
            
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
            $(element).parents("tr").remove();
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
            self.setData(ele, ele.val(), true);
        };
        scope.$parent.onNumberKeydown = function(event) {
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
        scope.$parent.onTypeaheadBlur = function(event){
            var ele = $(event.target);
            self.setTypeaheadData(ele, scope, true);
        };
        scope.$parent.onTypeaheadKeydown = function(event) {
            if(event.keyCode == 9) {
                window.event.returnValue=false;
                var ele = $(event.target);
                self.setTypeaheadData(ele, scope);
            } else if(event.keyCode == 13) {
                var ele = $(event.target);
                self.setTypeaheadData(ele, scope);
            }
        };
//        scope.$parent.onTypeaheadBlur = function(event) {
//            event.returnValue = false;
//        };
//        scope.$parent.onTypeaheadKeydown = function(event){
////            setTimeout(function(){
////                var ele = $(event.target);
////                var val = ele.val();
////                var field = ele.parent().data("bind-model");
////                var dataSource = self.opts.fieldsDefine[field].dataSource
////                if(!val || !dataSource) {
////                    return;
////                }
////                if(event.keyCode<48 || event.keyCode>90 || (event.keyCode>57&&event.keyCode<65)) {
////                    return;
////                }
////                dataSource.query({typeahead: val}).$promise.then(function(data){
////                    //结果将添加到typeahead下拉列表
////                });
////            });
//        };
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
    setData: function(element, data, isBlur) {
        var ele = $(element);
        var td = ele.parent();
        var index = td.parent().data("trid");
        var field = td.data("bind-model");
        ele.remove();
        td.find("label").html(data);
        
        //设置在作用于中得数据对象
        if(!this.scope[this.opts.dataName][index]) {
            this.scope[this.opts.dataName][index] = {};
        }
        this.scope[this.opts.dataName][index][field] = data;
        this.scope.$emit("billFieldEdited", this.scope[this.opts.dataName]);
        
        if(!isBlur) {
            this.scope.$parent.billEndEdit(td, false);
        }
    },
    setTypeaheadData: function(ele, scope, isBlur) {
        var self = this;
        var timeout = isBlur ? 200 : 0;
        setTimeout(function(){
            var td = ele.parent();
            var field = td.data("bind-model");
            var dataName = field+"TAIT";
            var index = td.parent().data("trid");
            if(!(dataName in scope.$parent)) {
                td.find("label").text("");
                td.find("*").not("label").remove();
                return;
            }
            td.find("label").text(ele.val());
            td.find("*").not("label").remove();
            //设置在作用于中得数据对象
            if(!scope[self.opts.dataName][index]) {
                scope[self.opts.dataName][index] = {};
            }   
            scope[self.opts.dataName][index][field] = scope.$parent[dataName];
            delete(scope.$parent[dataName]);
            if(!isBlur) {
                scope.$parent.billEndEdit(td, false);
            }
            setTimeout(function(){
                scope.$parent.$broadcast("billFieldEdited", scope[self.opts.dataName]);
            });
            scope.$parent.$digest();
        }, timeout);
        
    }
};