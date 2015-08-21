angular.module('ones.servicesModule', [])
    .service('Home.SchemaAPI', [
        'ones.dataApiFactory',
        function(dataAPI) {
            this.config = {};
            this.resource = dataAPI.getResourceInstance({
                uri: "home/schema",
                extra_methods: ['api_query', 'api_get']
            });

            this.get_schema = function(opts) {
                var queryParams = {
                    app: opts.app,
                    table: opts.table
                };
                var schema = this.resource.api_get(queryParams).$promise;

                if(typeof opts.callback === "function") {
                    ones.DEBUG && console.debug('loading schema');
                    return schema.then(opts.callback);
                }

                return schema;
            };

        }
    ])

    .service('Home.NavAPI', [
        'ones.dataApiFactory',
        function(dataAPI) {
            this.config = {};
            this.resource = dataAPI.getResourceInstance({
                uri: "home/nav",
                extra_methods: ['api_query', 'api_get']
            });
        }
    ])

;