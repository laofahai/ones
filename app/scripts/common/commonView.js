/**
 * 通用视图
 * 
 * 
 * */

var CommonView = {
    /**
     * diplayGrid 封装 ng-grid 
     * */
    displyGrid: function(needed, fieldsStruct, options) {

        needed.scope.totalServerItems = 0;
        needed.scope.selectedItems = [];

        options = options ? options : {};
        fieldsStruct = fieldsStruct ? fieldsStruct : [];
        var columnDefs = [];

        options.afterSelectionChange = function(rowitem, items) {
            if (true === items) {
                needed.scope.selectedItems = [];
                for (var i = 0; i < rowitem.length; i++) {
                    needed.scope.selectedItems.push(rowitem[i].entity)
                }
            } else if (false === items) {
                needed.scope.selectedItems = [];
            } else {
                needed.scope.selectedItems = items;
            }
        };

        /**
         * 字段名称
         * */
        for (var f in fieldsStruct) {
            if (!fieldsStruct[f]["field"]) {
                fieldsStruct[f].field = f;
            }
            columnDefs.push(fieldsStruct[f]);
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
            rowHeight: 40,
            headerRowHeight: 40,
            checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>',
            totalServerItems: 'totalServerItems',
            i18n: "zh-cn",
            //extra
            module: needed.location.$$url.split("/").splice(0, 3).join("/"),
            subModule: "",
            extraParams: {},
        };

        var opts = $.extend(defaults, options);
        opts.subModule = opts.subModule ? "/" + opts.subModule : "";

        /**
         * 默认方法
         * */
        needed.scope.doView = opts.doView ? opts.doView : function() {
            if (needed.scope.selectedItems.length) {
                needed.location.url(opts.module + opts.subModule + "/view/id/" + needed.scope.selectedItems[0].id);
            }
        };
        needed.scope.doViewSub = opts.doViewSub ? opts.doViewSub : function() {
            if (needed.scope.selectedItems.length) {
                needed.location.url(opts.module + opts.subModule + "/viewSub/id/" + needed.scope.selectedItems[0].id);
            }
        };
        needed.scope.doViewDataModel = opts.doViewDataModel ? opts.doViewDataModel : function() {
            needed.location.url("/HOME/DataModelData/" + needed.scope.selectedItems[0].bind_model);
        };
        needed.scope.doEditSelected = opts.doEditSeleted ? opts.doEditSelected : function() {
            if (needed.scope.selectedItems.length) {
                needed.location.url(opts.module + opts.subModule + "/edit/id/" + needed.scope.selectedItems[0].id);
            }
        };
        needed.scope.doDeleleSelected = opts.doDeleleSelected ? opts.doDeleleSelected : function() {
            if (!confirm(sprintf(needed.scope.i18n.lang.confirm_delete, needed.scope.selectedItems.length))) {
                return false;
            }
            var ids = [];
            for (var i = 0; i < needed.scope.selectedItems.length; i++) {
                ids.push(needed.scope.selectedItems[i].id);
            }
            needed.resource.delete({id: ids.join("|")}, function(data) {
                needed.scope.selectedItems = [];
                getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
            });
        };

        opts.columnDefs = columnDefs;

        var setPagingData = function(data, page, pageSize) {
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            needed.scope.itemsList = pagedData;
            needed.scope.totalServerItems = data.length;
            if (!needed.scope.$$phase) {
                needed.scope.$apply();
            }
        };
        //获取数据
        var getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    needed.resource.query(opts.extraParams, function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        setPagingData(data, page, pageSize);
                    });
                } else {
                    needed.resource.query(opts.extraParams, function(largeLoad) {
                        setPagingData(largeLoad, page, pageSize);
                    });
                }

            }, 100);
        };

        if (!('pagingOptions' in opts)) {
            needed.scope.pagingOptions = opts.pagingOptions = pagingOptions;
        }
        if (!('filterOptions' in opts)) {
            needed.scope.filterOptions = opts.filterOptions = filterOptions;
        }

        getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage);

        /**
         * 监视器
         * */
        needed.scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
            }
        }, true);
        needed.scope.$watch('filterOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
            }
        }, true);

        needed.scope.$on('gridData.changed', function() {
            needed.scope.selectedItems = [];
            getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
        });

        needed.scope.gridOptions = opts;

    },
    /**
     * 表单生成, 封装commonform指令
     * */
    displayForm: function(needed, model, opts) {
        var defaultOpts = {
            name: null, //表单名称
            id: null, //如为编辑，需传递此参数
            dataLoadedEvent: null, //需要异步加载数据时，传递一个dataLoadedEvent的参数标识异步数据已经加载完成的广播事件
            dataObject: null, //数据绑定到$scope的名字
            returnPage: needed.location.$$url.split("/").splice(0, 3).join("/") //表单提交之后的返回页面地址
        };
        opts = $.extend(defaultOpts, opts);
        opts.dataObject = opts.name + "Data";

        if ("dataLoadedEvent" in opts && opts.dataLoadedEvent && "getFields" in model) {
            model.getFields(needed.scope, needed.foreignResource);
            needed.scope.$on(opts.dataLoadedEvent, function(event, data) {
                //edit
                if (opts.id) {
                    needed.resource.get({id: opts.id}).$promise.then(function(defaultData) {
                        needed.scope[opts.dataObject] = formMaker.dataFormat(data, defaultData);
                    });
                }
                needed.scope.config = {
                    fieldsDefine: data,
                    name: opts.name
                };
                needed.scope.$broadcast("commonForm.ready");
            });
        } else {
            setTimeout(function() {
                needed.scope.config = {
                    fieldsDefine: model.getFieldsStruct(needed.scope.i18n),
                    name: opts.name
                };
                //edit
                if (opts.id) {
                    needed.resource.get({id: opts.id}).$promise.then(function(defaultData) {
                        needed.scope[opts.dataObject] = formMaker.dataFormat(needed.scope.config.fieldsDefine, defaultData);
                    });
                }
                needed.scope.$broadcast("commonForm.ready");
            }, 100);
            //todo 无需异步加载其他数据
        }

        //默认表单提交方法，可自动判断是否编辑/新建
        needed.scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {
            if (!needed.scope[opts.name].$valid) {
//                console.log(needed.scope[opts.name]);
                return;
            }
            if (opts.id) {
                var getParams = {};
                for (var k in needed.routeParams) {
                    getParams[k] = needed.routeParams[k];
                }
                getParams.id = opts.id;
                needed.resource.update(getParams, needed.scope[opts.dataObject]);
            } else {
                for (var k in needed.routeParams) {
                    needed.scope[opts.dataObject][k] = needed.routeParams[k];
                }
                needed.resource.save(needed.scope[opts.dataObject]);
            }
            needed.location.url(opts.returnPage);
        };

    },
    /**
     * 生成单据录入表单
     * */
    displayBill: function(needed, model, opts) {

        var defaultOpt = {
            dataName: "formData"
        };

        opts = $.extend(defaultOpt, opts);
        opts.dataName = "";
        opts.fieldsDefine = model.getFieldsStruct(needed.scope.i18n, needed.res);
        needed.scope.config = opts;


        //默认表单提交方法，可自动判断是否编辑/新建
        needed.scope.doSubmit = opts.doSubmit ? opts.doSubmit : function() {

            /**
             * 合计字段
             * */
            var tdTotals = $(".tdTotalAble");
            for (var i = 0; i < tdTotals.length; i++) {
                var name = $(tdTotals[i]).attr("tdname");
                needed.scope.formMetaData["total_"+name] = $(tdTotals[i]).text();
            }
            
            var data = $.extend(needed.scope.formMetaData, {data: needed.scope.formData});
            if (opts.id) {
                var getParams = {};
                for (var k in needed.routeParams) {
                    getParams[k] = needed.routeParams[k];
                }
                getParams.id = opts.id;
                needed.modelRes.update(getParams, data);
            } else {
                needed.modelRes.save(data);
            }
            return;
            needed.location.url(opts.returnPage);
        };

    }

};