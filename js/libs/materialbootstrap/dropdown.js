(function ($){
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop';
    var toggle   = '[data-toggle="dropdown"]';
    var Dropdown = function (element) {
        $(element).on('click.bs.dropdown', this.toggle);
    };

    Dropdown.VERSION = '1.0.0';

    Dropdown.prototype.toggle = function (e) {
        var $this = $(this);

        if ($this.is('.disabled, :disabled')) return;

        var $parent  = getParent($this);
        var isActive = $parent.hasClass('open');
        var $ul      = $parent.find('.dropdown-menu');

        clearMenus();

        if($ul.attr('role') == 'select') {
            initSelectMenu({
                $ul : $ul,
                $button : $this,
                $parent : $parent
            });
        }

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }
            $ul.find('li a').on('click', function(evt) {
                $parent.trigger('select.bs.dropdown', evt);
                selectItem(evt, {
                    $this   : $this,
                    $ul     : $ul,
                    $parent : $parent
                });
            });

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) return;

            $this.trigger('focus');

            // position of $ul with $parent position
            if ($ul.hasClass('dropdown-tab')) {
                $ul.css({
                    top : $parent.position().top,
                    left : $parent.position().left
                });
            }

            animations.openSelectMenu({
                $ul : $ul,
                $button : $this
            }, function () {
                $parent
                    .toggleClass('open')
                    .trigger('shown.bs.dropdown', relatedTarget)
            });
        } else {
            $ul.find('li a').off('click');
        }

        return false
    };

    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) return;

        var $parent  = getParent($this);
        var isActive = $parent.hasClass('open');

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus');
            return $this.trigger('click')
        }

        var desc = ' li:not(.divider):visible a';
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);

        if (!$items.length) return;

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0)                 index--;                     // up
        if (e.keyCode == 40 && index < $items.length - 1) index++;                     // down
        if (!~index)                                      index = 0;

        $items.eq(index).trigger('focus')
    };

    function clearMenus(e) {
        if (e && e.which === 3) return;
        $(backdrop).remove();
        $(toggle).each(function () {
            var $parent         = getParent($(this));
            var relatedTarget   = { relatedTarget: this };
            var $ul             = $parent.find('.dropdown-menu');
            if (!$parent.hasClass('open')) return;
            $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));
            animations.closeSelectMenu({
                $ul : $ul,
                $button : $(this)
            }, function () {
                if (e.isDefaultPrevented()) return;
                $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
            });
        });
    }


    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent()
    }

    var animations = {
        openSelectMenu : function openSelectMenu(params, callback) {
            var height   = params.$ul.height(),
                minWidth = params.$button.outerWidth(true);

            params.$ul.css({
                display : 'block',
                opacity : 0,
                height : '45px',
                overflow : 'hidden',
                'min-width' : minWidth + 'px'
            });
            params.$ul.animate({
                opacity : 1
            }, 100, function () {
                params.$ul.animate({
                    height: height + 'px'
                }, 400, function () {
                    //params.$ul.removeAttr('style');
                    params.$ul.css('min-width', minWidth + 'px');
                    callback();
                });
            });
        },
        closeSelectMenu : function closeSelectMenu(params, callback) {
            params.$ul.css('overflow', 'hidden');
            params.$ul.animate({
                height : '45px'
            }, 400, function () {
                params.$ul.animate({
                    opacity : 0
                }, 100, function () {
                    params.$ul.removeAttr('style');
                    callback();
                });
            });
        }
    };

    function initSelectMenu(params) {
        if (params.$ul.find('li.header').length === 0 && params.$ul.data('header') !== false) {
            // add header selected
            var $liSelected = $('<li class="header"><a role="menuitem" href="#">'+ params.$button.find('.name').html() +'</a></li>');
            params.$ul.prepend('<li role="presentation" class="divider"></li>');
            params.$ul.prepend($liSelected);
        }
        if (params.$parent.find('input[type="hidden"]').length == 0) {
            params.$parent.append('<input type="hidden" name="'+ (params.$ul.data('name') || '') +'" />');
        }
    }

    function selectItem(evt, params) {
        var $a = $(evt.currentTarget),
            $this = params.$this,
            $ul = params.$ul,
            $parent = params.$parent,
            $input = $parent.find('input[type="hidden"]');

        if ($ul.attr('role') != 'select') return;
        if ($a.hasClass('disabled')) return;
        if ($a.hasClass('selected')) return;

        evt.preventDefault();

        $ul.find('li a').removeClass('selected');
        $a.addClass('selected');
        $input.val($a.data('value'));
        $this.find('.name').html($a.html());
    }

    function clickItem(evt) {
        var $a          = $(evt.target),
            $parent     = $a.closest('.dropdown'),
            $this       = $parent.find('.dropdown-toggle'),
            $ul         = $parent.find('.dropdown-menu');

        selectItem($.Event('click', {
            currentTarget : $a
        }), {
            $parent : $parent,
            $this   : $this,
            $ul     : $ul
        });
    }

    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('bs.dropdown');

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)));
            if (typeof option == 'string') data[option].call($this);
        })
    }

    var old = $.fn.dropdown;

    $.fn.dropdown             = Plugin;
    $.fn.dropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.bs.dropdown.data-api', clearMenus)
        .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"], [role="select"]', Dropdown.prototype.keydown)
        .on('click.bs.dropdown.item', clickItem);


})(jQuery);