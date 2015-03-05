(function ($){
    'use strict';

    var SlideMenu = function (options) {

    };

    SlideMenu.VERSION = '1.0.0';

    var oldMaterialSlideMenu = $.materialSlideMenu;
    $.fn.materialSlideMenu = SlideMenu;

    $.fn.materialSlider.noConflict = function () {
        $.fn.materialSlideMenu = oldMaterialSlideMenu;
    };
})(jQuery);