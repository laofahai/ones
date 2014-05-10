/**
 * 通用视图
 * 
 * */
(function(){
angular.module("ones.commonView", ["ones.formMaker", 'mgcrea.ngStrap'])
    /**
     * 通用路由适配
     * 使用通用Controller
     * Resource命名规则： ModuleNameRes
     * Model   命名规则： ModelNameModel
     * */
    .config(["$routeProvider", function($route){
        $route.when('/:group/list/:module', {
            templateUrl: 'views/common/grid.html',
            controller : 'ComViewGridCtl'
        })
        //列表 with extraParams
        .when('/:group/list/:module/:extra*', {
            templateUrl: 'views/common/grid.html',
            controller : 'ComViewGridCtl'
        })
        //新增
        .when('/:group/add/:module', {
            templateUrl: 'views/common/edit.html',
            controller : 'ComViewEditCtl'
        })
        //新增 with extraParams
        .when('/:group/add/:module/:extra*', {
            templateUrl: 'views/common/edit.html',
            controller : 'ComViewEditCtl'
        })
        //修改
        .when('/:group/edit/:module/id/:id', {
            templateUrl: 'views/common/edit.html',
            controller : 'ComViewEditCtl'
        })
        //修改 with extraParams
        .when('/:group/edit/:module/id/:id/:extra*', {
            templateUrl: 'views/common/edit.html',
            controller : 'ComViewEditCtl'
        })
        //新增子项
        .when('/:group/addChild/:module/pid/:pid', {
            templateUrl: 'views/common/edit.html',
            controller : 'ComViewEditCtl'
        })
        .otherwise({
            templateUrl: "views/common/404.html",
            controller : "ComViewError404Ctl"
        })
        //子项列表
        ;
    }])
    .value('ComViewConfig', {
        actionClasses : {
            "add" : "primary",
            "list": "default",
            "export": "success"
        }
    })
    .controller('ComViewError404Ctl', ["$scope", function($scope){
        $scope.hidePageHeader = true;
    }])
    .controller('ComViewGridCtl', ["$rootScope", "$scope","ComView","$routeParams", "$injector", "ComViewConfig", "$location",
        function($rootScope,$scope, ComView, $routeParams, $injector, ComViewConfig, $location){
            var module,group,res,model,actions,pageActions=[];
            
            group = $routeParams.group;
            module = $routeParams.module;
            
            res = $injector.get(module.ucfirst()+"Res");
            model = $injector.get(module.ucfirst()+"Model");
            
            //Grid 可跳转按钮
            actions = $rootScope.i18n.urlMap[group].modules[module.ucfirst()].actions;
            ComView.makeGridLinkActions($scope, actions, model.isBill);
            ComView.makeGridSelectedActions($scope, model, res, group, module);
            
            var opts = {};
            if($routeParams.extra) {
                opts.queryExtraParams = parseParams($routeParams.extra);
            }
            
            ComView.displayGrid($scope, model, res, opts);
        }])
    .controller('ComViewEditCtl', ["$rootScope", "$scope","ComView","$routeParams", "$injector", "ComViewConfig",
        function($rootScope,$scope, ComView, $routeParams, $injector, ComViewConfig){
//            var extraParams = parseParams($routeParams.extra) || "";
            var module,group,res,model,actions;
            
            group = $routeParams.group;
            module = $routeParams.module;
            
            res = $injector.get(module.ucfirst()+"Res");
            model = $injector.get(module.ucfirst()+"Model");
//            console.log(res);
            //可跳转按钮
            actions = $rootScope.i18n.urlMap[group].modules[module.ucfirst()].actions;
            ComView.makeGridLinkActions($scope, actions, model.isBill, $routeParams.extra);
//            
            $scope.selectAble = false;
//            $scope.pageActions = pageActions;
            ComView.displayForm($scope, model, res, {
                id: $routeParams.id
            });
        }])
    .service("ComView",["$location", "$rootScope", "$routeParams", "$q", "$alert", "$aside", "WorkflowProcessRes", "ComViewConfig", "$injector", "ones.config",
        function($location, $rootScope, $routeParams, $q, $alert, $aside, WorkflowProcessRes, ComViewConfig, $injector, conf){
            var service = {};
            /**
             * 通用alert
             * */
            service.alert = function(alertMsg, type, title, autohide) {
                type = type || "warning";
                title = title || type.ucfirst()+":"; 
                var erpalert = $alert({title: title, 
                    content: alertMsg, 
                    placement: 'top-right', type: type, show: true,
                    container: '#alerts-container'
                });

                if(autohide !== false) {
                    setTimeout(function(){
                        erpalert.hide();
                    }, 5000);
                }
            };
            /**
             * 通用aslide
             * */
            service.aside = function(title, content, template){
                template = template || "views/common/aside.html";
                $aside({
                    title: title,
                    content: content,
                    template: template
                });
            };
            service.displayForm = function($scope, fieldsDefine, resource, opts, remote){
                var defaultOpts = {
                    name: null, //表单名称
                    id: null, //如为编辑，需传递此参数
                    dataLoadedEvent: null, //需要异步加载数据时，传递一个dataLoadedEvent的参数标识异步数据已经加载完成的广播事件
                    dataObject: null, //数据绑定到$scope的名字
                    returnPage: sprintf("/%(group)s/list/%(module)s", {
                        group: $routeParams.group,
                        module: $routeParams.module
                    }) //表单提交之后的返回页面地址
                };
                opts = $.extend(defaultOpts, opts);
                opts.dataObject = opts.name + "Data";

                var doDefine = function(fd) {
                    $scope.config = {
                        fieldsDefine: fd,
                        name: opts.name
                    };

                    if (opts.id) {
                        resource.get({id: opts.id}).$promise.then(function(defaultData) {
                            $scope[opts.dataObject] = dataFormat($scope.config.fieldsDefine, defaultData);
                        });
                    }
                    setTimeout(function(){
                        $scope.$broadcast("commonForm.ready");
                    });
                };

                /**
                 * 自动获取字段
                 * */
                if(typeof(fieldsDefine) === "object" && "getFieldsStruct" in fieldsDefine && typeof(fieldsDefine.getFieldsStruct) == "function") {
                    var model = fieldsDefine;
                    var field = model.getFieldsStruct();
                    if(remote || typeof(field.then) === "function") { //需要获取异步数据
                        field.then(function(data){
//                            fieldsDefine = data;
                            doDefine(data);
                        }, function(msg){
                            service.alert(msg);
                        });
                    } else {
//                        fieldsDefine = model.getFieldsStruct();
                        doDefine(field);
                    }
                } else {
                    doDefine();
                }

                //提交表单
                $scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {
                    if (!$scope[opts.name].$valid) {
                        service.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                        return;
                    }
                    //编辑
                    if (opts.id) {
                        var getParams = {};
                        for (var k in $routeParams) {
                            getParams[k] = $routeParams[k];
                        }
                        getParams.id = opts.id;
                        resource.update(getParams, $scope[opts.dataObject], function(data){
                            if(data.error) {
                                service.alert(data.msg);
                            } else {
                                $location.url(opts.returnPage);
                            }
                        });
                    //新增
                    } else {
                        for (var k in $routeParams) {
                            $scope[opts.dataObject][k] = $routeParams[k];
                        }
                        var getParams = {};
                        for (var k in $routeParams) {
                            getParams[k] = $routeParams[k];
                        }
                        var params = $.extend(getParams, $scope[opts.dataObject]);
                        params = $.extend(params, $scope[opts.dataObject]);
                        resource.save(params, function(data){
                            if(data.error) {
                                service.alert(data.msg);
                            } else {
//                                    $location.url(opts.returnPage);
                            }
                        });
                    }


                };
            };

            service.displayGrid = function($scope, fieldsDefine, resource, opts){

                $scope.totalServerItems = 0;
                $scope.gridSelected = [];

                var options = opts ? opts : {};
                fieldsDefine = fieldsDefine ? fieldsDefine : [];
                var columnDefs = [];

//                console.log(typeof(fieldsDefine));
//                console.log("getFieldsStruct" in fieldsDefine);
//                console.log(typeof(fieldsDefine.getFieldsStruct) == "function");
                if(typeof(fieldsDefine) == "object" 
                        && "getFieldsStruct" in fieldsDefine 
                        && typeof(fieldsDefine.getFieldsStruct) == "function") {
                    var model = fieldsDefine;
                    fieldsDefine = model.getFieldsStruct(true);
                }

                /**
                 * 字段名称
                 * */
                for (var f in fieldsDefine) {
                    if(!fieldsDefine[f].field) {
                        fieldsDefine[f].field = f;
                    }
                    if(!fieldsDefine[f].displayName) {
                        fieldsDefine[f].displayName = $rootScope.i18n.lang[f];
                    }
                    columnDefs.push(fieldsDefine[f]);
                }


                /**
                 * 过滤不显示字段
                 * */
                var col;
                for (var key in columnDefs) {
                    col = columnDefs[key];
                    if (false == col.listable) {
                        columnDefs.splice(key, 1);
                    }
                }

                /**
                 * 分页/过滤器默认项
                 * */
                var pagingOptions = {
                    pageSizes: [15, 30, 50],
                    pageSize: 15,
                    currentPage: 1
                };
                var filterOptions = {
                    filterText: "",
                    useExternalFilter: true
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
//                        selectedItems: "gridSelected",
        //            enablePinning: true,  
//                        checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>',
                    totalServerItems: 'totalServerItems',
                    i18n: "zh-cn",
                    //extra
                    module: $location.$$url.split("/").splice(0, 3).join("/"),
                    subModule: "",
                    queryExtraParams: {}, //get 参数
                    editExtraParams: "" //edit 时附加参数
                };

                var opts = $.extend(defaults, options);
                opts.subModule = opts.subModule ? "/" + opts.subModule : "";

                /**
                 * 默认方法
                 * */
                $scope.doAddChild = opts.doAddChild ? opts.doAddChild : function(){
                    if ($scope.gridSelected.length) {
                        $location.url(opts.module + opts.subModule + "/add/pid/"+$scope.gridSelected[0].id);
                    }
                };
                $scope.doView = opts.doView ? opts.doView : function() {
                    if ($scope.gridSelected.length) {
                        $location.url(opts.module + opts.subModule + "/view/id/" + $scope.gridSelected[0].id);
                    }
                };
                $scope.doViewSub = opts.doViewSub ? opts.doViewSub : function() {
                    if ($scope.gridSelected.length) {
                        $location.url(opts.module + opts.subModule + "/viewSub/id/" + $scope.gridSelected[0].id);
                    }
                };
                $scope.doViewDataModel = opts.doViewDataModel ? opts.doViewDataModel : function() {
                    $location.url("/HOME/DataModelData/" + $scope.gridSelected[0].bind_model);
                };
                $scope.doEditSelected = opts.doEditSeleted ? opts.doEditSelected : function() {
                    if ($scope.gridSelected.length) {
                        $location.url(opts.module + opts.subModule + "/edit/id/" + $scope.gridSelected[0].id+opts.editExtraParams);
                    }
                };
                $scope.doDeleteSelected = opts.doDeleleSelected ? opts.doDeleleSelected : function() {
                    if (!confirm(sprintf($scope.i18n.lang.confirm_delete, $scope.gridSelected.length))) {
                        return false;
                    }
                    var ids = [];
                    for (var i = 0; i < $scope.gridSelected.length; i++) {
                        ids.push($scope.gridSelected[i].id);
                    }
                    resource.delete({id: ids.join(",")}, function(data) {
                        $scope.$broadcast("gridData.changed");
                    });

                    $scope.gridOptions.selectedItems = [];
                    $scope.gridSelected = [];
                };

                //导出excel
                $scope.doExport = function(){};


                opts.columnDefs = columnDefs;

                var setPagingData = function(data, page, pageSize) {
                    var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                    $scope.itemsList = pagedData;
                    $scope.totalServerItems = data.length;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                };
                //获取数据
                var getPagedDataAsync = function(pageSize, page, searchText) {
                    setTimeout(function() {
                        var data;
                        if (searchText) {
                            var ft = searchText.toLowerCase();
                            resource.query(opts.queryExtraParams, function(largeLoad) {
                                data = largeLoad.filter(function(item) {
                                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                                });
                                setPagingData(data, page, pageSize);
                            });
                        } else {
                            resource.query(opts.queryExtraParams, function(largeLoad) {
                                setPagingData(largeLoad, page, pageSize);
                            });
                        }
                    }, 100);
                };

                if (!('pagingOptions' in opts)) {
                    $scope.pagingOptions = opts.pagingOptions = pagingOptions;
                }
                if (!('filterOptions' in opts)) {
                    $scope.filterOptions = opts.filterOptions = filterOptions;
                }

                getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage);

                /**
                 * 监视器
                 * */
                $scope.$watch('pagingOptions', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
                    }
                }, true);
                $scope.$watch('filterOptions', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
                    }
                }, true);

                $scope.$on('gridData.changed', function() {
                    var url = "/HOME/goTo/url/"+encodeURI(encodeURIComponent($location.$$url));
                    $location.url(url);
                    return;
//                        $scope.gridSelected = [];
                    $scope.gridOptions.selectedItems = [];
                    getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
                });
                $scope.gridOptions = opts;
            };

            service.displayBill = function($scope, fieldsDefine, resource, opts) {

                var defaultOpt = {
                    dataName: "formData",
                    queryExtraParams: {}
                };

                if(typeof(fieldsDefine) == "object" && "getFieldsStruct" in fieldsDefine && typeof(fieldsDefine.getFieldsStruct) == "function") {
                    var model = fieldsDefine;
                    fieldsDefine = model.getFieldsStruct(true);
                }

                /**
                * 字段名称
                * */
               for (var f in fieldsDefine) {
                   if(!fieldsDefine[f].field) {
                       fieldsDefine[f].field = f;
                   }
                   if(!fieldsDefine[f].displayName) {
                       fieldsDefine[f].displayName = $rootScope.i18n.lang[f];
                   }
               }

                opts = $.extend(defaultOpt, opts);

                opts.fieldsDefine = fieldsDefine;

                if($routeParams.id) {
                    opts.isEdit = true;
                    var queryExtraParams = $.extend(defaultOpt.queryExtraParams, {id: $routeParams.id, includeRows: true});
                    resource.get(queryExtraParams).$promise.then(function(data){
                        $scope.$broadcast("bill.dataLoaded", data);
                    });
                }

                $scope.config = opts;
                
//                //监控数据变化，是否保存
//                $scope.watch(function(){
//                    return $scope[opts.dataName];
//                }, function(){
//                    
//                });

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
                    if (opts.id) {
                        getParams.id = opts.id;
                        resource.update(getParams, data);
                    } else {
                        resource.save(getParams,data);
                    }
                    
                    if(conf.DEBUG) {
                        return;
                    }
                    
                    $location.url(opts.returnPage);
                };
            };
            
            service.makeGridSelectedActions = function($scope, model, res, group, module){
                //选中项操作
                //编辑
                $scope.selectedActions = [];
                var extraParams = "";
                if($routeParams.extra) {
                    var tmp = parseParams($routeParams.extra);
                    angular.forEach(tmp, function(item, key){
                        extraParams = extraParams+sprintf("/%s/%s", key, item);
                    });
                }
                
                //编辑
                if(model.editAble === undefined || model.editAble) {
                    $scope.selectedActions.push({
                        label: $rootScope.i18n.lang.actions.edit,
                        action: function(){
                            if($scope.gridSelected.length > 1) {
                                return;
                            }
                            var action = "edit";
                            //如果是单据形式的
                            if(model.isBill) {
                                action = "editBill";
                            }
                            $location.url(sprintf('/%(group)s/%(action)s/%(module)s/id/%(id)s', {
                                group : group,
                                action: action,
                                module: module,
                                id: $scope.gridSelected[0].id
                            })+extraParams);
                        },
                        class: "default",
                        multi: false
                    });
                }

                //增加/查看 子项
                if(model.subAble) {
                    if(false !== model.addSubAble) {
                        $scope.selectedActions.push({
                            label: $rootScope.i18n.lang.actions.addChild,
                            class: "primary",
                            multi: false,
                            action: function(){
                                $location.url(sprintf('/%(group)s/addChild/%(module)s/pid/%(id)d', {
                                    group : group,
                                    module: module,
                                    id: Number($scope.gridSelected[0].id)
                                })+extraParams);
                            }
                        });
                    }
                    
                    //查看子项
                    if(false !== model.viewSubAble) {
                        $scope.selectedActions.push({
                            label: $rootScope.i18n.lang.actions.viewChild,
                            class: "primary",
                            multi: false,
                            action: function(){
                                $location.url(sprintf('/%(group)s/viewChild/%(module)s/pid/%(id)d', {
                                    group : group,
                                    module: module,
                                    id: Number($scope.gridSelected[0].id)
                                })+extraParams);
                            }
                        });
                    }
                }
                //查看数据模型
                //工作流
                if(model.workflowAlias) {
                    $scope.workflowAble = true;
                    $scope.workflowAlias = model.workflowAlias;
                    var workflowNodeRes = $injector.get("WorkflowNodeRes");
                    workflowNodeRes.query({
                        workflow_alias: model.workflowAlias,
                        only_active: true
                    }).$promise.then(function(data){
                        $scope.workflowActionList = data;
                    });
                    
                    $scope.doWorkflow = function(event, node_id){
                        var selectedItems = $scope.gridSelected || [];
//                        console.log(arguments);
                        if(!selectedItems.length || $(event.target).parent().hasClass("disabled")) {
                            return false;
                        }
                        for(var i=0;i<selectedItems.length;i++) {
                            res.doWorkflow({
                                workflow: true,
                                node_id: node_id,
                                id: selectedItems[i].id
                            }).$promise.then(function(data){
                                if(data.type) {
                                    switch(data.type) {
                                        case "redirect":
                                            $location.url(data.location);
                                            return;
                                            break;
                                    }
                                }
                            });
                        }
                        $scope.$broadcast("gridData.changed");
                    };
                    $scope.workflowActionDisabled = function(id) {
                        var selectedItems = $scope.gridSelected || [];
                        if(selectedItems.length > 1) {
                            return true;
                        }
                        if(!selectedItems.length) {
                            return true;
                        }
                        var result = true;
                        for(var i=0;i<selectedItems.length;i++) {
                            
                            var item = selectedItems[i];
//                            console.log(item);
                            if(!item["processes"]) {
                                result = true;
                                break;
                            }
                            
                            angular.forEach(item.processes.nextNodes, function(node){
                                if(node.id === id) {
                                    result = false;
                                    return;
                                }
                            });
                        }
                        return result;
                    };
                    //查看工作进程
                    $scope.doViewWorkflowProcesses = function(){
                        if(!$scope.gridSelected.length) {
                            return false;
                        }
                        WorkflowProcessRes.query({
                            id: $scope.gridSelected[0].id,
                            workflowAlias: $scope.workflowAlias
                        }).$promise.then(function(data){
                            service.aside({
                                bill_id: $scope.gridSelected[0].bill_id,
                                title: $scope.gridSelected[0].subject,
                                subTitle: $scope.gridSelected[0].dateline_lang
                            }, data, "views/common/workflowProcess.html");
                        });
                    };
                }
                //删除
                if(model.deleteAble === undefined || model.deleteAble) {
                    $scope.selectedActions.push({
                        label: $rootScope.i18n.lang.actions.delete,
                        action: function(){
                            var ids = [];
                            angular.forEach($scope.gridSelected, function(item){
                                ids.push(item.id);
                            });
                            if (!confirm(sprintf($rootScope.i18n.lang.confirm_delete, $scope.gridSelected.length))) {
                                return false;
                            }
                            res.delete({id: ids.join()}, function(data) {
                                $scope.$broadcast("gridData.changed");
                            });

                            $scope.gridOptions.selectedItems = [];
                            $scope.gridSelected = [];
                        },
                        class: "danger",
                        multi: true
                    });
                }
            }
            service.makeGridLinkActions = function($scope, actions, isBill, extraParams){
                //可跳转按钮
//                actions = $rootScope.i18n.urlMap[group].modules[module].actions;
                extraParams = extraParams ? "/"+extraParams : "";
                var available = ["add", "list", "export", "print"];
                $scope.pageActions = [];
                angular.forEach(actions, function(act, k){
                    if(available.indexOf(k) < 0) {
                        return;
                    }
                    var action = k;
                    if(isBill && k === "add") {
                        action = "addBill";
                    }
                    $scope.pageActions.push({
                        label: $rootScope.i18n.lang.actions[k],
                        class: ComViewConfig.actionClasses[k],
                        href : sprintf("/%(group)s/%(action)s/%(module)s", {
                            group: $routeParams.group,
                            action: action,
                            module: $routeParams.module
                        })+extraParams
                    });
                });
            }
            service.makeDefaultPageAction = function($scope, module, actions){
                actions = actions || ["add", "list"];

                var cssClass = ["success", "primary"];
                $scope.pageActions = [];
                for(var i=0;i<actions.length;i++) {
                    $scope.pageActions.push({
                        label: $scope.i18n.lang.actions[actions[i]],
                        class: cssClass[i],
                        href : module.replace("/", sprintf('/%s/', actions[i]))
                    });
                }

            };
            
            
            return service;
        }]);
})(window.angular);