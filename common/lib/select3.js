(function(){

    angular.module("ones.select3Module", [])
        .service("select3Field", ["$timeout", "$compile", "$parse", "$injector", "$rootScope", "FormMaker", "ComView", "$routeParams",
            function($timeout, $compile, $parse, $injector, $rootScope, FormMaker, ComView, $routeParams){

                var self = this;

                this.configs = {};
                this.currentConfig = {};
                this.focusing = false;

                //初始化
                this.init = function($scope, attrs) {

                    var scopeConfig = $scope.$parent.$eval(attrs.config);

                    scopeConfig.fieldDefine.field = scopeConfig.name;
                    scopeConfig["ng-model"] = scopeConfig["ng-model"] || scopeConfig.fieldDefine["ng-model"];
                    if(typeof(scopeConfig.fieldDefine.dataSource) === "string") {
                        scopeConfig.fieldDefine.dataSource = $injector.get(scopeConfig.fieldDefine.dataSource);
                    }

                    self.configs[attrs.config] = $.extend(self.getDefaultOpts(), scopeConfig.fieldDefine);

                    self.scope = $scope;
                };

                //载入配置
                this.loadConfig = function(key) {
                    this.currentConfig = this.configs[key];
                    return this.configs[key];
                };

                //创建HTML
                this.makeHTML = function(attrs) {
                    var config = this.loadConfig(attrs.config);

                    //绑定输入框事件
                    var events = {
                        'focus': "'doSelect3Focus($event)'",
                        'blur': "'doSelect3Blur($event)'",
                        'keydown': "'doSelect3Keydown($event)'"
                    };
                    if(config["ui-event"]) {
                        var tmpEvents;
                        eval('tmpEvents='+config["ui-event"]);
                        angular.forEach(tmpEvents, function(evt, key){
                            if(key in events) {
                                events[key] = events[key].replace(")'", ");"+evt+"'");
                            }
                        });
                    }

                    events = $.extend(events, config.events);
                    var attrs = [
                        ["ui-event", angular.toJson(events).replace(/"/g, "")],
                        ["class", "select3Input editAble"],
                        ["data-field", config.field],
                        ["data-config-hash", attrs.config]
                    ];
                    var attrHTML = [];
                    angular.forEach(attrs, function(item){
                        attrHTML.push(sprintf('%s="%s"', item[0], item[1]));
                    });

                    var html = sprintf(config.inputTpl, {
                        attr: attrHTML.join(" "),
                        model: config["ng-model"]
                    });

                    self.bindEvents();

                    return html;

                };

                //获取默认配置项
                this.getDefaultOpts = function(){
                    return {
                        autoQuery: false,
                        inputTpl: '<input type="text" ng-model="%(model)s_label" %(attr)s /><input type="hidden" ng-model="%(model)s" />',
                        selectTpl: '<ul class="select3Container" id="select3Container">'+
                            '<li ng-repeat="s3it in select3Items" ng-class="{active:$index==selectedItem}" data-value="{{s3it.value}}" ng-bind="s3it.label" ng-show="s3it.label.length>0" ui-event="%(events)s"></li>'+
                            '<li class="select3_add" ng-click="doSelect3AddNew(\'%(field)s\')"><i class="icon icon-plus"></i>{{\'lang.actions.add\'|lang}}</li>'+
                            '</ul>'
                    };
                };

                //绑定事件
                this.bindEvents = function(){
                    var parentScope = self.scope.$parent;

                    //获取焦点开始设定当前配置项
                    parentScope.doSelect3Focus = function($event) {

                        if(self.focusing) {
                            return false;
                        }
                        var config = self.loadConfig($($event.target).data("config-hash"));
                        self.focusing = true;

                        var val = $($event.target).val();
                        if(config.autoReset || (!val && config.autoQuery)) {
                            val = "_";
                        }
                        if(val || config.dynamicAddOpts || config.dataSource.dynamicAddOpts) {
                            parentScope.doSelect3Query(val);
                        }

                    };

                    parentScope.doSelect3Blur = function($event) {
                        self.focusing = false;

                        var valueModel = $($event.target).next().attr("ng-model");
                        var labelModel = $($event.target).attr("ng-model");

                        $timeout(function(){
                            parentScope.hideSelect3Options();

                            if(!parentScope.$eval(valueModel)) {
                                var getter = $parse(labelModel);
                                getter.assign(parentScope, undefined);
                            }

                        }, 150);
                    };

                    parentScope.doSelect3Keydown = function($event){

                        var config = self.currentConfig;


                        var Keys = ones.keyCodes;
                        if($event.keyCode === Keys.Up || $event.keyCode === Keys.down) {
                            window.event.returnValue =false;
                        }
                        $timeout(function(){
                            //监听键盘事件
                            switch($event.keyCode) {
                                case Keys.Enter:
                                    if(!$("#select3Container li").length) {
                                        return false;
                                    }
                                    self.scope.setValue($("#select3Container li.active"), $event);
                                    break;
                                case Keys.Tab:
                                case Keys.Escape:
                                    parentScope.hideSelect3Options();
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
                                        parentScope.doSelect3Query($event.target.value);
                                    }
                                    break;
                            }
                            parentScope.$digest();
                        });
                    };

                    parentScope.doSelect3Query = function(val){
                        var config = self.currentConfig;
                        //总是取得所有数据
//                        if(config.autoQuery) {
//                            val = "_";
//                        }
                        self.scope.select3Items = [];
                        //非数组形式数据源
                        if(!angular.isArray(config.dataSource)) {
                            if(!$.trim(val) && !config.dynamicAddOpts) {
                                parentScope.hideSelect3Options(true);
                                return;
                            }

                            var queryParams = config.queryParams || {};
                            queryParams.typeahead = $.trim(val);
                            if('queryWithExistsData' in config) {
                                angular.forEach(config.queryWithExistsData, function(qItem){
                                    queryParams[qItem] = config["data-row-index"] !== undefined
                                        ? parentScope[config.dataName][config["data-row-index"]][qItem]
                                        : parentScope[config.dataName][qItem];
                                });
                            }
                            var promise = getDataApiPromise(config.dataSource, "query", queryParams);
                            promise.then(function(data){
                                if(data.length < 1 && !config.dynamicAddOpts) {
                                    parentScope.hideSelect3Options(true);
                                    return;
                                }
                                var tmpList = [];
                                angular.forEach(data, function(item){
                                    tmpList.push({
                                        label: item[config.nameField || "name"],
                                        value: item[config.valueField || "id"]
                                    });
                                });
                                self.scope.select3Items = tmpList;
                                parentScope.displaySelect3Options();
                            });
                        } else {
                            if(config.dataSource.length < 1 && !config.dynamicAddOpts) {
                                //@todo no result
                                parentScope.hideSelect3Options(true);
                                return;
                            }
                            var tmpList = [];
                            angular.forEach(config.dataSource, function(item){
                                tmpList.push({
                                    label: item[config.nameField || "name"],
                                    value: item[config.valueField || "id"]
                                });
                            });
                            self.scope.select3Items = tmpList;
                            parentScope.displaySelect3Options();
                        }
                    };


                    parentScope.displaySelect3Options = function(){
                        if($("#select3Container").length) {
                            return;
                        }
                        var selectHTML = sprintf(self.currentConfig.selectTpl, {
                            events: "{keydown:'doSelect3Keydown($event)', click:'doSelect3Click($event)'}",
                            field: self.currentConfig.field
                        });
                        var selectHTMLCompiled = $compile(selectHTML)(self.scope);
                        $("body").append(selectHTMLCompiled);
                        var currentInput = $(".select3Input:focus");

                        if(!currentInput || !currentInput.offset()) {
                            return;
                        }

                        $("#select3Container").css({
                            minWidth: currentInput.outerWidth(),
                            left: currentInput.offset().left,
                            top: currentInput.offset().top+currentInput.outerHeight()
                        });
                        self.scope.selectedItem = 0;
                    };
                    parentScope.hideSelect3Options = function(keepFocus){
                        if(!keepFocus) {
                            $(".select3Input:focus").blur();
                        }
                        if(!keepFocus && self.currentConfig.autoHide) {
    //                        $(".select3Input").addClass("hide");
                        }
                        $("#select3Container").remove();
                        self.scope.select3Items = [];
                    };

                    self.scope.doSelect3Click = function($event) {
                        self.scope.setValue($event.target);
                    };
                    this.scope.setValue = function(element){

                        var getter = $parse(self.currentConfig["ng-model"]);
                        getter.assign(parentScope, $(element).data("value"));

                        //label
                        getter = $parse(self.currentConfig["ng-model"]+"_label");
                        getter.assign(parentScope, $(element).text());

                        parentScope.hideSelect3Options();
                    };

                    this.scope.doSelect3AddNew = function(){
                        var fieldDefine = self.currentConfig;
                        if(!fieldDefine.dynamicAddOpts || !fieldDefine.dynamicAddOpts) {
                            alert(toLang("this field not support dynamic add "+fieldDefine.displayName, "messages", $rootScope));
                            return false;
                        }

                        var formName = "dynamicEditForm"+fieldDefine.field;
                        var formDataName = "dynamicEditForm"+fieldDefine.field+"Data";

                        var $modal = $injector.get("$modal");
                        var modal = $modal({
                            scope: parentScope,
                            title: toLang("add", "actions", $rootScope) + self.currentConfig.displayName,
                            contentTemplate: "common/base/views/dynamicEdit.html"
                        });

                        var showModal = function(formFieldDefine) {
                            $timeout(function(){
                                var cacheKey = "form_html_cache_dynamic_add_"+fieldDefine.field;
                                modal.$promise.then(function(){
                                    parentScope[formDataName] = {};
                                    var modalHtml = ones.caches.getItem(cacheKey);
                                    if(!modalHtml || undefined === modalHtml || modalHtml === "undefined") {
                                        var fm = new FormMaker.makeForm(parentScope, {
                                            fieldsDefine: formFieldDefine,
                                            includeFoot: false,
                                            name: formName,
                                            dataName: formDataName
                                        });
                                        ones.caches.setItem(cacheKey, fm.makeHTML(), -1);
                                    }

                                    modalHtml = ones.caches.getItem(cacheKey);
                                    $("#dynamicEditContainer").html($compile(modalHtml)(parentScope));
                                });
                            }, 300);

                            parentScope.doDynamicAdd = function(){

                                if(!parentScope[formName].$valid) {
                                    ComView.alert(toLang("fillTheForm", "messages", $rootScope), "danger");
//                                    return false;
                                }

                                var callback = function() {
                                    modal.hide();
                                };

                                var postParams = $.extend(parentScope[formDataName], fieldDefine.dynamicAddOpts.postParams);

                                //命名歧义。。 应该是包含行内已有的某条数据
                                if(fieldDefine.dynamicAddOpts.postWithExtraData) {
                                    angular.forEach(fieldDefine.dynamicAddOpts.postWithExtraData, function(field){
                                        try {
                                            var tmp = parentScope[self.currentConfig.dataName][self.currentConfig["data-row-index"]][field];
                                            if(tmp !== undefined) {
                                                postParams[field] = tmp;
                                            }
                                        } catch(e) {}
                                    });
//                                    console.log(postParams);
                                }

                                getDataApiPromise(fieldDefine.dataSource, "save", postParams).then(callback);

                            };

                        };

                        //模型字段增加$routeParams.model_alias
                        if(fieldDefine.dynamicAddOpts.postParams && fieldDefine.dynamicAddOpts.postParams.modelAlias) {
                            $routeParams.modelAlias = fieldDefine.dynamicAddOpts.postParams.modelAlias;
                        }
                        var structure = $injector.get(fieldDefine.dynamicAddOpts.model).getStructure();
                        if("then" in structure && typeof structure.then == "function") {
                            structure.then(function(struct){
                                showModal(struct);
                            });
                        } else {
                            showModal(structure);
                        }
                    }

                };

            }])

        .directive("select3", ["$compile", "FormMaker", "$timeout", "select3Field", function($compile, FormMaker, $timeout, select3Field) {
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
                            var b = select3Field.init($scope, iAttrs);
                            $timeout(function() {
                                $(iElement).after($compile(select3Field.makeHTML(iAttrs))($scope.$parent));
                                iElement.remove();
                            });

                        }
                    };
                }
            };
        }])
    ;

})();