
(function(){
    /**
     * 通用视图
     *
     * */
    angular.module("ones.commonView", [])
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
                .when('/:group/listall/:module', {
                    templateUrl: 'common/base/views/grid.html',
                    controller : 'ComViewGridCtl'
                })
                .when('/:group/listall/:module/:extra*', {
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

                .when('/:group/viewChild/:module/pid/:pid', {
                    //            templateUrl: 'views/common/grid.html',
                    controller : 'ComViewChildCtl'
                })
                //新增
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
                //查看详情
                .when('/:group/viewDetail/:module/id/:id', {
                    controller : 'ComViewViewDetailCtl',
                    templateUrl: "common/base/views/viewDetail.html"
                })
                .when('/:group/viewBillDetail/:module/id/:id', {
                    controller : 'ComViewViewDetailCtl',
                    templateUrl: "common/base/views/viewDetail.html"
                })
                //单据
                .when('/:group/addBill/:module', {
                    controller : 'ComViewEditBillCtl',
                    templateUrl: "common/base/views/billEdit.html"
                })
            ;
        }])
        .value('ComViewConfig', {
            actionClasses : {
                "add" : "primary",
                "list": "default",
                "listall": "default",
                "export": "success"
            }
        })
        .controller('ComViewError404Ctl', ["$scope", function($scope){
            $scope.hidePageHeader = true;
        }])
        .controller("ComViewEditBillCtl", ["$scope", "ComView", "$rootScope", "$injector", "ones.dataApiFactory", "$routeParams",
            function($scope, ComView, $rootScope, $injector, dataAPI, $routeParams){
                var group, module, res, model, rowsModel;



                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;

                $scope.billConfig = {
                    model: model,
                    resource: res
                };


                var queryExtraParams = {};
                if($routeParams.extra) {
                    queryExtraParams = parseParams($routeParams.extra);
                    $routeParams = $.extend($routeParams, queryExtraParams);
                }

                var opts = {
                    id: $routeParams.id,
                    queryParams: queryExtraParams,
                    includeFoot: false,
                    dataName: "formMetaData"
                };
                if(model.returnPage) {
                    opts.returnPage = model.returnPage;
                }

                $scope.formConfig = {
                    model: model,
                    resource: res,
                    opts: opts
                };

            }])
        .controller("ComViewViewDetailCtl", ["$scope", "$rootScope", "$injector", "$routeParams", "ones.dataApiFactory", "ComView", "detailViewService",
            function($scope, $rootScope, $injector, $routeParams, dataAPI, ComView, detailView){
                var group, module, res, model;

                $scope.selectAble = false;

                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;
                model.config = model.config || {};

                //Grid 可跳转按钮
                try {
                    var key = sprintf("urlMap.%s.modules.%s.actions", group, module.ucfirst());
                    actions = l(key);
                } catch(e) {
                    throw("unable get i18n package section:" + group + "." + module + "." + actions);
                }

                $scope.detailViewConfig = {
                    group: group,
                    module: module,
                    model: model,
                    resource: res
                };

                ComView.makeGridSelectedActions($scope, model, res, group, module);
                ComView.makeGridLinkActions($scope, actions, model.config.isBill, "", model);
            }])
        .controller('ComViewPrintCtl', ["$scope", "$injector", "$routeParams", "ones.dataApiFactory", "CommonPrint",
            function($scope, $injector, $routeParams, dataAPI, printer) {
                var group, module, res, model;

                group = $routeParams.group;
                module = $routeParams.module;

                dataAPI.init(group, module);
                model = dataAPI.model;
                res = dataAPI.resource;
                model.config = model.config || {};

                $scope.printFooterTemplate = appView(sprintf("%s/printDetail.html", module), group.toLowerCase());

                $scope.selectAble = false;
                $scope.printModule = group+"_"+module;

                printer.init($scope, $routeParams.id);
                printer.assignStructure(model);

                var params = {
                    id: $routeParams.id
                };

                var promise = getDataApiPromise(res, "get", params);
                printer.assignMeta(promise, model)


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

                model.config = model.config || {};

                var opts = {
                    queryExtraParams: {}
                };
                if($routeParams.extra) {
                    opts.queryExtraParams = parseParams($routeParams.extra);
                    var extra = $routeParams.extra;
                }

                //加入查询全部条件
                if($rootScope.currentPage.action === "listall") {
                    opts.queryExtraParams.queryAll = true;
                }

                //加入仅查询回收站
                if($rootScope.currentPage.action === "trash") {
                    opts.queryExtraParams.onlyTrash = true;
                    $routeParams.extra = "onlyTrash/1";
                }

                //Grid 可跳转按钮
                try {
                    var key = sprintf("urlMap.%s.modules.%s.actions", group, module.ucfirst());
                    actions = l(key);
                } catch(e) {
                    throw("unable get i18n package section:" + group + "." + module + "." + actions);
                }

                ComView.makeGridLinkActions($scope, actions, model.config.isBill, extra, model);
                ComView.makeGridSelectedActions($scope, model, res, group, module);

                ComView.displayGrid($scope, dataAPI.modelName, res, opts);
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
                model.config = model.config || {};

//                res = $injector.get(module.ucfirst()+"Res");
//                model = $injector.get(module.ucfirst()+"Model");
                //            console.log($scope);console.log(res);
                //可跳转按钮
                try {
                    var key = sprintf("urlMap.%s.modules.%s.actions", group, module.ucfirst());
                    actions = l(key);
                } catch(e) {
                    throw("unable get i18n package section:" + group + "." + module + "." + actions);
                }
                ComView.makeGridLinkActions($scope, actions, model.config.isBill, $routeParams.extra, model);

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

                $scope.formConfig = {
                    model: model,
                    resource: res,
                    opts: opts
                };

            }])
        .service("ComView",["$location", "$rootScope", "$routeParams", "$q", "ComViewConfig", "$injector", "ones.config", "$timeout", "$route",
            function($location, $rootScope, $routeParams, $q, ComViewConfig, $injector, conf, $timeout, $route){
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

                    var $alert = $injector.get("$alert");

                    var container = "#alerts-container";
                    var placement = "bottom";

                    if(typeof(alertMsg) == "object") {
                        var config = angular.copy(alertMsg);
                        alertMsg = config.msg;
                        type = type || config.type;
                        title = title || config.title;
                        autohide = autohide || config.autohide;
                        container = config.container || container;
                        placement = config.placement || placement;
                    }

                    type = type || "warning";

                    var erpalert = $alert({title: title,
                        content: alertMsg+" &nbsp;",
                        placement: placement,
                        type: type,
                        show: true,
                        container: container,
                        animation: false
                    });

                    if(autohide !== false) {
                        var sleep = parseInt(autohide);
                        if(isNaN(sleep) || sleep < 3000) {
                            sleep = 3000;
                        }

                        $timeout(function(){
                            erpalert.hide();
                        }, sleep);
                    }
                };
                /**
                 * 通用aslide
                 * */
                service.aside = function(title, content, template){
                    var $aside = $injector.get("$aside");
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
                };

                service.displayForm = function($scope, fieldsDefine, resource, opts, remote){};

                service.displayGrid = function($scope, model, resource, opts){
                    $scope.totalServerItems = 0;
                    $scope.totalPages = 1;
                    $scope.gridSelected = [];

                    var options = opts ? opts : {};
                    var fieldsDefine = [];
                    var columnDefs = [];



                    //默认选项
                    var defaults = {
                        data: 'itemsList',

                        multiSelect: true,
                        selectedItems: $scope.gridSelected,
                        pagingOptions: $scope.pagingOptions,
                        filterOptions: $scope.filterOptions,
                        keepLastSelected: true,
                        //                    showGroupPanel: true,
                        sortInfo: $scope.sortInfo,
                        totalServerItems: "totalServerItems",

                        module: $location.$$url.split("/").splice(0, 3).join("/"),
                        subModule: "",
                        queryExtraParams: {}, //get 参数
                        editExtraParams: "" //edit 时附加参数
                    };

                    opts = $.extend(defaults, options);
                    opts.subModule = opts.subModule ? "/" + opts.subModule : "";

                    var modelName;
                    if(typeof(model) === "string") {
                        modelName = model;
                        model = $injector.get(modelName);
                    }

                    if(!model.config) {
                        model.config = {};
                    }

                    if(model.config.filters) {
                        opts.filters = model.config.filters;
                    }

                    opts = $.extend(opts, model.config);

                    opts.resource = resource;

                    //非DEBUG模式下模型缓存
                    var enableModelCache = true;
                    if(!ones.DEBUG || modelName || model.config.modelCacheAble !== false) {
                        enableModelCache = false;
                    }
                    if(enableModelCache) {
                        var cacheKey = "ones.caches.structure."+modelName;
                        opts.columnDefs = columnDefs = ones.caches.getItem(cacheKey) || [];
                    }


                    if(columnDefs.length < 1) {

                        fieldsDefine = model.getStructure(true);
                        if("then" in fieldsDefine && typeof(fieldsDefine.then) === "function") { //需要获取异步数据
                            fieldsDefine.then(function(data){
                                fieldsDefine = data;
                                $scope.$broadcast("commonGrid.structureReady", fieldsDefine);
                            }, function(msg){
                                service.alert(msg);
                            });
                        } else {
                            $timeout(function(){
                                $scope.$broadcast("commonGrid.structureReady", fieldsDefine);
                            });
                        }

                        $scope.$on("commonGrid.structureReady", function(evt, fieldsDefine) {

                            /**
                             * 字段名称
                             * */
                            for (var f in fieldsDefine) {
                                if(!fieldsDefine[f].field) {
                                    fieldsDefine[f].field = f;
                                }
                                if(!fieldsDefine[f].displayName) {
                                    fieldsDefine[f].displayName = l('lang.'+f);
                                }
                                columnDefs.push(fieldsDefine[f]);
                            }


                            /**
                             * 过滤不显示字段
                             * */
                            var tmp = columnDefs;
                            columnDefs = [];
                            for(var $i=0;$i<tmp.length;$i++) {
                                if(tmp[$i].listAble !== false) {
                                    columnDefs.push(tmp[$i]);
                                }
                            }

                            opts.columnDefs = columnDefs;

                            if(enableModelCache) {
                                ones.caches.setItem(cacheKey, columnDefs, 1, 1);
                            }

                            $scope.$broadcast("commonGrid.ready");

                        });

                    } else {
                        $scope.$broadcast("commonGrid.ready");
                    }

                    $scope.gridOptions = opts;

                };

                service.displayBill = function($scope, fieldsDefine, resource, opts) {};

                service.makeGridSelectedActions = function($scope, model, res, group, module, extraParams){
                    //选中项操作
                    extraParams = extraParams || "";

                    $scope.selectedActions = [];
                    $scope.selectedActionsLabel = [];

                    model.config = model.config || {};

                    if($routeParams.extra) {
                        var tmp = parseParams($routeParams.extra);
                        angular.forEach(tmp, function(item, key){
                            extraParams = extraParams+sprintf("/%s/%s", key, item);
                        });
                    }


                    //编辑
                    if(model.config.editAble === undefined || model.config.editAble) {
                        $scope.selectedActions.push({
                            name: "edit",
                            label: service.toLang('edit', "actions"),
                            icon: "pencil",
                            action: function(evt, selected, theItem){
                                return $scope.doEditSelected(theItem||$scope.gridSelected[0]);
                            },
                            class: "default",
                            multi: false,
                            authAction: "edit"
                        });
                        //编辑
                        $scope.doEditSelected = function(item){
                            if(!item.id) {
                                return;
                            }
                            if(model.config.editAble === false) {
                                return false;
                            }
//                            console.log(model);return;
                            var action = "edit";
                            //如果是单据形式的
                            if(model.config.isBill) {
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
                    if(model.config.subAble) {
                        if(false !== model.config.addSubAble) {
                            $scope.selectedActions.push({
                                name: "addChild",
                                label: service.toLang('addChild', "actions"),
                                class: "primary",
                                multi: false,
                                icon: "plus",
                                authAction: "edit",
                                action: function(evt, selected, theItem){
                                    theItem = theItem || {};
                                    $location.url(sprintf('/%(group)s/addChild/%(module)s/pid/%(id)d', {
                                        group : group,
                                        module: module,
                                        id: Number(theItem.id||$scope.gridSelected[0].id)
                                    })+extraParams);
                                }
                            });
                        }

                        //查看子项
                        if(false !== model.config.viewSubAble) {
                            $scope.selectedActions.push({
                                name: "viewChild",
                                label: service.toLang('viewChild', "actions"),
                                class: "primary",
                                multi: false,
                                icon: "eye",
                                authAction: "read",
                                action: function(evt, selected, theItem){
                                    theItem = theItem || {};
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
                    if(model.config.viewDetailAble) {
                        $scope.selectedActions.push({
                            name: "viewDetail",
                            label: service.toLang('viewDetail', "actions"),
                            class: "primary",
                            icon: "eye",
                            multi: false,
                            authAction: "read",
                            action: function(evt, selected, theItem){
                                theItem = theItem || {};
                                var action = model.config.isBill ? "viewBillDetail" : "viewDetail";
                                $location.url(sprintf('/%(group)s/%(action)s/%(module)s/id/%(id)d', {
                                    group : group,
                                    module: module,
                                    action: action,
                                    id: Number(theItem.id||$scope.gridSelected[0].id)
                                })+extraParams);
                            }
                        });
                    }
                    //查看数据模型
                    //工作流
                    if(model.config.workflowAlias && isAppLoaded("workflow")) {
                        $scope.workflowAble = true;
                        $scope.workflowAlias = model.config.workflowAlias;
                        var workflowNodeRes = $injector.get("Workflow.WorkflowNodeAPI").api;
                        workflowNodeRes.query({
                            workflow_alias: model.config.workflowAlias,
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
                                if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
                                    return false;
                                }
                                workflowAPI.scope = $scope;
                                for(var i=0;i<selectedItems.length;i++) {
                                    workflowAPI.doWorkflow(res, node_id, selectedItems[i].id);
                                }
                            }
                        };
                        $scope.workflowActionDisabled = function(id, item) {
                            try {
                                item = item || $scope.gridSelected[0];
                            } catch(e) {
                                return true;
                            }

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
                        $scope.doViewWorkflowProcesses = function(item){
                            if(!item) {
                                item = $scope.gridSelected[0];
                            }
                            if(!item) {
                                return false;
                            }
                            $injector.get("WorkflowProcessRes").query({
                                id: item.id,
                                workflowAlias: $scope.workflowAlias
                            }).$promise.then(function(data){
                                service.aside({
                                    animation: "am-fade-and-slide-left",
                                    bill_id: item.bill_id,
                                    title: item.subject,
                                    subTitle: item.dateline_lang
                                }, data, appView("workflowProcess.html", "workflow"));
                            });
                        };
                    }
                    //删除
                    if(model.config.deleteAble === undefined || model.config.deleteAble) {
                        $scope.selectedActions.push({
                            name: "delete",
                            label: service.toLang('delete', "actions"),
                            icon: "trash-o",
                            authAction: "delete",
                            action: function(evt, selected, theItem){
                                var ids = [];
                                var items = theItem ? [theItem] : $scope.gridSelected;

                                if(model.config.deleteAble === false) {
                                    return false;
                                }

                                $scope.confirmMsg = sprintf(toLang("confirm_delete", "messages", $rootScope), items.length);
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

                            },
                            class: "danger",
                            multi: true
                        });
                    }
                    if(model.config.printAble) {
                        $scope.selectedActions.push({
                            name: "print",
                            label: service.toLang('print', "actions"),
                            multi: true,
                            icon: "print",
                            authAction: "read",
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
                    if(model.config.extraSelectActions) {
                        angular.forEach(model.config.extraSelectActions, function(item){
                            item.scope = $scope;
                            item.injector = $injector;
                            $scope.selectedActions.push(item);
                        });
                    }

                    var authedNodes = ones.caches.getItem("ones.authed.nodes") || [];
                    angular.forEach($scope.selectedActions, function(item, k){
                        var authKey;
                        if(item.authAction && item.authAction.indexOf(".") >= 0) {
                            authKey = item.authAction;
                        } else {
                            authKey = sprintf("%s.%s.%s", $routeParams.group, $routeParams.module, item.authAction).toLowerCase();
                        }
                        if(authedNodes.indexOf(authKey) < 0){
                            delete($scope.selectedActions[k]);
                        }
                    });

                    $scope.selectedActions = reIndex($scope.selectedActions);
                    $injector.get("GridView").selectedActions = $scope.selectedActions;

                };
                service.makeGridLinkActions = function($scope, actions, isBill, extraParams, model){
                    //可跳转按钮
                    extraParams = extraParams ? "/"+extraParams : "";
                    var available = ["add", "list", "listall", "export", "print", "trash"];
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

                    if(!model) {
                        return;
                    }

                    model.config = model.config || {};

                    //打印按钮
                    if(!$scope.selectAble && model && model.config.printAble) {
                        $scope.pageActions.push({
                            label: l('lang.actions.print'),
                            class: "success",
                            icon : "print",
                            href : sprintf("/%(group)s/print/%(module)s/id/%(id)s", {
                                group: $routeParams.group,
                                module: $routeParams.module,
                                id: $routeParams.id
                            })
                        });
                    }

                    //扩展操作
                    if(model.config.extraPageActions) {
                        angular.forEach(model.config.extraPageActions, function(act){
                            $scope.pageActions.push(act);
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

                        if(model && model.config.isBill && actions[i] == "add") {
                            actions[i] = "addBill";
                        }

                        $scope.pageActions.push({
                            label: l('lang.actions.'+actions[i]),
                            class: cssClass[i],
                            href : module.replace("/", sprintf('/%s/', actions[i]))
                        });
                    }

                    //打印按钮
                    if(model && model.config.printAble) {
                        $scope.pageActions.push({
                            label: l('lang.actions.print'),
                            class: "success",
                            icon : "print",
                            href : module.replace("/", "/print/")+"/id/"+$routeParams.id
                        });
                    }

                };

                return service;
            }]);
})(window.angular);