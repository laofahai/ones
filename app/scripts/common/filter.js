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
        })
        .filter("dateFormat", function(){
            return function(timestamp, format){
                var d = new Date(parseInt(timestamp)*1000);
                var year=d.getFullYear(); 
                var month=d.getMonth()+1; 
                var date=d.getDate(); 
                var hour=d.getHours(); 
                var minute=d.getMinutes(); 
                var second=d.getSeconds(); 
                return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
            };
        });
        