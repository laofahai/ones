/**
 * 通用视图
 * 
 * */
(function(){
angular.module("erp.commonView", ["erp.formMaker"])
        .service("ComView",["$location", "$rootScope", "$routeParams", 
            function($location, $rootScope, $routeParams){
                var service = {};
                service.displayForm = function($scope, fieldsDefine, resource, opts, remote){
                    var defaultOpts = {
                        name: null, //表单名称
                        id: null, //如为编辑，需传递此参数
                        dataLoadedEvent: null, //需要异步加载数据时，传递一个dataLoadedEvent的参数标识异步数据已经加载完成的广播事件
                        dataObject: null, //数据绑定到$scope的名字
                        returnPage: $location.$$url.split("/").splice(0, 3).join("/") //表单提交之后的返回页面地址
                    };
                    opts = $.extend(defaultOpts, opts);
                    opts.dataObject = opts.name + "Data";

                    var doDefine = function() {
                        $scope.config = {
                            fieldsDefine: fieldsDefine,
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
                    if(typeof(fieldsDefine) == "object" && "getFieldsStruct" in fieldsDefine && typeof(fieldsDefine.getFieldsStruct) == "function") {
                        var model = fieldsDefine;
                        if(remote) { //需要获取异步数据
                            var field = model.getFieldsStruct();
                            field.then(function(data){
                                fieldsDefine = data;
                                doDefine();
                            }, function(msg){
                                $scope.$parent.alert(msg);
                            });
                        } else {
                            fieldsDefine = model.getFieldsStruct();
                            doDefine();
                        }
                    } else {
                        doDefine();
                    }

                    $scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {
                        if (!$scope[opts.name].$valid) {
                            $scope.$parent.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                            return;
                        }
                        if (opts.id) {
                            var getParams = {};
                            for (var k in $routeParams) {
                                getParams[k] = $routeParams[k];
                            }
                            getParams.id = opts.id;
                            resource.update(getParams, $scope[opts.dataObject], function(data){
                                if(data.error) {
                                    $scope.$parent.alert(data.msg);
                                } else {
                                    $location.url(opts.returnPage);
                                }
                            });
                        } else {
                            for (var k in $routeParams) {
                                $scope[opts.dataObject][k] = $routeParams[k];
                            }
                            resource.save($scope[opts.dataObject], function(data){
                                if(data.error) {
                                    $scope.$parent.alert(data.msg);
                                } else {
                                    $location.url(opts.returnPage);
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

                    options.afterSelectionChange = function(rowitem, items) {
//                        console.log(arguments);
//                        angular.forEach(items, function(it, key){
//                            if(it.checked) {
//                                delete(items[key]);
//                            }
//                        });
//                        
//                        $scope.gridSelected = items;
//                        
////                        if (true === items) { //全选
////                            $scope.gridSelected = [];
////                            for (var i = 0; i < rowitem.length; i++) {
////                                $scope.gridSelected.push(rowitem[i].entity);
////                            }
////                        } else if (false === items) { //取消全选
////                            $scope.gridSelected = [];
////                        } else {
////                            if(rowitem.entity.checked) {
////                                $scope.gridSelected.push(rowitem.entity);
////                            }
////                            if($scope.gridSelected instanceof Array && $scope.gridSelected.length > 0 && $scope.gridSelected[0]) {
////                                angular.forEach($scope.gridSelected, function(item,key){
////                                    if(!item.checked) {
////                                        delete($scope.gridSelected[key]);
////                                    }
////                                });
////                            }
////                        }
////                        
////                        console.log($scope.gridSelected);
                    };
                    
//                    options.beforeSelectionChange = function (event) {
//                        event.entity.checked = !event.selected;
//                        return true;
//                    };

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
                     * 过滤器
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
                        editExtraParams: null //edit 时附加参数
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
                    
                    //查看工作进程
                    $scope.doViewWorkflowProcesses = function(){
                        var id = $scope.gridSelected[0].id;
                    }
                    

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
                        dataName: "formData"
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
                        resource.get({id: $routeParams.id, includeRows: true}).$promise.then(function(data){
                            $scope.$broadcast("bill.dataLoaded", data);
                        });
                    }
                    $scope.config = opts;

                    


                    //默认表单提交方法，可自动判断是否编辑/新建
                    $scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {

                        var data = $.extend($scope.formMetaData, {data: $scope[opts.dataName]});
                        if (opts.id) {
                            var getParams = {};
                            for (var k in $routeParams) {
                                getParams[k] = $routeParams[k];
                            }
                            getParams.id = opts.id;
                            resource.update(getParams, data);
                        } else {
                            resource.save(data);
                        }
                        $location.url(opts.returnPage);
                    };

                };
                return service;
            }]);
})(window.angular);