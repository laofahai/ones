(function(window, angular, ones){
    'use strict';

    angular.module('ones.app.marketing.main', ['ones.app.marketing.model'])
        .config(['$routeProvider', function($route) {
            $route
                .when('/marketing/saleOpportunities/push/:id', {
                    controller: 'SaleOpportunitiesPushCtrl',
                    templateUrl: 'views/edit.html'
                })
                .when('/marketing/saleOpportunitiesProduct/add/:extra*', {
                    controller: 'SaleOpportunitiesProductEditCtrl',
                    templateUrl: 'views/edit.html'
                })
            ;
        }])
        // 商机推进
        .controller('SaleOpportunitiesPushCtrl', [
            '$scope',
            'Marketing.SaleOpportunitiesAPI',
            '$routeParams',
            function($scope, api, $routeParams) {
                api.config.unaddable.push(
                    'name',
                    'remark',
                    'customer_id',
                    'head_id'
                );
                api.config.uneditable.push(
                    'name',
                    'remark',
                    'customer_id',
                    'head_id'
                );
                api.config.fields.push_remark = {
                    label: _('marketing.Push Remark'),
                    widget: 'textarea'
                };
                api.config.fields.last_contact_time.label = _('crm.Current Contact Time');
                $scope.back_able = true;
                $scope.formConfig = {
                    model: api,
                    resource: api.resource,
                    opts: {
                        extra_params: {
                            is_push: true,
                            opp_id: $routeParams.id
                        }
                    }
                };
            }
        ])
        .controller('SaleOpportunitiesProductEditCtrl', [
            '$scope',
            '$routeParams',
            'Marketing.SaleOpportunitiesProductAPI',
            'ones.form.api',
            '$timeout',
            'Product.ProductAPI',
            '$parse',
            function($scope, $routeParams, model, form_api, $timeout, product_api, $parse) {
                var extra_params = parse_arguments($routeParams.extra);
                $scope.formConfig = {
                    resource: model.resource,
                    model   : model,
                    id      : $routeParams.id,
                    model_prefix: 'form_add_sop',
                    opts    : {
                        extra_params: extra_params || {}
                    }
                };

                var quote_price = $parse('form_add_sop.quote_price');
                var quote_amount = $parse('form_add_sop.quote_amount');
                $timeout(function() {
                    form_api.scope.$watch('form_add_sop.product_id', function(product_id) {
                        if(!product_id) {
                            return;
                        }
                        product_api.resource.api_get({id: product_id[0]}).$promise.then(function(data) {
                            if(!data) {
                                return;
                            }
                            quote_price.assign(form_api.scope, data.price);
                        });
                    });
                });

            }
        ])
    ;
})(window, window.angular, window.ones);