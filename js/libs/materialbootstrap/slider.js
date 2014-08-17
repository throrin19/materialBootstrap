/**
 * Material Slider
 *
 * $.materialSlider(options)
 *
 * @param {object}      options                 Slider Options
 * @param {number}      options.min             Minimum value of Slider
 * @param {number}      options.max             Maximum value of Slider
 * @param {number}      options.step            Slider Step for selectors
 * @param {boolean}     options.showInput       Add input to set manually the cursor value
 * @param {function}    options.onChange        Called on input or selector change
 * @param {string}      options.inputName       Input Name to get value in form data
 * @param {string}      [options.icon]          Icon for Slider (without icon-)
 * @param {string}      [options.label]         Slider Label
 * @param {string}      [options.color]         Slider color
 * @param {boolean}     [options.dark]          True : dark theme, false : light theme
 */
(function ($){
    var materialColors = {
        red : '#e51c23',
        pink : '#e91e63',
        purple : '#9c27b0',
        dpurple : '#673ab7',
        indigo : '#3f51b5',
        blue : '#5677fc',
        lblue : '#03a9f4',
        cyan : '#00bcd4',
        teal : '#009688',
        green : '#259b24',
        lgreen : '#8bc34a',
        lime : '#cddc39',
        yellow : '#ffeb3b',
        amber : '#ffc107',
        orange : '#ff9800',
        dorange : '#ff5722',
        brown : '#795548',
        grey : '#9e9e9e',
        bgrey : '#607d8b'
    };

    function Slider(options) {
        var defaultOptions = {
                min         : 0,
                max         : 100,
                value       : 0,
                step        : 1,
                showInput   : false,
                onChange    : function (value) {},
                color       : 'indigo',
                dark        : false,
                inputName   : ''
            },
            opts = $.extend({}, defaultOptions, options);

        // controls on value
        if (!opts.value) {
            opts.value = opts.min;
        }
        if (opts.value < opts.min) {
            opts.value = opts.min;
        }
        if (opts.value > opts.max) {
            opts.value = opts.max;
        }
        if (opts.value%opts.step !== 0) {
            if (opts.value > 0) {
                opts.value = Math.ceil(opts.value/opts.step) * opts.step;
            } else if(opts.value < 0) {
                opts.value = Math.floor(opts.value/opts.step) * opts.step;
            }
        }
        if (!materialColors[opts.color]) {
            opts.color = 'indigo';
        }
        if (opts.dark === true) {
            opts.color += ' dark';
        }

        return this.each(function () {
            var $element        = $(this),
                $input          = $('<input type="text" value="'+ opts.value + '" name="'+ opts.inputName +'" class="text-field '+ opts.color +'" />'),
                $icon           = $('<span class="slider-icon-addon"><i class="icon-'+ opts.icon +'"></i></span>'),
                $label          = $('<label class="slider-label" for="'+ opts.inputName + '">'+ opts.label +'</label>'),
                $slider         = $('<div class="slider"><div class="slider-bar"><div class="slider-bar-colored"></div></div><div class="selector"><div class="focus"></div></div></div>'),
                $selector       = $slider.find('.selector'),
                $focus          = $selector.find('.focus'),
                $bar            = $slider.find('.slider-bar'),
                $progress       = $slider.find('.slider-bar-colored'),
                originalWidth   = $element.width(),
                width           = originalWidth,
                pressed         = false,
                prevX           = 0,
                left            = 0,
                decal           = 0,
                value           = opts.value,
                valueRange      = opts.max - opts.min,
                percent         = 0; // @todo change that

            if (opts.icon && opts.icon.length > 0) {
                width -= 59;
            }
            if (opts.showInput === true) {
                width = width - originalWidth*0.10;
                $input.css('width', originalWidth*0.10);
            }

            $element.addClass('material-slider ' + opts.color);

            $slider.css({
                width : width
            });

            if (opts.label && opts.label.length > 0) {
                $element.append($label);
            }
            if (opts.icon && opts.icon.length > 0) {
                $element.append($icon);
            }
            $element.append($slider);
            if (opts.showInput === true) {
                $element.append($input);
            }

            // events
            $selector.bind('mousedown', function () {
                pressed = true;
                prevX   = 0;
                $focus.css('display', 'block');
            });
            $(document).bind('mouseup', function () {
                if (pressed === true) {
                    // launch event and set value and placement with step
                    opts.onChange(value);
                    var decal = ((value-opts.min)/opts.max)*(opts.max/opts.min),
                        left  = ($bar.width()*decal) + 5;

                    if (left >= $bar.width()) {
                        left = left - 5;
                    }

                    $progress.css('width',(decal*100)+'%');
                    $selector.css('left', left + 'px');

                    if (left > 5) {
                        $selector.css({
                            'border-color' : materialColors[opts.color],
                            'background-color' : materialColors[opts.color]
                        });
                    } else {
                        $selector.css({
                            'border-color' : '',
                            'background-color' : ''
                        });
                    }
                }
                pressed = false;
                $focus.css('display', 'none');
            });
            $selector.bind('mousemove', function (e) {
                if (pressed === true) {
                    if (prevX == 0) {
                        prevX = e.pageX;
                        left  = +$selector.css('left').replace('px', '');
                    }
                    decal = (e.pageX - prevX)+left;

                    if (decal < 5) {
                        decal = opts.min;
                    }
                    if (decal > $bar.width()) {
                        decal = $bar.width();
                    }

                    $selector.css('left', decal);
                    $progress.css('width', decal);

                    // calculate value
                    percent = Math.round(($progress.width()/$bar.width())*100)/100;
                    value   = opts.min + percent*(opts.max-valueRange);

                    if (value > 0) {
                        value = Math.floor(value);
                    } else if (value < 0) {
                        value = Math.ceil(value);
                    }

                    if (value < opts.min) {
                        value = opts.min;
                    }
                    if (value > opts.max) {
                        value = opts.max;
                    }
                    if (value%opts.step !== 0) {
                        if (value > 0) {
                            value = Math.floor(value/opts.step) * opts.step;
                        } else if(value < 0) {
                            value = Math.ceil(value/opts.step) * opts.step;
                        }
                    }
                    // update input value with steps
                    $input.val(value);
                }
            });
        });
    }

    var oldMaterialSlider = $.materialSlider;
    $.fn.materialSlider = Slider;

    $.fn.materialSlider.noConflict = function () {
        $.fn.materialSlider = oldMaterialSlider;
    };
})(jQuery);