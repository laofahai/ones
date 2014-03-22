/**
 * 通用视图
 * 
 * 
 * */

var CommonView = {
    
    defaultTemplate : [
        ['CommonView/grid.html', '<div class="gridStyle" ng-grid="gridOptions"></div>'],
    ],
    
    /**
     * diplayGrid 封装 ng-grid 
     * */
    displyGrid: function(needed, fieldsStruct, options) {
        
        needed.scope.totalServerItems = 0;
        needed.scope.selectedItems = [];
        
        options = options ? options : {};
        fieldsStruct = fieldsStruct ? fieldsStruct : [];
        var columnDefs = [];
        /**
         * 字段名称
         * */
        for(var f in fieldsStruct) {
            fieldsStruct[f].field = f;
            columnDefs.push(fieldsStruct[f]);
        }
        
        /**
         * 默认方法
         * */
        options.afterSelectionChange =  function(rowitem, items){
            needed.scope.selectedItems = items;
        };
        
        needed.scope.doEditSelected = options.doEditSeleted ? options.doEditSelected : function(){
            if(needed.scope.selectedItems.length) {
                needed.location.url("/JXC/Goods/edit/id/"+needed.scope.selectedItems[0].id);
            }
        };
        needed.scope.doDeleleSelected = options.doDeleleSelected ? options.doDeleleSelected : function() {
            if(!confirm(sprintf(needed.scope.i18n.lang.confirm_delete, needed.scope.selectedItems.length))) {
                return false;
            }
            var ids = [];
            for(var i=0;i<needed.scope.selectedItems.length;i++) {
                ids.push(needed.scope.selectedItems[i].id);
            }
            needed.resource.delete({id: ids.join("|")}, function(data){
                needed.scope.selectedItems = [];
                getPagedDataAsync(pagingOptions.pageSize, pagingOptions.currentPage, filterOptions.filterText);
            });
        };
        
        
        /**
         * 过滤器
         * */
        var col;
        for(var key in columnDefs) {
            col = columnDefs[key];
            if(false == col.listable) {
                columnDefs.splice(key,1);
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
            checkboxHeaderTemplate: '<div></div>',
            totalServerItems: 'totalServerItems',
            i18n: "zh-cn"
        };
        
        var opts = $.extend(defaults, options);
        
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
                    needed.resource.query(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        setPagingData(data, page, pageSize);
                    });
                } else {
                    needed.resource.query(function(largeLoad) {
                        setPagingData(largeLoad, page, pageSize);
                    });
                }

            }, 100);
        };
        
        if(!('pagingOptions' in opts)) {
            needed.scope.pagingOptions = opts.pagingOptions = pagingOptions;
        }
        if(!('filterOptions' in opts)) {
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
        
        needed.scope.gridOptions = opts;

    },
    
    /**
     * 表单生成, 封装commonform指令
     * */
    displayForm : function(needed, model, opts) {
        var defaultOpts = {
            name: null,
            id: null,
            dataLoadedEvent: null,
            dataObject: null
        };
        opts = $.extend(defaultOpts, opts);
        opts.dataObject = opts.name+"Data";
        
        if("dataLoadedEvent" in opts && "getFields" in model) {
            model.getFields(needed.scope, needed.foreignResource);
            needed.scope.$on(opts.dataLoadedEvent, function(event, data){
                //edit
                if(opts.id) {
                    needed.resource.get({id: opts.id}).$promise.then(function(defaultData){
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
            needed.scope.config = {
                fieldsDefine: model.getFieldsStruct(needed.scope.i18n),
                name: opts.dataObject
            };
            needed.scope.$broadcast("commonForm.ready");
            //todo 无需异步加载其他数据
        }
        
        needed.scope.doSubmit = opts.doSubmit ? opts.doSubmit : function(){
            if(opts.id) {
                needed.resource.update({id: opts.id}, needed.scope[opts.dataObject]);
            } else {
                needed.resource.save(needed.scope[opts.dataObject]).$promise.then(function(data){
                    needed.location.url("/JXC/Goods");
                });
            }
            needed.location.url("/JXC/Goods");
        };
        
    }

}