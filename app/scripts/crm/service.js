'use strict';

angular.module("ones.crm.services", [])
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