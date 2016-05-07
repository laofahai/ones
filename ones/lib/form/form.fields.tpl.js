var FORM_GROUP_TPL = '<div class="form-group %(group_class)s" ng-class="%(ng_class)s" ng-show="check_is_in_active_group(%(field_config)s.field)">' +
    '<label for="%(id)s" class="col-sm-3 control-label">%(label)s</label>' +
    '<div class="col-sm-5 form-field">%(input)s</div>' +
    '<div class="help-block text-info col-sm-4"> <span ng-bind="%(form_field)s|toError:%(field_config)s:%(app)s"></span> <span ng-bind-html="%(help_text)s"></span></div>' +
    '</div>';
var FORM_CONTAINER_TPL = '<form name="%(form_name)s" id="%(form_name)s" class="form-horizontal form %(form_class)s" novalidate="">%(html)s</form>';
var FORM_FIELDS_TPL = {
    COMMON_INPUT: '<input type="%s" %s />',
    select: '<select %(attr)s ng-options="item.value as item.label for item in %(data)s" search_contains="true" disable_search_threshold="10" chosen><option></option></select>',
    radio: '<div class="radio" ng-repeat="item in %(data_name)s"><label><input type="radio" ng-value="item.value" %(attrs)s /> <span ng-bind="item.label"></span></label></div>',
    radio_inline: '<label class="radio-inline" ng-repeat="item in %(data_name)s"><input type="radio" ng-value="item.value" %(attrs)s /> <span ng-bind="item.label"></span></label>',
    checkbox: '',
    datetime_picker: '<input type="datetime-local" %(attr)s />',
    date_picker: '<input type="date" %(attr)s />',
    textarea: '<textarea %s></textarea>',
    item_select: '<div class="item_select_input_container">' +
                '<input type="text" %(attr)s readonly />' +
                '<div class="item_select_input_selected_container">' +
                '<a href="javascript:void(0);" class="btn btn-mini btn-success" ng-click="removeFromSelected(u.id)" ng-repeat="u in %(selected_model)s">' +
                '<span ng-bind="u.label"></span> <i ng-click="removeFromSelected(u.id)" class="fa fa-times"></i>' +
                '</a>' +
                '</div>'+
                '</div>',
    select3: '<div class="select3-container">' +
        '<input type="text" ng-model="%(model)s__label__" data-origin-model="%(model)s" autocomplete="off" %(attr)s />' +
        '<a href="javascript:void(0)" class="select3-add-btn" ng-show="cant_be_dynamic_add" ng-click="select_dynamic_add(\'%(model)s\')"><i class="fa fa-plus"></i></a>' +
        '<a href="javascript:void(0)" class="select3-show-grid-btn" ng-click="show_select3_modal(\'%(model)s\', \'%(model)s__label__\')">' +
        '<i class="fa fa-ellipsis-h"></i></a>' +
        '<input type="hidden" ng-model="%(model)s" /></div>',
    select3_items: '<ul ng-show="%(items_model)s.length>0" class="items">' +
    '<li ng-repeat="item in %(items_model)s" ng-bind="item.label" ' +
    'ng-click="do_select3_item_select(item, true, \'%(origin_model)s\', $event)" ng-class="{\'active\':$index===active_select3_index}"></li>' +
    '</ul>' +
    '<ul ng-show="%(items_model)s.length<=0" class="items"><li ng-bind="\'common.Does not match any rows\'|lang"></li></ul>',
    select3_group_tpl: '<div class="form-group %(group_class)s" ng-class="%(ng_class)s" ng-show="check_is_in_active_group(%(field_config)s.field)">' +
    '<label for="%(id)s" class="col-sm-3 control-label">%(label)s</label>' +
    '<div class="col-sm-5 select3-container-box form-field">%(input)s</div>' +
    '<div class="help-block text-info col-sm-4"> <span ng-bind="%(form_field)s|toError:%(field_config)s:%(app)s"></span> <span ng-bind-html="%(help_text)s"></span></div>' +
    '</div>',
    with_addon_before_group_tpl: '<div class="input-group"><span class="input-group-addon">%(label)s</span>%(input)s</div>'
};