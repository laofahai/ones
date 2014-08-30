(function(){
    ones.installLang = {};
    angular.module("ones.install", [
            'ngRoute',
            "ones.configModule",
            "ones.common.filters",
            "ones.commonView"
        ])
        .config(["$routeProvider", function($route){
            $route
                .when("/step-1", {
                    templateUrl: appView("readAgreement.html", "install"),
                    controller: "ReadAgreementCtl"
                })
                .when("/step-2", {
                    templateUrl: appView("configure.html", "install"),
                    controller: "ConfigureCtl"
                })
                .when("/step-3", {
                    templateUrl: appView("initialize.html", "install"),
                    controller: "InitializeCtl"
                })
                .when("/step-4", {
                    templateUrl: appView("doInstall.html", "install"),
                    controller: "DoInstallCtl"
                })
                .otherwise({
                    redirectTo: "/step-1"
                });
        }])
        .run(["$rootScope", function($rootScope){
            var language = uriParamsGet("lang") || ones.defaultLanguage;
            $.getJSON("apps/install/i18n/"+language+".json", function(data){
                $rootScope.installLang = data.lang;
            });
        }])
        .service("ConfigureModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                getFieldsStruct: function() {
                    return {
                        dbhost: {
                            value: "127.0.0.1",
                            displayName: $rootScope.installLang.dbhost,
                            helpText: $rootScope.installLang.helpText.dbhost
                        },
                        dbname: {
                            value: "ones",
                            displayName: $rootScope.installLang.dbname
                        },
                        dbpre: {
                            value: "x_",
                            displayName: $rootScope.installLang.dbpre
                        },
                        dbuser: {
                            displayName: $rootScope.installLang.dbuser
                        },
                        dbpwd: {
                            displayName: $rootScope.installLang.dbpwd
                        }
                    };
                }
            };
        }])
        .service("InitModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                getFieldsStruct: function() {
                    return {
                        email: {
                            inputType: "email",
                            displayName: $rootScope.installLang.adminEmail
                        },
                        username: {
                            displayName: $rootScope.installLang.adminUsername,
                            value: "admin"
                        },
                        truename: {
                            displayName: $rootScope.installLang.adminTruename,
                            value: "Administrator"
                        },
                        password: {
                            displayName: $rootScope.installLang.adminPwd
                        }
                    };
                }
            };
        }])
        .controller("MainCtl", ["$scope", "$location", "$rootScope", function($scope, $location, $rootScope){

            $scope.step = 1;

            $scope.configure = {};

            $scope.$watch(function(){
                return $rootScope.installLang;
            }, function(){
            });
            $scope.$watch("step", function(newVal, oldVal){
                if(!$scope.agreed && newVal !== 1) {
                    $location.url("/");
                }
            });

            var resetAlert = function() {
                $scope.alert = {
                    type: "info",
                    msg: null
                };
            }
            resetAlert();
            $scope.selectedLanguage = uriParamsGet("lang") || ones.defaultLanguage;
            $scope.languages = [
                {
                    alias: "zh-cn",
                    name: "Simplified Chinese"
                },
                {
                    alias: "en-us",
                    name: "English"
                }
            ];

            $scope.changeLanguage = function(){
                window.location.href="install.html?lang="+$scope.selectedLanguage;
            };


            $scope.hasNext = function() {
                return $scope.step < 4;
            }
            $scope.hasPrev = function() {
                return $scope.step > 1 && $scope.step !== 4;
            }
            $scope.goNext = function() {
                if(typeof($scope.checkNext) == "function") {
                    if(false === $scope.checkNext()) {
                        return false;
                    }
                }
                resetAlert();
                $scope.step = parseInt($scope.step)+1;
                $location.url("/step-"+$scope.step);
            }
            $scope.goPrev = function() {
                $scope.step = parseInt($scope.step)-1;
                $location.url("/step-"+$scope.step);
            }

        }])
        .controller("ReadAgreementCtl", ["$scope", "$rootScope", function($scope, $rootScope){
            $scope.$parent.step = 1;
            $scope.agree = false;

            $.get("apps/install/i18n/license/"+$scope.selectedLanguage, function(data){
                $("#agreementContent").html(data);
            });

            $scope.$parent.checkNext = function(){
                if(!$scope.agree) {
                    $scope.$parent.alert.msg = $rootScope.installLang.mustAgree;
                    $scope.$parent.alert.type = "danger";
                }
                $scope.$parent.agreed = true;
                return $scope.agree;
            }
        }])
        .controller("ConfigureCtl", ["$scope", "FormMaker", "ConfigureModel", "$compile", "$rootScope",
            function($scope, FormMaker, model, $compile, $rootScope){

                $scope.$parent.step = 2;
                var fm = new FormMaker.makeForm($scope, {
                    fieldsDefine: model.getFieldsStruct(),
                    includeFoot: false
                });
                var formHTML = fm.makeHTML();
                $("#configureFormContainer").append($compile(formHTML)($scope));

                if($scope.$parent.configure.db) {
                    $scope.formData = $scope.$parent.configure.db;
                }

                $scope.$parent.checkNext = function() {
                    if(!$scope.form.$valid) {
                        $scope.$parent.alert.msg = $rootScope.installLang.fillTheForm;
                        $scope.$parent.alert.type = "danger";

                        return false;
                    }

                    $scope.$parent.configure.db = $scope.formData;

                };

            }])
        .controller("InitializeCtl", ["$scope", "FormMaker", "InitModel", "$compile", "$rootScope",
            function($scope, FormMaker, model, $compile, $rootScope){
                $scope.$parent.step = 3;
                var fm = new FormMaker.makeForm($scope, {
                    fieldsDefine: model.getFieldsStruct(),
                    includeFoot: false
                });
                var formHTML = fm.makeHTML();
                $("#initFormContainer").append($compile(formHTML)($scope));

                if($scope.$parent.configure.admin) {
                    $scope.formData = $scope.$parent.configure.admin;
                }

                $scope.$parent.checkNext = function() {
                    if(!$scope.form.$valid) {
                        $scope.$parent.alert.msg = $rootScope.installLang.fillTheForm;
                        $scope.$parent.alert.type = "danger";

                        return false;
                    }

                    $scope.$parent.configure.admin = $scope.formData;

                };

            }])
        .controller("DoInstallCtl", ["$scope", function($scope){
            $scope.$parent.step = 4;

            console.log($scope.$parent.configure);
        }])

    ;
})();