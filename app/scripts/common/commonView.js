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
    displyGrid: function($scope, resource, columnDefs, options) {
        
        $scope.totalServerItems = 0;
        
        options = options ? options : {};
        columnDefs = columnDefs ? columnDefs : null;
        
        /**
         * 过滤器
         * */
        var col;
        for(key in columnDefs) {
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
            $scope.itemsList = pagedData;
            $scope.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };
        
        var getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;

                if (searchText) {
                    var ft = searchText.toLowerCase();
                    resource.query(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        setPagingData(data, page, pageSize);
                    });
                } else {
                    resource.query(function(largeLoad) {
                        setPagingData(largeLoad, page, pageSize);
                    });
                }

            }, 100);
        };
        
        if(!('pagingOptions' in opts)) {
            $scope.pagingOptions = opts.pagingOptions = pagingOptions;
        }
        if(!('filterOptions' in opts)) {
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

        
        $scope.gridOptions = opts;

    },
    
    /**
     * 表单生成
     * */
    displayForm : function(fields, data) {
        data = data ? data : {};
//        console.log(fields);
        for(var f in fields) {}
        
    }

}