(function() { 
  document.data = function() {

    // LOAD SOME EXTERNAL DATAS
    var dataJson = 'data.json',
        data = []

    $.ajax({
        url: dataJson,
        async: false,
        dataType: 'json',
        success: function (i) {
            data = i
        }
    })

    return {
        locations: data.locations,
        trucks: data.trucks,
        calendar: data.calendar
    }

  }
})();

$(document).ready( function () {

    // TRUCK INFO - Dragger
    // $('#truck-info').draggable({ handle: '.truck-title', containment: '#main', cursor: '-webkit-grabbing !important'})

    // TRUCK HEADING - Hi-liter
    // Note on hiliters - consider using CSS3 transitions instead of jQuery?
    var truckHeadingColor = $('.truck-heading').css('background-color'),
        truckHiliteColor = $('.truck-heading-hilite').css('background-color')

    $('.truck-heading').hover( function () {
        $(this).animate({
            backgroundColor: truckHiliteColor,
        }, 200 )
    }, function () {
        $(this).animate({
            backgroundColor: truckHeadingColor,
        }, 200 )
    })

    // TRUCK HEADING - toggler for entries
    $('.truck-heading').click( function () {
        toggleTruckEntries($(this))
    })

    // TRUCK ENTRY - Hi-liter
    var entryBgColor = $('.truck-entry').css('background-color'),
        entryHiliteColor = $('.truck-entry-hilite').css('background-color')

    $('#truck-info').on('mouseenter', '.truck-entry', function () {
        $(this).css('background-color', entryHiliteColor)
    })
    $('#truck-info').on('mouseleave', '.truck-entry', function () {
        $(this).css('background-color', entryBgColor)
    })

    // FOOTER POPUPS
    // Open / toggle
    $('#footer-trucks-link').click( function () { toggleFooterPopup('#footer-trucks') })
    $('#footer-calendar-link').click( function () { toggleFooterPopup('#footer-calendar') })
    $('#footer-mfv-link').click( function () { toggleFooterPopup('#footer-mfv') })
    $('#footer-about-link').click( function () { toggleFooterPopup('#footer-about') })
    // Close popups
    // -- when X is clicked on inside the popup
    $('.footer-popup-close').click( function () {
        $('.footer-popup').slideUp(200)
    })
    // -- when user clicks outside the popup
    $('#map').on('click', function () {
        $('.footer-popup').slideUp(200)
    })




    // INITIALISE!
    $('#truck-head-now').click()

    displayTruckEntries(calendar.now, '#truck-info-now')
    displayTruckEntries(calendar.later, '#truck-info-later')
    displayTruckEntries(calendar.muchlater, '#truck-info-muchlater')

    // Populate footer elements
    var mFooterAllTrucks = $('#m-footer-all-trucks').html()
    $('#footer-trucks .footer-popup-content').html(Mustache.render(mFooterAllTrucks, data))

})

function toggleTruckEntries(clickedHeading) {
    var entries = clickedHeading.next('.truck-entries')
    if ( entries.is(':visible') ) {
        entries.slideUp(200)
        clickedHeading.addClass('truck-heading-border')
        clickedHeading.removeClass('active')
    } else {
        entries.slideDown(200)
        clickedHeading.removeClass('truck-heading-border')
        clickedHeading.addClass('active')
    }
}

function toggleFooterPopup(target) {
    if ($(target).is(':visible')) {
        $(target).slideUp(200)
    } else {
        // hide all others
        $('.footer-popup').slideUp(200)

        // get the position of the clicked link so that the popup box lines up
        // there may be a better way of doing this somehow, that doesn't rely on programatically determining position. what happens if a window resizes?
        var link = target + '-link'
        var position = $(link).offset().left
        $(target).css('left', position)

        // display the popup
        $(target).slideDown(200)
    }
}

function displayTruckEntries(calendar, section) {

    var mTruckEntry = $('#m-truck-entry').html()
    var trucksObject = {}
    trucksObject.entries = []

    for (i = 0; i < calendar.length; i++) {

        var truckID = calendar[i].id
        var locationID = calendar[i].at

        for (j = 0; j < trucks.length; j++) {
            if (trucks[j].id == truckID) {
                trucksObject.entries[i] = trucks[j]
            }
        }

        for (k = 0; k < locations.length; k++) {
            if (locations[k].id == locationID) {
                trucksObject.entries[i].location = locations[k].name
                trucksObject.entries[i].address = locations[k].address
            }
        }

        trucksObject.entries[i].date = calendar[i].date
        trucksObject.entries[i].from = calendar[i].from
        trucksObject.entries[i].until = calendar[i].until

        if(!trucksObject.entries[i]) {
            console.log('error: problem with truck entries.')
        }
    }

    $(section).append(Mustache.render(mTruckEntry, trucksObject))
}
