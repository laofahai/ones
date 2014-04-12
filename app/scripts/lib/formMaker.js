(function(){
    'use struct';
    angular.module("erp.formMaker", [])
    .service("FormMaker", ["$compile", "$q", function($compile, $q) {
        var service = {};
        service.makeField = function(scope, opts) {
            var defaultOpts = {};
            this.scope = scope;
            this.opts = $.extend(defaultOpts, opts);
            this.templates = {
                "fields/text": '<input type="text" %s />',
                "fields/number": '<input type="number" %s />',
                "fields/select": '<select %(attr)s '+
                        'ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s" '+
                        'search_contains="true" '+
                        '><option><option></select>',
                'fields/email': '<input type="number" %s />',
                'fields/textarea': '<textarea %s>%s</textarea>',
                'fields/password': '<input type="password" %s />',
//                'fields/select2': '<ui-select ng-model="%(model)s" class="editAble" %(event)s theme="selectize" reset-search-input="false" %(attrs)s>'+
//                                    '<match ng-bind-html="$select.selected.label"></match>'+
//                                    '<choices refresh="%(method)s_refresh($select.search)" refresh-delay="0" repeat="%(data)s in %(method)s | filter: $select.search">'+
//                                      '<div ng-bind-html="%(data)s.label"></div>'+
//                                    '</choices>'+
//                                  '</ui-select>',
                "fields/select2": '<select %(attr)s '+
                        'ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s" '+
                        'search_contains="true" '+
                        'ui-select><option><option></select>',
                'fields/typeahead': '<input type="text" ' +
                        'typeahead-on-select="showselected(this)" typeahead-editable="false" typeahead-min-length="0" ' +
                        'ng-options="%(key)s.label as %(key)s.label for %(key)s in %(data)s($viewValue)" %(attr)s '+
                        'data-html="true" bs-typeahead />'
            };
            this.maker = new service.fieldsMakerFactory(this, this.opts);
        };

        service.fieldsMakerFactory = function(fieldsMaker, opts) {
            this.$parent = fieldsMaker;
            var defaultOpts = {
                multi: false,
                compile: false
            };
            this.opts = $.extend(defaultOpts, opts);
            this.opts.disabledAttrs = ["dataSource"];
        };


        service.fieldsMakerFactory.prototype = {
            /**
             * 字段生成器工厂方法，
             * @name 字段name //context field, text, trid
             * @fieldDefine 字段属性
             * @scope 作用域对象
             * @events 单个字段的事件列表，eg: ngBlur: doTextEndEdit; 
             * */
            factory: function(context, fieldDefine, $scope, events) {
                var method = "_" + (fieldDefine.inputType ? fieldDefine.inputType : "text");
                //事件绑定
                if (events) {
                    angular.forEach(events, function(func, event) {
                        fieldDefine[event] = func + "($event)";
                    });
                }
                if (context.text) {
                    fieldDefine.value = context.text;
                }
                if(context.trid !== undefined && this.opts.multi) {
                    fieldDefine["data-row-index"] = context.trid;
                }
                if (!fieldDefine.displayName) {
                    fieldDefine.displayName = this.$parent.scope.$parent.i18n.lang[context.field];
                }
                var html = false;
                if (method in this) {
                    html = this[method](context.field, fieldDefine, $scope);
                }
                
                if(html && this.opts.compile) {
                    html = $compile(html)($scope);
                }
                
                return html;
            },
            /**
             * 生成字段属性
             * 包括表单项的事件绑定
             * */
            _attr: function(name, fieldDefine) {
                var k, v, html = [];
                //多行数据 如bill
                if (!this.opts.multi) {
                    fieldDefine.id = "id_" + name;
                    fieldDefine.name = name;
                }
                for (k in fieldDefine) {
                    if (this.opts.disabledAttrs.indexOf(k) >= 0) {
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
                return sprintf(this.$parent.templates["fields/number"], this._attr(name, fieldDefine));
            },
            _password: function(name, fieldDefine) {
                delete(fieldDefine.value);
                return sprintf(this.$parent.templates["fields/password"], this._attr(name, fieldDefine));
            },
            //多选框
            _checkbox: function(name, fieldDefine) {
                
            },
            _static: function() {
                return "";
            },
            _textarea: function(name, fieldDefine){
                var value = fieldDefine.value;
                delete(fieldDefine.value);
                return sprintf(this.$parent.templates["fields/textarea"], this._attr(name, fieldDefine), value);
            },
            //下拉框选择
            _select: function(name, fieldDefine, $scope) {
                var valueField = fieldDefine.valueField || "id";
                var nameField = fieldDefine.nameField || "name";
                var data = [];
                var self = this;
                fieldDefine.chosen = "chosen";
                fieldDefine.remoteDataField = fieldDefine.remoteDataField || name;
                fieldDefine["data-placeholder"]= $scope.$parent.i18n.lang.messages.chosen_select_text;
                fieldDefine["no-results-text"]= $scope.$parent.i18n.lang.messages.chosen_no_result_text;

                if (fieldDefine.dataSource instanceof Array) {
                    for (var item in fieldDefine.dataSource) {
                        if (!item || !fieldDefine.dataSource[item][valueField]) {
                            continue;
                        }
                        data.push({
                            value: fieldDefine.dataSource[item][valueField],
                            name: fieldDefine.dataSource[item][nameField]
                        });
                    }
                    $scope.$parent[fieldDefine.remoteDataField + "sSelect"] = data;

                } else if (typeof (fieldDefine.dataSource) == "function") {
                    var queryParams = fieldDefine.queryParams || {};
                    //需要使用已有数据作为参数进行查询
                    if(fieldDefine.queryWithExistsData) {
                        angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                            queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                                ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                                : $scope.$parent[self.opts.dataName][qItem];
                        });
                    }
                    fieldDefine.dataSource.query(queryParams).$promise.then(function(result) {
                        angular.forEach(result, function(item) {
                            data.push({
                                value: item[valueField],
                                name: item[nameField]
                            });
                        });
                        $scope.$parent[fieldDefine.remoteDataField + "sSelect"] = data;
                    });
                }
                
                return sprintf(this.$parent.templates["fields/select"], {
                    attr: this._attr(name, fieldDefine),
                    key: name + "item",
                    data: fieldDefine.remoteDataField + "sSelect"
                });


            },
            _select2: function(name, fieldDefine, $scope) {
                var methodName = name + "DataSource";
                var nameField = fieldDefine.nameField || "name";
                var valueField = fieldDefine.valueField || "id";
                var queryParams;
                var self = this;
                queryParams = $.extend(fieldDefine.queryParams || {}, {});
                
                var oldval;

                $scope.$parent[methodName] = undefined;
                
                $scope.$parent[methodName+"_refresh"] = function(val){
                    if(oldval === val) {
                        return;
                    }
                    oldval = val;
                    if(fieldDefine.queryWithExistsData) {
                        angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                            queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                                ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                                : $scope.$parent[self.opts.dataName][qItem];
                        });
                    }
                    queryParams = $.extend(fieldDefine.queryParams || {}, {typeahead: val});
                    fieldDefine.dataSource.query(queryParams, function(data){
                        var dataList = [];
                        angular.forEach(data, function(item) {
                            dataList.push({
                                label: item[nameField],
                                value: item[valueField],
                                category: item.goods_category_id,
                                factory_code: item.factory_code
                            });
                        });
                        $scope.$parent[methodName] = dataList;
                    });
                };
//                console.log(methodName);
                var html = sprintf(this.$parent.templates['fields/select2'], {
                    method: methodName,
                    data: name,
                    key: "forkey",
                    label: nameField,
                    model: fieldDefine["ng-model"],
                    event: fieldDefine["ui-event"] ? sprintf('ui-event="%s"', fieldDefine["ui-event"]) : "",
                    attr: this._attr(name, fieldDefine)
//                    dataSource: dataSourceName
                });
                
//                console.log(html);
                return html;
                /*
                <ui-select ng-model="formData[0].goods_id" 
                theme="selectize" reset-search-input="false">
                <match>{{$select.selected.combineLabel}}</match>
                <choices refresh="goods_idDataSource_refresh" refresh-delay="0" 
                repeat="goods_id in goods_idDataSource | filter: $select.search">
                <div ng-bind-html="goods_id.combineLabel | highlight: $select.search">
                </div></choices></ui-select> 
                */
                
            },
            _typeahead: function(name, fieldDefine, $scope) {
                var methodName = name + "DataSource";
                var nameField = fieldDefine.nameField || "name";
                var valueField = fieldDefine.valueField || "id";
                var queryParams;
                queryParams = $.extend(fieldDefine.queryParams || {}, {});
                
                $scope.$parent[methodName] = function(val){
                    queryParams = $.extend(fieldDefine.queryParams || {}, {typeahead: val});
                    var defer = $q.defer();
                    fieldDefine.dataSource.query(queryParams, function(data){
                        var dataList = [];
                        angular.forEach(data, function(item) {
                            dataList.push({
                                label: item[valueField]+"_"+item[nameField],
                                value: item[valueField],
                                category: item.goods_category_id,
                                factory_code: item.factory_code
                            });
                        });
                        defer.resolve(dataList);
                    });
                    return defer.promise.then(function(data){
                        return data;
                    });
                };
                
                //设置默认值
                if (fieldDefine.value) {
                    $scope.$parent[name + "TAIT"] = fieldDefine.value;
                }
                //@todo 设置默认显示
                //        if(fieldDefine.autoQuery) {
                //            $scope.$parent.versionTAIT = "*";
                //            $scope.$parent[methodName]();
                //        }

                var html = sprintf(this.$parent.templates["fields/typeahead"], {
                    key: name + "item",
                    data: methodName,
                    attr: this._attr(name, fieldDefine)
                });
                return html;
            }
        };

        service.makeBill = function($scope){

            var defaultOpts = {
                minRows: 9,
                dataName: "formData",
                autoFocusNext: true,
                methods: {}
            };

            this.opts = $.extend(defaultOpts, $scope.config);

            this.scope = $scope;
            this.compile = $compile;
            this.scope.$parent[this.opts.dataName] = [];

            this.opts.templates = this.templates = {
                'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                        '<thead><tr><th>#</th><th></th>%(headHTML)s</tr></thead>'+
                        '<tbody>%(bodyHTML)s</tbody><tfoot><tr>%(footHTML)s</tr></tfoot></table>',
                'bills/fields/rowHead.html': '<th>%(i)s</th><td class="center"><label class="rowHead">'+
                                        '<i class="icon icon-plus" ng-click="billAddRow($event.target)"></i> '+
                                        '<i class="icon icon-trash" ng-click="billRemoveRow($event.target)"></i> '+
                                    '</label></td>',
                'bills/fields/td.html': '<td class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"><label ng-bind="%(bind)s" %(event)s>%(label)s</label></td>',
                'bills/fields/typeaheadList.html': '<ul class="typeAheadList editAble" />'+
                        '<li ng-repeat="%(v)s in %(data)s" type="typeahead" data-typeahead-value="%(v)s.%(valueField)s" '+
                        'ng-click="billTypeaheadClick($event)">{{%(v)s.%(labelField)s}}</li></ul>'
            };

            this.fm = new service.makeField($scope, {
                multi: true, //指定为表单绑定多条数据
                dataName: this.opts.dataName
            });
            
        };

        service.makeBill.prototype = {
            makeHTML: function() {
                this.bindEvents(this.scope);
                return sprintf(this.opts.templates["bills/box.html"], {
                    headHTML : this.makeHead(this.opts.fieldsDefine),
                    bodyHTML : this.makeBody(this.opts.fieldsDefine),
                    footHTML : this.makeFoot(this.opts.fieldsDefine)
                });
            },
            makeHead: function(fieldsDefine){
//                console.log(fieldsDefine);
                var html = [];
                angular.forEach(fieldsDefine, function(item){
                    if(item.billAble!==false) {
                        var attr = [];
                        if(item && "width" in item) {
                            attr.push('width="'+item.width+'"');
                        }
                        html.push(sprintf('<th %s>%s</th>', attr.join(""), item.displayName));
                    }
                });
                return html.join("");
            },
            makeBody: function(fieldsDefine){
                var html = [], self=this;
                
                //编辑模式下
                var defaultData = self.scope.$parent.formMetaData.rows || [];
                this.scope.$parent.formMetaData.rows = defaultData = dataFormat(fieldsDefine, defaultData);
                var defaultDataLength = defaultData.length || self.opts.minRows;
                for(var i=0;i<defaultDataLength;i++) {
                    html.push(this.makeRow(fieldsDefine, i, defaultData));
                }
                return html.join("");
                
                if(this.opts.isEdit) {
                    
                    this.scope.$on("bill.dataLoaded", function(evt, data){
                        self.opts.defaultData = data.rows;
                        delete(data.rows);
                        self.scope.$parent.formMetaData = data;
                        for(var i=0;i<self.opts.defaultData.length;i++) {
                            html.push(self.makeRow(fieldsDefine, i, self.opts.defaultData));
                        }
                        return html.join("");
                    });
                } else {
                    for(var i=0;i<this.opts.minRows;i++) {
                        html.push(this.makeRow(fieldsDefine, i));
                    }
                    return html.join("");
                }
            },
            makeFoot: function(fieldsDefine){
                var html = ['<td colspan="2" align="center">'+this.scope.$parent.i18n.lang.total+'</td>'];
                angular.forEach(fieldsDefine, function(item, field){
                    if(item.billAble !== false) {
                        if(item.totalAble) {
                            html.push(sprintf('<td class="tdTotalAble" tdname="%(field)s" id="tdTotalAble%(field)s" ng-bind="%(dataBind)s">0</td>', 
                                {
                                    field: field,
                                    dataBind: "formMetaData.total_"+field
                                }));
                        } else {
                            html.push("<td></td>");
                        }
                    }
                });
                return sprintf("<tr>%s</tr>", html.join(""));
            },
            makeRow: function(fieldsDefine,i, defaultData){
                var self = this;
                var html = [this.opts.templates['bills/fields/rowHead.html']];
                defaultData = defaultData || [];
                defaultData = dataFormat(fieldsDefine, defaultData);
                this.scope.$parent[this.opts.dataName][i] = defaultData[i] || {};
                var label;
                var labelBind;
                angular.forEach(fieldsDefine, function(item, field){
                    if(item.billAble!==false) {
                        if(defaultData.length) {
                            self.scope.$parent[self.opts.dataName][i][item.field+"_label"] = defaultData[i][item.field+"_label"];
                            labelBind = sprintf('%s[%d].%s_label', self.opts.dataName, i, field);
                        } else {
                            labelBind = sprintf('%s[%d].%s', self.opts.dataName, i, field);
                        }
                        item.inputType = item.inputType ? item.inputType : "text";
                        html.push(sprintf(self.templates['bills/fields/td.html'], {
                            field: field,
                            type: item.inputType,
                            tdClass: false !== item.editAble ? "tdEditAble" : "",
                            event: false !== item.editAble ? 'ng-click="billFieldEdit($event.target)"' : "",
                            label: label,
                            bind: labelBind
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
                    var context = getLabelContext(ele);

                    //已经存在
                    if(context.td.find(".editAble").length) {
                        context.td.find(".editAble").removeClass("hide").find("input");
                        context.inputAble.trigger("click").focus();
                        return;
                    }
                    var struct = self.opts.fieldsDefine[context.field];
                    struct.class="width-100 editAble";
                    struct.remoteDataField = sprintf("%s_%d", context.field, context.trid);
                    struct["ng-model"] = sprintf("%s[%d].%s", self.opts.dataName, context.trid, context.field);
                    if(struct.editAbleRequire) {
                        if(struct.editAbleRequire instanceof Array) {
                            for(var i=0;i<struct.editAbleRequire.length;i++) {
                                struct.editAbleRequire[i];
                                if(!scope.$parent[self.opts.dataName][context.trid] || !scope.$parent[self.opts.dataName][context.trid][struct.editAbleRequire[i]]) {
                                    return false;
                                }
                            }
                        } else {
                            if(!scope.$parent[self.opts.dataName][context.trid] || !scope.$parent[self.opts.dataName][context.trid][struct.editAbleRequire]) {
                                return false;
                            }
                        }
                    }

                    //支持的事件列表
                    var eventsList = ["blur", "click", "keydown", "focus", "change"];
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

                    var html = self.fm.maker.factory(context, struct, scope, events);
                    html = self.compile(html)(scope.$parent);
                    context.td.append(html);
                    
                    //触发结束编辑事件
                    setTimeout(function(){
                        context = getInputContext(ele);
                        context.inputAble.trigger("click").focus();
                        context.inputAble.bind("keydown", function(e){
                            if(e.keyCode == 13) {
                                self.scope.$parent.billEndEdit(context.td);
                            }
                        });
                    }, 100);
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
                    delete(scope.$parent[self.opts.dataName][tr.data("trid")])
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
                    }
                };
                scope.$parent.onNumberBlur = function(event) {
                    var ele = $(event.target);
                    scope.$parent.billEndEdit(ele.parent(), true);
                    self.setNumberData(ele, ele.val(), true);
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
                scope.$parent.onSelect2Keydown = function(event) {
                    console.log(arguments);
                }
                scope.$parent.onStockBlur = function(event){
//                    console.log(self);
                    console.log(arguments);return;
//                    self.scope.$parent.onTypeaheadBlur(event);
                    setTimeout(function(){
                        var context = getInputContext(event.target);
                        var tmp = self.scope.$parent[self.opts.dataName][context.trid];
                        self.opts.res.stockProduct.get({
                            factory_code_all: sprintf("%s-%s-%s", tmp.goods_id.factory_code, tmp.standard.value, tmp.version.value),
                            id: self.scope.$parent[self.opts.dataName][context.trid].stock.value
                        }).$promise.then(function(data){
                            context.tr.find("[data-bind-model=store_num] label").text(data.num||0);
            //                self.scope.$parent[self.opts.dataName][context.trid].store_num=data.num;
                        });
                    },100);
                };
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
                    var context = getInputContext(element);
                    angular.forEach(this.scope.$parent[this.opts.dataName], function(item){
                        if(context.field in item) {
                            total += parseFloat(item[context.field]);
                        }
                    });
                    total = total.toFixed(2);
                    data = parseFloat(data).toFixed(2);
                    this.scope.$parent.formMetaData["total_"+context.field] = total;
                    this.setData(element, data, isBlur);
                } else {
                    this.setData(element, data, isBlur);
                }

            },
            setData: function(element, data, isBlur) {
                var context = getInputContext(element);
//                context.label.html(data);
                context.td.find(".editAble").addClass("hide");
                this.scope.$parent.billEndEdit(context.td, isBlur);
            },
            setTypeaheadData: function(ele, scope, isBlur) {
                var val;
                var context = getInputContext(ele);
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

            }
        };

        service.makeForm = function($scope) {
            this.scope = $scope;
            var config = $scope.$parent.config || {};

            if (!config.fieldsDefine) {
                return false;
            }

            var defaultOpts = {
                class: "form-horizontal",
                submitAction: "doSubmit",
                fieldsDefine: {},
                templates: {
                    "commonForm/form.html": '<form class="form-horizontal" name="%(name)s" ng-keydown="doKeydown($event)" novalidate>%(html)s</form>',
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
                },
                dataName: ""
            };

            this.opts = $.extend(true, defaultOpts, config);
            

            this.opts.dataName = this.opts.dataName ? this.opts.dataName : this.opts.name+"Data";

            $scope.$parent[this.opts.dataName] = $scope.$parent[this.opts.dataName] || {};
            $scope[this.opts.dataName] = {};
            
            $scope.$parent.doKeydown = function(event){
                if(event.keyCode == 13) {
                    $scope.$parent.doSubmit();
                }
            };
            
            //this.fieldsMaker
            this.fm = new service.makeField($scope, this.opts);
        };

        service.makeForm.prototype = {
            makeHTML : function() {
                if(this.scope.formBuilded) {
                    return;
                }
                var self = this;
                var fieldHTML, finalHTML = [];
                var boxHTML = this.opts.templates["commonForm/box.html"];
                angular.forEach(this.opts.fieldsDefine, function(struct, field){
                    struct.class = "width-100";
                    struct["ng-model"] = self.opts.dataName+"."+field;
                    if(struct.required !== false) {
                        struct.required = "required";
                    } else {
                        delete(struct.required);
                    }

                    if(struct.value) {
                        self.scope.$parent[self.opts.dataName][field] = struct.value;
                    }

                    if(!struct.hideInForm && !struct.primary) {
                        self.scope.$parent[self.opts.dataName][field] = "";
                        fieldHTML = self.fm.maker.factory({field: field}, struct, self.scope);
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
                self.scope.formBuilded = true;
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
            }

        };

        return service;
    }]);
})();