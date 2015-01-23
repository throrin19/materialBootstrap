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
    'use strict';

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
                onChange    : function () {},
                onSlide     : function () {},
                color       : 'indigo',
                dark        : false,
                inputName   : '',
                disabled    : false,
                type        : 'normal',
                value1      : 0,
                value2      : 100,
                inputName1  : '',
                inputName2  : ''
            },
            opts = $.extend({}, defaultOptions, options);

        return this.each(function () {
            opts.$element = $(this);
            if (opts.type === 'range') {
                var range = new Range();
                range.init(opts);
            } else if (opts.type === 'selector') {
                var selector = new Selector();
                selector.init(opts);
            } else {
                var slider = new Slider();
                slider.init(opts);
            }
        });
    }

    // all common functions, elements
    var common = {
        roundValue : function roundValue(value, opts) {
            value = Math.round(value);

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
        },
        tooltip : function tooltip($tooltip, $selector) {
            var left = ($selector.width() - $tooltip.width())/2 -3;
            $tooltip.css({
                left : left + 'px'
            });
        }
    };

    var Slider = function () {};
    Slider.prototype.init = function init(opts) {
        var color = opts.color;
        // controls on value
        if (!opts.value) {
            opts.value = opts.min;
        }
        opts.value = common.roundValue(opts.value, opts);

        if (!materialColors[opts.color]) {
            opts.color = 'indigo';
        }
        if (opts.dark === true) {
            color += ' dark';
        }

        this.$element        = opts.$element;
        this.$input          = $('<input type="text" value="'+ opts.value + '" name="'+ opts.inputName +'" class="text-field '+ color +'" />');
        this.$icon           = $('<span class="slider-icon-addon"><i class="'+ opts.icon +'"></i></span>');
        this.$slider         = $('<div class="slider"><div class="slider-bar"><div class="slider-bar-colored"></div></div><div class="selector"><div class="focus"></div><div class="tooltip">'+ opts.value +'</div></div></div>');
        this.$selector       = this.$slider.find('.selector');
        this.$focus          = this.$selector.find('.focus');
        this.$bar            = this.$slider.find('.slider-bar');
        this.$progress       = this.$slider.find('.slider-bar-colored');
        this.$tooltip        = this.$selector.find('.tooltip');
        this.pressed         = false;
        this.prevX           = 0;
        this.left            = 0;
        this.decal           = 0;
        this.visible         = this.$element.is(':visible');
        this.value           = opts.value;
        this.valueRange      = opts.max - opts.min === opts.max ? 0 : opts.max - opts.min;
        this.percent         = 0;
        this.opts            = opts;
        this.color           = color;

        this.create();
        this.events();
    };
    Slider.prototype.create = function create() {
        this.$element.addClass('material-slider ' + this.color);

        if (this.opts.disabled === true) {
            this.$element.addClass('disabled');
            this.$input.attr('disabled', 'disabled');
        }

        if (this.opts.icon && this.opts.icon.length > 0) {
            this.$element.append(this.$icon);
        }
        this.$element.append(this.$slider);
        if (this.opts.showInput === true) {
            this.$element.append(this.$input);
        }

        common.tooltip(this.$tooltip, this.$selector);
        this.resizeSlider();
        // init value
        this.valueToPosition(this.opts.value);
    };
    Slider.prototype.events = function events() {
        this.$selector.bind('mousedown', function () {
            this.mouseDown();
        }.bind(this));
        $(document).bind('mousemove', function (e) {
            this.mouseMove(e);
        }.bind(this));
        this.$input.on('keyup', function () {
            this.value = common.roundValue(this.$input.val(), this.opts);
            this.valueToPosition(this.value);
        }.bind(this));
        this.$input.on('change', function () {
            this.value = common.roundValue(this.$input.val(), this.opts);
            this.valueToPosition(this.value);
            this.$input.val(this.value);
            this.opts.onChange(this.value);
        }.bind(this));
        $(window).resize(function () {
            this.resizeSlider();
        }.bind(this));
        setInterval(function () {
            var nextVisible = this.$element.is(':visible');
            if (this.visible !== nextVisible && this.visible === false) {
                this.visible = true;
                this.resizeSlider();
            }
        }.bind(this), 500);
    };
    Slider.prototype.valueToPosition = function valueToPosition(value) {
        var min   = this.opts.min > 0 ? this.opts.min : this.opts.max,
            decal = ((value-this.opts.min)/this.opts.max)*(this.opts.max/min),
            left  = (this.$bar.width()*decal) + 5;

        if (left >= this.$bar.width()) {
            left = left - 5;
        }

        this.$progress.css('width',(decal*100)+'%');
        this.$selector.css('left', left + 'px');

        if (left > 5) {
            this.$selector.css({
                'border-color' : materialColors[this.opts.color],
                'background-color' : materialColors[this.opts.color]
            });
        } else {
            this.$selector.css({
                'border-color' : '',
                'background-color' : ''
            });
        }
        this.$tooltip.html(value);
        common.tooltip(this.$tooltip, this.$selector);
        this.value = value;
    };
    Slider.prototype.resizeSlider = function resizeSlider() {
        var originalWidth   = this.$element.width(),
            width           = originalWidth;

        if (this.opts.icon && this.opts.icon.length > 0) {
            width -= 59;
        }
        if (this.opts.showInput === true) {
            width = width - 55;
            this.$input.css('width', 55);
        }
        this.$slider.css({
            width : width
        });
        this.$selector.css('top', (this.$bar.position().top - 5) + 'px');

        this.valueToPosition(this.value);
    };
    Slider.prototype.mouseDown = function mouseDown() {
        this.pressed = true;
        this.prevX   = 0;
        if (this.opts.disabled !== true) {
            this.$focus.css('display', 'block');
        }
        $(document).one('mouseup', function () {
            if (this.pressed === true) {
                // launch event and set value and placement with step
                this.opts.onChange(this.value);
                this.valueToPosition(this.value);
            }
            this.pressed = false;
            this.$focus.css('display', 'none');
        }.bind(this));
    };
    Slider.prototype.mouseMove = function mouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.pressed === true && this.opts.disabled !== true) {
            if (this.prevX == 0) {
                this.prevX = e.pageX;
                this.left  = +this.$selector.css('left').replace('px', '');
            }
            this.decal = (e.pageX - this.prevX)+this.left;

            if (this.decal < 5) {
                this.decal = this.opts.min;
            }
            if (this.decal > this.$bar.width()) {
                this.decal = this.$bar.width();
            }

            this.$selector.css('left', this.decal);
            this.$progress.css('width', this.decal);

            // calculate value
            this.percent = Math.round((this.$progress.width()/this.$bar.width())*100)/100;
            this.value   = this.opts.min + this.percent*(this.opts.max-this.valueRange);

            this.value = common.roundValue(this.value, this.opts);
            // update input value with steps
            this.$input.val(this.value);
            this.$tooltip.html(this.value);
            common.tooltip(this.$tooltip, this.$selector);
            this.opts.onSlide(this.value);
        }
    };

    var Range = function () {};
    Range.prototype.init = function init(opts) {
        opts = $.extend({}, opts, this.roundValues(opts.value1, opts.value2, opts));

        if (!materialColors[opts.color]) {
            this.color = 'indigo';
        } else {
            this.color = opts.color;
        }

        this.opts            = opts;
        this.color           = opts.color;
        this.$element        = opts.$element;
        this.$inputLeft      = $('<input type="text" value="'+ opts.value1 + '" name="'+ opts.inputName1 +'" class="text-field left '+ this.color +'" />');
        this.$inputRight     = $('<input type="text" value="'+ opts.value2 + '" name="'+ opts.inputName2 +'" class="text-field right '+ this.color +'" />');
        this.$icon           = $('<span class="slider-icon-addon"><i class="'+ opts.icon +'"></i></span>');
        this.$slider         = $('<div class="slider"><div class="slider-bar"><div class="slider-bar-colored"></div></div><div class="selector left"><div class="focus"></div><div class="tooltip">'+ opts.value1 +'</div></<div></div><div class="selector right"><div class="focus"></div><div class="tooltip">'+ opts.value2 +'</div></div></div>');
        this.$selector1      = this.$slider.find('.selector.left');
        this.$selector2      = this.$slider.find('.selector.right');
        this.$focus1         = this.$selector1.find('.focus');
        this.$focus2         = this.$selector2.find('.focus');
        this.$tooltip1       = this.$selector1.find('.tooltip');
        this.$tooltip2       = this.$selector2.find('.tooltip');
        this.$bar            = this.$slider.find('.slider-bar');
        this.$progress       = this.$slider.find('.slider-bar-colored');
        this.pressed1        = false;
        this.pressed2        = false;
        this.value1          = opts.value1;
        this.value2          = opts.value2;
        this.visible         = false;
        this.valueRange      = opts.max - opts.min === opts.max ? 0 : opts.max - opts.min;
        this.percent1        = 0;
        this.percent2        = 0;
        this.prevX1          = 0;
        this.prevX2          = 0;
        this.left1           = 0;
        this.left2           = 0;
        this.decal1          = 0;
        this.decal2          = 0;

        this.create();
        this.events();
    };
    Range.prototype.create = function create() {
        if (this.opts.icon && this.opts.icon.length > 0) {
            this.$element.append(this.$icon);
        }
        if (this.opts.showInput === true) {
            this.$element.append(this.$inputLeft);
        }
        this.$element.append(this.$slider);
        if (this.opts.showInput === true) {
            this.$element.append(this.$inputRight);
        }

        this.resizeSlider();
        common.tooltip(this.$tooltip1, this.$selector1);
        common.tooltip(this.$tooltip2, this.$selector2);
        // init value
        this.valuesToPosition(this.opts);
    };
    Range.prototype.events = function events() {
        this.$selector1.on('mousedown', function () {
            this.mouseDown(1);
        }.bind(this));
        this.$selector2.on('mousedown', function () {
            this.mouseDown(2);
        }.bind(this));
        $(document).bind('mousemove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.mouseMoveLeft(e);
            this.mouseMoveRight(e);
        }.bind(this));
        this.$inputLeft.on('keyup', function () {
            var values = this.roundValues(+this.$inputLeft.val(),this.value2, this.opts);
            this.valuesToPosition(values);
        }.bind(this));
        this.$inputLeft.on('change', function () {
            var values = this.roundValues(+this.$inputLeft.val(),this.value2, this.opts);
            this.valuesToPosition(values);
            this.value1 = values.value1;
            this.value2 = values.value2;
            this.$inputLeft.val(values.value1);
            this.$inputRight.val(values.value2);
            this.opts.onChange({ value1 : values.value1, value2 : values.value2 });
        }.bind(this));
        this.$inputRight.on('keyup', function () {
            var values = this.roundValues(this.value1, +this.$inputRight.val(), this.opts);
            this.valuesToPosition(values);
        }.bind(this));
        this.$inputRight.on('change', function () {
            var values = this.roundValues(this.value1, +this.$inputRight.val(), this.opts);
            this.valuesToPosition(values);
            this.value1 = values.value1;
            this.value2 = values.value2;
            this.$inputLeft.val(values.value1);
            this.$inputRight.val(values.value2);
            this.opts.onChange({ value1 : values.value1, value2 : values.value2 });
        }.bind(this));
        $(window).resize(function () {
            this.resizeSlider();
        }.bind(this));
        setInterval(function () {
            var nextVisible = this.$element.is(':visible');
            if (this.visible !== nextVisible && this.visible === false) {
                this.visible = true;
                this.resizeSlider();
            }
        }.bind(this), 500);
    };
    Range.prototype.onMouseUp = function onMouseUp() {
        if (this.pressed1 === true || this.pressed2 === true) {
            // launch event and set value and placement with step
            this.opts.onChange({ value1 : this.value1, value2 : this.value2 });
            this.valuesToPosition({ value1 : this.value1, value2 : this.value2 });
        }
        this.pressed1 = false;
        this.pressed2 = false;
        this.$focus1.css('display', 'none');
        this.$focus2.css('display', 'none');
    };
    Range.prototype.valuesToPosition = function valuesToPosition(values) {
        var min     = this.opts.min > 0 ? this.opts.min : this.opts.max,
            decal1  = ((values.value1-this.opts.min)/this.opts.max)*(this.opts.max/min),
            decal2  = ((values.value2-this.opts.min)/this.opts.max)*(this.opts.max/min),
            left    = (this.$bar.width()*decal1) + 5,
            left2   = (this.$bar.width()*decal2) + 5,
            right   = this.$bar.width() - left2;

        if (left >= this.$bar.width()) {
            left = left - 5;
        }
        if (left <= 5) {
            left = 0;
        }
        if (left2 >= this.$bar.width()) {
            left2 = left2 - 5;
        }

        this.$selector1.css('left', left + 'px');
        this.$selector2.css('left', left2 + 'px');
        this.$progress.css({
            left : left + 'px',
            right : right + 'px'
        });
        this.$tooltip1.html(values.value1);
        this.$tooltip2.html(values.value2);
        this.value1 = values.value1;
        this.value2 = values.value2;
    };
    Range.prototype.roundValues = function roundValues(value1, value2, opts) {
        value1 = common.roundValue(value1, opts);
        value2 = common.roundValue(value2, opts);

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
    };
    Range.prototype.resizeSlider = function resizeSlider() {
        var originalWidth   = this.$element.width(),
            width           = originalWidth;

        // placement
        if (this.opts.icon && this.opts.icon.length > 0) {
            width -= 59;
        }
        if (this.opts.showInput === true) {
            width = width - 110;
            this.$inputLeft.css('width', 55);
            this.$inputRight.css('width', 55);
        }

        this.$element.addClass('material-slider range ' + this.color);

        if (this.opts.disabled === true) {
            this.$element.addClass('disabled');
            this.$inputLeft.attr('disabled', 'disabled');
            this.$inputRight.attr('disabled', 'disabled');
        }

        this.$slider.css({
            width : width
        });

        this.$selector1.css({
            'top'               : (this.$bar.position().top - 5) + 'px',
            'border-color'      : materialColors[this.color],
            'background-color'  : materialColors[this.color]
        });
        this.$selector2.css({
            'top'               : (this.$bar.position().top - 5) + 'px',
            'border-color'      : materialColors[this.color],
            'background-color'  : materialColors[this.color]
        });

        this.valuesToPosition(this.opts);
    };
    Range.prototype.mouseDown = function mouseDown(i) {
        this['pressed'+i] = true;
        this['prevX'+i]   = 0;
        if (this.opts.disabled !== true) {
            this['$focus' +i].css('display', 'block');
        }
        $(document).one('mouseup', function () {
            this.onMouseUp();
        }.bind(this));
    };
    Range.prototype.mouseMoveLeft = function mouseMoveLeft(e) {
        if (this.pressed1 === true && this.opts.disabled !== true) {
            if (this.prevX1 == 0) {
                this.prevX1 = e.pageX;
                this.left1  = +this.$selector1.css('left').replace('px', '');
            }
            this.decal1 = (e.pageX - this.prevX1)+this.left1;

            if (this.decal1 < 5) {
                this.decal1 = this.opts.min;
            }
            if (this.decal1 > this.$bar.width()) {
                this.decal1 = this.$bar.width();
            }

            // calculate value
            this.percent1 = Math.round((this.decal1/this.$bar.width())*100)/100;
            this.value1   = this.opts.min + this.percent1*(this.opts.max-this.valueRange);

            if (this.value1 < this.value2 - this.opts.step) {
                this.$selector1.css('left', this.decal1);
                this.$progress.css('left', this.decal1);

                var values = this.roundValues(this.value1, this.value2, this.opts);
                this.value1 = values.value1;
                this.value2 = values.value2;

                // update input value with steps
                this.$inputLeft.val(this.value1);
                this.$tooltip1.html(this.value1);
                common.tooltip(this.$tooltip1, this.$selector1);
                this.opts.onSlide({ value1 : this.value1, value2 : this.value2 });
            }
        }
    };
    Range.prototype.mouseMoveRight = function mouseMoveRight(e) {
        if (this.pressed2 === true && this.opts.disabled !== true) {
            if (this.prevX2 == 0) {
                this.prevX2 = e.pageX;
                this.left2  = +this.$selector2.css('left').replace('px', '');
            }
            this.decal2 = (e.pageX - this.prevX2)+this.left2;

            if (this.decal2 < 5) {
                this.decal2 = this.opts.min + this.opts.step;
            }
            if (this.decal2 > this.$bar.width()) {
                this.decal2 = this.$bar.width();
            }

            // calculate value
            this.percent2 = Math.round((this.decal2/this.$bar.width())*100)/100;
            this.value2   = this.opts.min + this.percent2*(this.opts.max-this.valueRange);

            if (this.value2 > this.value1 + this.opts.step) {
                this.$selector2.css('left', this.decal2);
                this.$progress.css('right', this.$bar.width() - this.decal2);

                var values = this.roundValues(this.value1, this.value2, this.opts);
                this.value1 = values.value1;
                this.value2 = values.value2;

                // update input value with steps
                this.$inputRight.val(this.value2);
                this.$tooltip2.html(this.value2);
                common.tooltip(this.$tooltip2, this.$selector2);
                this.opts.onSlide({ value1 : this.value1, value2 : this.value2 });
            }
        }
    };

    var Selector = function () {

    };
    Selector.prototype.init = function init(opts) {
        opts.value = common.roundValue(opts.value, opts);

        if (!materialColors[opts.color]) {
            this.color = 'indigo';
        } else {
            this.color = opts.color;
        }

        this.opts            = opts;
        this.color           = opts.color;
        this.$element        = opts.$element;
        this.$input          = $('<input type="text" value="'+ opts.value + '" name="'+ opts.inputName +'" class="text-field left '+ this.color +'" />');
        this.$icon           = $('<span class="slider-icon-addon"><i class="'+ opts.icon +'"></i></span>');
        this.$slider         = $('<div class="slider"><div class="slider-bar"></div><div class="selector"><div class="focus"></div><div class="tooltip">'+ opts.value +'</div></div></div>');
        this.$selector       = this.$slider.find('.selector');
        this.$focus          = this.$selector.find('.focus');
        this.$bar            = this.$slider.find('.slider-bar');
        this.$tooltip        = this.$selector.find('.tooltip');
        this.pressed         = false;
        this.prevX           = 0;
        this.left            = 0;
        this.decal           = 0;
        this.visible         = this.$element.is(':visible');
        this.value           = opts.value;
        this.valueRange      = opts.max - opts.min === opts.max ? 0 : opts.max - opts.min;
        this.percent         = 0;

        this.create();
        this.events();
    };
    Selector.prototype.create = function create() {
        this.$element.addClass('material-slider ' + this.color);

        if (this.opts.disabled === true) {
            this.$element.addClass('disabled');
            this.$input.attr('disabled', 'disabled');
        }

        if (this.opts.icon && this.opts.icon.length > 0) {
            this.$element.append(this.$icon);
        }
        this.$element.append(this.$slider);
        if (this.opts.showInput === true) {
            this.$element.append(this.$input);
        }

        common.tooltip(this.$tooltip, this.$selector);
        this.resizeSlider();
        // init value
        this.valueToPosition(this.opts.value);

        for (var i = this.opts.min; i<= this.opts.max; i = i + this.opts.step) {
            var $step = $('<div class="step" data-value="'+ i +'"><div class="tooltip">'+ i +'</div></div>');
            this.$bar.after($step);

            var min   = this.opts.min > 0 ? this.opts.min : this.opts.max,
                decal = ((i-this.opts.min)/this.opts.max)*(this.opts.max/min),
                left  = (this.$bar.width()*decal) + 5;


            if (left >= this.$bar.width()) {
                left = left - 5;
            }

            $step.css({
                'left' : left,
                top : this.$bar.position().top -2
            });
        }
    };
    Selector.prototype.events = function events() {
        this.$selector.bind('mousedown', function () {
            this.mouseDown();
        }.bind(this));
        $(document).bind('mousemove', function (e) {
            this.mouseMove(e);
        }.bind(this));
        this.$input.on('keyup', function () {
            this.value = common.roundValue(this.$input.val(), this.opts);
            this.valueToPosition(this.value);
        }.bind(this));
        this.$input.on('change', function () {
            this.value = common.roundValue(this.$input.val(), this.opts);
            this.valueToPosition(this.value);
            this.$input.val(this.value);
            this.opts.onChange(this.value);
        }.bind(this));
        this.$slider.find('.step').on('click', function (e) {
            var $step = $(e.currentTarget),
                value = $step.data('value');
            this.valueToPosition(value);
            this.value = common.roundValue(value, this.opts);
            this.$input.val(this.value);
        }.bind(this));
        $(window).resize(function () {
            this.resizeSlider();
        }.bind(this));
        setInterval(function () {
            var nextVisible = this.$element.is(':visible');
            if (this.visible !== nextVisible && this.visible === false) {
                this.visible = true;
                this.resizeSlider();
            }
        }.bind(this), 500);
    };
    Selector.prototype.valueToPosition = function valueToPosition(value) {
        var min   = this.opts.min > 0 ? this.opts.min : this.opts.max,
            decal = ((value-this.opts.min)/this.opts.max)*(this.opts.max/min),
            left  = (this.$bar.width()*decal) + 5;

        if (left >= this.$bar.width()) {
            left = left - 5;
        }

        this.$selector.css('left', left + 'px');

        this.$selector.css({
            'border-color' : materialColors[this.opts.color],
            'background-color' : materialColors[this.opts.color]
        });
        this.$tooltip.html(value);
        common.tooltip(this.$tooltip, this.$selector);
        this.value = value;
    };
    Selector.prototype.resizeSlider = function resizeSlider() {
        var originalWidth   = this.$element.width(),
            width           = originalWidth;

        if (this.opts.icon && this.opts.icon.length > 0) {
            width -= 59;
        }
        if (this.opts.showInput === true) {
            width = width - 55;
            this.$input.css('width', 55);
        }
        this.$slider.css({
            width : width
        });
        this.$selector.css('top', (this.$bar.position().top - 5) + 'px');

        this.valueToPosition(this.value);
    };
    Selector.prototype.mouseDown = function mouseDown() {
        this.pressed = true;
        this.prevX   = 0;
        if (this.opts.disabled !== true) {
            this.$focus.css('display', 'block');
        }
        $(document).one('mouseup', function () {
            if (this.pressed === true) {
                // launch event and set value and placement with step
                this.opts.onChange(this.value);
                this.valueToPosition(this.value);
            }
            this.pressed = false;
            this.$focus.css('display', 'none');
        }.bind(this));
    };
    Selector.prototype.mouseMove = function mouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.pressed === true && this.opts.disabled !== true) {
            if (this.prevX == 0) {
                this.prevX = e.pageX;
                this.left  = +this.$selector.css('left').replace('px', '');
            }
            this.decal = (e.pageX - this.prevX)+this.left;

            if (this.decal < 5) {
                this.decal = this.opts.min;
            }
            if (this.decal > this.$bar.width()) {
                this.decal = this.$bar.width();
            }

            this.$selector.css('left', this.decal);

            // calculate value
            this.percent = Math.round((this.decal/this.$bar.width())*100)/100;
            this.value   = this.opts.min + this.percent*(this.opts.max-this.valueRange);

            this.value = common.roundValue(this.value, this.opts);
            // update input value with steps
            this.$input.val(this.value);
            this.$tooltip.html(this.value);
            common.tooltip(this.$tooltip, this.$selector);
            this.opts.onSlide(this.value);
        }
    };

    var oldMaterialSlider = $.materialSlider;
    $.fn.materialSlider = Element;

    $.fn.materialSlider.noConflict = function () {
        $.fn.materialSlider = oldMaterialSlider;
    };
})(jQuery);