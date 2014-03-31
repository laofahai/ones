'use strict';

angular.module("erp.passport.services", [])
        .factory("UserModel", ["DepartmentRes", "$q", "$rootScope", function(DepartmentRes, $q, $rootScope){
            
            var service = {
                getFieldsStruct: function() {
                    var defered = $q.defer();
                    var fieldsStruct = {
                        id: {
                            primary: true
                        },
                        email: {
                            inputType: "email"
                        },
                        department_id: {
                            displayName: $rootScope.i18n.lang.department,
                            inputType: "select"
                        }
                    };
                    
                    DepartmentRes.query().$promise.then(function(data){
                        fieldsStruct.department_id.dataSource = data;
                        defered.resolve(fieldsStruct);
                    }, function(){
                        defered.reject();
                    });
                    
                    return defered.promise;
                }
            };
    
            return service;
        }])