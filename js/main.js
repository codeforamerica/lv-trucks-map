// LAS VEGAS FOOD TRUCKS MAP - main application Javascript

if (getQueryStringParams('test') == 1 ) {
    var dummy = true;
}

/*************************************************************************
// 
// GRAB DATA FROM BACK-END API
//
// ***********************************************************************/

(function() { 
  document.data = function() {

    // CONFIGURATE DATA SOURCES
    var APIServer = 'http://lv-food-trucks.herokuapp.com/api/'

    // Dummy data sources
    // var dataSource = 'dummy-data/data.json'
    // var locationSource = 'dummy-data/locations.geojson'

    // Data sources
    // Timeslots source is done further down below
    var locationSource = APIServer + 'locations/search.geojson'
    var vendorSource = APIServer + 'vendors.json'

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

            // Data munging
            for (var j = 0; j < locations.features.length; j ++) {
                // Strip city name/state/zip from address
                // assuming that the address format was entered properly, anyway....
                locations.features[j].properties.addressShort = locations.features[j].properties.address.split(',')[0]
                
                // Inject marker styles for mapbox.js
                // Disabled due to small icons... not good for retina
                // locations.features[j].properties['marker-symbol'] = 'restaurant'
                // locations.features[j].properties['marker-color'] = '#f93'
                // locations.features[j].properties['marker-size'] = 'large'

                // Inject dummy current vendor data
                if (dummy === true) {
                    locations.features[2].properties.current_vendor_id = 5
                    locations.features[1].properties.current_vendor_id = 2                    
                }
            }

        },
        error: function (x) {
            showError('We couldn\'t retrieve vendor locations at this time.')
        }
    })

    for (var i = 0; i < locations.features.length; i++) {

        var locationId = locations.features[i].id
        var timeslotSource = APIServer + 'locations/' + locationId + '/time_slots.json'

        $.ajax({
            url: timeslotSource,
            async: false,
            dataType: 'json',
            success: function (data) {
                for (var j = 0; j < data.length; j++) {
                    timeslots.push (data[j])
                }
            },
            error: function (x) {
                showError('We couldn\'t retrieve schedule at this time.')
            }
        })
    }

    /*
    $.ajax({
        url: dataSource,
        async: false,
        dataType: 'json',
        success: function (i) {
            data = i
        },
        error: function (x) {
            showError('We couldn\'t retrieve data at this time.')
        }
    })
    */

    $.ajax({
        url: vendorSource,
        async: false,
        dataType: 'json',
        success: function (i) {

            // Data munging
            // First, declare some munging functions

            // Sort alphabetical and assign to vendors array variable
            var sort_by = function(field, reverse, primer) {
                var key = function (x) {return primer ? primer(x[field]) : x[field]};

                return function (a,b) {
                    var A = key(a), B = key(b);
                    return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
                }
            }


            // Look at website string and add http:// if necessary
            function addHttp(url) {
                if (!url.match(/^(?:f|ht)tps?:\/\//)) {
                    url = 'http://' + url
                }
                return url
            }

            // Assign to data object
            vendors = i.sort(sort_by('name', true, function(a){return a.toUpperCase()}))

            // Clean up website URLs if present
            for (i = 0; i < vendors.length; i ++) {
                if (vendors[i].website) {
                    vendors[i].website = addHttp(vendors[i].website)
                }
            }

         },
        error: function (x) {
            showError('We couldn\'t retrieve vendor information at this time.')
        }
    })
    
    // Return data object
    return {
        locations: locations,
        vendors: vendors,
        timeslots: timeslots
    }

  }
})();


// TIME & DATE HIJINKS
var now = new Date()
// Set dummy date for testing.
if (dummy === true) {
    var now = new Date('July 16, 2013 12:05:00')
}

// Create a global schedule object
var schedule = {
    'now': {
        'entries': []
    },
    'later': {
        'entries': []
    },
    'tomorrow': {
        'entries': []
    }
}

/*************************************************************************
// 
// UI
// Makes liberal use of jQuery to do things
//
// ***********************************************************************/


