var BILL_META_INPUT_GROUP_TPL = '<div class="input-group"><span class="input-group-addon">%(label)s</span>%(input)s</div>';
(function(window, angular, ones, io) {
    'use strict';
    angular.module('ones.billModule', ['ones.formFieldsModule', 'ngClipboard'])
        .config([
            "ngClipProvider",
            function(ngClipProvider) {
                // ng-click to copy
                ngClipProvider.setPath("images/ZeroClipboard.swf");
            }
        ])
        .service('BillModule', [
            '$routeParams',
            '$timeout',
            '$injector',
            '$parse',
            '$compile',
            '$aside',

            'PageSelectedActions',
            'RootFrameService',
            'ones.form_fields_factory',
            function($routeParams, $timeout, $injector, $parse, $compile, $aside, PageSelectedActions, RootFrameService, field_factory) {
                var self = this;
                // 单据基本配置
                this.opts = {
                    // 初始显示行
                    init_rows: 9,
                    // 是否自动生成编号
                    bill_no: {
                        prefix: '' // 前缀
                        , bar_code_container: '#bar-code' // img container id <div id="bar-code"></div>
                        , field: 'bill_no' // bar code 存储ID
                        , display_value: true // 是否显示字符
                        , height: 40
                        , fontSize: 10
                        , value: generate_bill_no()
                    }
                };

                this.init = function(scope, opts) {
                    this.scope = scope;
                    this.parentScope = scope.$parent;

                    // 基本信息
                    this.parentScope.bill_meta_data = this.parentScope.bill_meta_data || {};

                    angular.deep_extend(this.opts, opts);

                    if(!opts.model || !opts.model.config.bill_row_model) {
                        RootFrameService.alert(_('common.Can not found bill row model'));
                        return false;
                    }

                    // 行model
                    this.row_model = $injector.get(opts.model.config.bill_row_model);
                    this.total_able_fields = [];
                    angular.forEach(this.row_model.config.fields, function(config, field) {
                        if(config.total_able) {
                            self.total_able_fields.push(field);
                        }
                    });

                    this.scope.bill_rows = [];
                    this.scope.row_fields = [];

                    this.parentScope.system_preference = ones.system_preference;
                    this.parentScope.company_profile = ones.company_profile;

                    this.opts.model.config.bill_meta_required = this.opts.model.config.bill_meta_required || [];

                    this.run();
                };

                /*
                * 常用方法
                * */
                this.common_methods = {
                    // 重新计算合计金额
                    re_calculate_total: function($runtime_scope, rows, total_able_fields, update_net) {
                        total_able_fields = total_able_fields || this.total_able_fields || [];

                        var totals = {};
                        angular.forEach(rows, function(row) {
                            angular.forEach(row, function(v, k) {
                                if(total_able_fields.indexOf(k) >= 0) {
                                    totals[k] = totals[k] || 0;
                                    totals[k] += to_decimal_display(v);
                                }
                            });
                        });

                        angular.forEach(totals, function(value, field) {
                            var getter = $parse('bill_meta_data.' + field + '__total__');
                            getter.assign($runtime_scope, value);

                            var label_getter = $parse('bill_meta_data.' + field + '__total____label__');
                            label_getter.assign($runtime_scope, to_decimal_display(value, false, true));
                        });

                        if(false !== update_net) {
                            $runtime_scope.bill_meta_data[update_net] = $runtime_scope.bill_meta_data.subtotal_amount__total__;
                        }
                    },
                    // 重新计算小计
                    re_calculate_subtotal: function($runtime_scope, rows, row_scope, row_index) {
                        if(!rows[row_index].quantity || !rows[row_index].unit_price) {
                            return;
                        }
                        var sub_total_getter = $parse('bill_rows['+row_index+'].subtotal_amount');
                        var sub_total_label_getter = $parse('bill_rows['+row_index+'].subtotal_amount__label__');
                        var sub_total = to_decimal_display(rows[row_index].quantity) * to_decimal_display(rows[row_index].unit_price);
                        sub_total_getter.assign(row_scope, to_decimal_display(sub_total));
                        sub_total_label_getter.assign(row_scope, to_decimal_display(sub_total, false, true));
                    }
                };

                /*
                * 载入编辑数据
                * @param array|undefined data 默认数据 => {meta: {}, rows: []}
                * */
                this.load_edit_data = function(data) {
                    if(data) {
                        if(!data.meta || !data.rows) {
                            RootFrameService.alert({
                                content: _('common.Bill Init Data Parse Error'),
                                type: 'danger'
                            });
                            return false;
                        }
                        angular.deep_extend(self.parentScope.bill_meta_data, data.meta);
                        self.scope.bill_rows = data.rows;
                        self.max_tr_id = data.rows.length+1;

                        generate_bar_code();
                        return;
                    }

                    var p = {
                        id: $routeParams.id,
                        _ir: true // include_rows
                    };
                    self.opts.model.resource.get(p).$promise.then(function(response_data){
                        angular.deep_extend(
                            self.parentScope.bill_meta_data,
                            format_rest_data(response_data.meta, self.opts.model.config.fields)
                        );

                        var rows = response_data.rows;
                        if(response_data.meta.locked && $routeParams.action === 'edit') {
                            return RootFrameService.alert({
                                type: 'danger',
                                content: _('common.This item is locked and can not be edit')
                            });
                        }
                        angular.forEach(rows, function(row, k) {
                            angular.forEach(row, function(value, field) {
                                if(!row[field+'__label__']) {
                                    if(self.row_model.config.fields[field] && typeof self.row_model.config.fields[field].get_display === 'function') {
                                        rows[k][field+'__label__'] = self.row_model.config.fields[field].get_display(value, row);
                                    } else {
                                        rows[k][field+'__label__'] = value;
                                    }
                                }

                                rows[k][field+'__label__'] = filter_invalid_value(rows[k][field+'__label__']);
                            });
                        });

                        self.scope.$root.current_item = self.parentScope.bill_meta_data;

                        self.scope.bill_rows = rows;

                        var workflow_api = $injector.get('Bpm.WorkflowAPI');
                        // 获取工作流按钮
                        if(self.opts.model.config.workflow) {
                            var _fd = [
                                'id', 'label'
                            ];
                            workflow_api.get_next_nodes(response_data.meta.workflow_id, response_data.meta.id, _fd)
                                .then(function(next_nodes){
                                    self.parentScope.$parent.workflow_node_in_bill = next_nodes;
                                });
                        }

                        // 未开始的工作流
                        if(!response_data.meta.workflow_id) {
                            self.parentScope.$parent.workflow_not_started = true;
                            workflow_api.get_all_workflow(self.opts.model.config.app + '.' + self.opts.model.config.module).then(function(all_workflow) {
                                self.parentScope.$parent.all_workflows = all_workflow;
                            });
                        }

                        // 更新合计
                        self.common_methods.re_calculate_total(self.parentScope, rows, self.total_able_fields, false);

                        generate_bar_code();
                    });

                };

                this.run = function() {


                    this.scope.$watch('column_defs', function(updated_column_defs) {
                        self.scope.column_defs = updated_column_defs;
                    });

                    // 编辑模式
                    if($routeParams.id) {
                        this.opts.isEdit = true;

                        // 修改/删除等按钮
                        self.scope.$root.display_selected_actions_directly = true;
                        self.scope.$root.selectedActions = PageSelectedActions.generate(self.opts.model, self.parentScope);

                    } else {
                        // 行初始信息
                        for(var i=0;i<this.opts.init_rows;i++) {
                            self.scope.bill_rows.push({
                                tr_id: i
                            });
                        }
                        this.max_tr_id = this.opts.init_rows;

                        // 标题
                        this.parentScope.bill_meta_data.subject = this.opts.subject;

                        // 条码
                        if(this.opts.bill_no !== false) {
                            $timeout(function() {
                                generate_bar_code();
                            });
                        }
                    }

                    if(!$routeParams.id) {

                        var do_quick_search_query = function() {
                            var keyword = self.scope.$parent.bill_meta_data.quick_search_keyword;
                            if(!self.scope.bill_rows || !keyword) {
                                return;
                            }

                            var api = $injector.get('Product.ProductCompanyMapAPI');
                            api.resource.api_query({_m: 'fetch_by_unique_number', keyword: keyword, app: ones.app_info.app}).$promise.then(function(response_data) {
                                self.scope.$parent.current_quick_search_index = 0;
                                if(response_data) {
                                    self.scope.$parent.quick_search_result = response_data;
                                }
                            });
                        };

                        self.scope.$parent.$watch(function() {
                            return self.scope.$parent.bill_meta_data.quick_search_keyword;
                        }, function(keyword) {
                            do_quick_search_query();
                        });

                        self.scope.$parent.do_quick_search_focus = function() {
                            do_quick_search_query();
                        };

                        var do_select = function(index) {
                            var latest_cleared_row = self.scope.bill_rows.length;
                            for(var i=0;i<self.scope.bill_rows.length;i++) {
                                if(!self.scope.bill_rows[i].product_id) {
                                    latest_cleared_row = i;
                                    break;
                                }
                            }
                            self.scope.bill_rows[latest_cleared_row] = self.scope.$parent.quick_search_result[index];

                            self.scope.$parent.fetch_stock_quantity(
                                self.scope.bill_rows,
                                self.scope.$parent,
                                latest_cleared_row
                            );
                            self.scope.$parent.re_calculate_subtotal(
                                self.scope.bill_rows,
                                self.scope.$parent,
                                latest_cleared_row
                            );
                            //console.log(self.scope.bill_rows);
                        };

                        this.scope.$parent.do_quick_search_blur = function() {
                            $timeout(function() {
                                self.scope.$parent.current_quick_search_index = 0;
                                self.scope.$parent.quick_search_result = [];
                            }, 350);

                        };

                        this.scope.$parent.do_quick_search = function($event, index) {
                            if(undefined !== index) {
                                do_select(index);
                                return;
                            }

                            switch($event.keyCode) {
                                case KEY_CODES.ENTER:
                                    do_select(self.scope.$parent.current_quick_search_index);
                                    break;
                                case KEY_CODES.UP:
                                    self.scope.$parent.current_quick_search_index--;
                                    if(self.scope.$parent.current_quick_search_index<0) {
                                        self.scope.$parent.current_quick_search_index = self.scope.$parent.quick_search_result.length-1;
                                    }
                                    break;
                                case KEY_CODES.DOWN:
                                    self.scope.$parent.current_quick_search_index++;
                                    if(self.scope.$parent.current_quick_search_index>=self.scope.$parent.quick_search_result.length) {
                                        self.scope.$parent.current_quick_search_index = 0;
                                    }
                                    break;
                                default:
                                    return;
                            }

                            $event.preventDefault();
                        };


                        this.scope.$parent.show_quick_search = true;
                    }

                    // 行字段
                    this.scope.row_fields = this.row_model.config.bill_fields;
                    this.scope.column_defs = this.row_model.config.fields;
                    this.scope.batch_select = {};

                    angular.forEach(this.scope.column_defs, function(config, field) {

                        config.field = config.field || field;

                        if(!config.field_model) {
                            self.scope.column_defs[field].field_model = field;
                        }

                        if(!config.field_label_model) {
                            self.scope.column_defs[field].field_label_model = field+'__label__';
                        }

                        if(!config['ng-model']) {
                            self.scope.column_defs[field]['ng-model'] = 'bill_rows[$parent.$index].' + field;
                        }

                        // 批量选择
                        if(config.batch_select) {
                            var batch_data_source = $injector.get(config.data_source);
                            batch_data_source.resource.api_query().$promise.then(function(data) {
                                self.scope.batch_select[field] = [];
                                var valueField = batch_data_source.config.value_field||'id';
                                angular.forEach(data, function(item) {
                                    self.scope.batch_select[field].push({
                                        value: item[valueField],
                                        label: typeof batch_data_source.unicode === 'function' ?
                                            batch_data_source.unicode(item) :
                                            item[batch_data_source.config.label_field||'name']
                                    });
                                });
                            });
                        }
                    });


                    // 批量设定
                    this.scope.batch_set_value = function(field, batch) {
                        var i = 0;
                        var cells = $('td[data-field="'+field+'"]');
                        angular.forEach(self.scope.bill_rows, function(item, key) {
                            self.scope.bill_rows[key][field] = batch.value;
                            self.scope.bill_rows[key][field + '__label__'] = batch.label;
                            i++;
                        });
                    };

                    // 增删行
                    this.scope.add_row = function(index) {
                        self.scope.bill_rows.splice(index, 0, {
                            tr_id: self.max_tr_id
                        });
                        self.max_tr_id++;
                    };
                    this.scope.del_row = function(index) {
                        self.scope.bill_rows.splice(index, 1);
                    };

                    // 单元格初始化
                    this.scope.cell_init = function(column_def, td, form_name, td_scope) {

                        var tr_id = td.data('row-index');

                        column_def['ng-model'] = form_name + '.' + column_def.field;
                        column_def['label-model'] = form_name + '.' + column_def.field + '__label__';
                        column_def.id = randomString('6')+'_'+column_def.field;

                        self.scope.column_defs[column_def.field] = column_def;

                        var html = field_factory.make_field(td_scope, column_def.field, column_def, column_def.opts || {
                            container_tpl: '%(input)s',
                            form_name: form_name
                        });

                        td.append($compile(html)(td_scope || self.scope));

                        //if(td.data('inited')) {
                            $timeout(function(){
                                td.find('>:last').addClass('bill_editable_widget').addClass('hide');
                            });
                        //}

                        td.attr('data-inited', 'true');


                    };

                    /*
                    * 单据数据格式化方法
                    * */
                    this.format_bill_data = function() {
                        var bill_rows = angular.copy(self.scope.bill_rows);
                        var bill_meta = angular.copy(self.scope.$parent.bill_meta_data);
                        var bill_rows_cleared = [];
                        var required_field_lang = [];

                        // 检测基本信息
                        for(var i=0; i<self.opts.model.config.bill_meta_required.length; i++) {
                            var required = self.opts.model.config.bill_meta_required[i];
                            if(!bill_meta[required]) {
                                required_field_lang.push(_(ones.app_info.app+'.'+ camelCaseSpace(required)));
                            }
                        }
                        if(required_field_lang.length > 0) {
                            RootFrameService.alert({
                                content: _('common.Please fill out the form correctly') + ': ' + required_field_lang.join(', '),
                                type: 'danger'
                            });
                            return false;
                        }

                        // 检测必须字段， 非法行将被丢弃
                        // @todo 检测时是否仅检测undefined

                        var required = self.row_model.config.bill_row_required;
                        angular.forEach(bill_rows, function(item, index) {

                            if(self.row_model.config.bill_row_required) {
                                for(var i=0;i<required.length;i++) {
                                    if(!item[required[i]]) {
                                        return;
                                    }
                                }
                            }

                            // 检测行数据中的无用临时数据
                            delete(item['tr_id']);
                            //angular.forEach(item, function(v, k) {
                            //    if(k.end_with('__') && k != 'brand__label__' && k != 'standard__label__' && k != 'product_id__label__') {
                            //        delete(item[k]);
                            //    }
                            //});
                            bill_rows_cleared.push(item);
                        });

                        // 无明细行
                        if(bill_rows_cleared.length <= 0) {
                            RootFrameService.alert({
                                content: _('common.Please fill out the form correctly'),
                                type: 'danger'
                            });
                            return false;
                        }
                        // 数据格式化
                        bill_meta = post_data_format(bill_meta);

                        return {
                            meta: bill_meta,
                            rows: bill_rows_cleared
                        };
                    };

                    /*
                    * 单据提交方法
                    * */
                    this.parentScope.do_bill_submit = function() {
                        var post_data = self.format_bill_data();
                        if(false === post_data) {
                            return false;
                        }
                        var callback = function(response_data) {

                            if(is_app_loaded('messageCenter')) {
                                var mc = $injector.get('ones.MessageCenter');
                                mc.emit('some_data_changed', {
                                    sign_id: ones.caches.getItem('company_sign_id'),
                                    user_id: ones.user_info.id,
                                    app: ones.app_info.app,
                                    module: ones.app_info.module
                                });
                            }

                            if(!response_data || !response_data.error) {
                                RootFrameService.close();
                            }

                        };
                        // 提交
                        if(self.opts.isEdit) {
                            self.opts.model.resource.update({id: $routeParams.id}, post_data).$promise.then(callback);
                        } else {
                            self.opts.model.resource.save(post_data).$promise.then(callback);
                        }

                    };

                    // 载入编辑数据
                    if($routeParams.id) {
                        self.load_edit_data();
                    }

                    // 复制条码
                    this.parentScope.on_clip_click = function() {
                        RootFrameService.alert({
                            type: 'info',
                            content: _('common.Bar code has been copy to your clip-board')
                        });
                    };
                };

                // 生成单据条码
                var generate_bar_code = function() {
                    var bar_code = self.opts.isEdit ? self.parentScope.bill_meta_data[self.opts.bill_no.field] : self.opts.bill_no.value;

                    if(!bar_code || false === self.opts.model.config.display_barcode) {
                        return;
                    }

                    $(self.opts.bill_no.bar_code_container).append('<img />');
                    $timeout(function() {
                        $(self.opts.bill_no.bar_code_container + ' img').JsBarcode(bar_code, {
                            height: 40,
                            fontSize: 8,
                            displayValue: self.opts.bill_no.display_value,
                            format:	"CODE128"
                        });
                    });

                    self.parentScope.bar_code_field = self.opts.bill_no.field;
                    self.parentScope.bill_meta_data[self.opts.bill_no.field] = bar_code;
                };

            }
        ])
        .directive("bill", [
            "$compile", "$timeout", "GridView", "$filter", "BillModule",
            function($compile, $timeout, GridView, $filter, bill) {
                return {
                    restrict: "E",
                    replace: true,
                    transclusion: true,
                    templateUrl: "views/billTemplate.html",
                    scope: {
                        config: "="
                    },
                    link: function(scope, element, attrs) {
                        bill.init(scope, scope.$parent.$eval(attrs.config));
                    }
                };
            }
        ])
        // 可编辑区域
        .directive("billEditAble", [
            '$timeout',
            '$compile',
            '$parse',
            '$routeParams',
            'ones.form_fields_factory',
            '$rootScope',
            function($timeout, $compile, $parse, $routeParams, field_factory, $rootScope) {
                return {
                    link: function(scope, ele, attrs) {

                        var self = {};
                        self.inited = false;

                        // 字段配置
                        var column_def = {};

                        // 是否已绑定时间
                        var event_binded = [];

                        var bind_element_event = function(column_def, element, is_td) {



                            if(is_td) {
                                td = $(element);
                            } else {
                                var td = $(element).parent();
                            }

                            td = $(td.context);
                            if(td.data('inited') == true) {
                                self.inited = true;
                            }

                            // 依赖其他字段时
                            if(column_def.editable_required && !self.inited) {
                                if(!angular.isArray(column_def.editable_required)) {
                                    column_def.editable_required = [column_def.editable_required];
                                }

                                var model_prefix = column_def['ng-model'].split('.').slice(0, -1).join('.');
                                model_prefix = model_prefix === 'undefined' ? 'bill_rows[$parent.$index]' : model_prefix;

                                for(var i=0;i<column_def.editable_required.length;i++) {
                                    var req = column_def.editable_required[i];
                                    var required_model = model_prefix + '.' + req;
                                    var required_val = scope.$eval(required_model);
                                    if(undefined === required_val) {
                                        return;
                                    }
                                }
                            }

                            var tr_id = td.data('row-index');
                            var form_name = column_def.form_name || 'bill_rows[$parent.$index]';

                            // 未初始化情况下，初始化输入控件
                            if(!self.inited) {
                                scope.$parent.cell_init(column_def, td, form_name, scope);
                                self.inited = true;
                            }

                            $timeout(function() {
                                element.find('label.bill_row_td_editable_label').addClass('hide');
                                element.find('.bill_editable_widget').removeClass('hide');
                                $(element).find('input.form-control').focus();
                                //$(element).find('input.form-control').select();
                            });

                            if(event_binded.indexOf(element) < 0) {
                                event_binded.push(element);
                                // 失去焦点事件
                                ele.delegate('input.form-control', 'blur', function() {
                                    // 隐藏输入框
                                    setTimeout(function() {
                                        ele.find('.bill_editable_widget').addClass('hide');
                                        ele.find('label.bill_row_td_editable_label').removeClass('hide');
                                    }, 350);

                                    // 检测label model 是否已正确
                                    $timeout(function(){
                                        // 小数保留
                                        if(column_def.widget == 'select3') {
                                            return;
                                        }
                                        if (column_def.widget === 'number') {
                                            var getter = $parse(column_def['ng-model']);
                                            getter.assign(scope, to_decimal_display(scope.$eval(column_def['ng-model'])));
                                        }

                                        var label_value = scope.$eval(column_def['label-model']);
                                        var old_label_value = angular.copy(label_value);

                                        if(typeof column_def.get_display === 'function') {
                                            label_value = column_def.get_display(
                                                scope.$eval(column_def['ng-model']), // value
                                                scope.$eval(form_name)// row item
                                            );
                                            label_value = filter_invalid_value(label_value);
                                            var getter = $parse(column_def['label-model']);
                                            getter.assign(scope, label_value || old_label_value);
                                        } else {
                                            var getter = $parse(column_def['label-model']);
                                            getter.assign(scope, scope.$eval(column_def['ng-model']));
                                        }
                                    }, 500);

                                    bind_before_and_after(column_def);
                                });

                                //回车事件
                                ele.delegate('input.form-control', 'keydown', function(event) {
                                    if(event.keyCode === KEY_CODES.ENTER) {
                                        // 自动进入下一可编辑区域
                                        var find_next = function() {
                                            // 寻找当前行下一可编辑框
                                            var ele = $(event.target).parents('td').nextAll('td.td_editable');
                                            var tr = $(event.target).parents('tr');

                                            var focus_next_line = function(next_tr) {
                                                next_tr = $(next_tr);
                                                if(!next_tr) {
                                                    return;
                                                }
                                                var next_td_ele = next_tr.find('td.td_editable');
                                                if(next_td_ele) {
                                                    $(next_td_ele[0]).find('label').trigger('click');
                                                }
                                            };
                                            if(ele[0]) {
                                                $(ele[0]).find('label').trigger('click');
                                                return;
                                            } else {
                                                ele = tr.nextAll('tr.tr_editable')[0];
                                                if(!ele) {
                                                    // 自动新增一行
                                                    scope.add_row(tr.index()+1);
                                                    $timeout(function() {
                                                        ele = tr.nextAll('tr.tr_editable')[0];
                                                        focus_next_line(ele);
                                                    });
                                                } else {
                                                    focus_next_line(ele);
                                                }

                                            }
                                        };

                                        $timeout(function() {
                                            if(!window.ajax_ing) {
                                                find_next();
                                            } else {
                                                var i = 0;
                                                var t = setInterval(function() {
                                                    if(!window.ajax_ing || i >= 30) {
                                                        find_next();
                                                        clearInterval(t);
                                                    }
                                                    i++;
                                                }, 100);
                                            }
                                        });
                                    }
                                });

                            }


                        };

                        // 绑定单元格前置和后置
                        var bind_before_and_after = function(column_def) {
                            var form_name = column_def.form_name || 'bill_rows[$parent.$index]';
                            var value = scope.$eval(column_def['ng-model']);
                            var item = scope.$eval(form_name);
                            // 单元格后置
                            if(typeof column_def.get_bill_cell_after === 'function') {
                                var after = column_def.get_bill_cell_after(
                                    value, // value
                                    item// row item
                                );
                                var getter = $parse(column_def['ng-model'] + '__after__');
                                if(angular.isObject(after) && 'then' in after) {
                                    after.then(function(string) {
                                        getter.assign(scope, string);
                                    });
                                } else {
                                    getter.assign(scope, after);
                                }
                            }

                            // 单元格前置
                            if(typeof column_def.get_bill_cell_before === 'function') {
                                var before = column_def.get_bill_cell_before(
                                    value, // value
                                    item// row item
                                );
                                var getter = $parse(column_def['ng-model'] + '__before__');
                                if(angular.isObject(before) && 'then' in before) {
                                    before.then(function(string) {
                                        getter.assign(scope, string);
                                    });
                                } else {
                                    getter.assign(scope, before);
                                }
                            }

                            // 合计
                            //if(column_def.total_able) {
                            //    console.log(value, item);
                            //}
                        };

                        /*
                        * @todo 产品属性模型远程字段配置后，同步更新row_model.fields
                        * @bug
                        * */
                        $timeout(function() {
                            // 字段配置
                            column_def = scope.$parent.$eval(attrs.billEditAble);

                            if($routeParams.id) {
                                bind_before_and_after(column_def);
                            }

                            // 锁定状态，并且非强制可编辑时
                            if(scope.$parent.$parent.$parent.bill_meta_data.locked && !column_def.force_editable) {
                                return;
                            }

                            if(column_def.editable === false) {
                                return;
                            }

                            //ele.delegate('label', 'click', function() {
                            //    bind_element_event(ele);
                            //});
                            ele.bind('click', function() {
                                bind_element_event(column_def, ele, true);
                            });
                        }, 5000);

                    }
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);