// LAS VEGAS FOOD TRUCKS MAP - main application Javascript

if (getQueryStringParams('test') == 1 ) {
	var dummy = true
}

// TIME & DATE HIJINKS
var now = new Date()
// Set dummy date for testing.
if (dummy === true) {
	var now = new Date('July 16, 2013 12:05:00')
}

// DATA SOURCES
var APIServer = 'http://lv-food-trucks.herokuapp.com/api/'
//var APIServer = 'http://localhost:3000/'



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
};


/*************************************************************************
// 
// GRAB DATA FROM BACK-END API
//
// ***********************************************************************/

(function() { 
  document.data = function() {

	// CONFIGURATE DATA SOURCES
	// Dummy data sources
	// var dataSource = 'dummy-data/data.json'   // NOTE - no references to this remain
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

	// RETRIEVE LOCATIONS
	$.ajax({
		url: locationSource,
		async: false,
		cache: false,
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
				locations.features[j].properties['marker-symbol'] = 'restaurant'
				locations.features[j].properties['marker-color'] = '#f93'
				locations.features[j].properties['marker-size'] = 'large'

				// Inject dummy current vendor data
				if (dummy === true) {
					locations.features[2].properties.current_vendor_id = 14
					locations.features[1].properties.current_vendor_id = 23                   
				}
			}

		},
		error: function (x) {
			showError('We couldn\'t retrieve vendor locations at this time.')
		}
	})

	// RETRIEVE SCHEDULED TIMESLOTS
	for (var i = 0; i < locations.features.length; i++) {

		var locationId = locations.features[i].id
		var timeslotSource = APIServer + 'locations/' + locationId + '/time_slots.json'

		$.ajax({
			url: timeslotSource,
			async: false,
			cache: false,
			dataType: 'json',
			success: function (data) {
				for (var j = 0; j < data.length; j++) {
					timeslots.push(data[j])
				}
			},
			error: function (x) {
				showError('We couldn\'t retrieve vendor schedule at this time.')
			}
		})
	}

	if (timeslots.length > 1) {

		// Sort timeslots function
		var sort_by_time = function(field, reverse, primer) {
			var key = function (x) {return primer ? primer(x[field]) : x[field]};

			return function (a,b) {
				var A = key(a), B = key(b);
				return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
			}
		}

		// Sort timeslots by time
		timeslots = timeslots.sort(sort_by_time('start_at', true))

		// Additional timeslot cleaning

		// Setup
		var day_names = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
		var month_names =  new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')

		// Actions
		for (var i = 0; i < timeslots.length; i++) {

			var endTime = new Date(timeslots[i].finish_at)
			var startTime = new Date(timeslots[i].start_at)

			// Add some helpful information for start times
			timeslots[i].day_of_week = day_names[startTime.getDay()]
			timeslots[i].month = month_names[startTime.getMonth()]
			timeslots[i].day = startTime.getDate()
			timeslots[i].year = startTime.getFullYear()

			// Remove all timeslots that have ended yesterday
			if (endTime < now && endTime.getDate() != now.getDate()) {
				timeslots.splice(i, 1)
				i--      // The array is affected, so change the value of i before re-looping
			}
		}

	}

	// RETRIEVE FULL VENDOR LIST
	$.ajax({
		url: vendorSource,
		async: false,
		cache: false,
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
				map.panToOffset(marker.getLatLng(), _getCenterOffset())

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
	$('.footer-feedback-link').click( function () {
		toggleFooterPopup('#feedback', $(this))
		_resetFeedbackForm()
	})
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


	var $panelNow = $('#vendor-info-now .vendor-entry-list')
	var $panelLater = $('#vendor-info-later .vendor-entry-list')
	var $panelMuchLater = $('#vendor-info-muchlater .vendor-entry-list')

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
			timeslots[i].tomorrow = true

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
		$('.leaflet-popup-pane').on('click', 'a', function (e) {
			e.preventDefault()
		})
	}

	// Feedback form shtuff
	$('#feedback-type').on('change', function () {
		_checkFeedbackForm()
	})
	$('#feedback-content').on('keyup', function () {
		_checkFeedbackForm()
	})
	$('#feedback-submit').on('click', function (e) {
		// e.preventDefault()
		_sendFeedback()
	})

	// Make Calendar
	$('#calendar .insert').html(makeCalendar())

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

function showScheduleOverlay () {

// NOT USED AT THE MOMENT

}

/**
 *   Display vendor schedule on footer / calendar popup
 */

function makeCalendar () {

	// Assuming all entries in the "timeslots" object is today or later,
	// and that timeslots are already sorted in time order, because
	// because the data retrieval process should have already done this.

	var theHTML = ''
	var mustacheCalendarDate = $('#mustache-calendar-date').html()
	var mustacheCalendarList = $('#mustache-calendar-list').html()

	for (var i = 0; i < timeslots.length; i++) {

		var start_day = timeslots[i].day,
			previous_day = 0

		if (i > 0) {
			previous_day = timeslots[i-1].day
		}

		// Display date header, if it needs to change
		if (start_day != previous_day) {

			var date = {
				day_of_week: timeslots[i].day_of_week,
				month:       timeslots[i].month,
				day:         timeslots[i].day,
				year:        timeslots[i].year
			}

			if (i > 0) {
				theHTML = theHTML + '</ul>'
			}

			theHTML = theHTML + Mustache.render(mustacheCalendarDate, date)

			theHTML = theHTML + '<ul>'

		}

		// Display scheduled entry
		var item = {
			name:     timeslots[i].vendor.name,
			website:  timeslots[i].vendor.website,
			location: timeslots[i].location.name,
			from:     timeslots[i].from
		}

		theHTML = theHTML + Mustache.render(mustacheCalendarList, item)

	}

	if (timeslots.length > 0) {
		theHTML = theHTML + '</ul>'
	}
	else {
		theHTML = 'No upcoming scheduled vendors.'
	}


	return theHTML

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
 *   Get center offset of map
 */

function _getCenterOffset () {

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
 *   Feedback form content validation
 */

function _checkFeedbackForm () {

	var type = ($('#feedback-type').val() != null) ? true : false
	var content = ($.trim($('#feedback-content').val()) != '') ? true : false

	if ( type == true && content == true ) {
		$('#feedback-submit').prop('disabled', false)
	}
	else {
		$('#feedback-submit').prop('disabled', true)
	}

}

function _sendFeedback () {

	$('#feedback-sending').show()

//	var feedbackAPI = 'http://localhost:3000/api/feedbacks'
	var feedbackAPI = APIServer + 'feedbacks'

	var feedbackData = {
		feedback: {
			category: $('#feedback-type').val(),
			body: $('#feedback-content').val(),
			email: $('#feedback-email').val()			
		}
	}
	// null = no type
	// 1 = feedback on the app, for us
	// 2 = feedback on the MFV program, for the city (but also us)

	$.ajax({
		type: "POST",
		url: feedbackAPI,
		data: feedbackData,
//		dataType: 'json',
		success: function (i) {
			$('#feedback-sending').hide()
			$('#feedback-success').show()
		},
		error: function (x) {
			$('#feedback-sending').hide()
			$('#feedback-error').show()
		}
	})

}

function _resetFeedbackForm () {
	document.getElementById('feedback-form').reset()
	$('#feedback-sending').hide()
	$('#feedback-success').hide()
	$('#feedback-error').hide()
}

/**
 *   Hide attribution in sensitive geographic areas.
 */

function _hideAttribution (point) {

	// In case anyone is looking at this code, here's why it exists. There
	// was a request from CLV to disable the map attribution in case someone
	// complains that it's "not city data". No one, I expect, will complain
	// -- except perhaps someone at the city -- and because it's not a nice
	// thing to do to remove credits from someone's work, all this code does
	// is hide the attribution if it detects that the user is within the
	// boundary of City Hall or the Development Services Center.

	// Alternate solutions to this problem include:
	//   (a) Using the city's official ESRI-run base map, or
	//   (b) Explaining why open source map data is important.

	// Eventually, we are likely to pursue option (b).

	// City Hall boundaries
	var foo = new L.LatLngBounds([
		[36.16671, -115.14953],
		[36.16794, -115.14744]
	])

	// Development Services Center boundaries
	var bar = new L.LatLngBounds([
		[36.17551, -115.17694],
		[36.17731, -115.17497]
	])

	// Point is a [lat,lng] array retrieved by geolocation.

	if (foo.contains(point) == true || bar.contains(point) == true) {
		$('.leaflet-control-attribution').hide()
	}
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