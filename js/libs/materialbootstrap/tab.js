/* ========================================================================
 * Bootstrap: tab.js v3.2.0
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


(function ($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function (element) {
        this.element = $(element)
    };

    Tab.VERSION = '1.0.0';

    Tab.prototype.show = function () {
        var $this    = this.element;
        var $ul      = $this.closest('ul:not(.dropdown-menu)');
        var selector = $this.data('target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return;

        var previous = $ul.find('.active:last a')[0];
        var e        = $.Event('show.bs.tab', {
            relatedTarget: previous
        });

        $this.trigger(e);

        if (e.isDefaultPrevented()) return;

        var $target = $(selector);

        this.activate($this.closest('li'), $ul);
        this.activate($target, $target.parent(), function () {
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: previous
            });
        });
    };

    Tab.prototype.activate = function (element, container, callback) {
        var $active    = container.find('> .active');
        var transition = callback
            && $.support.transition
            && $active.hasClass('fade');

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active');

            element.addClass('active');

            if (transition) {
                element[0].offsetWidth; // reflow for transition
                element.addClass('in');
            } else {
                element.removeClass('fade');
            }

            if (element.parent('.dropdown-menu')) {
                element.closest('li.dropdown').addClass('active');
            }

            if (!callback) {
                setSelectedBarPosition(element, container);
            }

            callback && callback()
        }

        transition ?
            $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(150) :
            next();

        $active.removeClass('in');
    };


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('bs.tab');

            if (!data) $this.data('bs.tab', (data = new Tab(this)));
            if (typeof option == 'string') data[option]()
        })
    }

    function setSelectedBarPosition($element, $container) {
        if ($element.parent('.dropdown-menu').length > 0) {
            $element = $element.closest('li.dropdown');
        }

        var $selector = $container.find('div.selected');
        $selector.animate({
            left : $element.position().left,
            width : $element.width()
        }, 150);
    }

    var old = $.fn.tab;

    $.fn.tab             = Plugin;
    $.fn.tab.Constructor = Tab;


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this
    };

    // Refresh selected bar placement (see to optimize this part later)
    setInterval(function () {
        $(document).find('.material-nav.nav-tabs, .material-nav .nav-tabs').each(function () {
            setSelectedBarPosition($(this).find('li.active'), $(this));
        });
    }, 500);

    // TAB DATA-API
    // ============
    $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show')
    })

})(jQuery);
