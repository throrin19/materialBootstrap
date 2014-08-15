/**
 * Material Input function to add floating label and input-group color focus
 */
(function ($){
    var colorNames  = [ 'red', 'pink', 'purple', 'dpurple', 'indigo', 'blue', 'lblue', 'cyan', 'teal', 'green', 'lgreen', 'lime', 'yellow', 'amber', 'orange', 'dorange', 'brown', 'grey', 'bgrey'],
        colorValues = [ '#e51c23', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#5677fc', '#03a9f4', '#00bcd4', '#009688', '#259b24', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b' ];
    
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

            $input.on('focus', Floating);
            $input.on('blur', UnFloating);
        });
    }

    function InputGroupFocus(options) {
        return this.each(function () {
            var $this = $(this),
                $addon = $this.find('.text-field-group-addon'),
                $input = $this.find('input');

            function Focus() {
                var classList = $input.attr('class').split(/\s+/),
                    hasColor  = false;
                $.each( classList, function(i, item){
                    $.each(colorNames, function (index, color) {
                        if (item === color) {
                            $addon.css('color', colorValues[index]);
                            hasColor = true;
                        }
                    });
                });
                if (!hasColor) {
                    $addon.css('color', colorValues[5]);
                }
            }
            function Unfocus() {
                $addon.css('color', '');
            }
            $input.on('focus', Focus);
            $input.on('blur', Unfocus);
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