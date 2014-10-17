/**
 * Material Input function to add floating label and input-group color focus
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

    function FloatingLabel(options) {
        return this.each(function () {
            var $this   = $(this),
                $input  = $this.find('input'),
                $label  = $this.find('label');

            function Floating() {
                $label.addClass('show-float');
            }
            function UnFloating() {
                if ($input.val().length === 0) {
                    $label.removeClass('show-float');
                }
            }

            if ($input.val().length > 0) {
                Floating();
            }

            $input.off('focus.text.field');
            $input.off('blur.text.field');
            $input.on('focus.text.field', Floating);
            $input.on('blur.text.field', UnFloating);
        });
    }

    function InputGroupFocus(options) {
        return this.each(function () {
            var $this = $(this),
                $addon = $this.find('.text-field-group-addon'),
                $input = $this.find('input');

            function Focus() {
                var classList   = $input.attr('class').split(/\s+/),
                    color       = materialColors['blue'];

                if ($input.hasClass('error')) {
                    $addon.css('color', materialColors.red);
                } else {
                    $.each( classList, function(i, item){
                        if (materialColors[item]) {
                            color = materialColors[item];
                        }
                    });
                    $addon.css('color', color);
                }
            }
            function Unfocus() {
                $addon.css('color', '');
            }
            $input.off('focus.text.field.group');
            $input.off('blur.text.field.group');
            $input.on('focus.text.field.group', Focus);
            $input.on('blur.text.field.group', Unfocus);
        });
    }

    var oldFloatingLabel    = $.fn.floatingLabel,
        oldInputGroupFocus  = $.fn.inputGroupFocus;

    $.fn.floatingLabel      = FloatingLabel;
    $.fn.inputGroupFocus    = InputGroupFocus;

    // No Conflict Mode
    $.fn.floatingLabel.noConflict = function () {
        $.fn.floatingLabel = oldFloatingLabel;
        return this;
    };
    $.fn.inputGroupFocus.noConflict = function () {
        $.fn.inputGroupFocus = oldInputGroupFocus;
        return this;
    };


    // auto launch
    $(function() {
        $(document).bind('DOMSubtreeModified', function(e){
            $('.floating-label').floatingLabel();
            $('.text-field-group').inputGroupFocus();
        });
    });
})(jQuery);