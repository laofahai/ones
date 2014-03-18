'use strict'

angular.module('erp.common', ['erp.common.filters'])
        .config(function($routeProvider) {
            $routeProvider
                    .when('/', {
                        templateUrl: 'views/home/dashboard.html',
                        controller: 'MainCtl'
                    })
                    .when('/HOME/Index/dashboard', {
                        templateUrl: 'views/home/dashboard.html',
                        controller: 'MainCtl'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
        })
        .controller('CommonSidebarCtl', ['$scope', function($scope, StockinRes) {

                var navs = [{"childs": [], "label": "\u63a7\u5236\u9762\u677f", "icon": "home", "url": "HOME\/Index\/dashboard", "id": "be0760ec2c3391fc0c729590a6371bde"}, {"childs": [{"label": "\u5e93\u5b58\u6e05\u5355", "url": "JXC\/StockProductList", "id": "77f9a88b99f611a5b98c21788c511c6b"}, {"label": "\u5165\u5e93\u5355", "url": "JXC\/Stockin", "id": "ec204fa513e18409da82df37526a5e2c"}, {"label": "\u51fa\u5e93\u5355", "url": "JXC\/Stockout", "id": "9d2a4a17e2a72605a08d9a109121e266"}, {"label": "\u53d1\u8d27\u5355", "url": "JXC\/Shipment", "id": "1a1a952340db71be6bf6dfd701264648"}, {"label": "\u5e93\u5b58\u8c03\u62e8", "url": "JXC\/StockTransfer", "id": "3b169edb0c8b26a7ac8fa8d42e0621dc"}], "label": "\u4ed3\u5e93", "icon": "th-large", "url": "", "id": "ebe957a40608389a67175dbf251dfe6b"}, {"childs": [{"label": "\u65b0\u589e\u91c7\u8d2d\u5355", "url": "JXC\/Purchase\/add", "id": "85cd5adfb8db4ebf5102c72841caf28e"}, {"label": "\u91c7\u8d2d\u5355\u5217\u8868", "url": "JXC\/Purchase", "id": "dbef581dff82705ffec76af827f75908"}], "label": "\u91c7\u8d2d", "icon": "shopping-cart", "url": null, "id": "85dbdb21fe502c4d7a1e81bca0aa396d"}, {"childs": [{"label": "\u8ba2\u5355", "url": "JXC\/Orders", "id": "69695ef55bdb90e6092bf4fa2cf23b20"}, {"label": "\u9000\u8d27", "url": "JXC\/Returns", "id": "3590927e2acb19a1dbb872706237bcb4"}], "label": "\u9500\u552e", "icon": "pencil", "url": "", "id": "e695b010fc43994e1f4f89bc971f4630"}, {"childs": [{"label": "\u5217\u8868", "url": "CRM\/RelationshipCompany", "id": "c98f0a2602914333f4764b5b9b70e99b"}, {"label": "\u65b0\u589e", "url": "CRM\/RelationshipCompany\/add", "id": "e66a009df16476d140344a1064b9b42a"}], "label": "\u5f80\u6765\u5355\u4f4d", "icon": "link", "url": null, "id": "9564518daab60fc84733ccd41075ed67"}, {"childs": [{"label": "\u8d44\u91d1\u8d26\u6237", "url": "Finance\/FinanceAccount", "id": "622a43c1941b4c30564fc0de76d1ec27"}, {"label": "\u8d22\u52a1\u6536\u652f\u8bb0\u5f55", "url": "Finance\/FinanceRecord", "id": "c20cc5117567179980d242e8432d1a40"}, {"label": "\u8d22\u52a1\u6536\u5165\u8ba1\u5212", "url": "Finance\/FinanceReceivePlan", "id": "f5b2d68b9236e4348dd5bffdd8bd3469"}, {"label": "\u8d22\u52a1\u652f\u51fa\u8ba1\u5212", "url": "Finance\/FinancePayPlan", "id": "cbccb288b3cb4ec5701fb8201c376cbd"}], "label": "\u8d22\u52a1", "icon": "money", "url": null, "id": "57336afd1f4b40dfd9f5731e35302fe5"}, {"childs": [{"label": "\u9500\u552e\u7edf\u8ba1", "url": "Statistics\/Sale", "id": "1b63f9e0b41e54730586631b55326500"}, {"label": "\u5e93\u5b58\u8b66\u544a", "url": "JXC\/Stock\/warning", "id": "6848aba97d73c9fc5814437d0c63adcf"}, {"label": "\u7edf\u8ba1\u603b\u89c8", "url": "Statistics\/Overview", "id": "07f6f2f4073060f1fe66d9b16ca7219e"}, {"label": "\u4ea7\u54c1\u8fdb\u9500\u5b58\u8868", "url": "Statistics\/ProductView", "id": "7cf261139ed49533369a9b48bb77c15a"}], "label": "\u7edf\u8ba1\u5206\u6790", "icon": "bar-chart", "url": null, "id": "a912a94d79b5124d876951f96ebb256f"}, {"childs": [{"label": "\u5b57\u6bb5\u8bbe\u7f6e", "url": "HOME\/Config", "id": "94e8412adccf57907ab5312b97033a5b"}, {"label": "\u57fa\u7840\u6570\u636e\u8bbe\u7f6e", "url": "JXC\/Goods", "id": "0b8ea437476d44f5db439a0907af57e9"}, {"label": "\u7ec4\u7ec7\u673a\u6784\u8bbe\u7f6e", "url": "HOME\/User", "id": "b174073f445cf038e11d6d9235d55588"}, {"label": "\u5de5\u4f5c\u6d41", "url": "HOME\/Workflow", "id": "694b23cb81d9cdef6172390ad37c4115"}, {"label": "\u6e05\u9664\u7f13\u5b58", "url": "HOME\/Settings\/clearCache", "id": "ac728b1c04ab350840ee1248322e682b"}], "label": "\u8bbe\u7f6e", "icon": "cog", "url": null, "id": "2e5d8aa3dfa8ef34ca5131d20f9dad51"}];
                $scope.navs = navs;
                //    $scope.activeNav = $scope.navs[0].id;
                $scope.activeSubNav = "";
                $scope.checkActiveNav = function($index, id) {
                    $scope.openNav = id;
                    $scope.activeNav = id;
//                $("#nav-list > li").eq($index).addClass("open").find("ul").slideToggle('fast').parent().siblings().removeClass("open").find("ul").slideUp('false', function(){
//                    $("#nav-list > li").eq($index).addClass("active").siblings().removeClass("active");
//                });
                };
                $scope.checkSubActiveNav = function(id, parent) {
                    $scope.activeSubNav = id;
                    $scope.activeShowNav = parent;
                    $scope.openNav = parent;
                };
            }]);



var TabsDemoCtrl = function($scope) {
    $scope.tabs = [
        {title: "Dynamic Title 1", content: "Dynamic content 1"},
        {title: "Dynamic Title 2", content: "Dynamic content 2", disabled: true}
    ];

    $scope.alertMe = function() {
        setTimeout(function() {
            alert("You've selected the alert tab!");
        });
    };

    $scope.navType = 'pills';
};