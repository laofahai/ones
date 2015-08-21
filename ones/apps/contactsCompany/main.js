(function(window, ones, angualr){

    /**
     * 往来单位模块
     *
     * @plugin extend_contacts_company_profile_action 往来单位详情中扩展查看内容
     * @pluginScope contacts_company_profile_actions {label: '', init: function() {}, view: ''}
     * */

    angular.module('ones.app.contactsCompany.main', [
        'ones.frameInnerModule',
        'ones.gridViewModule',
        'ones.detailViewModule'
    ]);

})(window, window.ones, window.angular);