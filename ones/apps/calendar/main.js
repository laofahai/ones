(function(window, angular, ones) {

    // 桌面块
    ones.pluginRegister('dashboard_widgets', function(injector, defered) {
        ones.pluginScope.append('dashboard_widgets', {
            alias: 'calendar',
            title: _('calendar.Calendar'),
            template: appView('dashboard_block.html', 'calendar'),
            sizeX: 5,
            sizeY: 4,
            auth_node: 'calendar.events.get'
        });
    });

    //ones.global_module
    angular.module('ones.app.calendar.main', [
        'mwl.calendar'
    ])
        .config([
            '$routeProvider',
            'calendarConfigProvider',
            function($route, calendarConfig) {
                $route.when('/calendar/events', {
                    controller: "CalendarEventsCtrl",
                    templateUrl: appView('calendar.html')
                });

                calendarConfig.setDateFormatter('moment');
            }
        ])

    ;
    ones.global_module
        .service('Calendar.EventsAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'calendar/events',
                    extra_methods:['api_get', 'api_query']
                });

                var default_start = new Date(moment().format());

                var default_end = new Date(moment().add(2, 'hours').format());

                this.config = {
                    app: 'calendar',
                    module: 'events',
                    table: 'events',

                    fields: {
                        start_at: {
                            value: default_start,
                            widget: 'datetime'
                        },
                        end_at: {
                            value: default_end,
                            widget: 'datetime'
                        },
                        company: {
                            addable: false,
                            editable: false
                        },
                        type: {
                            widget: 'select',
                            data_source: [
                                {value: 'info', label:_('calendar.EVENTS_TYPE.Info')},
                                {value: 'important', label:_('calendar.EVENTS_TYPE.Important')},
                                {value: 'warning', label:_('calendar.EVENTS_TYPE.Warning')},
                                {value: 'inverse', label:_('calendar.EVENTS_TYPE.Inverse')},
                                {value: 'success', label:_('calendar.EVENTS_TYPE.Success')},
                                {value: 'special', label:_('calendar.EVENTS_TYPE.Special')}
                            ],
                            value: 'info'
                        },
                        recurs_on: {
                            widget: 'select',
                            data_source: [
                                {value: 'null', label: _('calendar.No Repeat')},
                                {value: 'year', label: _('calendar.Every Year')},
                                {value: 'month', label: _('calendar.Every Month')},
                                {value: 'week', label: _('calendar.Every Week')},
                                {value: 'day', label: _('calendar.Every Day')}
                            ],
                            value: 'null'
                        },
                        user_info_id: {
                            addable: false,
                            editable: false
                        },
                        related_model: {
                            addable: false,
                            editable: false
                        },
                        related_id: {
                            addable: false,
                            editable: false
                        }
                    }
                };
            }
        ])
        .controller('CalendarEventsCtrl', [
            '$scope',
            'Calendar.EventsAPI',
            '$modal',
            'RootFrameService',
            '$location',
            function($scope, eventsAPI, $modal, RootFrameService, $location){

                $scope.calendarDay = new Date();

                $scope.calendarViewOptions = [
                    {label: _('calendar.Year'), value: 'year'},
                    {label: _('calendar.Month'), value: 'month'},
                    {label: _('calendar.Week'), value: 'week'},
                    {label: _('calendar.Day'), value: 'day'}
                ];

                $scope.calendarView = $scope.calendarViewOptions[1].value;

                $scope.setCalendarView = function(item) {
                    $scope.calendarView = item.value;
                };

                $scope.$watch('calendarView', function(view_by) {
                    for(var i=0;i<$scope.calendarViewOptions.length;i++) {
                        if($scope.calendarViewOptions[i].value == view_by) {
                            $scope.calendarViewLabel = $scope.calendarViewOptions[i].label;
                            break;
                        }
                    }
                });

                var incrementsBadgeTotal = false;
                if($location.url() === '/calendar/events') {
                    $scope.show_refresh_btn = true;
                    incrementsBadgeTotal = true;
                }

                var query_data = function() {
                    $scope.events = [];
                    eventsAPI.resource.query().$promise.then(function(data) {
                        angular.forEach(data, function(item) {
                            angular.extend(item, {
                                title: item.subject,
                                type: item.type||'info',
                                startsAt: new Date(item.start_at),
                                endsAt: new Date(item.end_at),
                                incrementsBadgeTotal: incrementsBadgeTotal
                            });
                            item.recursOn = (item.recurs_on && item.recurs_on !== 'null') ? item.recurs_on : undefined;
                            $scope.events.push(item);
                        });

                    });

                };

                query_data();

                $scope.add_frame = {
                    src: 'calendar/events/add',
                    icon: 'calendar',
                    label: _('common.Add New')+' '+_('calendar.Events')
                };

                // watch calendarView, calendarDay
                $scope.eventClicked = function(event) {
                    $scope.current_event = event;
                    $modal(
                        {
                            title: _('calendar.View Event Content'),
                            contentTemplate: appView('event_detail.html', 'calendar'),
                            show: true,
                            scope: $scope
                        }
                    );
                };

                $scope.eventEdited = function(event) {
                    RootFrameService.open_frame({
                        label: _('common.Edit')+' '+_('calendar.Events'),
                        src: 'calendar/events/edit/'+event.id,
                        icon: 'calendar'
                    });
                };

                $scope.eventDeleted = function(event) {
                    RootFrameService.confirm(_("common.Confirm delete the %s items?", 1), function() {
                        eventsAPI.resource.delete({id: event.id}).$promise.then(function() {
                            query_data();
                        })
                    });
                };

                //$scope.eventDropped = function(event) {
                //    console.log(event);
                //};

                $scope.toggle = function($event, field, event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    event[field] = !event[field];
                };

            }
        ])
    ;
})(window, window.angular, window.ones);