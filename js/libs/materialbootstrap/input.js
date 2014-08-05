/**
 * Material Input function to add floating label and input-control color focus
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

    var oldFloatingLabel = $.fn.floatingLabel;

    $.fn.floatingLabel = FloatingLabel;

    // No Conflict Mode
    $.fn.floatingLabel.noConflict = function () {
        $.fn.floatingLabel = oldFloatingLabel;
        return this;
    };


    // auto launch
    $(function() {
        $(document).bind('DOMSubtreeModified', function(e){
            $('.floating-label').floatingLabel();
        });
    });
})(jQuery);