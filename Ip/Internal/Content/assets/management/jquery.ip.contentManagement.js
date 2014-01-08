/**
 * @package ImpressPages
 *
 *
 */


(function($) {
    var widgetOnDroppable = false;


    var methods = {
        init : function(options) {


            return this.each(function() {

                var $this = $(this);

                var data = $this.data('ipContentManagement');

                // If the plugin hasn't been initialized yet
                if ( ! data ) {
                    $this.data('ipContentManagement', {
                    });

                    $(window).resize(function () {
                        if (this.resizeTO) {
                            clearTimeout(this.resizeTO);
                        }
                        this.resizeTO = setTimeout(function () {
                            $(this).trigger('resizeEnd');
                        }, 100);
                    });
                    $(window).bind('resizeEnd', ipAdminWidgetsScroll);


                    // case insensitive search
                    ip.jQuery.expr[':'].icontains = function (a, i, m) {
                        return ip.jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
                    };

                    if (isMobile) {
                        $('body').addClass('ipMobile');
                    }


                    $('body').prepend(ipContentInit.saveProgressHtml);
                    $('body').prepend(ipContentInit.controlPanelHtml);

                    var options = new Object;
                    options.zoneName = ip.zoneName;
                    options.pageId = ip.pageId;
                    options.revisionId = ip.revisionId;
                    options.widgetControlsHtml = ipContentInit.widgetControlsHtml;
                    options.contentManagementObject = $this;
                    options.manageableRevision = ipContentInit.manageableRevision;

                    var data = $this.data('ipContentManagement');
                    data.initInfo = options;
                    $this.data('ipContentManagement', data);

                    $('.ipAdminPanel .ipActionWidgetButton').ipAdminWidgetButton();



                    ipAdminPanelInit();
                    ipAdminWidgetsScroll();
                    ipAdminWidgetsSearch();

                    $('.ipAdminPanel .ipActionWidgetButton').on('dragstart', ipStartWidgetDrag);
                    $('.ipAdminPanel .ipActionWidgetButton').on('dragstop', ipStopWidgetDrag);
                    $('.ipAdminPanel .ipActionSave').on('click', function(e){$.proxy(methods.save, $this)(false)});
                    $('.ipAdminPanel .ipActionPublish').on('click', function(e){$.proxy(methods.save, $this)(true)});
                    $('.ipAdminPanelContainer .ipsPreview').on('click', function(e){e.preventDefault(); ipManagementMode.setManagementMode(0);});
                    $this.on('error.ipContentManagement', function (event, error){$(this).ipContentManagement('addError', error);});
                    $.proxy(methods.initBlocks, $this)($('.ipBlock'));

                    $this.trigger('initFinished.ipContentManagement', options);

                }
            });
        },



        initBlocks : function(blocks) {
            var $this = this;
            var data = $this.data('ipContentManagement');
            var options = data.initInfo;
            if (options.manageableRevision) {
                blocks.ipBlock(options);
            }
        },

        addError : function (errorMessage) {
            var $newError = $('.ipAdminErrorSample .ipAdminError').clone();
            $newError.text(errorMessage);
            $('.ipAdminErrorContainer').append($newError);
            $newError.animate( {opacity: "100%"}, 6000)
            .animate( { queue: true, opacity: "0%" }, { duration: 3000, complete: function(){$(this).remove();}});
        },


        save : function(publish) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('ipContentManagement');

                var postData = Object();
                postData.aa = 'Content.savePage';
                postData.securityToken = ip.securityToken;
                postData.revisionId = ip.revisionId;
                if (publish) {
                    postData.publish = 1;
                } else {
                    postData.publish = 0;
                }

                $.ajax({
                    type : 'POST',
                    url : ip.baseUrl,
                    data : postData,
                    context : $this,
                    success : methods._savePageResponse,
                    dataType : 'json'
                });
            });
        },

        _savePageResponse: function(response) {
            var $this = $(this);
            var data = $this.data('ipContentManagement');
            if (response.status == 'success') {
                window.location.href = response.newRevisionUrl;
            } else {

            }
        }


    };


    /**
     *
     * Function used to paginate Widgets on Administration Panel
     *
     * @param none
     * @returns nothing
     *
     *
     */
    var ipAdminWidgetsScroll = function () {
        var $scrollable = $('.ipAdminWidgetsContainer'); // binding object
        $scrollable.scrollable({
            items: 'li', // items are <li> elements; on scroll styles will be added to <ul>
            touch: false
        });
        var scrollableAPI = $scrollable.data('scrollable'); // getting instance API
        var itemWidth = scrollableAPI.getItems().eq(0).outerWidth(true);
        var containerWidth = scrollableAPI.getRoot().width() + 24; // adding left side compensation
        var scrollBy = Math.floor(containerWidth / itemWidth); // define number of items to scroll
        if (scrollBy < 1) {
            scrollBy = 1;
        } // setting the minimum
        $('.ipAdminWidgets .ipaRight, .ipAdminWidgets .ipaLeft').unbind('click'); // unbind if reinitiating dynamically
        scrollableAPI.begin(); // move to scroller to default position (beginning)
        $('.ipAdminWidgets .ipaRight').click(function (event) {
            event.preventDefault();
            scrollableAPI.move(scrollBy);
        });
        $('.ipAdminWidgets .ipaLeft').click(function (event) {
            event.preventDefault();
            scrollableAPI.move(-scrollBy);
        });
    }

    /**
     *
     * Function used to search Widgets on Administration Panel
     *
     * @param none
     * @returns nothing
     *
     *
     */
    var ipAdminWidgetsSearch = function () {
        var $input = $('.ipAdminWidgetsSearch .ipaInput');
        var $button = $('.ipAdminWidgetsSearch .ipaButton');
        var $widgets = $('.ipAdminWidgetsContainer li');

        $input.focus(function () {
            if (this.value == this.defaultValue) {
                this.value = '';
            }
            ;
        }).blur(function () {
                if (this.value == '') {
                    this.value = this.defaultValue;
                }
                ;
            }).keyup(function () {
                var value = this.value;
                $widgets.css('display', ''); // restate visibility
                if (value && value != this.defaultValue) {
                    $widgets.not(':icontains(' + value + ')').css('display', 'none');
                    $button.addClass('ipaClear');
                } else {
                    $button.removeClass('ipaClear');
                }
                ipAdminWidgetsScroll(); // reinitiate scrollable
            });

        $button.click(function (event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass('ipaClear')) {
                $input.val('').blur().keyup(); // blur returns default value; keyup displays all hidden widgets
                $this.removeClass('ipaClear'); // makes button look default
            }
        });
    }

    /**
     *
     * Function used to create a space on a page for Administration Panel
     *
     * @param none
     * @returns nothing
     *
     *
     */
    var ipAdminPanelInit = function () {
        var $container = $('.ipAdminPanelContainer'); // the most top element physically creates a space
        var $panel = $('.ipAdminPanel'); // Administration Panel that stays always visible
        $container.height($panel.height()); // setting the height to container
        $panel.css('top', $('.ipsAdminToolbarContainer').outerHeight()); // move down to leave space for top toolbar
    }

    var ipStartWidgetDrag = function (event, ui) {
        $('.ipWidget').each(function (key, value) {
            //left placeholder
            var $droppable = $('<div class="ipsWidgetDropPlaceholder" style="width: 10px; background-color: #000;"></div>');
            $('body').append($droppable);
            $droppable.css('position', 'absolute');
            $droppable.css('left', $(value).offset().left - $droppable.width() + 'px');
            $droppable.css('top', $(value).offset().top + 10 + 'px');
            $droppable.css('height', $(value).height() - 20 + 'px');
            $droppable.data('instanceId', $(value).data('widgetinstanceid'));
            $droppable.data('leftOrRight', 'left');

            //right placeholder
            var $droppable = $('<div class="ipsWidgetDropPlaceholder" style="width: 10px; background-color: #000;"></div>');
            $('body').append($droppable);
            $droppable.css('position', 'absolute');
            $droppable.css('left', $(value).offset().left + $(value).width() + 'px');
            $droppable.css('top', $(value).offset().top + 10 + 'px');
            $droppable.css('height', $(value).height() - 20 + 'px');
            $droppable.data('instanceId', $(value).data('widgetinstanceid'));
            $droppable.data('leftOrRight', 'right');
        });

        $('.ipsWidgetDropPlaceholder').droppable({
            accept: ".ipActionWidgetButton, .ipWidget",
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            over: function (event, ui) {
                widgetOnDroppable = $(this);
            },
            out: function (event, ui) {
                widgetOnDroppable = false;
            },
            drop: function (event, ui) {
                //this method on jQuery-ui is buggy and fires fake drop events. So we better handle stop event on draggable. This is just for widget side drops.
            }
        });

    }

    var ipStopWidgetDrag = function (event, ui) {

        if (widgetOnDroppable) {
            var targetWidgetInstanceId = widgetOnDroppable.data('instanceId');
            var leftOrRight = widgetOnDroppable.data('leftOrRight');
            var widgetName = $(this).data('ipAdminWidgetButton').name;
            ipContent.addWidgetToSide(widgetName, targetWidgetInstanceId, leftOrRight);
        }
        $('.ipsWidgetDropPlaceholder').remove();

    }

    var ipMoveWidgetToSide = function (widgetInstanceId, targetWidgetInstanceId, leftOrRight) {
        // todo
    }





    $.fn.ipContentManagement = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }


    };



})(ip.jQuery);
