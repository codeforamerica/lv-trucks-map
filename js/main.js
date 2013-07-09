(function() { 
  document.data = function() {

    var now = new Date()

    // CONFIGURATE DATA SOURCES
    var APIServer = 'http://lv-food-trucks.herokuapp.com/api/'

    // Dummy data sources
    var dataSource = 'dummy-data/data.json'
    // var locationSource = 'dummy-data/locations.geojson'

    // Data sources
//    var timeslotsSource = APIServer + 'locations/{x}/time_slots.json'
    var locationSource = APIServer + 'locations/search.geojson'
    var vendorSource = APIServer + 'vendors.json'

    /*
    var timeslotsSource = APIServer + 'locations/1/time_slots/search.json?q%5Bstart_at_gt%5D=' + now.toJSON()
    APIServer + 'locations/' + location_id + '/time_slots.json'
    http://www.timeapi.org/pst/now


    http://lv-food-trucks.herokuapp.com/api/locations/1/time_slots/search.json?q%5Bstart_at_gt%5D=2013-07-01T00:00:00Z
    */

    // LOAD SOME EXTERNAL DATAS
    var data = [],
        vendors = [],
        locations = [],
        timeslots = []

    // Note: true async does not work with cross-domain requests.
    $.ajax({
        url: locationSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            locations = i

            for (i = 0; i < locations.features.length; i ++) {
                // Strip city name/state/zip from address
                // assuming that the address format was entered properly, anyway....
                locations.features[i].properties.addressShort = locations.features[i].properties.address.split(',')[0]
                
                // Inject marker styles for mapbox.js
                // Disabled due to small icons... not good for retina
                // locations.features[i].properties['marker-symbol'] = 'restaurant'
                // locations.features[i].properties['marker-color'] = '#f93'
                // locations.features[i].properties['marker-size'] = 'large'
            }

        },
        error: function (i) {
            showError('We couldn\'t retrieve location data at this time.')
        }
    })

    for (i = 0; i < locations.features.length; i++) {

        var locationId = locations.features[i].id
        var timeslotSource = APIServer + 'locations/' + locationId + '/time_slots.json'

        $.ajax({
            url: timeslotSource,
            async: false,
            dataType: 'json',
            success: function (data) {
               console.log(data.length)
               // why is this an infinite loop??
/*                for (i = 0; i < data.length; i++) {
//                    timeslots[timeslots.length] = data[i]
                    console.log(data[i])
                }
                */

            },
            error: function (i) {
                showError('We couldn\'t retrieve time slots at this time.')
            }
        })
    }

    $.ajax({
        url: dataSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            data = i
        },
        error: function (i) {
            showError('We couldn\'t retrieve data at this time.')
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
            showError('We couldn\'t retrieve vendor information at this time.')
        }
    })
/*
    $.ajax({
        url: calendarSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            calendar = i
         },
        error: function (i) {
            showError('We couldn\'t retrieve calendar information at this time.')
        }
    })
*/
    var sort_by = function(field, reverse, primer) {

       var key = function (x) {return primer ? primer(x[field]) : x[field]};

       return function (a,b) {
           var A = key(a), B = key(b);
           return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
       }
    }

    $('#loading').hide()
    return {
        locations: locations,
        trucks: vendors.sort(sort_by('name', true, function(a){return a.toUpperCase()})),
        calendar: data.calendar,
        timeslots: timeslots
    }

  }
})();

$(document).ready( function () {

    // TIME & DATE HIJINKS
    var now = new Date()



    // TRUCK HEADING - toggler for entries
    $('.truck-heading').click( function () {
        toggleTruckEntries($(this))
    })

    // TRUCK ENTRY - Activate marker on click
    $('#truck-info').on('click', '.truck-entry', function () {
        // need a better way of indicating a click flash.
        // $(this).css('background-color', '#fffff0')
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
    $('.footer-trucks-link').click( function () { toggleFooterPopup('#trucks', $(this)) })
    $('.footer-calendar-link').click( function () { toggleFooterPopup('#calendar', $(this)) })
    $('.footer-about-link').click( function () { toggleFooterPopup('#about', $(this) ) })
    $('.footer-feedback-link').click( function () { toggleFooterPopup('#feedback', $(this)) })
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

    // Populate truck entries
    displayTruckEntries(calendar.now, '#truck-info-now')
    displayTruckEntries(calendar.later, '#truck-info-later')
    displayTruckEntries(calendar.muchlater, '#truck-info-muchlater')

    // temp disabled while i figure out how to make custom popups
    // makePopup(calendar.now)

    // Populate footer elements
    if (data.trucks.length > 0) {
        var mFooterAllTrucks = $('#m-footer-all-trucks').html()
        $('#footer-trucks .footer-popup-content').html(Mustache.render(mFooterAllTrucks, data))        
    }

    $('.leaflet-control-attribution a').on('click', function() {
        if ($(window).width() < 525) {
            return false
        }
    })


})

/**
 *   Shows or hides trucks under each section of trucks data panel
 */

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

/**
 *   Shows or hides a footer element
 */

function toggleFooterPopup(popup, clicked) {

    if ($(popup).is(':visible')) {
        // If visible, hide it!
        $(popup).slideUp(200)
        // window.location.hash = ''
    }
    else {
        // Hide all other popups
        $('.footer-popup').slideUp(200)

        // Establish popup position in the window
        var position = clicked.offset().left
        if ($(window).width() > 525) {
            if ( $(popup).width() + position <= $(window).width() ) {
                $(popup).css('left', position)
            }
            else {
                $(popup).css('left', $(window).width() - $(popup).width() - 20)
            }
        }
        else {
            $(popup).css('left', 0)
        }

        // Display the popup
        $(popup).slideDown(200)
        // Hash related hijinks are disabled
        // window.location.hash = popup
    }
}

/**
 *   Display calendar entries
 */

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

/**
 *   This is for the old popup format, I think
 */

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

/**
 *   ???
 */

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


/**
 *   In case of application error, display error modal on page with message.
 */

function showError (message) {

    $('#truck-data').hide(250)
    $('#error').show(250)
    $('#error .message').html(message)

}


/**
*    Get query string for various options
*/ 

function GetQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}