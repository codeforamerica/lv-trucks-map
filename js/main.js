(function() { 
  document.data = function() {

    // config

    var dataSource = 'data.json'
    var locationSource = 'locations.geojson'
    var vendorSource = 'http://lv-food-trucks.herokuapp.com/api/vendors.json'


    // LOAD SOME EXTERNAL DATAS
    var data = [],
        vendors = [],
        locations = []

    $.ajax({
        url: locationSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            locations = i
        },
        error: function (i) {
            showError('Could not retrieve locations at this time.')
        }
    })

    $.ajax({
        url: dataSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            data = i
        },
        error: function (i) {
            showError('Could not retrieve data at this time.')
        }
    })

    $.ajax({
        url: vendorSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            vendors = i
        },
        error: function (i) {
            showError('Could not retrieve vendor information at this time.')
        }
    })

    var sort_by = function(field, reverse, primer) {

       var key = function (x) {return primer ? primer(x[field]) : x[field]};

       return function (a,b) {
           var A = key(a), B = key(b);
           return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
       }
    }

    return {
        locations: locations,
        trucks: vendors.sort(sort_by('name', true, function(a){return a.toUpperCase()})),
//        trucks: data.trucks,
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

    // TRUCK ENTRY - Activate marker on click
    $('#truck-info').on('click', '.truck-entry', function () {
        $(this).css('background-color', '#fffff0')
        var locationId = $(this).data('locationId')
        markers.eachLayer( function (marker) {
            if (marker.feature.id === locationId) {
                map.panTo(marker.getLatLng())
                marker.openPopup()
            }
        })
    })

    // FOOTER POPUPS
    // Open / toggle
    $('.footer-trucks-link').click( function () { toggleFooterPopup('footer-trucks') })
    $('.footer-calendar-link').click( function () { toggleFooterPopup('footer-calendar') })
    $('.footer-about-link').click( function () { toggleFooterPopup('footer-about') })
    $('.footer-feedback-link').click( function () { toggleFooterPopup('footer-feedback') })
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

// temp disabled while i figure out how to make custom popups
    // makePopup(calendar.now)

    // Populate footer elements
    var mFooterAllTrucks = $('#m-footer-all-trucks').html()
    $('#footer-trucks .footer-popup-content').html(Mustache.render(mFooterAllTrucks, data))

})

function toggleTruckEntries(clickedHeading) {
    var entries = clickedHeading.next('.truck-entries')
    /*
    if ($('.truck-entries').is(':visible')) {
        $(this).slideUp(200)
        $(this).addClass('truck-heading-border')
        $(this).removeClass('active')
    }
    entries.slideDown(200)
    clickedHeading.removeClass('truck-heading-border')
    clickedHeading.addClass('active')
    */
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
    var popup = '#' + target

    if ($(popup).is(':visible')) {
        $(popup).slideUp(200)
    } else {
        // hide all others
        $('.footer-popup').slideUp(200)

        // get the position of the clicked link so that the popup box lines up
        // there may be a better way of doing this somehow, that doesn't rely on programatically determining position. what happens if a window resizes?
        // only make this work if screen width is more than 685px for responsive layouts
        if ($(window).width() > 767) {
            var link = '.' + target + '-link'
            var position = $(link).offset().left
            $(popup).css('left', position)            
        }
        if ($(window).width() > 525 && $(window).width() <= 767 ) {
            $(popup).css('left', $('footer div.container').offset().left)
            $(popup).css('width', $('footer div.container').width())
        }

        // display the popup
        $(popup).slideDown(200)
    }
}

function displayTruckEntries(calendar, section) {

    var mTruckEntry = $('#m-truck-entry').html()
    var trucksObject = {}
    trucksObject.entries = []

    for (i = 0; i < calendar.length; i++) {

        trucksObject.entries[i] = gatherData(calendar[i].truck, calendar[i].at)

        trucksObject.entries[i].date = calendar[i].date
        trucksObject.entries[i].from = calendar[i].from
        trucksObject.entries[i].until = calendar[i].until
    }

    $(section).html(Mustache.render(mTruckEntry, trucksObject))
}

function makePopup(calendar) {

    var mPopup = $('#m-popup').html()
    var popupObject = {}
    popupObject.entries = []

    for (i = 0; i < calendar.length; i++) {

        popupObject.entries[i] = gatherData(calendar[i].truck, calendar[i].at)
        popupObject.entries[i].until = calendar[i].until

        $('#popup-layer').append(Mustache.render(mPopup, popupObject.entries[i]))
    }

}

function gatherData(truckID, locationID) {

        var data = {}

        for (j = 0; j < trucks.length; j++) {
            if (trucks[j].id == truckID) {
                data.truck = trucks[j]
                break
            }
        }

        for (k = 0; k < locations.features.length; k++) {
            if (locations.features[k].id == locationID) {
                data.location = locations.features[k].properties
                data.location.id = locations.features[k].id
                break
            }
        }

        return data
}


function showError (message) {

    $('#truck-data').hide(250)
    $('#error').show(250)
    $('#error .message').html(message)

}
