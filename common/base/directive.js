(function(){
    /**
     * 表单生成
     * */
    angular.module("ones.common.directives", ["ones.formMaker"])

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
                transclude: true,
                scope: false
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
