
(function(){
    /**
     * 通用视图
     *
     * */
    angular.module("ones.commonView", ["ones.formMaker", 'mgcrea.ngStrap'])
    /**
     * 通用路由适配
     * 使用通用Controller
     * Resource命名规则： ModuleNameRes
     * Model   命名规则： ModelNameModel
     * */
        .config(["$routeProvider", function($route){
            $route
                //列表 with extraParams
                .when('/:group/list/:module', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                .when('/:group/list/:module/:extra*', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                .when('/:group/listAll/:module', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                .when('/:group/listAll/:module/:extra*', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                //回收站
                .when('/:group/trash/:module', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                .when('/:group/trash/:module/:extra*', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                //新增
                .when('/:group/viewChild/:module/pid/:pid', {
                    //            templateUrl: 'views/common/grid.html',
                    controller : 'ComViewChildCtl'
                })
                .when('/:group/add/:module', {
                    templateUrl: 'common/base/views/edit.html',
                    controller : 'ComViewEditCtl'
                })
                //新增 with extraParams
                .when('/:group/add/:module/:extra*', {
                    templateUrl: 'common/base/views/edit.html',
                    controller : 'ComViewEditCtl'
                })
                //修改
                .when('/:group/edit/:module/id/:id', {
                    templateUrl: 'common/base/views/edit.html',
                    controller : 'ComViewEditCtl'
                })
                //修改 with extraParams
                .when('/:group/edit/:module/id/:id/:extra*', {
                    templateUrl: 'common/base/views/edit.html',
                    controller : 'ComViewEditCtl'
                })
                //新增子项
                .when('/:group/addChild/:module/pid/:pid', {
                    templateUrl: 'common/base/views/edit.html',
                    controller : 'ComViewEditCtl'
                })
                //打印
                .when('/:group/print/:module/id/:id', {
                    controller : 'ComViewPrintCtl',
                    templateUrl: "common/base/views/print.html"
                })
                .otherwise({
                    templateUrl: "common/base/views/404.html",
                    controller : "ComViewError404Ctl"
                })
                //子项列表
            ;
        }])
        .value('ComViewConfig', {
            actionClasses : {
                "add" : "primary",
                "list": "default",
                "listAll": "default",
                "export": "success"
            }
        })
        .controller('ComViewError404Ctl', ["$scope", function($scope){
            $scope.hidePageHeader = true;
        }])
        .controller('ComViewPrintCtl', ["$scope", "$injector", "$routeParams", "ones.dataApiFactory", "CommonPrint",
            function($scope, $injector, $routeParams, dataAPI, printer) {
                var group, module, res, model;

                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;

                $scope.printFooterTemplate = appView(sprintf("%s/printDetail.html", module), group.toLowerCase());

                $scope.selectAble = false;
                $scope.printModule = group+"_"+module;

                printer.init($scope, $routeParams.id);
                printer.displayPrintPage(model, res);

                $scope.doPrint = function(){
                    printer.doPrint();
                };

                //        $scope.doPrint();

            }])
        .controller('ComViewGridCtl', ["$rootScope", "$scope","ComView","$routeParams", "$injector", "ComViewConfig", "$location", "ones.dataApiFactory",
            function($rootScope,$scope, ComView, $routeParams, $injector, ComViewConfig, $location, dataAPI){
                var module,group,res,model,actions,pageActions=[];
                $scope.selectAble = true;

                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;

                var opts = {
                    queryExtraParams: {}
                };
                if($routeParams.extra) {
                    opts.queryExtraParams = parseParams($routeParams.extra);
                    var extra = $routeParams.extra;
                }

                //加入查询全部条件
                if($rootScope.currentPage.action === "listAll") {
                    opts.queryExtraParams.queryAll = true;
                }

                //加入仅查询回收站
                if($rootScope.currentPage.action === "trash") {
                    opts.queryExtraParams.onlyTrash = true;
                    $routeParams.extra = "onlyTrash/1";
                }

                //Grid 可跳转按钮
                try {
                    actions = $rootScope.i18n.urlMap[group].modules[module.ucfirst()].actions;
                } catch(e) {
                    throw("unable get i18n package section:" + group + "." + module + "." + actions);
                }

                ComView.makeGridLinkActions($scope, actions, model.isBill, extra, model);
                ComView.makeGridSelectedActions($scope, model, res, group, module);

                ComView.displayGrid($scope, model, res, opts);
            }])
        .controller('ComViewEditCtl', ["$rootScope", "$scope","ComView","$routeParams", "ones.dataApiFactory",
            function($rootScope,$scope, ComView, $routeParams, dataAPI){

                if($routeParams.extra) {
                    var queryExtraParams = parseParams($routeParams.extra);
                    $routeParams = $.extend($routeParams, queryExtraParams);
                }

                //            var extraParams = parseParams($routeParams.extra) || "";
                var module,group,res,model,actions;
                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;

//                res = $injector.get(module.ucfirst()+"Res");
//                model = $injector.get(module.ucfirst()+"Model");
                //            console.log($scope);console.log(res);
                //可跳转按钮
                try {
                    actions = $rootScope.i18n.urlMap[group].modules[module.ucfirst()].actions;
                } catch(e) {
                    throw("unable get i18n package section:" + group + "." + module + "." + actions);
                }
                ComView.makeGridLinkActions($scope, actions, model.isBill, $routeParams.extra, model);

                //           console.log($routeParams);
                $scope.selectAble = false;
                //            $scope.pageActions = pageActions;
                var opts = {
                    id: $routeParams.id,
                    queryParams: queryExtraParams
                };
                if(model.returnPage) {
                    opts.returnPage = model.returnPage;
                }

                ComView.displayForm($scope, model, res, opts);
            }])
        .service("ComView",["$location", "$rootScope", "$routeParams", "$q", "$alert", "$aside", "ComViewConfig", "$injector", "ones.config", "$timeout", "GridView",
            function($location, $rootScope, $routeParams, $q, $alert, $aside, ComViewConfig, $injector, conf, $timeout, GridView){
                var service = {};

                /**
                 * 返回I18N
                 * @param lang 语言包项键值，支持多级 如：actions.submit
                 * @param section 默认取用的section，如：lang 会取得 i18n.lang.langKey
                 * */
                service.toLang = function(lang, section) {
                    return toLang(lang, section, $rootScope);
                }

                /**
                 * 通用alert
                 * */
                service.alert = function(alertMsg, type, title, autohide) {
                    type = type || "warning";
                    //                title = title || type.ucfirst()+":";
                    var erpalert = $alert({title: title,
                        content: alertMsg,
                        placement: 'top',
                        type: type,
                        show: true,
                        container: '#alerts-container'
                    });

                    if(autohide !== false) {
                        setTimeout(function(){
                            erpalert.hide();
                        }, autohide < 3000 ? 3000 : 5000);
                    }
                };
                /**
                 * 通用aslide
                 * */
                service.aside = function(title, content, template){
                    template = template || "views/common/asides/default.html";
                    $rootScope.asideContent = {
                        title: title,
                        content:content
                    };
                    $aside({
                        template: template,
                        scope: $rootScope
                    });
                };
                /**
                 * 通用跳转
                 * */
                service.redirectTo = function(url) {
                    var url = "/HOME/goTo/url/"+encodeURI(encodeURIComponent(url));
                    $location.url(url);
                }

                /**
                 * 过滤器
                 * */
                service.makeFilters = function($scope, filters){
                    $scope.filters = filters;
                    $scope.showFilters = true;
                    var FieldsDefine = {};
                    var fm = $injector.get("FormMaker");
                    angular.forEach(filters, function(item, type){
                        switch(type) {
                            case "between":
                                FieldsDefine["_filter_start_"+item.field] = {
                                    displayName: service.toLang(item.field) + service.toLang("start"),
                                    inputType: item.inputType || "number",
                                    value: item.defaultData[0] || 0
                                };
                                FieldsDefine["_filter_end_"+item.field] = {
                                    displayName: service.toLang(item.field) + service.toLang("end"),
                                    inputType: item.inputType || "number",
                                    value: item.defaultData[1] || 0
                                };
                                break;
                            case "select":
                                FieldsDefine["_filter_"+item.field] = item;
                                break;

                        }
                    });

                    var modal = null;
                    var modalHtml = null;
                    var $compile = $injector.get("$compile");
                    var $modal = $injector.get("$modal");
                    if(!$scope.doFilter) {
                        $scope.doFilter = function(){
                            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText, $scope.formData);
                            modal.hide();
                        };
                    }

                    $scope.showFiltersModal = function(){
                        if(modal && modalHtml) {
                            modal.show();
                            $timeout(function(){
                                $("#filterContainer").append($compile(modalHtml)($scope));
                            });
                            return;
                        }
                        $scope.modal = modal = $modal({
                            scope: $scope,
                            title: service.toLang("filters", "actions"),
//                            content: {
//                                config: $scope.config,
//                                defaultData: $scope.defaultData
//                            },
                            contentTemplate: "common/base/views/filters.html"
                        });
                        modal.$promise.then(function(){
                            $timeout(function(){
                                var FormMaker = $injector.get("FormMaker");
                                var fm = new FormMaker.makeForm($scope, {
                                    fieldsDefine: FieldsDefine,
                                    includeFoot: false
                                });
                                modalHtml = fm.makeHTML();
                                $("#filterContainer").append($compile(modalHtml)($scope));
                            });
                        });
                    };

                }

                service.displayForm = function($scope, fieldsDefine, resource, opts, remote){
                    //                console.log(arguments);
                    $scope.formConfig = {};
                    var defaultOpts = {
                        name: "form", //表单名称
                        id: null, //如为编辑，需传递此参数
                        dataLoadedEvent: null, //需要异步加载数据时，传递一个dataLoadedEvent的参数标识异步数据已经加载完成的广播事件
                        dataName: "formData", //数据绑定到$scope的名字
                        columns: null,
                        returnPage: sprintf("/%(group)s/list/%(module)s", {
                            group: $routeParams.group,
                            module: $routeParams.module
                        }) //表单提交之后的返回页面地址
                    };
                    opts = $.extend(defaultOpts, opts);
                    if(opts.id) {
                        opts.isEdit = true;
                    }
//                    opts.dataName = opts.name + "Data";
                    $scope.formConfig = opts;
//                    $scope.formConfig.name = opts.name;
//                    $scope.formConfig.dataName = opts.dataName;
//                    $scope.formConfig.isEdit = opts.isEdit;

                    var doDefine = function(fd) {
                        $scope.formConfig.fieldsDefine = fd;
                        //编辑
                        if (opts.id || opts.isEdit) {
                            //
                            var tmpParams = opts.queryParams || {};
                            if(opts.id) {
                                tmpParams.id = opts.id;
                            }

                            var promise = getDataApiPromise(resource, "get", tmpParams)
//                            if(typeof(resource.get) === undefined) {
//                                promise = resource.api.get(tmpParams).$promise;
//                            } else {
//                                promise = resource.get(tmpParams).$promise;
//                            }

                            promise.then(function(defaultData) {
                                $scope[opts.dataName] = dataFormat($scope.formConfig.fieldsDefine, defaultData);
                            });
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
                    if(typeof(fieldsDefine) === "object" && "getStructure" in fieldsDefine && typeof(fieldsDefine.getStructure) === "function") {
                        var model = fieldsDefine;
                        $scope.formConfig.columns = model.columns || 1;
                        $scope.formConfig.formActions = undefined === model.formActions ? true : false;
                        var field = model.getStructure();
                        if(remote || ("then" in field && typeof(field.then) === "function")) { //需要获取异步数据
                            field.then(function(data){
                                fieldsDefine = data;
                                doDefine(data);
                            }, function(msg){
                                service.alert(msg);
                            });
                        } else {
                            doDefine(field);
                        }

                    } else {
                        doDefine(fieldsDefine);
                    }

                    $scope.doFormValidate = function(name){
                        name = name || opts.name;
                        if (false === $scope[name].$valid) {
                            if($scope[name].$error) {
                                service.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                            } else {
                                service.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                            }
                            return false;
                        }
                        return true;
                    }

                    //提交表单
                    $scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {
                        //                    console.log("submit");

                        if(!$scope.doFormValidate()) {
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
                                service.alert(data.msg);
                            } else {
                                var lastPage = ones.caches.getItem("lastPage");
                                $location.url(lastPage[0] || opts.returnPage);
                            }
                        };
                        if (opts.id) {
                            getParams.id = opts.id;
                            getDataApiPromise(resource, "update", getParams, $scope[opts.dataName]).then(callback);
//                            try {
//                                //首先尝试使用dataAPI.method
//                                //dataSource为resource对象时或者dataAPI.method时
//                                resource.update(getParams, $scope[opts.dataName], callback);
//                            } catch(e) {
//                                //尝试使用dataAPI.api.method
//                                resource.api.update(getParams, $scope[opts.dataName], callback);
////                                resource.update(getParams, $scope[opts.dataName], callback);
//                            }
//                            return promise;
//                            getDataApiPromise(resource, "update", getParams).then(callback);
//                            if(typeof(resource.update) == "undefined") {
//                                resource.api.update(getParams, $scope[opts.dataName], callback);
//                            } else {
//                                resource.update(getParams, $scope[opts.dataName], callback);
//                            }
                            //新增
                        } else {
                            var params = $.extend(getParams, $scope[opts.dataName]);
                            getDataApiPromise(resource, "save", params).then(callback);
//
//                            if(typeof(resource.save) == "undefined") {
//                                resource.api.save(params, $scope[opts.dataName], callback);
//                            } else {
//                                resource.save(params, $scope[opts.dataName], callback);
//                            }
                        }
                    };
                };

                service.displayGrid = function($scope, fieldsDefine, resource, opts){
                    $scope.totalServerItems = 0;
                    $scope.totalPages = 1;
                    $scope.gridSelected = [];

                    var options = opts ? opts : {};
                    fieldsDefine = fieldsDefine ? fieldsDefine : [];
                    var columnDefs = [];

                    /**
                     * 分页/Grid 过滤器默认项
                     * */
                    $scope.pagingOptions = {
                        pageSizes: [10, 15, 20, 30, 50],
                        pageSize: 10,
                        currentPage: 1
                    };
                    $scope.filterOptions = {
                        filterText: "",
                        useExternalFilter: false
                    };
                    $scope.sortInfo = {
                        fields: ["id"],
                        directions: ["ASC"]
                    };


                    //默认选项
                    var defaults = {
                        data: 'itemsList',
                        enablePaging: true,
                        showFooter: true,
                        showFilter: true,
                        showColumnMenu: true,
                        showSelectionCheckbox: true,
                        //                        selectWithCheckboxOnly: true,
                        rowHeight: 40,
                        multiSelect: true,
                        headerRowHeight: 40,
                        enableColumnResize: true,
                        selectedItems: $scope.gridSelected,
                        pagingOptions: $scope.pagingOptions,
                        filterOptions: $scope.filterOptions,
                        keepLastSelected: true,
                        //                    showGroupPanel: true,
                        sortInfo: $scope.sortInfo,
                        totalServerItems: "totalServerItems",
                        useExternalSorting: true,
                        //                        selectedItems: "gridSelected",
                        //            enablePinning: true,
                        //                        checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>',
                        i18n: "zh-cn",
                        plugins: [ngGridDoubleClick],
                        //extra
                        module: $location.$$url.split("/").splice(0, 3).join("/"),
                        subModule: "",
                        queryExtraParams: {}, //get 参数
                        editExtraParams: "" //edit 时附加参数
                    };

                    opts = $.extend(defaults, options);
                    opts.subModule = opts.subModule ? "/" + opts.subModule : "";


                    //                console.log(typeof(fieldsDefine));
                    //                console.log("getStructure" in fieldsDefine);
                    //                console.log(typeof(fieldsDefine.getStructure) == "function");

                    if(typeof(fieldsDefine) === "object"
                        && "getStructure" in fieldsDefine
                        && typeof(fieldsDefine.getStructure) === "function") {
                        var model = fieldsDefine;

                        if(model.config) {
                            opts = $.extend(opts, model.config);
                            angular.forEach(model.config, function(item,k){
                                model[k] = item;
                            });
                        } else {
                            angular.forEach(ones.BaseConf.modelConfigFields, function(conf){
                                opts[conf] = model[conf];
                            });
                        }

                        fieldsDefine = model.getStructure(true);
                        if("then" in fieldsDefine && typeof(fieldsDefine.then) === "function") { //需要获取异步数据
                            fieldsDefine.then(function(data){
                                fieldsDefine = data;
                                $scope.$broadcast("commonGrid.structureReady", model);
                            }, function(msg){
                                service.alert(msg);
                            });
                        } else {
                            $timeout(function(){
                                $scope.$broadcast("commonGrid.structureReady", model);
                            });
                        }
                    } else {
                        $timeout(function(){
                            $scope.$broadcast("commonGrid.structureReady", model);
                        });
                    }

                    $scope.$on("commonGrid.structureReady", function(evt, model) {

                        opts.resource = resource;

                        /**
                         * 字段名称
                         * */
                        for (var f in fieldsDefine) {
                            if(!fieldsDefine[f].field) {
                                fieldsDefine[f].field = f;
                            }
                            if(!fieldsDefine[f].displayName) {
                                fieldsDefine[f].displayName = service.toLang(f);
                            }
                            columnDefs.push(fieldsDefine[f]);
                        }


                        /**
                         * 过滤不显示字段
                         * */
                        var tmp = columnDefs;
                        columnDefs = [];
                        for(var $i=0;$i<tmp.length;$i++) {
                            if(tmp[$i].listable !== false) {
                                columnDefs.push(tmp[$i]);
                            }
                        }

                        opts.columnDefs = columnDefs;

                        $scope.$broadcast("commonGrid.ready");

                    });


                    /**
                     * 自定义过滤器
                     * */
                    if(model.filters) {
                        service.makeFilters($scope, model.filters);
                    }

                    $scope.gridOptions = opts;

                };



                service.displayBill = function($scope, fieldsDefine, resource, opts) {

                    var defaultOpt = {
                        dataName: "formData",
                        queryExtraParams: {}
                    };

                    $scope.selectAble = false;

                    //直接传入MODEL
                    if(typeof(fieldsDefine) == "object" && "getStructure" in fieldsDefine && typeof(fieldsDefine.getStructure) == "function") {
                        var model = fieldsDefine;
                        fieldsDefine = model.getStructure(true);
                        opts.relateMoney = model.relateMoney || false;

                        if("then" in fieldsDefine && typeof(fieldsDefine.then) == "function") {
                            fieldsDefine.then(function(data){
                                fieldsDefine = data;
                                $timeout(function(){
                                    $scope.$broadcast("commonBill.structureReady");
                                });

                            });
                        } else {
                            $timeout(function(){
                                $scope.$broadcast("commonBill.structureReady");
                            });
                        }

                        //工作流按钮
                        if(model.workflowAlias && $routeParams.id) {
                            $injector.get("Workflow.WorkflowNodeAPI").api.query({
                                workflow_alias: model.workflowAlias,
                                mainrow_id: $routeParams.id,
                                filterFields: ["id", "name"]
                            }).$promise.then(function(data){
                                $scope.mainrow_id = $routeParams.id;
                                $scope.billWorkflowActions = data;
                            });

                            $scope.doWorkflow = function(event, node_id){
                                var mainrow_id = $scope.mainrow_id;
                                var workflowAPI = $injector.get("Workflow.WorkflowAPI");
                                if(mainrow_id) {
                                    workflowAPI.doWorkflow(resource, node_id, mainrow_id);
                                }
                            };

                        }
                    }

                    $scope.$on("commonBill.structureReady", function(){
                        /**
                         * 字段名称
                         * */
                        for (var f in fieldsDefine) {
                            if(!fieldsDefine[f].field) {
                                fieldsDefine[f].field = f;
                            }
                            if(!fieldsDefine[f].displayName) {
                                fieldsDefine[f].displayName = service.toLang(f);
                            }
                        }

                        opts = $.extend(defaultOpt, opts);

                        opts.fieldsDefine = fieldsDefine;
                        if(model.config) {
                            opts = $.extend(opts, model.config);
                            angular.forEach(model.config, function(item, k){
                                model[k] = item;
                            });
                        } else {
                            angular.forEach(ones.BaseConf.modelConfigFields, function(conf){
                                opts[conf] = model[conf];
                            });
                        }


                        if($routeParams.id) {
                            opts.isEdit = true;
                            var queryExtraParams = $.extend(defaultOpt.queryExtraParams, {id: $routeParams.id, includeRows: true});
                            resource.get(queryExtraParams).$promise.then(function(data){
                                $scope.$broadcast("bill.dataLoaded", data);
                            });
                        }

                        $scope.billConfig = opts;

                        $scope.$broadcast("commonBill.ready");

                        if(opts.isEdit && $routeParams.id && isAppLoaded("workflow")) {
                            $injector.get("Workflow.WorkflowNodeAPI").api.query({
                                workflow_alias: model.workflowAlias,
                                mainrow_id: $routeParams.id,
                                filterFields: ["id", "name"]
                            }).$promise.then(function(data){
                                $scope.workflowInBill = data;
                                $scope.mainrow_id = $routeParams.id;
                            });

                        }

                    });



                    //默认单据提交方法，可自动判断是否编辑/新建
                    $scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {
                        if(!opts.returnPage) {
                            var tmp = $location.$$url.split("/").slice(1,4);
                            tmp[1] = "list";
                            opts.returnPage = "/"+tmp.join("/");
                        }
                        var data = $.extend($scope.formMetaData, {rows: $scope[opts.dataName]});
                        var getParams = {};
                        for (var k in $routeParams) {
                            getParams[k] = $routeParams[k];
                        }

                        var rs ;

                        if (opts.id) {
                            getParams.id = opts.id;
                            rs = resource.update(getParams, data);
                        } else {
                            rs = resource.save(getParams, data);
                        }

                        rs.$promise.then(function(data){
                            if(!data.error) {
                                var lastPage = ones.caches.getItem("lastPage");
                                $location.url(lastPage[0] || opts.returnPage);
                            }
                        });



                    };
                };

                service.makeGridSelectedActions = function($scope, model, res, group, module, extraParams){
                    //选中项操作
                    extraParams = extraParams || "";
                    //编辑
                    $scope.selectedActions = [];
                    if($routeParams.extra) {
                        var tmp = parseParams($routeParams.extra);
                        angular.forEach(tmp, function(item, key){
                            extraParams = extraParams+sprintf("/%s/%s", key, item);
                        });
                    }

                    //编辑
//                    console.log(model.editAble);
                    if(model.editAble === undefined || model.editAble) {
                        $scope.selectedActions.push({
                            label: service.toLang('edit', "actions"),
                            icon: "pencil",
                            action: function(evt, selected, theItem){
                                return $scope.doEditSelected(theItem||$scope.gridSelected[0]);
                            },
                            class: "default",
                            multi: false
                        });
                        //编辑
                        $scope.doEditSelected = function(item){
                            if(!item.id) {
                                return;
                            }
                            if(model.editAble === false) {
                                return false;
                            }
//                            console.log(model);return;
                            var action = "edit";
                            //如果是单据形式的
                            if(model.isBill) {
                                action = "editBill";
                            }
                            $location.url(sprintf('/%(group)s/%(action)s/%(module)s/id/%(id)s', {
                                group : group,
                                action: action,
                                module: module,
                                id: item.id
                            })+extraParams);
                        };
                    }

                    //增加/查看 子项
                    if(model.subAble) {
                        if(false !== model.addSubAble) {
                            $scope.selectedActions.push({
                                label: service.toLang('addChild', "actions"),
                                class: "primary",
                                multi: false,
                                icon: "plus",
                                action: function(evt, selected, theItem){
                                    $location.url(sprintf('/%(group)s/addChild/%(module)s/pid/%(id)d', {
                                        group : group,
                                        module: module,
                                        id: Number(theItem.id||$scope.gridSelected[0].id)
                                    })+extraParams);
                                }
                            });
                        }

                        //查看子项
                        if(false !== model.viewSubAble) {
                            $scope.selectedActions.push({
                                label: service.toLang('viewChild', "actions"),
                                class: "primary",
                                multi: false,
                                action: function(evt, selected, theItem){
                                    $location.url(sprintf('/%(group)s/viewChild/%(module)s/pid/%(id)d', {
                                        group : group,
                                        module: module,
                                        id: Number(theItem.id||$scope.gridSelected[0].id)
                                    })+extraParams);
                                }
                            });
                        }
                    }
                    //查看详情
                    if(model.viewDetailAble) {
                        $scope.selectedActions.push({
                            label: service.toLang('viewDetail', "actions"),
                            class: "primary",
                            multi: false,
                            action: function(evt, selected, theItem){
                                $location.url(sprintf('/%(group)s/viewDetail/%(module)s/id/%(id)d', {
                                    group : group,
                                    module: module,
                                    id: Number(theItem.id||$scope.gridSelected[0].id)
                                })+extraParams);
                            }
                        });

                        $scope.doViewSelected = function(item){
                            if(!item.id) {
                                return;
                            }
                            $location.url(sprintf('/%(group)s/viewDetail/%(module)s/id/%(id)s', {
                                group : group,
                                module: module,
                                id: item.id
                            })+extraParams);
                        };
                    }
                    //查看数据模型
                    //工作流
                    if(model.workflowAlias && isAppLoaded("workflow")) {
                        $scope.workflowAble = true;
                        $scope.workflowAlias = model.workflowAlias;
                        var workflowNodeRes = $injector.get("Workflow.WorkflowNodeAPI").api;
                        workflowNodeRes.query({
                            workflow_alias: model.workflowAlias,
                            only_active: true
                        }).$promise.then(function(data){
                            $scope.workflowActionList = data;
                        });

                        $scope.doWorkflow = function(event, node_id, mainrow_id){
                            var workflowAPI = $injector.get("Workflow.WorkflowAPI");
                            if(mainrow_id) {
                                workflowAPI.doWorkflow(res, node_id, mainrow_id);
                            } else {
                                var selectedItems = $scope.gridSelected || [];
                                //                        console.log(arguments);
                                if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
                                    return false;
                                }
                                for(var i=0;i<selectedItems.length;i++) {
                                    workflowAPI.doWorkflow(res, node_id, selectedItems[i].id);
                                }
                            }

                            $scope.$broadcast("gridData.changed", true);
                        };
                        $scope.workflowActionDisabled = function(id, item) {
                            item = item || $scope.gridSelected[0];

                            if(!item || !item.processes) {
                                return true;
                            }

                            var result = true;
                            angular.forEach(item.processes.next_node_id.split(","), function(node){
                                if(node === id) {
                                    result = false;
                                    return;
                                }
                            });
                            return result;
                        };
                        //查看工作进程
                        $scope.doViewWorkflowProcesses = function(){
                            if(!$scope.gridSelected.length) {
                                return false;
                            }
                            $injector.get("WorkflowProcessRes").query({
                                id: $scope.gridSelected[0].id,
                                workflowAlias: $scope.workflowAlias
                            }).$promise.then(function(data){
                                    service.aside({
                                        bill_id: $scope.gridSelected[0].bill_id,
                                        title: $scope.gridSelected[0].subject,
                                        subTitle: $scope.gridSelected[0].dateline_lang
                                    }, data, appView("workflowProcess.html", "workflow"));
                                });
                        };
                    }
                    //删除
                    if(model.deleteAble === undefined || model.deleteAble) {
                        $scope.selectedActions.push({
                            label: service.toLang('delete', "actions"),
                            icon: "trash-o",
                            action: function(evt, selected, theItem){
                                var ids = [];
                                var items = theItem ? [theItem] : $scope.gridSelected;

                                if(model.deleteAble === false) {
                                    return false;
                                }

                                $scope.confirmMsg = sprintf(toLang("confirm_delete", "", $rootScope), items.length);
                                $scope.doConfirm = function(){
                                    var api = $injector.get("ones.dataApiFactory").getResourceInstance({
                                        uri: $routeParams.group+"/"+$routeParams.module
                                    });

                                    angular.forEach(items, function(item){
                                        ids.push(item.id);
                                    });

                                    api.delete({id: ids}, function() {
                                        $scope.$parent.$broadcast("gridData.changed", true);
                                    });
                                };

                                var modal = $injector.get("$modal")({
                                    scope: $scope,
                                    title: toLang("confirm", "actions", $rootScope),
                                    template: "common/base/views/confirm.html"
                                });
//
//
//                                angular.forEach(items, function(item){
//                                    ids.push(item.id);
//                                });
//                                if (!confirm(sprintf(service.toLang('confirm_delete'), $scope.gridSelected.length))) {
//                                    return false;
//                                }
//                                res.delete({id: ids.join()}, function(data) {
//                                    $scope.$broadcast("gridData.changed", true);
//                                });
//
//                                $scope.gridOptions.selectedItems = [];
//                                $scope.gridSelected = [];
                            },
                            class: "danger",
                            multi: true
                        });
                    }
                    if(model.printAble) {
                        $scope.selectedActions.push({
                            label: service.toLang('print', "actions"),
                            multi: true,
                            icon: "print",
                            action: function(evt, selected, theItem){
                                var ids = [];
                                var items = theItem ? [theItem] : $scope.gridSelected;
                                angular.forEach(items, function(item){
                                    ids.push(item.id);
                                });
                                $location.url(sprintf("/%(group)s/print/%(module)s/id/%(id)s", {
                                    group: $routeParams.group,
                                    module: $routeParams.module,
                                    id: ids.join()
                                }));
                            }
                        });
                    }

                    //其他扩展操作，在model中定义
                    if(model.extraSelectActions) {
                        angular.forEach(model.extraSelectActions, function(item){
                            item.scope = $scope;
                            item.injector = $injector;
                            $scope.selectedActions.push(item);
                        });
                    }

                    GridView.selectedActions = $scope.selectedActions;

                };
                service.makeGridLinkActions = function($scope, actions, isBill, extraParams, model){
                    //可跳转按钮
                    //                actions = $rootScope.i18n.urlMap[group].modules[module].actions;
                    extraParams = extraParams ? "/"+extraParams : "";
                    var available = ["add", "list", "listAll", "export", "print", "trash"];
                    var actEnabled;
                    $scope.pageActions = [];
                    angular.forEach(actions, function(act, k){
                        if(available.indexOf(k) < 0) {
                            return;
                        }
                        if(k == $rootScope.currentPage.action) {
                            return;
                        }
                        var action = k;
                        if(isBill && k === "add") {
                            action = "addBill";
                        }
                        actEnabled = k+"Able";
                        if(model && model[actEnabled] === false) {
                            return;
                        }

                        $scope.pageActions.push({
                            label: service.toLang(k, "actions"),
                            class: ComViewConfig.actionClasses[k],
                            href : sprintf("/%(group)s/%(action)s/%(module)s", {
                                group: $routeParams.group,
                                action: action,
                                module: $routeParams.module
                            })+extraParams
                        });
                    });

                    //打印按钮
                    if(!$scope.selectAble && model && model.printAble) {
                        $scope.pageActions.push({
                            label: $scope.i18n.lang.actions.print,
                            class: "success",
                            icon : "print",
                            href : sprintf("/%(group)s/print/%(module)s/id/%(id)s", {
                                group: $routeParams.group,
                                module: $routeParams.module,
                                id: $routeParams.id
                            })
                        });
                    }
                };
                service.makeDefaultPageAction = function($scope, module, actions, model){

                    if(!actions || actions.length <=0) {
                        actions = ["add", "list"];
                    }

                    var cssClass = ["default", "primary", "success"];
                    $scope.pageActions = [];
                    for(var i=0;i<actions.length;i++) {

                        if(model && model.isBill && actions[i] == "add") {
                            actions[i] = "addBill";
                        }

                        $scope.pageActions.push({
                            label: $scope.i18n.lang.actions[actions[i]],
                            class: cssClass[i],
                            href : module.replace("/", sprintf('/%s/', actions[i]))
                        });
                    }

                    //打印按钮
                    if(model && model.printAble) {
                        $scope.pageActions.push({
                            label: $scope.i18n.lang.actions.print,
                            class: "success",
                            icon : "print",
                            href : module.replace("/", "/print/")+"/id/"+$routeParams.id
                        });
                    }

                };

                return service;
            }]);
})(window.angular);