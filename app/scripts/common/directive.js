'use strict';

/**
 * 表单生成
 * */
angular.module("ones.common.directives", ["ones.formMaker"])
        .directive("commonform", ["$compile", "FormMaker", function($compile, FormMaker) {
                return {
                    restrict: "E",
                    scope: {
                        config: "=",
                        data: "="
                    },
                    replace: true,
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                $scope.$on("commonForm.ready", function() {
                                    var fm = new FormMaker.makeForm($scope);
                                    var html = fm.makeHTML();
                                    iElement.append($compile(html)($scope.$parent));
                                    setTimeout(function(){
                                        var ele = iElement.find("input").eq(0);
                                        $(ele).trigger("click").focus();
                                    }, 200);
                                });
                            }
                        };
                    }
                };
            }])
        .directive("aceupload", ["$rootScope", function($rootScope){
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                scope: {
                    config: "="
                },
                compile: function() {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var config = $scope.$parent.$eval(iAttrs.config);
                            iElement.append('<input type="file" />');
                            iElement.find("input").ace_file_input({
                                no_file:'No File ...',
                                btn_choose: 'Choose',
                                btn_change: 'Change',
                                droppable: false,
                                onchange:null,
                                thumbnail:false
                            });
                        }
                    };
                }
            };
        }])
        .directive('ensureunique', ['$http', "$injector", function($http, $injector) {
                return {
                    require: 'ngModel',
                    link: function(scope, ele, attrs, c) {
                        var res = $injector.get(attrs.ensureunique);
                        scope.$watch(attrs.ngModel, function() {
                            var queryParams = {
                                id: 0,
                                excludeId:  $injector.get("$routeParams").id
                            };
                            queryParams[attrs.name] = scope.$eval(attrs.ngModel);
                            res.get(queryParams).$promise.then(function(data){
                                if(data[attrs.name]) {
                                    c.$setValidity('unique', false);
                                } else {
                                    c.$setValidity('unique', true);
                                }
                                
                            }, function(){
                                c.$setValidity('unique', false);
                            });
                        });
                    }
                };
            }])
        .directive("inputfield", ["$compile", "FormMaker", function($compile, FormMaker) {
                return {
                    restrict: "E",
                    replace: true,
                    scope: {
                        config: "="
                    },
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                var fieldDefine = $scope.$parent[iAttrs.config].fieldDefine;
                                var formMaker = new FormMaker.makeField($scope);
                                var html = formMaker.maker.factory($scope.$parent[iAttrs.config].context, fieldDefine, $scope);

                                iElement.append($compile(html)($scope.$parent));
                            }
                        };
                    }
                };
            }])
        .directive("select3", ["$compile", "FormMaker", function($compile, FormMaker) {
                return {
                    restrict: "E",
                    replace: true,
                    scope: {
                        config: "="
                    },
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                var b = new FormMaker.select3($scope);
                                setTimeout(function() {
                                    $(iElement).after($compile(b.makeHTML())($scope.$parent));
                                    iElement.remove();
                                });

                            }
                        };
                    }
                };
            }])
        .directive("bill", ["$compile", "FormMaker", function($compile, FormMaker) {
                return {
                    restrict: "E",
                    replace: true,
                    scope: {
                        config: "="
                    },
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                if ($scope.config.isEdit) {
                                    $scope.$on("bill.dataLoaded", function(evt, data) {
                                        $scope.$parent.formMetaData = data;
                                        var b = new FormMaker.makeBill($scope);
                                        iElement.append($compile(b.makeHTML())($scope.$parent));
                                    });
                                } else {
                                    var b = new FormMaker.makeBill($scope);
                                    iElement.append($compile(b.makeHTML())($scope.$parent));
                                }
                            }
                        };
                    }
                };
            }])
        .directive("widgetbox", ["$compile", "$templateCache", "$rootScope", function($compile, $templateCache, $rootScope) {
                return {
                    restrict: "E",
                    scope: {
                        wtitle: "=",
                        wclass: "="
                    },
                    replace: false,
                    transclusion: true,
                    compile: function(element, attrs) {
                        var template = '<div class="widget-box %(class)s">' +
                                '<div class="widget-header widget-header-flat"><h5>%(title)s</h5></div>' +
                                '<div class="widget-body"><div class="widget-main no-padding">%(inner)s</div></div>' +
                                '</div>';
                        var titles = $rootScope.i18n.lang.widgetTitles;
                        element.html(sprintf(template, {
                            title: (attrs.wtitle in titles) ? titles[attrs.wtitle] : attrs.wtitle,
                            inner: element.html(),
                            class: attrs.wclass
                        }));
                    }
                };
            }])
        .directive("pageactions", ["$compile", function($compile) {
                return {
                    restrict: "E",
                    templateUrl: 'views/common/actions/default.html',
                    replace: false,
                    transclude: true
                };
            }])
        ;