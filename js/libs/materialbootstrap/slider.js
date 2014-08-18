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
 * @param {string}      [options.color]         Slider color
 * @param {boolean}     [options.dark]          True : dark theme, false : light theme
 * @param {boolean}     [options.disabled]      True : slider is disable
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


    function Element(options) {
        var defaultOptions = {
                min         : 0,
                max         : 100,
                value       : 0,
                step        : 1,
                showInput   : false,
                onChange    : function (value) {},
                color       : 'indigo',
                dark        : false,
                inputName   : '',
                disabled    : false,
                range       : false,
                value1      : 0,
                value2      : 100,
                inputName1  : '',
                inputName2  : ''
            },
            opts = $.extend({}, defaultOptions, options);

        return this.each(function () {
            opts.$element = $(this);
            if (opts.range === true) {
                Range(opts);
            } else {
                Slider(opts);
            }
        });
    }

    function Slider(opts) {
        var color = opts.color;
        // controls on value
        if (!opts.value) {
            opts.value = opts.min;
        }
        opts.value = roundValue(opts.value);

        if (!materialColors[opts.color]) {
            opts.color = 'indigo';
        }
        if (opts.dark === true) {
            color += ' dark';
        }

        var $element        = opts.$element,
            $input          = $('<input type="text" value="'+ opts.value + '" name="'+ opts.inputName +'" class="text-field '+ color +'" />'),
            $icon           = $('<span class="slider-icon-addon"><i class="icon-'+ opts.icon +'"></i></span>'),
            $slider         = $('<div class="slider"><div class="slider-bar"><div class="slider-bar-colored"></div></div><div class="selector"><div class="focus"></div><div class="tooltip">'+ opts.value +'</div></div></div>'),
            $selector       = $slider.find('.selector'),
            $focus          = $selector.find('.focus'),
            $bar            = $slider.find('.slider-bar'),
            $progress       = $slider.find('.slider-bar-colored'),
            $tooltip        = $selector.find('.tooltip'),
            originalWidth   = $element.width(),
            width           = originalWidth,
            pressed         = false,
            prevX           = 0,
            left            = 0,
            decal           = 0,
            value           = opts.value,
            valueRange      = opts.max - opts.min === opts.max ? 0 : opts.max - opts.min,
            percent         = 0;

        if (opts.icon && opts.icon.length > 0) {
            width -= 59;
        }
        if (opts.showInput === true) {
            width = width - originalWidth*0.10;
            $input.css('width', originalWidth*0.10);
        }

        $element.addClass('material-slider ' + color);

        if (opts.disabled === true) {
            $element.addClass('disabled');
            $input.attr('disabled', 'disabled');
        }

        $slider.css({
            width : width
        });

        if (opts.icon && opts.icon.length > 0) {
            $element.append($icon);
        }
        $element.append($slider);
        if (opts.showInput === true) {
            $element.append($input);
        }

        $selector.css('top', (($slider.height()/2) - ($selector.height()/2) - 2) + 'px');

        // coonvert functions
        function roundValue(value) {
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
            return value;
        }
        function valueToPosition(value) {
            var min   = opts.min > 0 ? opts.min : opts.max,
                decal = ((value-opts.min)/opts.max)*(opts.max/min),
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

        // init value
        valueToPosition(opts.value);

        // events
        $selector.bind('mousedown', function () {
            pressed = true;
            prevX   = 0;
            if (opts.disabled !== true) {
                $focus.css('display', 'block');
            }
        });
        $(document).bind('mouseup', function () {
            if (pressed === true) {
                // launch event and set value and placement with step
                opts.onChange(value);
                valueToPosition(value);
            }
            pressed = false;
            $focus.css('display', 'none');
        });
        $selector.bind('mousemove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (pressed === true && opts.disabled !== true) {
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

                value = roundValue(value);
                // update input value with steps
                $input.val(value);
                $tooltip.html(value);
            }
        });
        $input.on('keyup', function () {
            value = roundValue($input.val());
            valueToPosition(value);
        });
        $input.on('change', function () {
            value = roundValue($input.val());
            valueToPosition(value);
            $input.val(value);
        });
    }

    function Range(opts) {
        opts = $.extend({}, opts, roundValues(opts.value1, opts.value2));

        var color           = opts.color,
            $element        = opts.$element,
            $inputLeft      = $('<input type="text" value="'+ opts.value1 + '" name="'+ opts.inputName1 +'" class="text-field left '+ color +'" />'),
            $inputRight     = $('<input type="text" value="'+ opts.value2 + '" name="'+ opts.inputName2 +'" class="text-field right '+ color +'" />'),
            $icon           = $('<span class="slider-icon-addon"><i class="icon-'+ opts.icon +'"></i></span>'),
            $slider         = $('<div class="slider"><div class="slider-bar"><div class="slider-bar-colored"></div></div><div class="selector left"><div class="focus"></div><div class="tooltip">'+ opts.value1 +'</div></<div></div><div class="selector right"><div class="focus"></div><div class="tooltip">'+ opts.value2 +'</div></div></div>'),
            $selector1      = $slider.find('.selector.left'),
            $selector2      = $slider.find('.selector.right'),
            $focus1         = $selector1.find('.focus'),
            $focus2         = $selector2.find('.focus'),
            $tooltip1       = $selector1.find('.tooltip'),
            $tooltip2       = $selector2.find('.tooltip'),
            $bar            = $slider.find('.slider-bar'),
            $progress       = $slider.find('.slider-bar-colored'),
            originalWidth   = $element.width(),
            width           = originalWidth,
            pressed1        = false,
            pressed2        = false,
            value1          = opts.value1,
            value2          = opts.value2,
            valueRange      = opts.max - opts.min === opts.max ? 0 : opts.max - opts.min,
            percent1        = 0,
            percent2        = 0,
            prevX1          = 0,
            prevX2          = 0,
            left1           = 0,
            left2           = 0,
            decal1          = 0,
            decal2          = 0;

        // placement
        if (opts.icon && opts.icon.length > 0) {
            width -= 59;
        }
        if (opts.showInput === true) {
            width = width - (originalWidth*0.10)*2;
            $inputLeft.css('width', originalWidth*0.10);
            $inputRight.css('width', originalWidth*0.10);
        }

        $element.addClass('material-slider range ' + color);

        if (opts.disabled === true) {
            $element.addClass('disabled');
            $input.attr('disabled', 'disabled');
        }

        $slider.css({
            width : width
        });

        if (opts.icon && opts.icon.length > 0) {
            $element.append($icon);
        }
        if (opts.showInput === true) {
            $element.append($inputLeft);
        }
        $element.append($slider);
        if (opts.showInput === true) {
            $element.append($inputRight);
        }

        $selector1.css({
            'top'               : (($slider.height()/2) - ($selector1.height()/2) - 2) + 'px',
            'border-color'      : materialColors[color],
            'background-color'  : materialColors[color]
        });
        $selector2.css({
            'top'               : (($slider.height()/2) - ($selector2.height()/2) - 2) + 'px',
            'border-color'      : materialColors[color],
            'background-color'  : materialColors[color]
        });
        valuesToPosition(opts);


        // functions
        function roundValue(value) {
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
            return value;
        }
        function roundValues(value1, value2) {
            value1 = roundValue(value1);
            value2 = roundValue(value2);

            if (value1 > value2) {
                value1 = value2 - opts.step;
            }
            if (value2 < value1) {
                value2 = value1 + opts.step;
            }
            if (value1 == value2) {
                if (value1 == opts.min) {
                    value2 = value1 + opts.step;
                } else if (value2 == opts.max) {
                    value1 = value2 - opts.step;
                }
            }

            return {
                value1 : value1,
                value2 : value2
            };
        }
        function valuesToPosition(values) {
            var min     = opts.min > 0 ? opts.min : opts.max,
                decal1  = ((values.value1-opts.min)/opts.max)*(opts.max/min),
                decal2  = ((values.value2-opts.min)/opts.max)*(opts.max/min),
                left    = ($bar.width()*decal1) + 5,
                left2   = ($bar.width()*decal2) + 5,
                right   = $bar.width() - left2;

            if (left >= $bar.width()) {
                left = left - 5;
            }
            if (left <= 5) {
                left = 0;
            }
            if (left2 >= $bar.width()) {
                left2 = left2 - 5;
            }

            $selector1.css('left', left + 'px');
            $selector2.css('left', left2 + 'px');
            $progress.css({
                left : left + 'px',
                right : ($bar.width() - left2) + 'px'
            })
        }

        $selector1.on('mousedown', function () {
            pressed1 = true;
            prevX1   = 0;
            if (opts.disabled !== true) {
                $focus1.css('display', 'block');
            }
        });
        $selector2.on('mousedown', function () {
            pressed2 = true;
            prevX2   = 0;
            if (opts.disabled !== true) {
                $focus2.css('display', 'block');
            }
        });
        $(document).bind('mouseup', function () {
            if (pressed1 === true || pressed2 === true) {
                // launch event and set value and placement with step
                opts.onChange({ value1 : value1, value2 : value2 });
                valuesToPosition({ value1 : value1, value2 : value2 });
            }
            pressed1 = false;
            pressed2 = false;
            $focus1.css('display', 'none');
            $focus2.css('display', 'none');
        });
        $selector1.bind('mousemove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (pressed1 === true && opts.disabled !== true) {
                if (prevX1 == 0) {
                    prevX1 = e.pageX;
                    left1  = +$selector1.css('left').replace('px', '');
                }
                decal1 = (e.pageX - prevX1)+left1;

                if (decal1 < 5) {
                    decal1 = opts.min;
                }
                if (decal1 > $bar.width()) {
                    decal1 = $bar.width();
                }

                var width = $progress.width() - decal1;

                $selector1.css('left', decal1);
                $progress.css('left', decal1);

                // calculate value
                percent1 = Math.round((decal1/$bar.width())*100)/100;
                value1   = opts.min + percent1*(opts.max-valueRange);

                var values = roundValues(value1, value2);
                value1 = values.value1;
                value2 = values.value2;

                // update input value with steps
                $inputLeft.val(value1);
                $tooltip1.html(value1);
            }
        });
    }

    var oldMaterialSlider = $.materialSlider;
    $.fn.materialSlider = Element;

    $.fn.materialSlider.noConflict = function () {
        $.fn.materialSlider = oldMaterialSlider;
    };
})(jQuery);