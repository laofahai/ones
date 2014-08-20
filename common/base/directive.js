(function(){
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
        .directive("commongrid", ["$compile", function($compile) {
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            $scope.$on("commonGrid.ready", function() {
                                var html = '<div class="gridStyle" ng-grid="gridOptions"></div>';
                                iElement.append($compile(html)($scope));
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
                            console.log($scope.$parent);
                            var config = $scope.$parent.$eval(iAttrs.config) || {};
                            iElement.append(sprintf('<input type="file" %s />', config.multiple || ""));
                            var conf = {
                                btn_choose: $rootScope.i18n.lang.messages.drag_or_chose_file,
                                btn_change: $rootScope.i18n.lang.messages.drag_or_chose_file,
                                droppable: true,
                                onchange:null,
                                whitelist:'gif|png|jpg|jpeg',
                                no_icon:'icon-cloud-upload',
                                style: "well",
                                thumbnail: "fit"
                            }
                            conf = $.extend(conf, config);
                            console.log(conf);
                            iElement.find("input").ace_file_input(conf);
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
        .directive("bill", ["$compile", "FormMaker", "$timeout", function($compile, FormMaker, $timeout) {
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
                            $scope.$on("commonBill.ready", function(){
                                $timeout(function(){
                                    if ($scope.$parent.config.isEdit) {
                                        $scope.$on("bill.dataLoaded", function(evt, data) {
                                            $scope.$parent.formMetaData = data;
                                            var b = new FormMaker.makeBill($scope);
                                            iElement.append($compile(b.makeHTML())($scope.$parent));
                                        });
                                    } else {
                                        var b = new FormMaker.makeBill($scope);
                                        iElement.append($compile(b.makeHTML())($scope.$parent));
                                    }
                                });
                            });
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
                templateUrl: 'common/base/views/actions/default.html',
                replace: false,
                transclude: true
            };
        }])

        /**
         * The ng-thumb directive
         * @author: nerv
         * @version: 0.1.2, 2014-01-09
         */
        .directive('ngThumb', ['$window', function($window) {
            var helper = {
                support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                isFile: function(item) {
                    return angular.isObject(item) && item instanceof $window.File;
                },
                isImage: function(file) {
                    var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            };

            return {
                restrict: 'A',
                template: '<canvas/>',
                link: function(scope, element, attributes) {

                    if (!helper.support) {
                        $(element).remove();
                        return;
                    }

                    var params = scope.$eval(attributes.ngThumb);

                    if (!helper.isFile(params.file) || !helper.isImage(params.file)){
                        $(element).remove();
                        return;
                    }

                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }
                }
            };
        }])
    ;
})();
