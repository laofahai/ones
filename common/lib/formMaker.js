(function(){
    'use struct';
    angular.module("ones.formMaker", ["ones.select3Module"])
        .directive("commonform", ["$compile", "FormMaker", "$routeParams", "ComView", "$timeout", "$location", "pluginExecutor",
            function($compile, FormMaker, $routeParams, ComView, $timeout, $location, $plugin) {
                $plugin.callPlugin("when_make_form_init");
                return {
                    restrict: "E",
                    scope: {
                        config: "=",
                        data: "="
                    },
                    replace: true,
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {

                                var parentScope = $scope.$parent;
                                var opts = parentScope.$eval(iAttrs.config);

                                var defaultOpts = {
                                    name: "form", //表单名称
                                    id: null, //如为编辑，需传递此参数
                                    dataLoadedEvent: "form.dataLoaded", //需要异步加载数据时，传递一个dataLoadedEvent的参数标识异步数据已经加载完成的广播事件
                                    dataName: "formData", //数据绑定到$scope的名字
                                    columns: 2,
                                    returnPage: sprintf("/%(group)s/list/%(module)s", {
                                        group: $routeParams.group,
                                        module: $routeParams.module
                                    }) //表单提交之后的返回页面地址
                                };

                                opts = $.extend(defaultOpts, opts);
                                $.extend(opts, opts.opts);

                                if(opts.id || $routeParams.id) {
                                    opts.isEdit = true;
                                    opts.id = $routeParams.id;
                                }

                                var doDefine = function(fd) {
                                    opts.fieldsDefine = fd;
                                    //编辑
                                    if (opts.id || opts.isEdit) {
                                        //
                                        var tmpParams = opts.queryParams || {};
                                        if(opts.id) {
                                            tmpParams.id = opts.id;
                                        }

                                        var promise = getDataApiPromise(opts.resource, "get", tmpParams);

                                        promise.then(function(defaultData) {
                                            parentScope[opts.dataName] = dataFormat(opts.fieldsDefine, defaultData);
                                            $timeout(function(){
                                                parentScope.$broadcast(opts.dataLoadedEvent);
                                            }, 300);

                                        });
                                    } else {
                                        $timeout(function(){
                                            parentScope.$broadcast(opts.dataLoadedEvent);
                                        }, 300);
                                    }

                                    //延时编译
                                    if(!opts.lazyload) {
                                        $timeout(function(){
                                            $scope.$broadcast("commonForm.ready");
                                        });
                                    }
                                };

                                /**
                                 * 自动获取字段
                                 * */

                                opts.model.config = opts.model.config || {};
                                opts.columns = opts.model.config.columns || opts.columns;
                                opts.formActions = undefined === opts.model.config.formActions ? true : false;
                                var field = opts.model.getStructure();
                                if("then" in field && typeof(field.then) === "function") { //需要获取异步数据
                                    field.then(function(data){
                                        doDefine(angular.copy(data));
                                    }, function(msg){
                                        ComView.alert(msg);
                                    });
                                } else {
                                    doDefine(angular.copy(field));
                                }

                                var doFormValidate = function(name){
                                    name = name || opts.name;
                                    if (false === parentScope[name].$valid) {
                                        if(parentScope[name].$error) {
                                            ComView.alert(ComView.toLang("fillTheForm", "messages"), "danger");
                                        } else {
                                            ComView.alert(ComView.toLang("fillTheForm", "messages"), "danger");
                                        }
                                        return false;
                                    }
                                    return true;
                                };

                                //提交表单
                                if(typeof(parentScope.doFormSubmit) !== "function") {
                                    parentScope.doSubmit = parentScope.doFormSubmit = (opts.doSubmit ? opts.doSubmit : function() {
                                        if(!doFormValidate()) {
                                            return;
                                        }
                                        //编辑
                                        var getParams = {};
                                        var tmp = ['group', 'module', 'action'];
                                        for (var k in $routeParams) {
                                            if(tmp.indexOf(k) >= 0) {
                                                continue;
                                            }
                                            getParams[k] = $routeParams[k];
                                        }
                                        var callback = function(data){
                                            if(data.error) {
                                                ComView.alert(data.msg);
                                            } else {
                                                var lastPage = ones.caches.getItem("lastPage");
                                                var returnPage = opts.returnPage;
                                                if(lastPage[0]) {
                                                    lastPage = lastPage[0].split("/");
                                                    returnPage = lastPage[1]+"/list/"+lastPage[3];
                                                }

                                                $location.url(returnPage);
                                            }
                                        };
                                        if (opts.id) {
                                            getParams.id = opts.id;
                                            getDataApiPromise(opts.resource, "update", getParams, parentScope[opts.dataName]).then(callback);
                                            //新增
                                        } else {
                                            var params = $.extend(getParams, parentScope[opts.dataName]);
                                            getDataApiPromise(opts.resource, "save", params).then(callback);
                                        }
                                    });
                                } else {
                                    parentScope.doSubmit = parentScope.doFormSubmit;
                                }

                                parentScope.doResetForm = function(){
                                    parentScope[opts.name].$setPristine(true)
                                    parentScope[opts.dataName] = {};
                                };

                                $scope.$on("commonForm.ready", function() {
                                    var fm = new FormMaker.makeForm($scope, opts);
                                    var html = fm.makeHTML();
                                    iElement.append($compile(html)($scope.$parent));
                                    setTimeout(function(){
                                        var ele = iElement.find("input").eq(0);
                                        $(ele).trigger("click").focus();
                                    }, 200);
                                });
                            }
                        };
                    }
                };
            }])

        .directive("aceupload", ["$rootScope", function($rootScope){
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                scope: {
                    config: "="
                },
                compile: function() {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var config = $scope.$parent.$eval(iAttrs.config) || {};
                            iElement.append(sprintf('<input type="file" %s />', config.multiple || ""));
                            var conf = {
                                btn_choose: l("lang.messages.drag_or_chose_file"),
                                btn_change: l("lang.messages.drag_or_chose_file"),
                                droppable: true,
                                onchange:null,
                                whitelist:'gif|png|jpg|jpeg',
                                no_icon:'icon-cloud-upload',
                                style: "well",
                                thumbnail: "fit"
                            }
                            conf = $.extend(conf, config);
                            iElement.find("input").ace_file_input(conf);
                        }
                    };
                }
            };
        }])
        .directive('ensureunique', ['$http', "$injector", "$timeout","$parse", function($http, $injector, $timeout, $parse) {
            return {
                require: 'ngModel',
                link: function(scope, ele, attrs, c) {
                    var inited = {};
                    scope.$watch(attrs.ngModel, function(newVal, oldVal) {

                        if(!inited[attrs.ngModel]) {
                            inited[attrs.ngModel] = true;
                            return;
                        }

                        if(!newVal) {
                            var getter = $parse(attrs.ngModel);
                            getter.assign(scope, c.$viewValue);
                        }

                        var res = $injector.get(attrs.ensureunique);
                        var queryParams = {
                            id: 0,
                            excludeId:  $injector.get("$routeParams").id
                        };

                        queryParams[attrs.name] = scope.$eval(attrs.ngModel);

                        var promise = getDataApiPromise(res, "get", queryParams);

                        promise.then(function(data){
                            if(data[attrs.name]) {
                                c.$setValidity('unique', false);

                            } else {
                                c.$setValidity('unique', true);
                            }

                        }, function(){
                            c.$setValidity('unique', false);
                        });

                    });
                }
            };
        }])
        .directive("inputfield", ["$compile", "FormMaker", function($compile, FormMaker) {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    config: "="
                },
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var fieldDefine = $scope.$parent[iAttrs.config].fieldDefine;
                            var formMaker = new FormMaker.makeField($scope);
                            var html = formMaker.maker.factory($scope.$parent[iAttrs.config].context, fieldDefine, $scope);

                            iElement.append($compile(html)($scope.$parent));
                        }
                    };
                }
            };
        }])

        .directive("bill", ["$compile", "FormMaker", "$timeout", "$routeParams", "ComView", "$injector", "$location", "$route", "$interval",
            function($compile, FormMaker, $timeout, $routeParams, ComView, $injector, $location, $route, $interval) {
                return {
                    restrict: "E",
                    replace: true,
                    scope: {
                        config: "="
                    },
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {

                                var parentScope = $scope.$parent;
                                var config = parentScope.$eval(iAttrs.config);

                                config = $.extend(config, config.model.config||{});

                                config = $.extend(config, config.opts);

                                config.dataName = config.dataName || "billData";

                                parentScope.selectAble = false;

                                var rowsModel = config.model.config.rowsModel ? $injector.get(config.model.config.rowsModel) : config.model;
                                var structure = rowsModel.getStructure(true);

                                if("then" in structure && typeof(structure.then) == "function") {
                                    structure.then(function(data){
                                        structure = angular.copy(data);
                                        $timeout(function(){
                                            doWhenStructureReady(structure);
                                        });

                                    });
                                } else {
                                    $timeout(function(){
                                        doWhenStructureReady(angular.copy(structure));
                                    });
                                }

                                var cachedData, currentData;
                                var cacheKey = sprintf("ones.billCache.%s.%s", $routeParams.group, $routeParams.module);

                                var doWhenStructureReady = function(fieldsDefine){

                                    config.fieldsDefine = fieldsDefine;

                                    /**
                                     * 字段名称
                                     * */
                                    for (var f in fieldsDefine) {
                                        if(!fieldsDefine[f].field) {
                                            fieldsDefine[f].field = f;
                                        }
                                        if(!fieldsDefine[f].displayName) {
                                            fieldsDefine[f].displayName = ComView.toLang(f);
                                        }
                                    }


                                    if($routeParams.id) {
                                        config.isEdit = true;
                                        var queryExtraParams = {
                                            id: $routeParams.id, includeRows: true
                                        };
                                        queryExtraParams = angular.extend(queryExtraParams, config.queryExtraParams);
                                        config.resource.get(queryExtraParams).$promise.then(function(data){
                                            $scope.$broadcast("bill.dataLoaded", data);
                                        });
                                    }


                                    if(config.model.config.workflowAlias
                                        && config.isEdit
                                        && $routeParams.id
                                        && isAppLoaded("workflow")) {
                                        $injector.get("Workflow.WorkflowNodeAPI").api.query({
                                            workflow_alias: config.model.config.workflowAlias,
                                            mainrow_id: $routeParams.id,
                                            filterFields: ["id", "name"].join()
                                        }).$promise.then(function(data){
                                            parentScope.workflowInBill = data;
                                            parentScope.mainrow_id = $routeParams.id;
                                        });

                                    }


                                    //自动保存
                                    if(!config.isEdit && $routeParams.group && $routeParams.module && false !== config.autoSave) {
                                        cachedData = ones.caches.getItem(cacheKey);

                                        if(cachedData) {
                                            try {
                                                if(cachedData.meta.inputTime) {
                                                    cachedData.meta.inputTime = parentScope.formMetaData.inputTime;
                                                }
                                                if(cachedData.meta.dateline) {
                                                    cachedData.meta.dateline = parentScope.formMetaData.dateline;
                                                }
                                            } catch(e) { }
                                            parentScope.formMetaData = cachedData.meta;
                                            parentScope[config.dataName] = cachedData.data;

                                            ComView.alert({
                                                msg: ComView.toLang("cached data loaded", "messages"),
                                                type: "success",
                                                container: "#bottomAlertContainer",
                                                autohide: 6000
                                            });

                                        }

                                        parentScope.showClearAutoSaved = true;

                                        parentScope.doClearCachedData = function(){
                                            ones.caches.removeItem(cacheKey);
                                            ComView.alert({
                                                msg: ComView.toLang("cached data cleared", "messages"),
                                                type: "danger",
                                                container: "#bottomAlertContainer",
                                                autohide: 3000
                                            });
                                            $route.reload();
                                        };


                                        var t = $interval(function(){
                                            cachedData = ones.caches.getItem(cacheKey);
                                            currentData = {
                                                meta: parentScope.formMetaData,
                                                data: parentScope[config.dataName]
                                            };

                                            if(cachedData != currentData) {
                                                ComView.alert({
                                                    msg: ComView.toLang("auto saved", "messages"),
                                                    type: "success",
                                                    container: "#bottomAlertContainer",
                                                    autohide: 3000
                                                });
                                                ones.caches.setItem(cacheKey, currentData, 1);
                                            }
                                        }, 15000);

                                        $scope.$on('$destroy', function() {
                                            $interval.cancel(t);
                                        });

                                        $scope.$on("$locationChangeStart", function(){
                                            $interval.cancel(t);
                                        });
                                    }

                                    $scope.$broadcast("commonBill.ready");
                                };


                                //默认单据提交方法，可自动判断是否编辑/新建

                                if(typeof(parentScope.doBillSubmit) !== "function") {
                                    parentScope.doSubmit = parentScope.doBillSubmit = (config.doSubmit ? config.doSubmit : function() {
                                        if(!config.returnPage) {
                                            var tmp = $location.$$url.split("/").slice(1,4);
                                            tmp[1] = "list";
                                            config.returnPage = "/"+tmp.join("/");
                                        }
                                        var data = $.extend(parentScope.formMetaData, {rows: parentScope[config.dataName]});
                                        var getParams = {};
                                        for (var k in $routeParams) {
                                            getParams[k] = $routeParams[k];
                                        }

                                        var rs;

                                        if (config.isEdit) {
                                            getParams.id = $routeParams.id;
                                            rs = config.resource.update(getParams, data);
                                        } else {
                                            rs = config.resource.save(getParams, data);
                                        }

                                        rs.$promise.then(function(data){
                                            if(!data.error) {
                                                ones.caches.removeItem(cacheKey);

                                                var lastPage = ones.caches.getItem("lastPage");
                                                var returnPage = config.returnPage;
                                                if(lastPage[0]) {
                                                    lastPage = lastPage[0].split("/");
                                                    returnPage = lastPage[1]+"/list/"+lastPage[3];
                                                }
                                                $location.url(returnPage);
                                            }
                                        });
                                    });
                                } else {
                                    parentScope.doSubmit = parentScope.doBillSubmit;
                                }

                                var doMakeBillHTML = function($scope, config, parentScope){

                                    //标记工作流状态
                                    if($location.url().indexOf("/doWorkflow/") === 0 && $routeParams.nodeId) {
                                        parentScope.isWorkflowing = true;
                                        config.isWorkflowing = true;
                                    }

                                    var b = new FormMaker.makeBill($scope, config);
                                    iElement.append($compile(b.makeHTML())(parentScope));
                                };

                                $scope.$on("commonBill.ready", function(){
                                    if (config.isEdit) {
                                        $scope.$on("bill.dataLoaded", function(evt, data) {
                                            var timeToFormat = [
                                                "inputTime",
                                                "input_time",
                                                "dateline",
                                                "start_time",
                                                "end_time"
                                            ];
                                            angular.forEach(data, function(item, k){
                                                for(var i=0;i<timeToFormat.length;i++) {
                                                    if(k === timeToFormat[i]) {
                                                        if(String(item).length <= 10) {
                                                            item*=1000;
                                                        }
                                                        data[k] = new Date(item);
                                                    }
                                                }
                                            });
                                            parentScope.formMetaData = data;
                                            doMakeBillHTML($scope, config, parentScope);
                                        });
                                    } else {
                                        doMakeBillHTML($scope, config, parentScope);
                                    }
                                });

                            }
                        };
                    }
                };
            }])
        .service("FormMaker", ["$compile", "$q", "$parse",  "$injector", "$timeout", "ones.config", "$parse", "pluginExecutor",
            function($compile, $q, $parse, $injector, $timeout, ONESConfig, $parse, $plugin) {
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
                            '><option></option></select>',
                        'fields/static': '<span ng-bind="%s"></span>',
                        'fields/email': '<input type="email" %s />',
                        'fields/textarea': '<textarea %s>%s</textarea>',
                        'fields/password': '<input type="password" %s />',
                        'fields/select2': '<ui-select ng-model="%(model)s" class="editAble" %(event)s theme="selectize" reset-search-input="false" %(attrs)s>'+
                            '<match ng-bind-html="$select.selected.label"></match>'+
                            '<choices refresh="%(method)s_refresh($select.search)" refresh-delay="0" repeat="%(data)s in %(method)s | filter: $select.search">'+
                            '<div ng-bind-html="%(data)s.label"></div>'+
                            '</choices>'+
                            '</ui-select>',
                        'fields/datepicker': '<span class="input-icon input-icon-right"> \
                                    <input type="date" ng-model="%(model)s" %(attrs)s /> \
                                <i class="icon-calendar gray"></i> \
                            </span>',
                        'fields/datetime': '<span class="input-icon input-icon-right"> \
                                    <input type="datetime-local" ng-model="%(model)s" %(attrs)s /> \
                                <i class="icon-calendar gray"></i> \
                            </span>',
                        'fields/typeahead': '<input type="text" ' +
                            'typeahead-on-select="showselected(this)" typeahead-editable="false" typeahead-min-length="0" ' +
                            'ng-options="%(key)s.label as %(key)s.label for %(key)s in %(data)s($viewValue)" %(attr)s '+
                            'data-html="true" bs-typeahead />',
                        'fields/craft': '<a class="craftSetLink" ng-bind="%(label)s" ng-click="%(action)s"></a>'
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

                    $plugin.callPlugin("when_fields_factory_init", service.fieldsMakerFactory);

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

                        var self = this;

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
                            fieldDefine.displayName = l("lang."+context.field);
                        }

                        var html = false;
                        if (method in this) {
                            html = this[method](context.field, fieldDefine, $scope, context, self);
                        }

                        if(undefined !== fieldDefine.value){
                            var getter = $parse(self.opts.dataName+"."+context.field);
                            getter.assign($scope.$parent, fieldDefine.value);
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
                    _attr: function(name, fieldDefine, blackList) {
                        var k, v, html = [];
                        var bl = [
                            "inputType",
                            "listAble",
                            "displayName",
                            "nameField",
                            "valueField",
                            "hideInForm",
                            "cellFilter",
                            "primary",
                            "dataSource",
                            "helpText",
                            "uiEvents"
                        ];
                        bl = $.extend(bl, blackList);
                        fieldDefine["autocomplete"] = "false";
                        //多行数据 如bill
                        if (!this.opts.multi) {
                            fieldDefine.id = "id_" + name;
                            fieldDefine.name = name;
                        }
                        for (k in fieldDefine) {
                            if (bl.indexOf(k) >= 0) {
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
                    _email: function(name, fieldDefine) {
                        return sprintf(this.$parent.templates["fields/email"], this._attr(name, fieldDefine));
                    },
                    //数字
                    _number: function(name, fieldDefine) {
                        return sprintf(this.$parent.templates["fields/number"], this._attr(name, fieldDefine));
                    },
                    _password: function(name, fieldDefine) {
                        delete(fieldDefine.value);
                        return sprintf(this.$parent.templates["fields/password"], this._attr(name, fieldDefine));
                    },
                    _datepicker: function(name, fieldDefine, $scope) {
                        if(fieldDefine.value) {
//                            console.log(fieldDefine["ng-model"]);
                            var getter = $parse(fieldDefine["ng-model"]);
                            $scope.$apply(function(){
                                getter.assign($scope, fieldDefine.value);
                            });
                        }
                        return sprintf(this.$parent.templates["fields/datepicker"], {
                            attrs: this._attr(name, fieldDefine),
                            model: fieldDefine["ng-model"]
                        });
                    },
                    _datetime: function(name, fieldDefine, $scope) {
                        if(fieldDefine.value) {
//                            console.log(fieldDefine["ng-model"]);
                            var getter = $parse(fieldDefine["ng-model"]);
                            $scope.$apply(function(){
                                getter.assign($scope, new Date(fieldDefine.value));
                            });
                        }
                        return sprintf(this.$parent.templates["fields/datetime"], {
                            attrs: this._attr(name, fieldDefine),
                            model: fieldDefine["ng-model"]
                        });
                    },
                    //多选框
                    _checkbox: function(name, fieldDefine) {

                    },
                    _static: function(name, fieldDefine) {
                        return "";
                        return sprintf(this.$parent.templates["fields/static"], fieldDefine["ng-model"]);
                    },
                    _craft: function(name, fieldDefine, $scope, context, factory) {
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
                        $scope.$parent[factory.opts.dataName][context.trid].craft = l('lang.undefined');
                        var crafts = [];
                        res.query({
                            goods_id: goods_id,
                            only_defined: true
                        }).$promise.then(function(data){
                                angular.forEach(data, function(item){
                                    crafts.push(item.name);
                                });
                                if(crafts.length) {
                                    $scope.$parent[factory.opts.dataName][context.trid].craft = crafts.join(">");
                                }
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
                        fieldDefine["data-placeholder"]= l('lang.messages.chosen_select_text');
                        fieldDefine["no-results-text"]= l('lang.messages.chosen_no_result_text');


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
                        } else if (typeof (fieldDefine.dataSource) === "function" || typeof (fieldDefine.dataSource) === "string") {
                            if(typeof (fieldDefine.dataSource) === "string") {
                                fieldDefine.dataSource = $injector.get(fieldDefine.dataSource);
                            }

                            var queryParams = fieldDefine.queryParams || {};

                            //需要使用已有数据作为参数进行查询
                            if(fieldDefine.queryWithExistsData) {
                                angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                                    queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                        ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                        : $scope.$parent[self.opts.dataName][qItem];
                                });
                            }

                            var promise = getDataApiPromise(fieldDefine.dataSource, "query", queryParams);
                            promise.then(function(result) {
                                angular.forEach(result, function(item) {
                                    data.push({
                                        value: item[valueField],
                                        name: item[nameField]
                                    });
                                });
                                $scope.$parent[fieldDefine.remoteDataField + "sSelect"] = data;
                            });
                        }

                        var getter = $injector.get("$parse")(fieldDefine["ng-model"]);

                        $scope.$on("form.dataLoaded", function(){
                            var exists = $scope.$parent.$eval(fieldDefine["ng-model"]);
                            if(undefined !== exists || false === fieldDefine.required || fieldDefine.multiple) {
                                return;
                            }
                            //默认值
                            try{
                                getter.assign($scope.$parent, $scope.$parent[fieldDefine.remoteDataField + "sSelect"][0].value);
                            } catch(e) {}

                        });

                        return sprintf(this.$parent.templates["fields/select"], {
                            attr: this._attr(name, fieldDefine),
                            key: name + "item",
                            data: fieldDefine.remoteDataField + "sSelect"
                        });
                    },
                    _select3: function(name, fieldDefine, $scope) {
                        var key = "s"+md5.createHash(fieldDefine["ng-model"]+"Select3Config");
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
                        var html = sprintf(this.$parent.templates['fields/select2'], {
                            method: methodName,
                            data: name,
                            key: "forkey",
                            label: nameField,
                            model: fieldDefine["ng-model"],
                            event: fieldDefine["ui-event"] ? sprintf('ui-event="%s"', fieldDefine["ui-event"]) : "",
                            attrs: this._attr(name, fieldDefine)
                        });

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

                service.makeBill = function($scope, config){
                    var defaultOpts = {
                        minRows: 9,
                        dataName: "formData",
                        autoFocusNext: true,
                        methods: {},
                        relateMoney: false
                    };

                    this.scope = $scope;
                    this.compile = $compile;

                    this.opts = $.extend(defaultOpts, config);


                    this.scope.$parent[this.opts.dataName] = this.scope.$parent[this.opts.dataName] || [];
                    this.scope.$parent.formMetaData = this.scope.$parent.formMetaData || {};
                    this.scope.$parent.isEdit = this.opts.isEdit;

                    this.opts.templates = this.templates = {
                        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                            '<thead><tr><th>#</th><th></th>%(headHTML)s</tr></thead>'+
                            '<tbody>%(bodyHTML)s</tbody><tfoot><tr>%(footHTML)s</tr></tfoot></table>',
                        'bills/fields/rowHead.html': '<th>%(i)s</th><td class="center"><label class="rowHead">'+
                            '<i class="icon icon-plus" ng-click="billAddRow($event)"></i> '+
                            '<i class="icon icon-trash-o" ng-click="billRemoveRow($event)"></i> '+
                            '</label></td>',
                        'bills/fields/td.html': '<td class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"><label ng-bind="%(bind)s" title="{{%(bind)s}}" %(event)s>%(label)s</label></td>',
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
                        var html = [];
                        var self = this;
                        angular.forEach(fieldsDefine, function(item){
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }
                            var attr = [];
                            if(item && "width" in item) {
                                attr.push('width="'+item.width+'"');
                            }
                            html.push(sprintf('<th %s>%s</th>', attr.join(""), item.displayName));
                        });
                        return html.join("");
                    },
                    makeBody: function(fieldsDefine){
                        var html = [], self=this;

                        //编辑模式下
                        var defaultData = [];

                        if(self.scope.$parent.formMetaData.rows && self.scope.$parent.formMetaData.rows.length) {
                            defaultData = self.scope.$parent.formMetaData.rows;
                        } else if(self.scope.$parent[self.opts.dataName] && self.scope.$parent[self.opts.dataName].length) {
                            defaultData = self.scope.$parent[self.opts.dataName];
                        }

                        if(defaultData.length > 0) {
                            this.scope.$parent.formMetaData.rows = defaultData = dataFormat(fieldsDefine, defaultData);
                        }

                        var defaultDataLength = defaultData.length || self.opts.minRows;
                        for(var i=0;i<defaultDataLength;i++) {
                            html.push(this.makeRow(fieldsDefine, i, defaultData));
                        }

                        return html.join("");
                    },
                    makeFoot: function(fieldsDefine){
                        var html = ['<td colspan="2" align="center">'+l('lang.total')+'</td>'];
                        var hasTotalAble = false;
                        var self = this;
                        angular.forEach(fieldsDefine, function(item, field){
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }
                            if(item.totalAble) {
                                hasTotalAble = true;
                                html.push(sprintf('<td class="tdTotalAble" tdname="%(field)s" id="tdTotalAble%(field)s" ng-bind="%(dataBind)s" title="{{%(dataBind)s}}">0</td>',
                                    {
                                        field: field,
                                        dataBind: item.cellFilter ? "formMetaData.total_"+field + "|"+item.cellFilter : "formMetaData.total_"+field
                                    }));
                            } else {
                                html.push("<td></td>");
                            }
                        });
                        if(hasTotalAble) {
                            return sprintf("<tr>%s</tr>", html.join(""));
                        } else {
                            return "";
                        }
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
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }

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
                                event: false !== item.editAble ? 'ng-click="billFieldEdit($event)"' : "",
                                label: label,
                                bind: labelBind
                            }));
                        });

                        this.maxTrId = i;
                        return sprintf('<tr data-trid="%s">%s</tr>', i, sprintf(html.join(""), {
                            i: i+1
                        }));
                    },
                    bindEvents: function(scope){

                        var self = this;
                        var parentScope = self.parentScope = scope.$parent;
                        parentScope.billFieldEdit = function($evt){
                            var ele = $evt.target || $evt;

                            var context = getLabelContext(ele);

                            //已经存在input
                            if(context.td.find(".editAble").length) {
                                context.td.find(".editAble").removeClass("hide").find("input");
                                context.inputAble.trigger("click").focus();
                                return false;
                            }
                            var struct = self.opts.fieldsDefine[context.field] || {};
                            struct.class="width-100 editAble";
                            struct.remoteDataField = sprintf("%s_%d", context.field, parseInt(context.trid) || 0);
                            struct["ng-model"] = sprintf("%s[%d].%s", self.opts.dataName, parseInt(context.trid) || 0, context.field);
                            if(struct.editAbleRequire) {
                                if(struct.editAbleRequire instanceof Array) {
                                    for(var i=0;i<struct.editAbleRequire.length;i++) {
                                        struct.editAbleRequire[i];
                                        if(!parentScope[self.opts.dataName][context.trid] || !parentScope[self.opts.dataName][context.trid][struct.editAbleRequire[i]]) {
                                            return false;
                                        }
                                    }
                                } else {
                                    if(!parentScope[self.opts.dataName][context.trid] || !parentScope[self.opts.dataName][context.trid][struct.editAbleRequire]) {
                                        return false;
                                    }
                                }
                            }


                            //支持的事件列表
                            var eventsList = ["blur", "click", "keydown", "focus", "change"];
                            var events = {};

                            context.field = context.field || "";
                            angular.forEach(eventsList, function(e){
                                var m = sprintf("on%s%s%s", context.field.ucfirst(), context.inputType.ucfirst(), e.ucfirst());

                                if(m in parentScope) {
                                    events[e] = m;
                                } else {
                                    m = sprintf("on%s%s", context.inputType.ucfirst(), e.ucfirst());
                                    if(m in parentScope) {
                                        events[e] = m;
                                    }
                                }
                            });

                            if(struct["uiEvents"]) {
                                var eventFuncName = "";
                                angular.forEach(struct.uiEvents, function(e, k){
                                    if(typeof(e) == "function") {
                                        eventFuncName = "e_"+md5.createHash(String(Math.random()));
                                        parentScope[eventFuncName] = e;
                                    } else if(angular.isArray(e)) {
                                        eventFuncName = "e_"+md5.createHash(String(Math.random()));
                                        parentScope[eventFuncName] = e[1];
                                    } else {
                                        eventFuncName = e;
                                    }
                                    if(events[k] || (angular.isArray(e) && e[0] !== "override")) {
                                        events[k] = events[k]+","+eventFuncName;
                                    } else {
                                        events[k] = eventFuncName;
                                    }

                                });
                            }

                            struct["ui-event"] = [];
                            if(events) {
                                angular.forEach(events, function(method, e){
                                    var methods = [];
                                    angular.forEach(method.split(","), function(m){
                                        methods.push(m+"($event, this)");
                                    });
                                    struct["ui-event"].push(sprintf("%s: '%s'", e, methods.join(";")));
                                });

                                struct["ui-event"] = sprintf("{%s}", struct["ui-event"].join(","));
                            }

                            var html = self.fm.maker.factory(context, struct, scope);
                            html = self.compile(html)(parentScope);

                            context.td.append(html);
                            $timeout(function(){
                                context = getInputContext(ele);
                                context.inputAble.focus();
                                context.inputAble.bind("keydown", function(e){
                                    if(e.keyCode === 13) {
                                        $timeout(function(){
                                            self.parentScope.billEndEdit(context.td);
                                        },100);
                                    }
                                });
                            }, 200);
                            return true;
                        };

                        //结束编辑 ele 应为td子元素
                        /**
                         * @todo 回调方法
                         * */
                        parentScope.billEndEdit = function(td, isBlur){
                            var next = false;
                            var tdEditAbles = td.parent().find(".tdEditAble");
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
                                        self.parentScope.billAddRow(null, true);
                                    }
                                    next = $("#billTable tbody tr").eq(td.parent().index()+1).find("td.tdEditAble").eq(0);//跳到下一行
                                }
                                self.parentScope.billFieldEdit(next.find("label"));
                            }
                            self.scope.editing = false;
                            if("callback" in self.fieldsDefine[$(td).data("bind-model")]) {
                                self.fieldsDefine[$(td).data("bind-model")].callback($(td).parent());
                            }

                        };

                        //增删行
                        parentScope.billAddRow = function($evt, isTbody) {
                            var element = $evt.target;
                            var html = self.makeRow(self.opts.fieldsDefine, self.maxTrId+1);
                            html = self.compile(html)(self.parentScope);
                            if(true === isTbody) {
                                $("#billTable tbody").append(html);
                            } else {
                                $(element).parent().parent().parent().after(html);
                            }
                            self.reIndexTr();
                        };
                        parentScope.billRemoveRow = function($evt) {
                            var element = $evt.target;
                            if($("#billTable tbody tr").length < 2) {
                                alert("At least 1 rows");
                                return;
                            }
                            var tr = $(element).parents("tr");
                            delete(parentScope[self.opts.dataName][tr.data("trid")])
                            tr.remove();
                            self.reIndexTr();

//                            console.log(parentScope[self.opts.dataName]);

                            recountTotalAmount();
                            recountTotalAble();
                        };

                        //不同字段不同事件
                        parentScope.onTextBlur = function(event) {
                            var ele = $(event.target);
                            parentScope.billEndEdit(ele.parent(), true);
                            self.setData(ele, ele.val(), true);
                        };
                        parentScope.onTextKeydown = function(event) {
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
                        if(parentScope.onNumberBlur === undefined) {
                            parentScope.onNumberBlur = function(event) {
                                var ele = $(event.target);
                                parentScope.billEndEdit(ele.parent(), true);
                                self.setNumberData(ele, ele.val(), true);
                            };
                        }
                        parentScope.onNumberKeydown = function(event) {
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
                        parentScope.onTypeaheadBlur = function(event){
                            var ele = $(event.target);
                            self.setTypeaheadData(ele, self.scope, true);
                        };
                        parentScope.onTypeaheadKeydown = function(event) {
                            if(event.keyCode == 9) {
                                window.event.returnValue=false;
                                var ele = $(event.target);
                                self.setTypeaheadData(ele, self.scope);
                            } else if(event.keyCode == 13) {
                                var ele = $(event.target);
                                self.setTypeaheadData(ele, self.scope);
                            }
                        };
                        parentScope.onSelect2Keydown = function(event) {
//                            console.log(arguments);
                        };
                        parentScope.onSelect3Blur = function(event) {
                            var context = getInputContext(event.target);
                            parentScope.billEndEdit(context.td, true);
                        };
                        parentScope.onStockSelect3Blur = function(event){
                            $timeout(function(){
                                var context = getInputContext(event.target);
                                var tmp = self.parentScope[self.opts.dataName][context.trid];
                                var queryParams = {
                                    id: 0,
                                    stock_id: tmp.stock
                                };
                                queryParams = $.extend(angular.copy(tmp), queryParams);

                                getDataApiPromise($injector.get("Store.StockProductListAPI"), "get", queryParams)
                                    .then(function(data){
                                        self.parentScope[self.opts.dataName][context.trid].store_num=data.num || 0;
                                    });
                            }, 200);

                        };

                        var countRowAmount = parentScope.countRowAmount = function(index){
                            var price =  parentScope[self.opts.dataName][index].unit_price
                            var num = parentScope[self.opts.dataName][index].num;
                            var discount = parentScope[self.opts.dataName][index].discount;
                            //计算折扣
                            if(discount === undefined || parseInt(discount) === 0) {
                                discount = 100;
                            };
                            parentScope[self.opts.dataName][index].amount = Number(parseFloat(num * price * discount / 100).toFixed(2));
                            recountTotalAmount();
                        };
                        var recountTotalAmount = parentScope.recountTotalAmount = function() {
                            var totalAmount = 0;
                            angular.forEach(parentScope[self.opts.dataName], function(row){
                                if(!row || !row.amount) {
                                    return;
                                }
                                totalAmount += Number(row.amount);
                            });
                            parentScope.formMetaData.total_amount = parseFloat(totalAmount).toFixed(2);
                        };

                        var recountTotalAble = parentScope.recountTotalAble = function(){

                            angular.forEach($("#billTable tbody tr:first td"), function(td){
                                var element = $(td).find(".editAble");
                                if(!element.length) {
                                    return false;
                                }
                                if(element.attr("totalAble")) {
                                    var total = 0;
                                    var context = getInputContext(element);
                                    angular.forEach(parentScope[self.opts.dataName], function(item){
                                        if(item && context.field in item) {
                                            total += parseFloat(item[context.field]);
                                        }
                                    });
                                    total = total.toFixed(2);
                                    var data = 0;
                                    data = parseFloat(data).toFixed(2);
                                    parentScope.formMetaData["total_"+context.field] = total;
                                }
                            });


                        };

                        /**
                         * 数量变动时，计算行内总价，更新数量统计，更新总金额
                         * */
                        parentScope.onNumNumberBlur = function(event){
                            var context = getInputContext(event.target);

                            if(!parentScope[self.opts.dataName][context.trid].discount && parentScope.formMetaData.customerInfo) {
                                parentScope[self.opts.dataName][context.trid].discount = parentScope.formMetaData.customerInfo.discount;
                            }
                            var totalNum = 0;
                            angular.forEach(parentScope[self.opts.dataName], function(item){
                                if(!item || !item.num) {
                                    return;
                                }
                                totalNum += Number(item.num);
                            });
                            parentScope.formMetaData.total_num = totalNum;
                            if(parentScope[self.opts.dataName][context.trid] && parentScope[self.opts.dataName][context.trid].goods_id) {
                                if(undefined === parentScope[self.opts.dataName][context.trid].unit_price){
                                    var gid = parentScope[self.opts.dataName][context.trid].goods_id.split("_");

                                    $injector.get("Store.StockProductListAPI").getUnitPrice(parentScope[self.opts.dataName][context.trid], parentScope.unitPriceField || "price")
                                        .then(function(data){
                                            parentScope[self.opts.dataName][context.trid].unit_price = Number(data[parentScope.unitPriceField||"price"]);
                                            parentScope.countRowAmount(context.trid);
                                            parentScope.recountTotalAmount();
                                        })
                                    ;
//                                    return;
//                                    $injector.get("Store.StockProductListAPI").get({
//                                        id: gid[1]
//                                    }).$promise.then(function(data){
//                                        parentScope[self.opts.dataName][context.trid].unit_price = Number(data[parentScope.unitPriceFile||"price"]);
//                                        parentScope.countRowAmount(context.trid);
//                                        parentScope.recountTotalAmount();
//                                    });
                                } else {
                                    parentScope.countRowAmount(context.trid);
                                    parentScope.recountTotalAmount();
                                }
                            }
                        };

                        /**
                         * 如果涉及到金额，加入默认计算事件
                         * */
                        if(self.opts.relateMoney) {
                            //实收金额
                            var times = 0;
                            parentScope.$watch('formMetaData.total_amount', function(newVal, oldVal){
                                if(self.opts.isEdit && times <= 1) {
                                    times++;
                                    return;
                                }

                                times = 0;
                                parentScope.formMetaData.total_amount_real = parentScope.formMetaData.total_amount;
                            });

                            //单价
                            parentScope.onUnit_priceNumberBlur = function(event){
                                var context = getInputContext(event.target);
                                countRowAmount(context.trid);
                                var ele = $(event.target);
                                self.setNumberData(ele, ele.val(), true);
                                recountTotalAmount();
                            };
                            //折扣
                            parentScope.onDiscountNumberBlur = function(event){
                                var context = getInputContext(event.target);
                                countRowAmount(context.trid);
                                recountTotalAmount();

                                var ele = $(event.target);
                                self.setNumberData(ele, ele.val(), true);
                            };
                            //行内总价
                            parentScope.onTotal_amountNumberBlur = function(event){
                                recountTotalAmount();
                            };
                        }
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
                                if(item && context.field in item) {
                                    total += Number(item[context.field]);
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
                        context.td.find(".editAble").addClass("hide");
                        this.scope.$parent.billEndEdit(context.td, isBlur);
                    },
                    setTypeaheadData: function(ele, scope, isBlur) {
                        var val;
                        var context = getInputContext(ele);
                        var self = this;
                        $timeout(function(){
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

                service.makeForm = function($scope, config) {

                    this.scope = $scope;
                    config = config || {};

                    if (!config.fieldsDefine) {
                        return false;
                    }

                    var defaultOpts = {
                        class: "form-horizontal",
                        submitAction: "doSubmit",
                        fieldsDefine: {},
                        includeFoot: true,
                        templates: {
                            "commonForm/form.html": '<form class="form-horizontal" name="%(name)s" ng-keydown="doKeydown($event)" novalidate>%(html)s</form>',
                            "commonForm/footer.html": '<div class="clearfix form-actions center">' +
                                '<button id="submitbtn" class="btn btn-primary" ng-click="%(action)s();" type="button">' +
                                '<i class="icon-ok bigger-110"></i>' +
                                '{{%(langsubmit)s}}' +
                                '</button>' +
                                '&nbsp; &nbsp; &nbsp;' +
                                '<button class="btn" ng-click="doResetForm()">' +
                                '<i class="icon-undo bigger-110"></i>' +
                                '{{%(langreset)s}}' +
                                '</button>' +
                                '&nbsp; &nbsp; &nbsp;' +
                                '<button class="btn btn-info" onclick="history.back()">' +
                                '<i class="icon-undo bigger-110"></i>' +
                                '{{%(langreturn)s}}' +
                                '</button>' +
                                '</div>',
                            "commonForm/box.html": '<div class="form-group col-sm-%(colWidth)s" ng-class="{\'has-error\': %(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid}">' +
                                '<label class="col-sm-3 control-label no-padding-right">%(label)s</label>' +
                                '<div class="col-sm-%(inputBoxWidth)s">%(inputHTML)s</div>' +
                                '<div class="help-block col-sm-reset">' +
                                '<span ng-bind="%(formname)s.%(fieldname)s|toError" ng-hide="%(formname)s.%(fieldname)s.$valid"></span>' +
                                '<span> %(helpText)s</span>' +
                                '</div>' +
                                '</div>',
                            "commonForm/hide.html": '%(inputHTML)s',
                            "text": '<input type="text" %s />',
                            "number": '<input type="number" %s />',
                            "select": '<select %(attr)s ng-options="%(value)s as %(name)s for %(key)s in %(data)s"></select>'
                        },
                        name: "form",
                        dataName: "formData"
                    };

                    this.opts = $.extend(defaultOpts, config);


                    this.opts.dataName = this.opts.dataName ? this.opts.dataName : this.opts.name+"Data";

                    $scope.$parent[this.opts.dataName] = $scope.$parent[this.opts.dataName] || {};
                    $scope[this.opts.dataName] = {};

                    $scope.$parent.doKeydown = function(event){

                        //绑定回车提交事件
                        if(event.keyCode === 13
                            && $(event.target).attr("ng-model")
                            && !$(event.target).is("textarea")
                            && !$(event.target).hasClass("select3Input")) {
                            event.preventDefault();
                            event.stopPropagation();
                            $scope.$parent.doFormSubmit();
                        }
                    };

                    this.fm = new service.makeField($scope, this.opts);
                };

                service.makeForm.prototype = {
                    makeHTML : function() {
                        if(this.formBuilded) {
                            return;
                        }
                        var self = this;
                        var fieldHTML, finalHTML = [];
                        var boxHTML = this.opts.templates["commonForm/box.html"];

                        var colWidth = self.opts.columns ? 12/self.opts.columns : null;

                        angular.forEach(this.opts.fieldsDefine, function(struct, field){

                            if(struct.hideInForm || struct.primary) {
                                return false;
                            }
                            if(self.opts.isEdit && struct.onlyInAdd) {
                                return false;
                            }

                            if(!self.opts.isEdit && struct.onlyInEdit) {
                                return false;
                            }

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

                            fieldHTML = self.fm.maker.factory({field: field}, struct, self.scope);
                            if (false !== fieldHTML) {
                                if(struct.colspan) {
                                    colWidth = colWidth * struct.colspan;
                                }
                                var helpText = "";
                                if(struct.helpText) {
                                    try {
                                        helpText = l("lang.helpTexts.".struct.helpText);
                                    } catch(e) {}
                                    helpText = helpText || struct.helpText
                                }
                                finalHTML.push(sprintf(boxHTML, {
                                    helpText: helpText,
                                    colWidth: colWidth,
                                    inputBoxWidth: self.opts.columns>1 ? 6 : 4,
                                    formname: self.opts.name,
                                    fieldname: struct.name ? struct.name : field,
                                    label: struct.displayName,
                                    inputHTML: fieldHTML
                                }));
                            }

                        });

                        //包含表单结尾
                        if(self.opts.includeFoot) {
                            finalHTML.push(this.makeActions());
                        }

                        self.formBuilded = true;
                        return sprintf(self.opts.templates["commonForm/form.html"], {
                            name : self.opts.name,
                            html : finalHTML.join("")
                        });
                    },
                    makeActions: function(){
                        if(this.opts.formActions === false) {
                            return '<div class="clearfix"></div>';
                        }
                        return sprintf(this.opts.templates["commonForm/footer.html"], {
                            action: this.opts.submitAction,
                            langsubmit: "'lang.actions.submit'|lang",
                            langreset: "'lang.actions.reset'|lang",
                            langreturn: "'lang.actions.return'|lang"
                        });
                    }

                };

                return service;
            }]);
})();