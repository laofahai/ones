(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.bpm.model', [])

        /*
        * 渲染BPM控件、联系线等
        * */
        .service('BPM.Renderer', [
            '$modal',
            '$timeout',
            function($modal, $timeout) {

                var self = this;
                this.widgets = {};
                this.widget_id = 0;

                this.lines = [];
                this.line_id = 0;

                /*
                * 新增控件
                * 1、控件ng-repeat
                * 2、控件属性
                *   ID
                *   element
                *   position
                *   size
                *   label
                *   action_type
                *   action
                * */
                this.add_widget = function(type, group) {
                    var widget = {
                        id: this.widget_id,
                        element: '',
                        position: {top:15, left: (get_random_int(1, 7) * 15) + 100},
                        type: type,
                        group: group,
                        action_type: 'n',
                        label: '#' + String(this.widget_id)
                    };

                    this.widgets[group].widgets.push(widget);
                    this.widget_id++;
                };

                this.add_widget_exists = function(group) {

                    var need_draw_line = [];
                    angular.forEach(group.widgets, function(widget, k) {
                        self.widget_id = self.widget_id > widget.id ? self.widget_id : widget.id;
                        if(widget.next_nodes) {
                            angular.forEach(widget.next_nodes, function(nn) {
                                need_draw_line.push({
                                    from: widget,
                                    to: nn
                                });
                            });
                        }
                        if(widget.condition_true) {
                            angular.forEach(widget.condition_true, function(nn) {
                                need_draw_line.push({
                                    from: widget,
                                    to: nn
                                });
                            });
                        }
                        if(widget.condition_false) {
                            angular.forEach(widget.condition_false, function(nn) {
                                need_draw_line.push({
                                    from: widget,
                                    to: nn
                                });
                            });
                        }
                    });
                    this.widgets[group.group.value] = group;

                    $timeout(function() {
                        angular.forEach(need_draw_line, function(item) {
                            self.draw_line(item.from, item.to, true);
                        });
                    });

                };

                // 新增人员分组
                this.add_group = function(opt) {
                    this.widgets[opt.value] = {
                        group: opt,
                        widgets: []
                    };
                };


                /*
                * 修改node配置
                * @param source = widget object
                * @param key
                * @param value
                * @param append 是否追加
                * */
                this.set_node_config = function(source, key, value, append) {

                    value = angular.copy(value);
                    delete(value.next_nodes);
                    delete(value.prev_nodes);
                    delete(value.branches);

                    angular.forEach(self.widgets[source.group].widgets, function(item, k) {
                        if(item.id === source.id) {
                            if(true === append) {
                                self.widgets[source.group].widgets[k][key] =
                                    angular.isArray(self.widgets[source.group].widgets[k][key])
                                ? self.widgets[source.group].widgets[k][key] : [];
                                self.widgets[source.group].widgets[k][key].push(value);
                            } else {
                                self.widgets[source.group].widgets[k][key] = value;
                            }
                        }
                    });
                };

                /*
                * 画线
                * @param from widget object
                * @param to widget object
                * @param unique mixed
                *
                * situation 1: to 位于 from 上方 from_point = top
                * situation 2: to 位于 from 下方 from_point = bottom
                * situation 3: to 和 from 平级但 to 位于from 左侧 from_point = left
                * situation 4: to 和 from 平级但 to 位于 from 右侧 from_point = right
                * */
                this.draw_line = function(from, to, unique) {

                    var draw_line_debug = true;

                    if(!from || !to) {
                        return;
                    }

                    draw_line_debug && console.debug('from and to widgets:', from, to);


                    var container_height = 160;
                    var to_element = $('#bpm-widget-'+to.id);
                    var from_element = $('#bpm-widget-'+from.id);

                    var to_group = this.widgets[to.group].group;
                    var from_group = this.widgets[from.group].group;

                    draw_line_debug && console.debug('exists line: ', this.lines);
                    switch(unique) {
                        // 线条唯一，删除原线条
                        case true:
                        // 线条移动，删除原线条
                        case 'moved':
                            for(var i=0; i<this.lines.length;i++) {
                                if(self.lines[i].from_widget.id == from.id && self.lines[i].to_widget.id == to.id) {
                                    self.lines.splice(i, 1);
                                }
                            }
                            break;
                        default:
                            break;
                    }

                    to_group.index = $('.bpm-role-item[data-value="'+to_group.value+'"]').index();
                    from_group.index = $('.bpm-role-item[data-value="'+from_group.value+'"]').index();

                    var to_element_position = {
                        left: to_element.position().left,
                        top : to_element.position().top + (to_group.index * container_height),
                        width: parseInt(to_element.width()),
                        height: parseInt(to_element.height())
                    };
                    var from_element_position = {
                        left: from_element.position().left,
                        top : from_element.position().top + (from_group.index * container_height),
                        width: parseInt(from_element.width()),
                        height: parseInt(from_element.height())
                    };

                    //canvas
                    var canvas = {
                        position_x: 0,
                        position_y: 0,
                        width: 0,
                        height: 0
                    };

                    // 同级
                    if(from.group == to.group) {
                        // from 位于 to 右侧， 起始点为 to 右边长中间点
                        if(from_element_position.left > to_element_position.left) {
                            canvas.start_point = 'from_left';
                            canvas.end_point = 'to_right';
                        } else {
                            canvas.start_point = 'from_right';
                            canvas.end_point = 'to_left';
                        }
                    } else {
                        // from 位于 top 下方 则 起始点为 to 下边长中间点
                        if(from_element_position.top > to_element_position.top) {
                            canvas.start_point = 'from_top';
                            canvas.end_point = 'to_bottom';
                        } else {
                            canvas.start_point = 'from_bottom';
                            canvas.end_point = 'to_top';
                        }
                    }

                    draw_line_debug && console.debug('point:', canvas.start_point, canvas.end_point);

                    /*
                    * 获得点在画布中的绝对位置
                    * top, left
                    * */
                    var get_point_position = function(point) {
                        var top = 0;
                        var left = 0;

                        var tmp = point.split('_');
                        var element = tmp[0] == 'to' ? to_element_position : from_element_position;
                        var position = tmp[1];

                        switch(position) {
                            case "top":
                                top = element.top;
                                left = element.left + element.width / 2;
                                break;
                            case "bottom":
                                top = element.top + element.height;
                                left = element.left + element.width / 2;
                                break;
                            case "left":
                                top = element.top + element.height / 2;
                                left = element.left;
                                break;
                            case "right":
                                top = element.top + element.height / 2;
                                left = element.left + element.width;
                                break;
                        }

                        return {top: top, left: left};
                    };


                    var point_start = get_point_position(canvas.start_point);
                    var point_end = get_point_position(canvas.end_point);

                    canvas.width = point_start.left - point_end.left;
                    canvas.height = point_start.top - point_end.top;
                    canvas.position_x = point_start.left;
                    canvas.position_y = point_start.top;

                    if(canvas.width > 0) {
                        canvas.position_x = point_end.left;
                    }

                    if(canvas.height > 0) {
                        canvas.position_y = point_end.top;
                    }

                    canvas.width = Math.abs(canvas.width);
                    canvas.height = Math.abs(canvas.height);
                    if(canvas.width < 15) {
                        canvas.width = 15;
                    }
                    if(canvas.height < 15) {
                        canvas.height = 15;
                    }

                    var canvas_element = document.createElement('canvas');
                    var context = canvas_element.getContext('2d');
                    this.lines.push({
                        position: canvas,
                        element: canvas_element,
                        context: context,
                        id: this.line_id,
                        from_widget: from,
                        to_widget: to
                    });
                    canvas.line_id = this.line_id;

                    $(canvas_element).attr('width', canvas.width);
                    $(canvas_element).attr('height', canvas.height);

                    // 箭头path
                    context.beginPath();
                    context.fillStyle="#000";
                    // 线条宽度
                    context.lineWidth = 2;
                    switch(canvas.start_point) {
                        case "from_bottom": // 垂直 从上到下 默认从左上起，右下止
                            canvas.line_start = {left:6, top:0};
                            canvas.line_end = {left:canvas.width-6, top:canvas.height};

                            // 从右上角起
                            if(canvas.position_x != point_start.left) {
                                canvas.line_start.left = Math.abs(canvas.width) - 6;
                            }
                            // 至左下止
                            if(canvas.position_x == point_end.left) {
                                canvas.line_end.left = 6;
                            }

                            var fix_offset = Math.abs(canvas.line_start.left-canvas.line_end.left) > 10 ? false : true;
                            if(fix_offset) {
                                canvas.line_end.left = canvas.line_start.left;
                            }

                            // 箭头
                            context.moveTo(canvas.line_end.left-6, canvas.line_end.top - 20);
                            context.lineTo(canvas.line_end.left+6, canvas.line_end.top - 20);
                            context.lineTo(canvas.line_end.left, canvas.line_end.top-10);
                            context.fill();
                            context.closePath();

                            context.beginPath();
                            context.moveTo(canvas.line_start.left, canvas.line_start.top);

                            if(!fix_offset) {
                                context.lineTo(canvas.line_start.left, canvas.line_end.top/2);
                                context.lineTo(canvas.line_end.left, canvas.line_end.top/2);
                            }
                            context.lineTo(canvas.line_end.left, canvas.line_end.top-10);

                            break;
                        case "from_top": // 垂直 从下到上 默认从左下起，右上止
                            canvas.line_start = {left: 6, top:canvas.height};
                            canvas.line_end = {left: canvas.width - 6, top:10};

                            // 右下起
                            if(canvas.position_x != point_start.left) {
                                canvas.line_start.left = Math.abs(canvas.width) - 6;
                            }
                            // 左上止
                            if(canvas.position_x == point_end.left) {
                                canvas.line_end.left = 6;
                            }

                            var fix_offset = Math.abs(canvas.line_start.left-canvas.line_end.left) > 10 ? false : true;
                            if(fix_offset) {
                                canvas.line_end.left = canvas.line_start.left;
                            }

                            // 箭头
                            context.moveTo(canvas.line_end.left-6, canvas.line_end.top + 10);
                            context.lineTo(canvas.line_end.left+6, canvas.line_end.top + 10);
                            context.lineTo(canvas.line_end.left, canvas.line_end.top);
                            context.fill();
                            context.closePath();

                            context.beginPath();
                            context.moveTo(canvas.line_start.left, canvas.line_start.top);

                            if(!fix_offset) {
                                context.lineTo(canvas.line_start.left, canvas.line_start.top/2);
                                context.lineTo(canvas.line_end.left, canvas.line_start.top/2);
                            }

                            context.lineTo(canvas.line_end.left, canvas.line_end.top-3);
                            break;
                        case "from_left": // 横向， 默认为右下起，左上止
                            canvas.line_start = {left: canvas.width,  top: canvas.height - 3};
                            canvas.line_end = {left: 10, top: 6};

                            // 右上起
                            if(canvas.position_y == point_start.top) {
                                canvas.line_start.top = 3;
                            }
                            // 左下止
                            if(canvas.position_y != point_end.top) {
                                canvas.line_end.top = canvas.height - 6;
                            }

                            var fix_offset = Math.abs(canvas.line_start.top-canvas.line_end.top) > 10 ? false : true;
                            if(fix_offset) {
                                canvas.line_end.top = canvas.line_start.top;
                            }

                            // 箭头
                            context.moveTo(canvas.line_end.left + 10, canvas.line_end.top-6);
                            context.lineTo(canvas.line_end.left + 10, canvas.line_end.top+6);
                            context.lineTo(canvas.line_end.left, canvas.line_end.top);
                            context.fill();
                            context.closePath();

                            context.beginPath();
                            context.moveTo(canvas.line_start.left, canvas.line_start.top);

                            if(!fix_offset) {
                                context.lineTo(canvas.line_start.left/2, canvas.line_start.top);
                                context.lineTo(canvas.line_start.left/2, canvas.line_end.top);
                            }

                            context.lineTo(canvas.line_end.left, canvas.line_end.top);
                            break;
                        case "from_right": // 横向， 默认为左上起，右下止
                            canvas.line_start = {left: 0,  top: 3};
                            canvas.line_end = {left: canvas.width, top: canvas.height - 6};

                            // 左下起
                            if(canvas.position_y != point_start.top) {
                                canvas.line_start.top = canvas.height - 6;
                            }
                            // 右上止
                            if(canvas.position_y == point_end.top) {
                                canvas.line_end.top = 6;
                            }

                            var fix_offset = Math.abs(canvas.line_start.top-canvas.line_end.top) > 10 ? false : true;
                            if(fix_offset) {
                                canvas.line_end.top = canvas.line_start.top;
                            }

                            // 箭头
                            context.moveTo(canvas.line_end.left - 10, canvas.line_end.top-6);
                            context.lineTo(canvas.line_end.left - 10, canvas.line_end.top+6);
                            context.lineTo(canvas.line_end.left, canvas.line_end.top);
                            context.fill();
                            context.closePath();

                            context.beginPath();
                            context.moveTo(canvas.line_start.left, canvas.line_start.top);

                            if(!fix_offset) {
                                context.lineTo(canvas.line_end.left/2, canvas.line_start.top);
                                context.lineTo(canvas.line_end.left/2, canvas.line_end.top);
                            }

                            context.lineTo(canvas.line_end.left, canvas.line_end.top);
                            break;
                    }

                    context.stroke();


                    $timeout(function() {
                        $('#bpm-line-'+ canvas.line_id).append(canvas_element);
                    });

                    self.line_id++;
                }

            }
        ])

        // 控件directive
        .directive('bpmWidget', [
            'BPM.Renderer',
            '$timeout',
            function(render, $timeout) {
                return {
                    link: function(scope, element, attrs) {
                        $timeout(function() {
                            $(element).draggable({
                                containment: "parent",
                                start: function(event) {
                                    // 更新活动状态
                                    $(event.target).data('widget-id');
                                },
                                stop: function(event, ui) {
                                    scope.$emit('bpm.widget_moved', $(event.target));
                                }
                            });
                            $(element).resizable({
                                containment: "parent",
                                handles: "ne, nw, se, sw",
                                autoHide: true,
                                stop: function(event, ui) {
                                    var target = $(event.target);
                                    target.after_width = target.width();
                                    target.after_height = target.height();
                                    scope.$emit('bpm.widget_moved', target);
                                }
                            });

                        });

                    }
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);