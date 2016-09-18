(function(angular, ones){

    /**
     * 数据表格模块
     *
     * @todo 按键监听 上下翻页
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
            "$filter",
            "RootFrameService",
            "Home.SchemaAPI",
            function($rootScope, $routeParams, $location, $modal, dataAPI, $timeout, $injector, $filter,
                     RootFrameService, SchemaAPI
            ){
                var self = this;
                this.scope = {};
                this.selected = {};


                this.init = function($scope, options){

                    options.model.config = options.model.config || {fields:{}, list_display: []};
                    options.model.config.fields = options.model.config.fields || {};
                    options.model.config.list_display = options.model.config.list_display || [];
                    options.model.config.list_hide = options.model.config.list_hide || [];

                    // 列表第一个字段加入ID
                    if(options.model.config.list_display.indexOf('id') <= 0) {
                        options.model.config.list_display.unshift('id');
                    }
                    if(!options.model.config.fields.id) {
                        options.model.config.fields.id = {
                            label: "ID",
                            grid_fixed: true,
                            width: 50
                        };
                    }

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

                    self.parentScope.selectable = true;

                    self.scope.model_config = self.model_config = self.options.model.config || {};
                    self.model_config.sortable = self.model_config.sortable || ['id'];
                    self.scope.search_able = self.model_config.search_able = self.model_config.search_able || {};

                    self.parentScope.quickSearchText = '';

                    // 列内搜索
                    self.scope.search_value = {};

                    // 刷新状态
                    self.scope.grid_refershing = false;


                    /**
                     * 当前应用信息
                     * */
                    self.app_info = self.scope.app_info = {
                        app: self.model_config.app,
                        module: self.model_config.module
                    };

                    if(is_app_loaded('messageCenter')) {
                        try {
                            var mc = $injector.get('ones.MessageCenter');
                            console.debug('Try to connect message center');
                            mc.on('data_changed', function(data) {
                                ones.DEBUG && console.debug('grid detcted data_changed event', data);
                                if(data.app === self.app_info.app && data.module === self.app_info.module) {
                                    self.refresh();
                                }
                            });
                        } catch(e) {
                            console.log(e);
                        }
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

                        self.field_search_values = query_params;
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

                            schema[self.model_config.table] = schema[self.model_config.table] || {};

                            self.parentScope.grid_trash_able = schema[self.model_config.table].enable_trash || false;

                            var structure = {};

                            angular.forEach(schema[self.model_config.table].structure, function(field) {
                                structure[field.field] = field;
                            });

                            angular.deep_extend(structure, self.scope.column_defs);

                            var human_date_display = false;
                            try {
                                var user_preference = $injector.get('Account.UserPreferenceAPI');
                                human_date_display = user_preference.get_preference('human_date_display');
                            } catch(e) {}

                            // 默认显示全部字段
                            var list_display_all = false;
                            if(!self.options.model.config.list_display || self.options.model.config.list_display.length < 2 || self.options.model.config.list_display_all) {
                                list_display_all = true;
                            }

                            angular.forEach(structure, function(field, field_name) {

                                if(!field.label) {

                                    // 默认_id label
                                    if(field_name.slice(-3) === "_id") {
                                        field.label =
                                            _(
                                                sprintf('%s.%s', self.app_info.app, camelCaseSpace(field_name.slice(0, -3)))
                                            );
                                    } else {
                                        field.label = _(ones.app_info.app+'.'+camelCaseSpace(field_name));
                                    }
                                    if(field.label === camelCaseSpace(field_name)) {
                                        field.label = field.comment;
                                    }

                                }

                                field.field = field.field || field_name;

                                // 显示全部字段
                                if(list_display_all && self.options.model.config.list_hide.indexOf(field.field) < 0) {
                                    self.options.model.config.list_display.push(field.field);
                                }

                                if(field.field in self.scope.column_defs) {
                                    angular.deep_extend(field, self.scope.column_defs[field.field] || {})
                                } else {
                                    self.scope.column_defs[field.field] = field;
                                }

                                self.scope.column_defs[field.field].field = field.field;

                                // 可排序字段
                                if(field.sortable) {
                                    self.model_config.sortable.push(field.map || field.field);
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
                                    && false !== config.human_date_display
                                    && (['datetime', 'date', 'time'].indexOf(config.widget) >= 0
                                    || config.field == 'created')
                                ) {
                                    self.scope.column_defs[field.field].cell_filter = 'to_human_date';
                                }



                                // 点击事件
                                if(typeof field.on_view_item_clicked === "function") {
                                    var click_event_name = field.ng_click ? field.ng_click : 'grid_click_'+field.field;
                                    self.scope.column_defs[field.field]['ng_click'] = click_event_name+'(item[field], item)';
                                    self.scope[click_event_name] = field.on_view_item_clicked;
                                }

                            });

                            self.options.model.config.list_display.remove('company_id');
                            self.scope.schema_display = self.scope.schema_display.concat(self.options.model.config.list_display || []);
                            self.scope.schema_display = array_unique(self.scope.schema_display);
                            self.scope.schema_display_fixed = $filter('get_grid_fields')(self.scope.schema_display, self.scope.column_defs, 1);
                            self.scope.schema_display_not_fixed = $filter('get_grid_fields')(self.scope.schema_display, self.scope.column_defs, 2);

                            console.debug('grid fixed fields:', self.scope.schema_display_fixed);
                            console.debug('grid not fixed fields:', self.scope.schema_display_not_fixed);

                            self.scope.column_defs = structure;
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


                    if(!self.options.opts.is_modal_grid) {
                        // 生成选中项目操作
                        self.makeSelectedActions();

                        // 生成新增链接
                        self.makeLinkActions();
                    }
                };


                this.makeLinkActions = function() {
                    self.link_actions = [];
                    self.scope.$root.link_actions = self.scope.$root.link_actions || [];
                    // 新增
                    var add_btn = {
                        label: _("common.Add New") + ' ' + _(self.model_config.app+'.'+camelCaseSpace(self.model_config.module||'')),
                        src: sprintf('%s/%s/%s%s',
                            self.model_config.app,
                            camelCase(self.model_config.module).lcfirst(),
                            self.model_config.is_bill ? 'add/bill' : 'add',
                            $routeParams.extra ? '/'+$routeParams.extra : ''
                        ),
                        singleton: true,
                        id: 'add_new_item'
                    };

                    if(self.model_config.addable !== false && self.link_actions.indexOf(add_btn) < 0) {
                        self.link_actions.push(add_btn);
                    }
                    angular.forEach(self.model_config.extra_link_actions, function(la) {
                        if(self.link_actions.indexOf(la) >= 0) {
                            return;
                        }
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
                        angular.extend(angular.copy(self.filtersData), self.field_search_values || {})
                    );
                    self.scope.$parent.gridSelected = self.gridSelected = [];
                };

                // 选中项操作
                this.makeSelectedActions = function() {
                    self.selectedAction = [];

                    if(self.options.query_params && self.options.query_params._ot) {
                        self.selectedActions = [
                            {
                                name: "untrash",
                                label: _('common.Untrash'),
                                icon: "retweet",
                                action: function (evt, selected, theItem) {
                                    var ids = [];
                                    var items = theItem ? [theItem] : selected;

                                    angular.forEach(items, function(item) {
                                        ids.push(item.id);
                                    });

                                    self.options.resource.update({id: ids, _m: "untrash"}, {}).$promise.then(function() {
                                        self.scope.$broadcast('gridData.changed', true);
                                    });
                                },
                                auth_node: "put"
                            },
                            {
                                name: "forever_delete",
                                label: _('common.Forever Delete'),
                                icon: "trash-o",
                                action: function (evt, selected, theItem) {
                                    var ids = [];
                                    var items = theItem ? [theItem] : selected;

                                    RootFrameService.confirm(_("common.Confirm delete the %s items?", items.length), function() {

                                        angular.forEach(items, function(item) {
                                            ids.push(item.id);
                                        });

                                        self.options.resource.delete({id: ids, forever_delete: true}).$promise.then(function() {
                                            self.scope.$broadcast('gridData.changed', true);
                                        });
                                    });

                                },
                                auth_node: "delete"
                            }
                        ];
                    } else {
                        try {
                            var PageSelectedActions = $injector.get('PageSelectedActions');
                            self.selectedActions = PageSelectedActions.generate(self.options.model, self.scope);
                        } catch(e) {
                            console.log(e);
                        }
                    }
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

                    self.scope.grid_refershing = false;

                    if(!remoteData) {
                        return;
                    }

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

                    data = self.parseData(data);

                    self.scope.$broadcast("gridData.changed", data);

                    self.scope.checked_box = [];
                    self.parentScope.gridSelected = [];

                    $timeout(function() {
                        self.scope.table_height = angular.element("#dataGridTable").height();
                        self.scope.filter_height = angular.element("#grid-filter-container").height();
                    }, 300);

                };

                // 格式化后端数据
                this.parseData = function(data) {
                    var cleared_data = [];

                    for(var i=0; i<data.length; i++) {

                        var cleared_single_row = data[i];
                        for(var j=0; j<self.scope.schema_display.length; j++) {
                            var key = self.scope.schema_display[j];
                            var value = data[i][key];
                            cleared_single_row[key+'__source__'] = data[i][key];

                            value = data[i][key+"__label__"] === undefined ? value : data[i][key+"__label__"];

                            if(self.scope.column_defs[key]) {
                                if(typeof self.scope.column_defs[key].get_display === 'function') {
                                    value = self.scope.column_defs[key].get_display(value, data[i]);
                                } else {
                                    //value = $filter('tryGridEval')(value, key, i); ?????????

                                    if(value === null || value === 'null') {
                                        value = undefined;
                                    } else if(self.scope.column_defs[key].cell_filter) {
                                        value = $filter('tryGridFilter')(value, self.scope.column_defs[key].cell_filter, i);
                                    }
                                }

                            }

                            cleared_single_row[key] = filter_invalid_value(value);
                        }

                        cleared_data.push(cleared_single_row);
                    }

                    return cleared_data;

                };

                //获取后端数据
                this.getPagedDataAsync = function(page, extraParams) {

                    self.scope.grid_refershing = true;
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

                        if(self.scope.filterOptions && !p._kw) {
                            p._mf = self.scope.filterOptions.matchField || p._mf;
                            p._mv = self.scope.filterOptions.matchFieldValue || p._mv;
                        }

                        try {
                            self.options.resource.query(p).$promise.then(function(remoteData) {
                                self.setPagingData(remoteData, page, pageSize);

                                // 设置非固定列容器宽度
                                $('#grid-not-fixed-fields-container').css({
                                    marginLeft: $('#grid-fixed-fields-container').width() - 1
                                });
                            });
                        } catch(e) {
                            console.log(e);
                        }
                    });
                };
                /**
                 * 过滤器
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

                        if(self.options.query_params && self.options.query_params._mf && self.options.query_params._mv !== undefined) {
                            angular.extend(mf, self.options.query_params._mf.split(','));
                            angular.extend(mv, self.options.query_params._mv.split(','));
                        }

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

                        item = item || {};

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
                                                    d[data_source.config.label_field||'name'] = filter_invalid_value(item.get_display(d));
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
                        var direction = self.scope.sortInfo.direction == "ASC" ? "DESC" : "ASC";

                        if(self.model_config.fields[field] && self.model_config.fields[field].map) {
                            field = self.model_config.fields[field].map;
                        }

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
                        //var absIndex = Math.abs(index)-1;
                        var absIndex = Math.abs(index);
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
        .directive("tableView", [
            "$compile", "$timeout", "GridView", "$filter",
            "$rootScope",
            function($compile, $timeout, GridView, $filter, $rootScope){
                return {
                    restrict: "E",
                    replace: true,
                    transclusion: true,
                    templateUrl: get_view_path("views/gridTemplate.html"),
                    scope: {
                        config: "="
                    },
                    compile: function(element, attrs, transclude){
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                var fetchData = function(){
                                    var gridOptions = $scope.$parent.$eval(iAttrs.config);

                                    GridView.init($scope, gridOptions);

                                    angular.forEach(GridView.methodsList, function(method, k){
                                        $scope[k] = method;
                                    });
                                    $rootScope.recordSelected = GridView.methodsList.recordSelected;

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
            }
        ])
        //尝试使用$eval
        .filter("tryGridEval", [function(){
            return function(item, key, index){
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
        /*
         * 返回需显示的数据列
         * @param [] schema_display 全部需显示的列
         * @param {} column_defs 列配置
         * @param enum(0, 1, 2) type
         *   1: 仅返回固定左侧列字段
         *   2: 仅返回非fixed字段
         *   3: 返回全部字段
         *
         *  默认为首字段固定左侧显示
         * */
        .filter('get_grid_fields', [function() {
            return function(schema_display, column_defs, type) {
                type = type || 3;
                if(type == 3 || !schema_display) {
                    return schema_display;
                }

                var fixed = [], not_fixed = [], first_fixed = schema_display.slice(0, 2);

                for(var i=0; i<schema_display.length; i++) {
                    var t = schema_display[i];
                    if(column_defs[t] && column_defs[t].grid_fixed) {
                        fixed.push(t);
                    } else {
                        not_fixed.push(t);
                    }
                }

                // 默认首列固定
                if(fixed.length <= 1 && not_fixed.length > 1) {
                    fixed = first_fixed;
                    not_fixed = not_fixed.splice(1);
                }

                not_fixed.remove('_data_model_fields_');

                return type == 1 ? fixed : not_fixed;
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
    };

})(window.angular, window.ones);