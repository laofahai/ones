angular.module("ones.directiveModule", [])
    /**
     * 右键事件
     * */
    .directive('ngRightClick', ["$parse", function($parse) {
            return {
                restrict: "A",
                link: function($scope, element, attrs, oController) {
                    var fn;
                    fn = $parse(attrs.ngRightClick);
                    element.bind("contextmenu", function(event) {
                        $scope.$apply(function() {
                            fn($scope, {
                                $event: event
                            });
                        });
                        event.preventDefault();
                    });
                }
            }
        }])
    .directive("pageActions", ["$compile", function($compile) {
        return {
            restrict: "E",
            templateUrl: get_view_path('views/actions.html'),
            replace: true,
            transclude: true,
            scope: false
        };
    }])
    /*
    * 根据内容自动伸缩的input
    * @todo 不同语言字符宽度问题
    * */
    .directive('autoResizeInput', ['$timeout', function($timeout) {
        return {
            require: 'ngModel',
            link: function(scope, element, attr) {
                scope.$watch(attr.ngModel, function(val) {
                    if(!val) {
                        return;
                    }
                    var size = val.length * 2;

                    if(size < 4) {
                        size = 4;
                    }
                    $(element).attr('size', size);
                });
            }
        };
    }])
    /*
    * 仅能点击一次的按钮
    * */
    .directive('onceClick', [function() {
        return {
            link: function(scope, element, attr) {
                if(ones.DEBUG) {
                    return;
                }
                var fa = attr.onceClick || 'spinner';
                element.click(function() {
                    element.prepend('<i class="fa fa-spin fa-'+fa+'"></i> ').attr('disabled', 'disabled');
                    setTimeout(function() {
                        element.removeAttr('disabled');
                        element.find('i').remove();
                    }, 5000);
                });
            }
        };
    }])
;