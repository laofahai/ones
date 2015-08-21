(function(angular, ones){

    /**
     * 数据表格模块
     *
     * @todo 按键监听 上下翻页
     * @todo 链接按钮(新增等)
     * @todo 行内点击进入详情或编辑
     * */
    angular.module("ones.gridViewModule", [])
        .service("GridView", [
            "$rootScope",
            "$routeParams",
            "$location",
            "$modal",
            "ones.dataApiFactory",
            "$timeout",
            "$injector",
            "RootFrameService",
            "Home.SchemaAPI",
            "Account.UserPreferenceAPI",
            "PageSelectedActions",
            function($rootScope, $routeParams, $location, $modal, dataAPI, $timeout, $injector,
                     RootFrameService, SchemaAPI,
                     user_preference,
                     PageSelectedActions
            ){
                var self = this;
                this.scope = {};
                this.selected = {};


                this.init = function($scope, options){

                    self.scope = $scope;
                    // 父作用域
                    self.parentScope = self.scope.$parent;

                    /**
                     * 数据表结构
                     * */
                    self.schema = {};
                    /**
                     * grid 初始化参数
                     * options = {
                     *  model, resource # required
                     *  extraParams
                     * };
                     * */
                    self.options = options || {};
                    self.options.opts = self.options.opts || {};

                    /*
                    * 已选中项目
                    * */
                    self.parentScope.gridSelected = [];

                    /**
                     * 选中项目操作
                     * */
                    self.selectedActions = [];

                    /**
                     * 是否默认显示过滤器
                     * */
                    self.parentScope.show_filters = options.show_filters === undefined ? true : options.show_filters;

                    /**
                     * 默认排序
                     * */
                    self.scope.sorting = "id DESC";

                    /**
                     * 列表显示项目
                     * */
                    self.scope.schema_display = options.model.config.list_display || [];

                    /**
                     * 字段配置
                     * */
                    self.scope.column_defs = options.model.config.fields || {};

                    /**
                     * 右上角链接按钮（新增等）
                     * */
                    self.link_actions = [];

                    self.parentScope.selectable = true;

                    self.scope.model_config = self.model_config = self.options.model.config || {};
                    self.model_config.sortable = self.model_config.sortable || [];
                    self.scope.search_able = self.model_config.search_able = self.model_config.search_able || {};

                    self.parentScope.quickSearchText = '';

                    // 列内搜索
                    self.scope.search_value = {};

                    /**
                     * 当前应用信息
                     * */
                    self.app_info = self.scope.app_info = {
                        app: self.model_config.app,
                        module: self.model_config.module
                    };

                    if(is_app_loaded('messageCenter')) {
                        var mc = $injector.get('ones.MessageCenter');
                        mc.on('data_changed', function(data) {
                            ones.DEBUG && console.debug('grid detcted data_changed event', data);
                            if(data.app === self.app_info.app && data.module === self.app_info.module) {
                                self.refresh();
                            }
                        });
                    }

                    /**
                     * 监视器
                     * */
                    self.scope.$watch('pagingOptions', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if(newVal.currentPage >= $scope.totalPages) {
                                self.scope.pagingOptions.currentPage = self.scope.totalPages;
                            }
                            ones.caches.setItem("ones.pageSize", self.scope.pagingOptions.pageSize, 1);
                            self.refresh ();
                        }
                    }, true);
                    self.scope.$watch('filterOptions', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            self.refresh ();
                        }
                    }, true);
                    self.scope.$watch('$parent.quickSearchText', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            self.scope.filterOptions.filterText = $.trim(newVal);
                            self.refresh ();
                        }
                    }, true);
                    self.scope.$watch('sortInfo', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            self.refresh ();
                        }
                    }, true);

                    self.scope.$on("gridData.changed", function(evt, itemsList){
                        if(itemsList === true) {
                            self.refresh();
                        } else {
                            self.scope.itemsList = itemsList;
                        }
                        self.gridSelected = self.parentScope.gridSelected = [];
                    });

                    // 搜索
                    self.scope.$watch('search_value', function(new_val, old_val) {
                        if(new_val === old_val) return;

                        var query_params = {};
                        angular.forEach(self.scope.search_value, function(value, field) {
                            // 多字段匹配
                            var source_field = field;
                            field = self.scope.column_defs[field].search_able_fields || field;

                            query_params._mf = field || undefined;
                            if(self.scope.search_able[source_field].type === 2) { //精准匹配
                                query_params._mv = value;
                            } else {
                                query_params._kw = value;
                            }
                        });

                        self.getPagedDataAsync(1, query_params);

                    }, true);

                    self.scope.$on("gridData.refreshed", function(evt){
                        self.gridSelected = [];
                        self.doResetGridOptions();
                        self.refresh();
                    });

                    self.scope.sortData = function(){
                        self.refresh ();
                    };

                    self.scope.count_object_size = function(val) {
                        return count_object_size(val);
                    };


                    self.doResetGridOptions();

                    /**
                     * 获取数据表结构
                     * */
                    SchemaAPI.get_schema({
                        app: self.model_config.app,
                        table: self.model_config.table,
                        exclude_meta: false,
                        callback: function (schema) {
                            self.schema = schema;

                            self.parentScope.grid_trash_able = schema[self.model_config.table].enable_trash || false;

                            var structure = {};

                            angular.forEach(schema[self.model_config.table].structure, function(field) {
                                structure[field.field] = field;
                            });

                            angular.deep_extend(structure, self.scope.column_defs);

                            var human_date_display = user_preference.get_preference('human_date_display');
                            angular.forEach(structure, function(field, field_name) {

                                field.field = field.field || field_name;

                                if(field.field in self.scope.column_defs) {
                                    angular.deep_extend(field, self.scope.column_defs[field.field] || {})
                                } else {
                                    self.scope.column_defs[field.field] = field;
                                }

                                self.scope.column_defs[field.field].field = field.field;

                                // 可搜索字段
                                if(field.sortable) {
                                    self.model_config.sortable.push(field.field);
                                }

                                // model指定可搜索 或者数据模型字段支持模糊搜索
                                switch(field.search_able) {
                                    case 1: // 模糊搜索
                                    case true:
                                        self.scope.search_able[field.field] = {type: 1};
                                        break;
                                    case 2: // 精准匹配
                                        self.scope.search_able[field.field] = {type: 2};
                                        break;
                                }

                                var config = self.scope.column_defs[field.field];
                                if(human_date_display !== 2
                                    && !config.cell_filter
                                    && (['datetime', 'date', 'time'].indexOf(config.widget) >= 0
                                    || config.field == 'created')
                                ) {
                                    self.scope.column_defs[field.field].cell_filter = 'to_human_date';
                                }

                                // 默认_id label
                                if(!self.scope.column_defs[field.field].label && field.field.slice(-3) === "_id") {
                                    self.scope.column_defs[field.field].label =
                                        _(
                                            sprintf('%s.%s', self.app_info.app, camelCaseSpace(field.field.slice(0, -3)))
                                        );
                                }

                                // 点击事件
                                if(typeof field.on_view_item_clicked === "function") {
                                    var click_event_name = field.ng_click ? field.ng_click : 'grid_click_'+field.field;
                                    self.scope.column_defs[field.field]['ng_click'] = click_event_name+'(item[field], item)';
                                    self.scope[click_event_name] = field.on_view_item_clicked;
                                }

                            });

                            self.scope.schema_display = self.scope.schema_display.concat(schema[self.model_config.table].list_display || []);
                            self.scope.schema_display = array_unique(self.scope.schema_display);

                            self.scope.column_defs._data_model_fields_ = self.scope.column_defs._data_model_fields_ || {};
                            self.data_model_fields = self.scope.column_defs._data_model_fields_.value || null;

                            // 初始载入数据
                            self.refresh();

                            /**
                             * 可排序字段
                             * */
                            self.scope.is_sortable = function(field) {
                                return (self.model_config.sortable || []).indexOf(field) >= 0;
                            };


                            // 生成过滤器
                            self.makeFilters();
                        }
                    });


                    // 生成选中项目操作
                    self.makeSelectedActions();

                    // 生成新增链接
                    self.makeLinkActions();

                };


                this.makeLinkActions = function() {
                    // 新增
                    if(self.model_config.addable !== false) {
                        self.link_actions.push({
                            label: _("common.Add New") + ' ' + _(self.model_config.app+'.'+camelCaseSpace(self.model_config.module)),
                            src: sprintf('%s/%s/%s%s',
                                self.model_config.app,
                                camelCase(self.model_config.module).lcfirst(),
                                self.model_config.is_bill ? 'add/bill' : 'add',
                                $routeParams.extra ? '/'+$routeParams.extra : ''
                            ),
                            singleton: true
                        });
                    }

                    angular.forEach(self.model_config.extra_link_actions, function(la) {
                        self.link_actions.push(la);
                    });

                    if(!self.link_actions) {
                        return;
                    }

                    self.scope.$root.link_actions = self.link_actions;
                };

                this.refresh = function(){
                    self.getPagedDataAsync(
                        self.scope.pagingOptions.currentPage,
                        self.filtersData
                    );
                    self.scope.$parent.gridSelected = self.gridSelected = [];
                };

                // 选中项操作
                this.makeSelectedActions = function() {

                    self.selectedActions = PageSelectedActions.generate(self.options.model, self.scope);

                    self.scope.$root.selectedActions = self.selectedActions = reIndex(self.selectedActions);

                };

                //重置grid选项
                this.doResetGridOptions = function(){
                    self.scope.pagingOptions = {
                        pageSizes: [10, 15, 20, 30, 50],
                        pageSize: 15,
                        currentPage: 1
                    };
                    self.scope.filterOptions = {
                        filterText: "",
                        matchField: null,
                        matchFieldValue: null
                    };
                    self.scope.sortInfo = {
                        fields: "id",
                        directions: "DESC"
                    };
                    self.scope.filterFormData = {};
                    self.filtersData = {};
                };

                //设置数据
                this.setPagingData = function(remoteData, page, pageSize) {
                    var data = [];
                    if(remoteData && typeof(remoteData[0]) === "object" && ("count" in remoteData[0])) {
                        data = remoteData[1];
                        self.scope.totalServerItems = remoteData[0].count;
                        self.scope.totalPages = remoteData[0].totalPages;
                    } else {
                        data = remoteData;
                        self.scope.totalServerItems = remoteData.length;
                        self.scope.totalPages = parseInt(remoteData.length/self.scope.pagingOptions.pageSize)+1;
                    }

                    data = reIndex(data);
                    self.scope.$broadcast("gridData.changed", data);

                    self.scope.checked_box = [];
                    self.parentScope.gridSelected = [];

                    $timeout(function() {
                        self.scope.table_height = angular.element("#dataGridTable").height();
                        self.scope.filter_height = angular.element("#grid-filter-container").height();
                    }, 300);

                };
                //获取后端数据
                this.getPagedDataAsync = function(page, extraParams) {
                    var pageSize = self.scope.pagingOptions.pageSize;
                    page = page || self.scope.pagingOptions.currentPage;
                    $timeout(function(){
                        var sb = [];
                        if(self.scope.sortInfo.fields) {
                            sb.push(sprintf("%s%s",
                                self.scope.sortInfo.directions.toUpperCase() === "DESC" ? "-" : "+",
                                self.scope.sortInfo.fields
                            ));
                        }

                        /**
                         * kw : 搜索关键字
                         * pn : 当前页
                         * ps : 一页N行
                         * si : 排序
                         * ic : 包含count info
                         * mf : 精准匹配字段
                         * mv : 精准匹配字段值
                         * df : 数据模型字段
                         * */
                        var p = {
                            _kw: self.scope.filterOptions.filterText || undefined,
                            _pn: self.scope.pagingOptions.currentPage,
                            _ps: self.scope.pagingOptions.pageSize,
                            _si: sb.join("|") || undefined,
                            _ic: 1,
                            _mf: self.scope.filterOptions.matchField || undefined,
                            _mv: self.scope.filterOptions.matchFieldValue || undefined,
                            _df: self.data_model_fields || undefined
                        };

                        angular.extend(p, self.options.query_params, extraParams || {});


                        try {
                            self.options.resource.query(p).$promise.then(function(remoteData) {
                                self.setPagingData(remoteData, page, pageSize);
                            });
                        } catch(e) {
                            console.log(e);
                        }
                    });
                };
                /**
                 * 过滤器
                 * @todo
                 *  时间段过滤
                 *  自定义时间段过滤
                 *  工作流状态过滤 // link
                 *  用户过滤
                 * */
                this.makeFilters = function(){
                    var filters = self.options.model.config.filters || {};

                    // 字段中定义过滤器
                    angular.forEach(self.scope.column_defs, function(opt, field) {
                        if(!opt.filters) {
                            return;
                        }
                        if(!angular.isObject(opt.filters)) {
                            opt.filters = {type: opt.filters};
                        }

                        // 默认_id label
                        if(!opt.label && field.slice(-3) === "_id") {
                            opt.label = _(sprintf('%s.%s', self.app_info.app, camelCaseSpace(field.slice(0, -3))));
                        }

                        filters[field] = opt.filters;
                    });

                    if(!count_object_size(filters)) {
                        self.parentScope.has_filters = false;
                        return;
                    }

                    self.parentScope.has_filters = true;

                    self.scope.filters = {};
                    self.scope.filter_actives = {};

                    /**
                     * 字段精准匹配（链接选择形式）
                     * 包含多字段匹配
                     * */
                    self.scope.filter_by_link = function(field, source_field, id) {

                        var mf = self.scope.filterOptions.matchField ? self.scope.filterOptions.matchField.split(',') : [];
                        var mv = self.scope.filterOptions.matchFieldValue ? self.scope.filterOptions.matchFieldValue.split(',') : [];
                        //console.log(id);
                        if(id === -9) {
                            for(var i=0;i<mf.length;i++) {
                                if(mf[i] == field) {
                                    mf.splice(i, 1);
                                    mv.splice(i, 1);
                                    break;
                                }
                            }
                        } else {
                            var ind = mf.indexOf(field);
                            if(ind >= 0) {
                                mv[ind] = id;
                            } else {
                                mf.push(field);
                                mv.push(id);
                            }

                        }

                        self.scope.filterOptions.matchField = mf.join();
                        self.scope.filterOptions.matchFieldValue = mv.join();

                        self.scope.filter_actives[source_field] = id;
                    };


                    angular.forEach(filters, function(item, field) {
                        var data_source;
                        if(item.type) {
                            data_source = item.data_source || self.model_config.fields[field].data_source;
                        }
                        switch(item.type) {
                            case "link":
                                self.scope.filter_actives[field] = -9;
                                try{

                                    var link_filter_items = [{
                                        id: -9,
                                        name: _("common.All")
                                    }];

                                    if(angular.isArray(data_source)) {
                                        angular.forEach(data_source, function(t) {
                                            link_filter_items.push({
                                                id: t.value,
                                                name: t.label
                                            });
                                        });
                                    } else {
                                        data_source = $injector.get(data_source);
                                        var param = item.data_source_query_param || self.model_config.fields[field].data_source_query_param || {}
                                        data_source.resource.api_query(param).$promise.then(function(data){
                                            angular.forEach(data, function(d) {

                                                // 过滤器支持自定义显示结果
                                                if(typeof item.get_display === 'function') {
                                                    d[data_source.config.label_field||'name'] = item.get_display(d);
                                                }

                                                link_filter_items.push({
                                                    id: d[data_source.config.value_field||item.value_field||'id'],
                                                    name: d[data_source.config.label_field||item.label_field||'name']
                                                });
                                            });
                                        });
                                    }

                                    self.scope.filters.links = self.scope.filters.links || [];
                                    self.scope.filters.links.push({
                                        source_field: field,
                                        map_field: self.scope.column_defs[field] && self.scope.column_defs[field].map || field,
                                        label: item.label
                                            || (self.scope.column_defs[field] && self.scope.column_defs[field].label)
                                            || camelCaseSpace(field),
                                        items: link_filter_items
                                    });

                                } catch(e) {
                                    console.log(e);
                                    return;
                                }
                                break;
                        }

                    });

                };



                this.methodsList = {
                    doContextMenu: function(evt, item, config){
                        self.scope.$emit("contextMenu", {
                            items: self.selectedActions,
                            left: evt.clientX,
                            top: evt.clientY,
                            selectedItems: self.selected,
                            currentItem: item
                        });
                    },
                    //双击事件
                    doGridDblClick: function(item, extra, evt){
                        var acts = {};
                        angular.forEach(self.selectedActions, function(act) {
                            acts[act.name] = act.action;
                        });

                        if("viewChild" in acts) {
                            acts.viewChild(evt, self.selected, item);
                        } else if("viewDetail" in acts) {
                            acts.viewDetail(evt, self.selected, item);
                        } else if("edit" in acts) {
                            acts.edit(evt, self.selected, item);
                        }
                    },
                    //排序
                    doGridSortBy: function(field){
                        var source_field = field;
                        var direction = self.scope.sortInfo.direction == "ASC" ? "DESC" : "ASC"
                        field = self.model_config.fields
                                        && self.model_config.fields[field]
                                        && self.model_config.fields[field].map || field
                        self.scope.sortInfo = {
                            fields: field,
                            directions: direction
                        };
                        self.scope.sortInfo.direction = direction;
                        self.scope.sorting = source_field+" "+direction;
                    },
                    //刷新
                    doRefresh: function(){
                        self.refresh();
                    },

                    //设置当前页
                    setPage: function(p){
                        var goPage = 1;
                        var currentPage = self.scope.pagingOptions.currentPage;
                        switch(p) {
                            case "-1":
                                goPage = currentPage-1;
                                break;
                            case "+1":
                                goPage = currentPage+1;
                                break;
                            case "max":
                                goPage = self.scope.totalPages;
                                break;
                            default:
                                goPage = parseInt(p);
                                break;
                        }

                        if(goPage <=0) {
                            goPage = 1;
                        }
                        if(goPage > self.scope.totalPages) {
                            goPage = self.scope.totalPages;
                        }

                        self.scope.pagingOptions.currentPage = goPage;
                    },
                    //记录选中项
                    recordSelected: function(index){
                        var absIndex = Math.abs(index)-1;

                        if(self.model_config.multi_select === false) {
                            self.selected = {};
                            self.selected["index_"+absIndex] = self.scope.itemsList[absIndex];
                            self.scope.$parent.gridSelected = [self.scope.itemsList[absIndex]];
                        } else {
                            if(undefined !== self.selected["index_"+absIndex]) {
                                delete(self.selected["index_"+absIndex]);
                            } else {
                                self.selected["index_"+absIndex] = self.scope.itemsList[absIndex];
                            }

                            self.scope.$parent.gridSelected = [];

                            angular.forEach(self.selected, function(item){
                                self.parentScope.gridSelected.push(item);
                            });

                            self.scope.checked_box = self.selected;
                        }

                        self.scope.$emit('grid.selectedChanged',
                            self.parentScope.gridSelected,
                            self.scope.itemsList[absIndex],
                            self.scope.app_info
                        );

                    },
                    //重置搜索关键字
                    doResetSearchValue: function(field) {
                        angular.forEach(self.scope.search_value, function(v, f) {
                            if(field !== f) {
                                delete(self.scope.search_value[f]);
                            }
                        });
                    },
                    //选中所有
                    selectAll: function() {
                        return;
                        if(self.scope.all_checked) {
                            self.scope.checked_box = [];
                            for(var i=1;i<=self.scope.itemsList.length;i++) {
                                self.methodsList.recordSelected(i);
                            }
                        } else {
                            self.scope.$parent.gridSelected = [];
                            self.scope.checked_box = [];
                        }

                    }
                };



            }])
        .directive("tableView", ["$compile", "$timeout", "GridView", "$filter", function($compile, $timeout, GridView, $filter){
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                templateUrl: "views/gridTemplate.html",
                scope: {
                    config: "="
                },
                compile: function(element, attrs, transclude){
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var fetchData = function(){
                                var gridOptions = $scope.$parent.$eval(iAttrs.config);


                                GridView.init($scope, gridOptions);

                                var scope_method = [
                                    'setPage', 'recordSelected'
                                ];
                                angular.forEach(GridView.methodsList, function(method, k){
                                    $scope[k] = method;
                                });

                                GridView.doResetGridOptions();

                                //每页显示条数
                                var pageSize = ones.caches.getItem("ones.pageSize");

                                if(!pageSize || "undefined" === pageSize) {
                                    pageSize = $scope.pagingOptions.pageSize;
                                    ones.caches.setItem("ones.pageSize", pageSize, 1);
                                }
                                $scope.pagingOptions.pageSize = pageSize;
                                $scope.pageSizes = $scope.pagingOptions.pageSizes;
                            };

                            var fetched = false;
                            $scope.$on("commonGrid.ready", function(){
                                if(!fetched) {
                                    fetchData();
                                    fetched = true;
                                }
                            });
                            $timeout(function(){
                                if(!fetched) {
                                    fetchData();
                                    fetched = true;
                                }
                            }, 300);

                            ones.GridScope = $scope;

                            $scope.itemsList = [];

                        }
                    };
                }
            };
        }])
        //尝试使用$eval
        .filter("tryGridEval", [function(){
            return function(item, index, key){
                if(item) {
                    return item;
                } else {
                    return ones.GridScope.$eval("itemsList["+index+"]."+key);
                }
            };
        }])
        //尝试使用过滤器
        .filter("tryGridFilter", ["$filter", function($filter){
            return function(text, filter, $index){

                if(!filter) {
                    return text;
                }

                var item = ones.GridScope.$eval("itemsList["+$index+"]");

                var filters = filter.split("|");

                var data;

                angular.forEach(filters, function(filter){
                    filter = filter.replace(/'/g, "");


                    var args = filter.split(":");
                    filter = args[0];

                    if(args[1] && args[1].indexOf("item.") >=0) {
                        var itemField = args[1].split(".");
                        args[1] = ones.GridScope.$eval("itemsList["+$index+"]."+itemField[1]);
                    }

                    if(args[1]) {
                        var filterParams = args[1].match(/\+[a-zA-Z0-9\_\-]+/);
                        if(filterParams) {
                            angular.forEach(filterParams, function(p){
                                args[1] = args[1].replace(p, item[p.replace("+", "")]);
                            });
                        }
                    }

                    args = Array.prototype.slice.call(args, 1);

                    args.unshift(data || text);
                    args.push($index);

                    data = $filter(filter).apply(null, args);
                });

                return data;


            };
        }])
    ;

    /*
     * 返回grid selected ids
     * @param array selected 已选择项目
     * @param object item 右键点击项目
     * @param boolean multi 是否可多选
     * */
    window.get_grid_selected_ids = function(selected, item, multi) {
        var ids = [];

        if(multi) {
            if(item) {
                ids.push(item.id);
            } else if(selected) {
                angular.forEach(selected, function(si) {
                    ids.push(si.id);
                });
            }
        } else {
            ids = item.id || selected[0].id;
        }

        return ids;
    }

})(window.angular, window.ones);