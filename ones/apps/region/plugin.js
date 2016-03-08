(function(window, angular, ones) {
    'use strict';

    /*
    * 配置项
    * */
    // 注册至配置字段
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {

        // 是否忽略国家，意味着默认使用中国
        ones.pluginScope.append('common_config_item', {
            alias: 'region_ignore_country',
            label: _('region.Region ignore country'),
            widget: 'radio',
            required: false,
            data_source: window.BOOLEAN_DATASOURCE,
            app: 'region'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'region_ignore_country_opts',
            widget: 'hidden',
            value: 'region,integer',
            app: 'region'
        });

    });

    /*
    * 地区联动选择输入控件
    * @todo 确认为何scope有延迟
    * */
    ones.pluginRegister('extend_fields_maker', function(injector, defered, FORM_FIELDS_TPL, factory) {

        var $modal = injector.get('$modal');
        var $timeout = injector.get('$timeout');
        var $parse = injector.get('$parse');

        var tpl = '';
        var tpl_cache_key = 'ones.tpl.region_select';
        var cached = ones.caches.getItem(tpl_cache_key);
        if(!ones.DEBUG && cached) {
            tpl = cached;
        } else {
            $.get(get_view_path('apps/region/views/select_area.html'), function(html) {
                tpl = html;
            });
        }

        var region_api = injector.get('Region.RegionAPI');

        var label_model, label_getter, model_getter;

        // 已选中项目
        var selected_region_item = ['', '', '', ''];

        // 设置已选中显示
        var set_label = function(label) {

            if(!label) {
                var tmp = [];
                for(var i=0;i<4;i++) {
                    if(!selected_region_item[i] && selected_region_item[i] !== 0) {
                        continue;
                    }
                    tmp.push(factory.scope.$eval(label_model + '_' + i));
                }
                label = tmp.join('');
            }

            label_getter.assign(factory.scope, label);
        };

        // 设定字段值
        var set_model_value = function() {
            var value;
            for(var i=3; i>=0; i--) {
                if(selected_region_item[i]) {
                    value = selected_region_item[i];
                    break;
                }
            }
            model_getter.assign(factory.scope, value);
        };

        // 设定选择面板中的标题
        var set_type_label = function(type, label) {
            var default_labels = [
                _('region.Country'),
                _('region.Province'),
                _('region.City'),
                _('region.District')
            ];
            if(!label) {
                label = default_labels[type];
            }
            for(var i=type;i<4;i++) {
                var tg = $parse(label_model + '_' + i);
                tg.assign(factory.scope, default_labels[i]);
            }

            var tmp_getter = $parse(label_model + '_' + type);
            tmp_getter.assign(factory.scope, label);
        };
        // 获取远程信息
        var fetch_region_items = function(type, parent_id) {

            // 如果没有父类则返回
            if(ones.system_preference.region_ignore_country > 0) {
                parent_id = parent_id || 1;
            }
            if(!parent_id && type) {
                return;
            }

            parent_id = parent_id || 0;
            var params = {
                _mf: 'type,parent_id',
                _mv: [type, parent_id].join()
            };

            factory.scope.region_items = [];
            region_api.resource.api_query(params).$promise.then(function(response_data) {
                factory.scope.region_items = response_data || [];
            });
        };

        $timeout(function() {
            // 显示选择器
            factory.scope.show_region_select_modal = function($event) {
                angular.element($event.target).parents('.region_select_container').toggleClass('active');
            };
            // 切换选项卡
            factory.scope.change_tab_to = function(type) {
                factory.scope.active_tab = type;
                var parent_id = type-1 < 0 ? 0 : selected_region_item[type-1];
                fetch_region_items(type, parent_id);
            };
            // 设定已选择
            factory.scope.select_region_item = function(item) {
                selected_region_item[item.type] = item.id;
                // 自动切换至下一级
                if(item.type < 3) {
                    factory.scope.change_tab_to(item.type+1);
                }
                for(var i=item.type+1;i<4;i++) {
                    selected_region_item[i] = '';
                }
                set_type_label(item.type, item.name);
                set_label();
                set_model_value();
            };
            // 验证项目是否被选中
            factory.scope.is_region_item_active = function(type, id) {
                return selected_region_item[type] === id;
            };
        }, 1000);

        factory.fields_maker.region = function(config) {

            label_model = config['ng-model'] + '__label__';
            label_getter = $parse(label_model);
            model_getter = $parse(config['ng-model']);


            factory.scope.region_items = [];

            if(ones.system_preference.region_ignore_country > 0) {
                factory.scope.active_tab = 1;
                factory.scope.types = [1,2,3];
                fetch_region_items(1, 1);
            } else {
                factory.scope.active_tab = 0;
                factory.scope.types = [0,1,2,3];
                fetch_region_items(0);
            }

            angular.forEach(factory.scope.types, function(type) {
                set_type_label(type);
            });

            factory.scope.$on('form.dataLoaded', function(evt, data) {
                var exists_value = data[config.field];
                if(!exists_value) {
                    return;
                }
                region_api.get_full_name(exists_value).then(function(response_data) {
                    if(response_data) {
                        label_getter.assign(factory.scope, response_data.full_name);
                        angular.forEach(response_data.selected_region_item, function(item) {
                            factory.scope.select_region_item(item);
                        });
                    }
                });
            });



            config['class'] = 'region-select-input';
            config['ng-click'] = 'show_region_select_modal(\''+config['ng-model']+'\');';
            config['readonly'] = 'readonly';

            this.html = sprintf(tpl, {
                attr: factory.make_field_attr(config),
                label_model: label_model
            });

            set_label(_('region.Please Select'));
        };
    });

})(window, window.angular, window.ones);