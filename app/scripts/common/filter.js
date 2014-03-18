'use strict';

angular.module("erp.common.filters", [])
        .filter("sprintf", function(){
            var filterFun = function(fmt, argv, _argv){
                return sprintf(fmt, argv, _argv);
            };
            
            return filterFun;
            
//            var filterfun = function(person, sep) {
//                sep = sep || " ";
//                person = person || {};
//                person.first = person.first || "";
//                person.last = person.last || "";
//                return person.first + sep + person.last;
//            };
//            return filterfun;
        });
        