$(document).ready( function () {

    // TRUCK HEADING - toggler for entries
    $('.vendor-heading').click( function () {
        toggleVendorEntries($(this))
    })

    // TRUCK ENTRY - Activate marker on click
    $('#vendor-info').on('click', '.vendor-entry', function () {
        // need a better way of indicating a click flash.
        // $(this).css('background-color', '#fffff0')
        var locationId = $(this).data('locationId')
        markers.eachLayer( function (marker) {
            if (marker.feature.id === locationId) {

                // Pan to offset location (copied from map.js - how to make this piece of code DRY?
                map.panToOffset(marker.getLatLng(), getCenterOffset())

                // Open popup
                marker.openPopup()
            }
        })
    })

    // FOOTER POPUPS
    // Open / toggle
    $('.footer-vendors-link').click( function () { toggleFooterPopup('#vendors', $(this)) })
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
    $('#vendor-head-now').click()
    $('#loading').hide()

    // Populate schedule
    // showScheduleOverlay(data.timeslots);
// ***********************************************************************************************
    // let's just be stupid with this code right now.


    var $panelNow = $('#vendor-info-now')
    var $panelLater = $('#vendor-info-later')
    var $panelMuchLater = $('#vendor-info-muchlater')

    var mustacheScheduleEntry = $('#mustache-schedule-entry').html()

    // Current vendor id is stored in the location object.
    // Use this to create the schedule.now list
    for (var i = 0; i < locations.features.length; i++) {
        if (locations.features[i].properties.current_vendor_id) {
            for (var j =0; j < data.vendors.length; j++) {
                if (data.vendors[j].id == locations.features[i].properties.current_vendor_id) {
                    var temp = {}
                    temp.vendor = vendors[j]
                    var k = schedule.now.entries.push(temp) - 1
                    schedule.now.entries[k].location_id = locations.features[i].id
                    schedule.now.entries[k].location = locations.features[i].properties

                }
            }
        }
    }

    // Use timeslot data to create the rest of the schedule object
    for (var i = 0; i < timeslots.length; i++) {

        var start = new Date(timeslots[i].start_at)
        var end = new Date(timeslots[i].finish_at)

        var locationId = timeslots[i].location_id

        // add location data to schedule object
        for (var j = 0; j < locations.features.length; j++) {
            if (timeslots[i].location_id == locations.features[j].id) {
                timeslots[i].location = locations.features[j].properties
            }
        }

        // format times for output
        timeslots[i].from = formatTime(start)
        timeslots[i].until = formatTime(end)

        // time slots for current vendors - sure, why not.
        if (now > start && now < end) {
            for (var k = 0; k < schedule.now.entries.length; k++) {
                if (timeslots[i].location_id == schedule.now.entries[k].location_id) {
                    schedule.now.entries[k].until = timeslots[i].until
                }
            }
        }

        // time slots starting later today
        if (now < start && now.getDate() == start.getDate()) {
            schedule.later.entries.push(timeslots[i])
        }

        // time slots starting tomorrow
        var compareday = new Date(now)
        compareday.setDate(compareday.getDate() + 1)
        if (compareday.getDate() == start.getDate()) {
            // add day
            var day_names = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
            timeslots[i].date = day_names[start.getDay()]
    
            schedule.tomorrow.entries.push(timeslots[i])

        }
    }

    if (schedule.now.entries.length > 0) {
        $panelNow.html(Mustache.render(mustacheScheduleEntry, schedule.now))
    }
    if (schedule.later.entries.length > 0) {
        $panelLater.html(Mustache.render(mustacheScheduleEntry, schedule.later))
    }
    if (schedule.tomorrow.entries.length > 0) {
        $panelMuchLater.html(Mustache.render(mustacheScheduleEntry, schedule.tomorrow))
    }

// ***********************************************************************************************

    // Populate footer elements
    if (data.vendors.length > 0) {
        var mustacheFooterAllVendors = $('#mustache-footer-all-vendors').html()
        $('#vendors .footer-popup-content').html(Mustache.render(mustacheFooterAllVendors, data))        
    }

    // Sneaky disabling of attribution link on small windows
    $('.leaflet-control-attribution a').on('click', function() {
        if (window.screen.width < 530) {
            return false
        }
    })

    // Make tapping truck info popups on mobile easier
    if (window.screen.width < 767) {
        $('.leaflet-popup-pane').on('click', '.popup-vendor', function () {
            window.open($('.popup-vendor a').attr('href'), '_blank')
        })
        $('.leaflet-popup-pane').on('click', '.popup-location', function () {
            window.open($('.popup-location a').attr('href'), '_blank')
        })
    }

})



/*************************************************************************
// 
// HERE IS A PLACE WHERE I PUT FUNCTIONS
//
// ***********************************************************************/


/**
 *   Shows or hides trucks under each section of trucks data panel
 */

function toggleVendorEntries(clickedHeading) {

    // if clicked heading is currently open, just close it
    if (clickedHeading.next('.vendor-entries').is(':visible')) {
        clickedHeading.removeClass('active')
        $('.vendor-entries').slideUp(200)
    }

    // otherwise, close other open headings (if any) and open the one that's clicked
    else {
        if ($('.vendor-entries').is(':visible')) {
            $('.vendor-entries').prev('.vendor-heading').removeClass('active')
            $('.vendor-entries').slideUp(200)
        }
        clickedHeading.next('.vendor-entries').slideDown(200)
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
 *   Display vendor info panel with what's open now and upcoming
 */

function showScheduleOverlay (timeslots) {


}


/**
 *   Format time for display, given a Date object
 */

function formatTime (date) {

    var string = ''
    var hour = date.getHours()
    var minutes = date.getMinutes()

    // Hours in 12-hour format
    if (hour > 12) {
        string = (hour - 12)
    }
    else {
        string = hour
    }

    // Add minutes, if any
    if (minutes > 0) {
        string = string + ':' + minutes
    }

    // Add am/pm
    if (hour > 12) {
        string = string + 'pm'
    }
    else {
        string = string + 'am'
    }

    return string

}



/**
 *   ???
 */

function gatherData (vendorID, locationID) {

    var data = {}

    for (var j = 0; j < vendors.length; j++) {
        if (vendors[j].id == vendorID) {
            data.vendor = vendors[j]
            break
        }
    }

    for (var k = 0; k < locations.features.length; k++) {
        if (locations.features[k].id == locationID) {
            data.location = locations.features[k].properties
            data.location.id = locations.features[k].id
            break
        }
    }

    return data
}


/**
 *   Get center offset of map
 */

function getCenterOffset () {

    var centerOffset = [0, 0]

    var $overlay = $('#vendor-data')

    if ($overlay.is(':visible')) {
        var viewableWidth = $(window).width() - $overlay.width() - $overlay.offset().left
        centerOffset[0] =  ($overlay.width() + $overlay.offset().left) / 2
        if (viewableWidth > 840) {
            // Tweak to balance super wide windows.
            centerOffset[0] = centerOffset[0] - 60
        }
    }
    if ($(window).width() < 530) {
        centerOffset[1] = $(window).height() / 4
    } else {
        centerOffset[1] = $(window).height() / 10        
    }

    return centerOffset

 }

/**
 *   In case of application error, display error modal on page with message.
 */

function showError (message) {

    $('#vendor-data').hide(250)
    $('#error').show(250)
    $('#error .message').html(message)

}


/**
*    Get query string for various options
*/ 

function getQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}