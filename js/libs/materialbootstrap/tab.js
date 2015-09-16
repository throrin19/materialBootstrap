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

        var selectMenu = $this.closest('ul.dropdown-menu[role="select"]');
        if (selectMenu.length === 1) {
            $this.trigger('click.bs.dropdown.item');
        }

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

        var $selector   = $container.find('div.selected'),
            elementLeft = ($element.position() || {}).left,
            selectorLeft = ($selector.position() || {}).left;

        if (elementLeft !== selectorLeft) {
            $selector.animate({
                left : ($element.position() || {}).left,
                width : $element.width()
            }, 150);
        } else if ($selector.width() !== $element.width()) {
            $selector.css('width', $element.width());
        }
    }

    function checkNextTab(params) {
        var showNextButton  = false,
            left            = params.$ul.position().left;
        params.$ul.find('> li').each(function () {
            var $li     = $(this),
                width   = params.$content.width();


            if ($li.position().left + left + $li.width() > width) {
                showNextButton = true;
            }
        });
        if (showNextButton === true) {
            params.$nextTabButton.show();
        } else {
            params.$nextTabButton.hide();
        }
    }

    function navigateToNextTab(params) {
        var width   = params.$content.width(),
            left    = params.$ul.position().left,
            $finalLi;
        params.$ul.find('> li').each(function () {
            var $li     = $(this);

            if ($li.position().left + left + $li.width() > width) {
                $finalLi = $li;
                return false;
            }
        });

        if ($finalLi) {
            params.$ul.animate({
                left : width - ($finalLi.position().left + $finalLi.width())
            }, 200);
        }
    }

    function checkPreviousTab(params) {
        if (parseInt(params.$ul.css('left')) || 0 < 0) {
            params.$prevTabButton.show();
        } else {
            params.$prevTabButton.hide();
        }
    }

    function navigateToPreviousTab(params) {
        var $finalLi,
            testLeft    = -Infinity,
            left        = parseInt(params.$ul.css('left')) || 0;
        params.$ul.find('> li').each(function () {
            var $li     = $(this);

            if ($li.position().left + left < 0 && $li.position().left > testLeft) {
                $finalLi = $li;
                testLeft = $li.position().left;
            }
        });

        if ($finalLi) {
            params.$ul.animate({
                left : -$finalLi.position().left
            }, 200);
        }
    }

    function navigateToSelectedTab(params) {
        var $li     = params.$ul.find('> li.active'),
            width   = params.$content.width(),
            left    = params.$ul.position().left;

        if ($li.length > 0) {
            if ($li.position().left + left + $li.width() > width) {
                params.$ul.animate({
                    left: width - ($li.position().left + $li.width())
                }, 200);
            }
        }
    }

    function initScrollTab(params) {
        checkNextTab(params);
        checkPreviousTab(params);
        if (params.$container.data('init') !== true) {
            navigateToSelectedTab(params);
            params.$container.data('init', true);
        }
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

    // Refresh tabs Content, placement, size
    setInterval(function () {
        $(document).find('.material-nav.nav-tabs, .material-nav .nav-tabs').each(function () {
            if ($(this).parents('.material-nav').data('refresh') != 'false' && $(this).parents('.material-nav').data('refresh') !== false) {
                setSelectedBarPosition($(this).find('li.active'), $(this));
            }
        });
        $(document).find('.material-nav[role="scroll"]').each(function () {
            if ($(this).data('refresh') != 'false' && $(this).data('refresh') !== false) {
                initScrollTab({
                    $container      : $(this),
                    $content        : $(this).find('.nav-content'),
                    $ul             : $(this).find('.nav-tabs'),
                    $nextTabButton  : $(this).find('.nav-scroll-right > a'),
                    $prevTabButton  : $(this).find('.nav-scroll-left > a')
                });
            }
        })
    }, 500);

    // TAB DATA-API
    // ============
    $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show')
    });
    $(document).on('click.bs.tab.scroll.next', '.material-nav[role="scroll"] .nav-scroll-right > a', function (e) {
        var $container      = $(this).parents('.material-nav');
        navigateToNextTab({
            $container      : $container,
            $content        : $container.find('.nav-content'),
            $ul             : $container.find('.nav-tabs'),
            $nextTabButton  :  $(this)
        });
    });
    $(document).on('click.bs.tab.scroll.previous', '.material-nav[role="scroll"] .nav-scroll-left > a', function (e) {
        var $container      = $(this).parents('.material-nav');
        navigateToPreviousTab({
            $container      : $container,
            $content        : $container.find('.nav-content'),
            $ul             : $container.find('.nav-tabs'),
            $nextTabButton  :  $(this)
        });
    });

})(jQuery);
