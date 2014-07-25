(function(){
    angular.module("ones.crm", ["ones.department"])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when("/crm/addBill/relationshipCompany", {
                templateUrl: appView("edit.html", "crm"),
                controller: "CRMRelCompanyEditCtl"
            })
            ;
        }])
        .factory("RelationshipCompanyGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompanyGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("RelationshipCompanyRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompany/:id.json", null, {'update': {method: 'PUT'}});
        }])

        .factory("RelationshipCompanyGroupModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        discount: {
                            inputType: "number",
                            max: 100,
                            min: 1,
                            value: 100
                        }
                    };
                }
            };
        }])
        .factory("RelationshipCompanyModel", ["$rootScope", "RelationshipCompanyGroupRes", function($rootScope, RelationshipCompanyGroupRes){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        group_id: {
                            field: "Group.name",
                            dataSource: RelationshipCompanyGroupRes,
                            inputType: "select",
                            displayName: $rootScope.i18n.lang.group
                        },
                        discount: {
                            inputType: "number",
                            max: 100,
                            value: 100
                        },
                        owner: {
                            hideInForm: true,
                            field: "User.truename"
                        },
                        linkMan: {
                            field: "Linkman[0].contact"
                        },
                        mobile: {
                            field: "Linkman[0].mobile"
                        },
                        telephone: {
                            field: "Linkman[0].tel",
                            required: false
                        },
                        qq: {
                            field: "Linkman[0].qq",
                            required: false,
                            listable: false
                        },
                        address: {
                            required: false
                        }
                    };
                }
            };
        }])

        .controller("CRMRelCompanyEditCtl", ["$scope", "ComView", function($scope, ComView){

        }])
    ;
})();