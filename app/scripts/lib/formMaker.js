(function(){
    'use struct';
    angular.module("ones.formMaker", [])
    .service("FormMaker", ["$compile", "$q", "$parse", "StockProductListRes", "$injector",
    function($compile, $q, $parse, StockProductListRes, $injector) {
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
                        'search_contains="true" disable_search_threshold="10"'+
                        '><option><option></select>',
                'fields/static': '<span ng-bind="%s"></span>',
                'fields/email': '<input type="number" %s />',
                'fields/textarea': '<textarea %s>%s</textarea>',
                'fields/password': '<input type="password" %s />',
                'fields/select2': '<ui-select ng-model="%(model)s" class="editAble" %(event)s theme="selectize" reset-search-input="false" %(attrs)s>'+
                                    '<match ng-bind-html="$select.selected.label"></match>'+
                                    '<choices refresh="%(method)s_refresh($select.search)" refresh-delay="0" repeat="%(data)s in %(method)s | filter: $select.search">'+
                                      '<div ng-bind-html="%(data)s.label"></div>'+
                                    '</choices>'+
                                  '</ui-select>',
//                "fields/select2": '<select ngyn-select2 %(attrs)s '+
//                        'ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s" '+
//                        'search_contains="true" '+
//                        'ui-select><option><option></select>',
                'fields/typeahead': '<input type="text" ' +
                        'typeahead-on-select="showselected(this)" typeahead-editable="false" typeahead-min-length="0" ' +
                        'ng-options="%(key)s.label as %(key)s.label for %(key)s in %(data)s($viewValue)" %(attr)s '+
                        'data-html="true" bs-typeahead />',
                'fields/craft': '<a class="craftSetLink" ng-bind="%(label)s" ng-click="%(action)s">未定义</a>',
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
                    html = this[method](context.field, fieldDefine, $scope, context);
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
            _hidden: function(name, fieldDefine) {
                return sprintf('<input type="hidden" ng-bind="%(bind)s" />', {
                    bind: fieldDefine["ng-model"]
                });
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
            _static: function(name, fieldDefine) {
                return "";
                return sprintf(this.$parent.templates["fields/static"], fieldDefine["ng-model"]);
            },
            _craft: function(name, fieldDefine, $scope, context) {
                context.td.html("");
                var res = $injector.get("GoodsCraftRes");
                var queryParams = {};
                var self = this;
                if(fieldDefine.queryWithExistsData) {
                    angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                        queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                            ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                            : $scope.$parent[self.opts.dataName][qItem];
                    });
                }
                
                var goods_id = queryParams["goods_id"].split("_");
                goods_id = goods_id[1];
                
                var crafts = [];
                res.query({
                    goods_id: goods_id,
                    only_defined: true
                }).$promise.then(function(data){
                    angular.forEach(data, function(item){
                        crafts.push(item.name);
                    });
                    $scope.$parent.formData[context.trid].craft = crafts.join(">");
                });
                
                var action = sprintf('doSetProductCraft(%d, \'%s\', this)',parseInt(goods_id), "");
                
                return sprintf(this.$parent.templates["fields/craft"], {
                    label: fieldDefine["ng-model"],
                    action:action
                });
                
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
            _select3: function(name, fieldDefine, $scope) {
                var key = name+"Select3Config";
                fieldDefine.dataName = this.opts.dataName
                $scope.$parent[key] = {
                    name: name,
                    fieldDefine: fieldDefine
                };
                return sprintf('<select3 config="%s"></select3>', key);
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
                    queryParams.limit = queryParams.limit ? queryParams.limit : 5;
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
                    attrs: this._attr(name, fieldDefine)
//                    dataSource: dataSourceName
                });
                
//                console.log(html);
                return html;
                
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
            
            this.opts.storeAPI = StockProductListRes;

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
                var html = [];
                angular.forEach(fieldsDefine, function(item){
                    if(item.billAble !== false) {
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
                                    dataBind: item.cellFilter ? "formMetaData.total_"+field + "|"+item.cellFilter : "formMetaData.total_"+field
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
                this.fieldsDefine = fieldsDefine;
                var label;
                var labelBind;
                
                angular.forEach(fieldsDefine, function(item, field){
                    if(item.billAble!==false) {
                        if(defaultData.length) {
                            var curRowData = self.scope.$parent[self.opts.dataName][i];
                            //判断返回数据中是否有_label显示的字段
                            if(item.field+"_label" in curRowData) {
                                curRowData[item.field+"_label"] = defaultData[i][item.field+"_label"];
                                labelBind = sprintf('%s[%d].%s_label', self.opts.dataName, i, field);
                            } else {
                                labelBind = sprintf('%s[%d].%s', self.opts.dataName, i, field);
                            }
                        } else {
                            labelBind = sprintf('%s[%d].%s', self.opts.dataName, i, item.labelField ? field+"_label" : field);
                        }
                        //过滤器
                        if(item.cellFilter) {
                            labelBind = sprintf("%s|%s", labelBind, item.cellFilter);
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

                    //已经存在input
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
                    var events = [];
                    angular.forEach(eventsList, function(e){
                        var m = sprintf("on%s%s%s", context.field.ucfirst(), context.inputType.ucfirst(), e.ucfirst());
                        if(m in scope.$parent) {
//                            console.log(m);
                            events.push(sprintf("%s:'%s($event)'", e, m));
                        } else {
                            m = sprintf("on%s%s", context.inputType.ucfirst(), e.ucfirst());
                            if(m in scope.$parent) {
                                events.push(sprintf("%s:'%s($event)'", e, m));
                            }
                        }
                    });
                    
                    if(events.length) {
                        struct["ui-event"] = sprintf("{%s}", events.join());
                    }
                    
//                    console.log(struct["ui-event"]);
                    
                    var html = self.fm.maker.factory(context, struct, scope);
                    html = self.compile(html)(scope.$parent);
                    context.td.append(html);
                    
                    //触发结束编辑事件
                    setTimeout(function(){
                        context = getInputContext(ele);
                        context.inputAble.focus();
                        context.inputAble.bind("keydown", function(e){
                            if(e.keyCode === 13) {
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
                    setTimeout(function(){
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
                        if("callback" in self.fieldsDefine[$(td).data("bind-model")]) {
                            self.fieldsDefine[$(td).data("bind-model")].callback($(td).parent());
                        }
                    },200);
                    
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
                    if(event.keyCode === 9 && !event.shiftKey) {
                        window.event.returnValue=false;
                        var ele = $(event.target);
                        self.setData(ele, ele.val());
                    } else if(event.keyCode === 13) {
                        var ele = $(event.target);
                        self.setData(ele, ele.val());
                    } else if((event.shiftKey) && (event.keyCode ===9)) {
                        window.event.returnValue=false;
                    }
                };
                if(scope.$parent.onNumberBlur === undefined) {
                    scope.$parent.onNumberBlur = function(event) {
                        var ele = $(event.target);
                        scope.$parent.billEndEdit(ele.parent(), true);
                        self.setNumberData(ele, ele.val(), true);
                    };
                }
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
                };
                scope.$parent.onSelect3Blur = function(event) {
                    var context = getInputContext(event.target);
                    self.scope.$parent.billEndEdit(context.td, true);
                };
                scope.$parent.onStockSelect3Blur = function(event){
//                    console.log(self);
//                    console.log(event.target);return;
//                    self.scope.$parent.onTypeaheadBlur(event);
                    setTimeout(function(){
                        var context = getInputContext(event.target);
                        var tmp = self.scope.$parent[self.opts.dataName][context.trid];
                        var queryParams = {
                            id: 0,
                            stock_id: tmp.stock
                        };
                        if(tmp.factory_code_all) {
                            queryParams.factory_code_all = tmp.factory_code_all;
                        } else {
                            queryParams.factory_code_all = sprintf("%s-%s-%s", tmp.goods_id.split("_")[0], tmp.standard, tmp.version);
                        }
                        self.opts.storeAPI.get(queryParams).$promise.then(function(data){
                            self.scope.$parent[self.opts.dataName][context.trid].store_num=data.num || 0;
    //                        context.tr.find("[data-bind-model=store_num] label").text(data.num||0);
            //                self.scope.$parent[self.opts.dataName][context.trid].store_num=data.num;
                        });
                    }, 200);
                    
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
                    console.log(123);
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
                            '<div class="help-block col-xs-12 col-sm-reset" ng-hide="!%(formname)s.%(fieldname)s.$dirty||%(formname)s.%(fieldname)s.$valid" ng-bind="%(formname)s.%(fieldname)s.$error|toError"></div>' +
                            '</div>',
                    "commonForm/hide.html": '%(inputHTML)s',
                    "text": '<input type="text" %s />',
                    "number": '<input type="number" %s />',
                    "select": '<select %(attr)s ng-options="%(value)s as %(name)s for %(key)s in %(data)s"></select>',
                },
                dataName: "formData"
            };

            this.opts = $.extend(true, defaultOpts, config);
            

            this.opts.dataName = this.opts.dataName ? this.opts.dataName : this.opts.name+"Data";

            $scope.$parent[this.opts.dataName] = $scope.$parent[this.opts.dataName] || {};
            $scope[this.opts.dataName] = {};
            
            $scope.$parent.doKeydown = function(event){
//                console.log("dokeydown")
//                
                if(event.keyCode === 13 && $(event.target).attr("ng-model") && !$(event.target).hasClass("select3Input")) {
                    event.preventDefault();
                    event.stopPropagation();
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
                //隐藏字段
                angular.forEach(this.opts.fieldsDefine, function(struct, field){
                    if(struct.inputType === "hidden") {
                        boxHTML = self.opts.templates["commonForm/hide.html"];
                    } else {
                        boxHTML = self.opts.templates["commonForm/box.html"];
                    }
                    struct.class = "width-100";
                    struct["ng-model"] = self.opts.dataName+"."+field;
                    if(struct.required !== false) {
                        struct.required = "required";
                    } else {
                        delete(struct.required);
                    }
                    self.scope.$parent[self.opts.dataName][field] = "";
                    //默认值
                    if(struct.value) {
                        self.scope.$parent[self.opts.dataName][field] = struct.value;
                    }

                    if(!struct.hideInForm && !struct.primary) {
                        fieldHTML = self.fm.maker.factory({field: field}, struct, self.scope);
                        if (false !== fieldHTML) {
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
        
        
        /**
         * select3字段
         * */
        service.select3 = function($scope){
            this.defaultOpts = {
                autoQuery: false,
                inputTpl: '<input type="text" ng-model="%(model)s_label" %(attr)s /><input type="hidden" ng-model="%(model)s" />',
                selectTpl: '<ul class="select3Container" id="select3Container">'+
                        '<li ng-repeat="s3it in select3Items" ng-class="{active:$index==selectedItem}" data-value="{{s3it.value}}" ng-bind="s3it.label" ui-event="%(events)s"></li>'+
                        '</ul>'
            };
            var defaultOpts = {};
            $.extend(defaultOpts, this.defaultOpts);
            
            $scope.$parent.select3Configs = $scope.$parent.select3Configs || {};
            $scope.$parent.select3Configs[$scope.config.fieldDefine.field] = $scope.config.fieldDefine;
            this.opts = $.extend(defaultOpts, $scope.$parent.select3Configs[$scope.config.fieldDefine.field]);
            this.scope = $scope;
        };
        service.select3.prototype = {
            makeHTML: function(){
                this.bindEvents();
                //绑定输入框事件
                var events = {
                    'focus': "'doSelect3Focus($event)'",
                    'blur': "'doSelect3Blur($event)'",
                    'keydown': "'doSelect3Keydown($event)'"
                };
                if(this.opts["ui-event"]) {
                    var tmpEvents;
                    eval('tmpEvents='+this.opts["ui-event"]);
                    angular.forEach(tmpEvents, function(evt, key){
                        if(key in events) {
//                            console.log(events[key].replace(")'", ");"+evt+"'"));
                            events[key] = events[key].replace(")'", ");"+evt+"'");
                        }
                    });
//                    console.log(events);
//                    console.log($.parseJSON(this.opts["ui-event"]));
                }
                
                events = $.extend(events, this.opts.events);
                var attrs = [
                    ["ui-event", angular.toJson(events).replace(/"/g, "")],
                    ["class", "select3Input editAble"],
                    ["data-field", this.opts.field]
                ];
                var attrHTML = [];
                angular.forEach(attrs, function(item){
                    attrHTML.push(sprintf('%s="%s"', item[0], item[1]));
                });
                
                var html = sprintf(this.opts.inputTpl, {
                    attr: attrHTML.join(" "), 
                    model: this.opts["ng-model"]
                });
                return html;
            },
            bindEvents: function(){
                var self = this;
                this.scope.$parent.doSelect3Focus = function($event){
                    var defaultOpts = {};
                    $.extend(defaultOpts, self.defaultOpts);
                    self.opts = $.extend(defaultOpts, self.scope.$parent.select3Configs[$($event.target).data("field")]);
                    
                    var val = $event.target.value;
                    if(self.opts.autoReset || (!val && self.opts.autoQuery)) {
                        val = "_";
                    }
                    if(val) {
                        self.scope.$parent.doSelect3Query(val);
                    }
                };
                
                this.scope.$parent.doSelect3Keydown = function($event){
                    var Keys = {
                        Enter: 13,
                        Tab: 9,
                        Up: 38,
                        Down: 40,
                        Escape: 27
                    };
                    if($event.keyCode === Keys.Up || $event.keyCode === Keys.down) {
                        window.event.returnValue =false;
                    }
                    setTimeout(function(){
                        //监听键盘事件
                        switch($event.keyCode) {
                            case Keys.Enter:
                                if(!$("#select3Container li").length) {
                                    return false;
                                }

                                self.scope.setValue($("#select3Container li.active"));

    //
    //                                $parse(self.opts["ng-model"]).assign(value, self.scope);
    //                                $(".select3Input:focus").next().val(value);
                                break;
                            case Keys.Tab:
                            case Keys.Escape:
                                self.scope.$parent.hideSelect3Options();
                                break;
                            case Keys.Up:
                                if(!self.scope.select3Items.length) {
                                    return;
                                }
                                if(self.scope.selectedItem-1 < 0) {
                                    self.scope.selectedItem = self.scope.select3Items.length-1;
                                } else {
                                    self.scope.selectedItem--;
                                }
                                break;
                            case Keys.Down: 
                                if(!self.scope.select3Items.length) {
                                    return;
                                }
                                if(self.scope.selectedItem+1 >= self.scope.select3Items.length) {
                                    self.scope.selectedItem = 0;
                                } else {
                                    self.scope.selectedItem++;
                                }
                                break;
                            default:
                                if($($event.target).is("input")) {
                                    self.scope.$parent.doSelect3Query($event.target.value);
                                }
                                break;
                        }
                        self.scope.$parent.$digest();
                    });
                };
                this.scope.$parent.doSelect3Query = function(val){
                    //总是取得所有数据
                    if(self.opts.alwaysQueryAll) {
                        val = "_";
                    }
                    self.scope.select3Items = [];
                    //非数组形式数据源
                    if(!angular.isArray(self.opts.dataSource)) {
                        if(!$.trim(val)) {
                            self.scope.$parent.hideSelect3Options(true);
                            return;
                        }
                        var queryParams = self.opts.queryParams || {};
                        queryParams.typeahead = $.trim(val);
                        if('queryWithExistsData' in self.opts) {
                            angular.forEach(self.opts.queryWithExistsData, function(qItem){
                                queryParams[qItem] = self.opts["data-row-index"] !== undefined
                                                    ? self.scope.$parent[self.opts.dataName][self.opts["data-row-index"]][qItem]
                                                    : self.scope.$parent[self.opts.dataName][qItem];
                            });
                        }
                        self.opts.dataSource.query(queryParams).$promise.then(function(data){
                            if(data.length < 1) {
                                self.scope.$parent.hideSelect3Options(true);
                                console.log('no result');
                                return;
                            }
                            angular.forEach(data, function(item){
                                self.scope.select3Items.push({
                                    label: item[self.opts.nameField || "name"],
                                    value: item[self.opts.valueField || "id"]
                                });
                            });
                            self.scope.$parent.displaySelect3Options();
                        });
                    } else {
                        if(self.opts.dataSource.length < 1) {
                            //@todo no result
                            self.scope.$parent.hideSelect3Options(true);
                            console.log('no result');
                            return;
                        }
                        angular.forEach(self.opts.dataSource, function(item){
                            self.scope.select3Items.push({
                                label: item[self.opts.nameField || "name"],
                                value: item[self.opts.valueField || "id"]
                            });
                        });
                        self.scope.$parent.displaySelect3Options();
                    }
                };
                
                this.scope.$parent.doSelect3Blur = function(){
                    setTimeout(function(){
                        self.scope.$parent.hideSelect3Options();
                    }, 150);
                };
                
                this.scope.$parent.displaySelect3Options = function(){
                    if($("#select3Container").length) {
                        return;
                    }
                    var selectHTML = sprintf(self.opts.selectTpl, {
                        events: "{keydown:'doSelect3Keydown($event)', click:'doSelect3Click($event)'}"
                    });
                    var selectHTMLCompiled = $compile(selectHTML)(self.scope);
                    $("body").append(selectHTMLCompiled);
                    var currentInput = $(".select3Input:focus");
                    
                    $("#select3Container").css({
                        minWidth: currentInput.outerWidth(),
                        left: currentInput.offset().left,
                        top: currentInput.offset().top+currentInput.outerHeight()
                    });
                    self.scope.selectedItem = 0;
                };
                this.scope.$parent.hideSelect3Options = function(keepFocus){
                    if(!keepFocus) {
                        $(".select3Input:focus").blur();
                    }
                    if(!keepFocus && self.opts.autoHide) {
//                        $(".select3Input").addClass("hide");
                    }
                    $("#select3Container").remove();
                    self.scope.select3Items = [];
                };
                
                this.scope.doSelect3Click = function($event) {
                    self.scope.setValue($event.target);
                };
                this.scope.setValue = function(element){
                    var getter = $parse(self.opts["ng-model"]);
                    getter.assign(self.scope.$parent, $(element).data("value"));
                    
                    //label
                    getter = $parse(self.opts["ng-model"]+"_label");
                    getter.assign(self.scope.$parent, $(element).text());
                    
                    self.scope.$parent.hideSelect3Options();
                };
            }
        };

        return service;
    }]);
})();