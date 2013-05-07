
$(document).ready(function() {

    // size #main block via jquery - kind of wonky right now
/*    $('#main').each(function() {
        var p = $(this).parent();
        $(this).height($('body').height() - $('header').height() - $('footer').height());
    });
*/
    // TRUCK INFO - Dragger
    $('#truck-info').draggable({ handle: '.truck-title', containment: '#main', cursor: '-webkit-grabbing !important'});

    // TRUCK HEADING - Hi-liter
    // Note on hiliters - consider using CSS3 transitions instead of jQuery?
    var truckHeadingColor = $('.truck-heading').css('background-color'),
        truckHiliteColor = $('.truck-heading-hilite').css('background-color');

    $('.truck-heading').hover( function () {
        $(this).animate({
            backgroundColor: truckHiliteColor,
        }, 200 );
    }, function () {
        $(this).animate({
            backgroundColor: truckHeadingColor,
        }, 200 );
    });

    // TRUCK HEADING - toggler for entries
    $('.truck-heading').click( function () {
        toggleTruckEntries($(this));
    });

    // TRUCK ENTRY - Hi-liter
    var entryBgColor = $('.truck-entry').css('background-color'),
        entryHiliteColor = $('.truck-entry-hilite').css('background-color');

    $('.truck-entry').hover( function () {
        $(this).animate({
            backgroundColor: entryHiliteColor,
        }, 200 );
    }, function () {
        $(this).animate({
            backgroundColor: entryBgColor,
        }, 200 );
    });

    // FOOTER POPUPS
    $('#footer-trucks-link').click( function () {
        toggleFooterPopup('#footer-trucks');
    });
    $('#footer-calendar-link').click( function () {
        toggleFooterPopup('#footer-calendar');
    });
    $('#footer-mfv-link').click( function () {
        toggleFooterPopup('#footer-mfv');
    });
    $('#footer-about-link').click( function () {
        toggleFooterPopup('#footer-about');
    });
    // Click outside a popup box to close it
    $('#main').click( function () {
        $('.footer-popup').slideUp(200);
    });

});


function toggleTruckEntries(clickedHeading) {
    var entries = clickedHeading.next('.truck-entries');
    if ( entries.is(':visible') ) {
        entries.slideUp(200);
        clickedHeading.addClass('truck-heading-border');
        clickedHeading.removeClass('active');
    } else {
        entries.slideDown(200);
        clickedHeading.removeClass('truck-heading-border');
        clickedHeading.addClass('active');
    }
}

function toggleFooterPopup(target) {
    if ($(target).is(':visible')) {
        $(target).slideUp(200);
    } else {
        // hide all others
        $('.footer-popup').slideUp(200);

        // get the position of the clicked link so that the popup box lines up
        // there may be a better way of doing this somehow, that doesn't rely on programatically determining position. what happens if a window resizes?
        var link = target + '-link';
        var position = $(link).offset().left;
        $(target).css('left', position);

        // display the popup
        $(target).slideDown(200);
    }
}

