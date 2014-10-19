(function(){
    ones.installLang = {};
    angular.module("ones.install", [
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'ngAnimate',
            "ones.configModule",
            "ones.common.filters",
            "ones.commonView",
            "ones.formMaker",
            "ones.pluginsModule"
        ])
        .config(["$routeProvider", function($route){
            $route
                .when("/step-1", {
                    templateUrl: appView("readAgreement.html", "install"),
                    controller: "ReadAgreementCtl"
                })
                .when("/step-2", {
                    templateUrl: appView("permissionCheck.html", "install"),
                    controller: "PermissionCheckCtl"
                })
                .when("/step-3", {
                    templateUrl: appView("configure.html", "install"),
                    controller: "ConfigureCtl"
                })
                .when("/step-4", {
                    templateUrl: appView("initialize.html", "install"),
                    controller: "InitializeCtl"
                })
                .when("/step-5", {
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
                $rootScope.$apply(function(){
                    $rootScope.installLang = data.lang;
                });
            });
        }])
        .service("ConfigureModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                config: {
                    columns: 1
                },
                getStructure: function() {
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
                        dbport: {
                            value: 3306,
                            displayName: $rootScope.installLang.dbport
                        },
                        dbuser: {
                            displayName: $rootScope.installLang.dbuser
                        },
                        dbpwd: {
                            displayName: $rootScope.installLang.dbpwd,
                            required: false
                        }
                    };
                }
            };
        }])
        .service("InitModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                config: {
                    columns: 1
                },
                getStructure: function() {
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
                            displayName: $rootScope.installLang.adminPwd,
                            minLength: 6
                        }
                    };
                }
            };
        }])
        .controller("MainCtl", ["$scope", "$location", "$rootScope", function($scope, $location, $rootScope){


            $scope.configure = {};

            $scope.steps = [
                1,2,3,4,5
            ];

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
                return $scope.step < 5;
            }
            $scope.hasPrev = function() {
                return $scope.step > 1;
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
                resetAlert();
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
        .controller("PermissionCheckCtl", ["$scope", "$rootScope", "$http", "ones.config", function($scope, $rootScope, $http, conf){
            $scope.step = 2;
            $scope.permissions = {
                hasUnwriteable: true,
                lists: []
            };
            $http.post(conf.BSU+"install", {
                step: "checkPermission",
                installing: true
            }).success(function(data){
                $scope.permissions = data;
            });

            $scope.$parent.checkNext = function(){
                if($scope.permissions.hasUnwriteable) {
                    $scope.$parent.alert.msg = $rootScope.installLang.mustWriteable;
                    $scope.$parent.alert.type = "danger";
                    return false;
                }
            }
        }])
        .controller("ConfigureCtl", ["$scope", "ConfigureModel", "$compile", "$rootScope",
            function($scope, model, $compile, $rootScope){

                $scope.$parent.step = 3;
                $scope.formConfig = {
                    model: model,
                    opts: {
                        includeFoot: false
                    }
                };

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
        .controller("InitializeCtl", ["$scope", "InitModel", "$compile", "$rootScope",
            function($scope, model, $compile, $rootScope){
                $scope.$parent.step = 4;

                $scope.formConfig = {
                    model: model,
                    opts: {
                        includeFoot: false
                    }
                };

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
        .controller("DoInstallCtl", ["$scope", "$rootScope", "$http", "ones.config", "$sce", function($scope,$rootScope, $http, config, $sce){
            $scope.$parent.step = 5;

            $scope.installMsgs = [];
            $scope.installProgress = {
                messages: [],
                type: "info"
            }

            /**
             *
             * */
            var trustHTML = function(lang, isLang) {
                isLang = isLang === false ? false : true;
                if(isLang) {
                    return $sce.trustAsHtml($rootScope.installLang[lang]);
                } else {
                    return $sce.trustAsHtml(lang);
                }

            }
            $scope.installProgress.messages.push(trustHTML("startInstall"));

            var installSteps = {
                _query: function(step, callback) {

                    $http.post(config.BSU+"install", {
                        step: step,
                        data: $scope.$parent.configure,
                        installing: true
                    }).success(callback);
                },
                testDB: function() {
                    installSteps._query("testDB", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("testDbConnectFailed"));
                            $scope.installProgress.messages.push(trustHTML(rs.msg, false));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("testDbConnectSuccess"));
                            installSteps.importData()
                        }
                    });
                },
                importData: function() {
                    $scope.installProgress.messages.push(trustHTML("importingData"));
                    installSteps._query("importDB", function(rs){
                        if(rs.error) {
                            var msg = "SQL:"+rs.msg.replace("\n", "");
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("importFailed"));
                            $scope.installProgress.messages.push(trustHTML(msg, false));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("completeImport"));
                            installSteps.importAdmin()
                        }
                    });
                },
                importAdmin: function() {
                    $scope.installProgress.messages.push(trustHTML("configuringAdmin"));
                    installSteps._query("init", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("configureAdminFailed"));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("completeConfigureAdmin"));
                            installSteps.clearData()
                        }
                    });
                },
                clearData: function() {
                    $scope.installProgress.messages.push(trustHTML("clearInstallData"));
                    installSteps._query("clearData", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("clearInstallDataFailed"));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("installComplete"));
                        }
                    });
                }
            };

            installSteps.testDB();

            //console.log(angular.toJson($scope.$parent.configure));
        }])

    ;
})();