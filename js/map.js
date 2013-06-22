
// Initialize map & set initial location / view
//var map = L.mapbox.map('map', 'examples.map-4l7djmvo')
var map = L.mapbox.map('map', 'examples.map-y7l23tes')
            .setView([36.1665, -115.1479], 17)

// Map imagery attribution
// Note that mapbox.js provides its own separate attribution, which I don't know how to edit, so I've hidden it with CSS (super hacky!) 
var control = L.control.attribution({
    prefix: 'Map imagery by <a href=\'http://www.mapbox.com/about/maps/\' target=\'_blank\'>MapBox</a>. Data &copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>.'
}).addTo(map)

// Set up truck icon
var truckMarker = L.icon({
    iconUrl: 'img/marker-truck.svg',

    iconSize:     [70, 60], // size of the icon
    iconAnchor:   [35, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [3, -55] // point from which the popup should open relative to the iconAnchor
})

var truckMarkerOff = L.icon({
    iconUrl: 'img/marker-truck-off.svg',

    iconSize:     [70, 60], 
    iconAnchor:   [35, 50], 
    popupAnchor:  [3, -55]
})

// Get data
var data = document.data()

// This information is now also available back in main.js
var locations = data.locations // this is a GeoJSON format
var trucks = data.trucks
var calendar = data.calendar

// Populate map with locations
var markers = L.mapbox.markerLayer(locations, {
    filter: function (feature) {
        return feature.properties.status === 'active'
    }
}).eachLayer(function (marker) {

    // set options here directly on the marker object
    marker.options.icon = truckMarkerOff  // set this to be off by default
    marker.options.riseOnHover = true

    // shorthand for where things are stored in the GeoJSON
    var markerID = marker.feature.id

    for (i = 0; i < calendar.now.length; i++) {
        if (calendar.now[i].at == markerID ) {
            for (j =0; j < trucks.length; j++) {
                if (trucks[j].id == calendar.now[i].truck) {
                    marker.truck = trucks[j]
                    break
                }
            }
            marker.calendar = calendar.now[i]
            break
        }
    }

    // Popup construction
    var popupHTML = 'No truck at <strong>' + marker.feature.properties.name + '</strong><br>' + marker.feature.properties.address
    if (marker.truck) {
        var popupHTML = '<strong>' + marker.truck.name + '</strong> is at <strong>' + marker.feature.properties.name + '</strong><br>' + marker.feature.properties.address + '<br>until ' + marker.calendar.until
        marker.options.icon = truckMarker //turn on truck
    }

    marker.bindPopup(popupHTML, {
        closeButton: false,
        minWidth: 200,
        autoPanPadding: [20, 20]
    })

    // Center marker on click
    marker.on('click', function (e) {
        map.panTo(marker.getLatLng())
    })
}).addTo(map)

// Set view based on locations
map.fitBounds(markers.getBounds().pad(0.10))

// Open popups on mouseover (test)
markers.on('mouseover', function (e) {
    e.layer.openPopup()
})
/*
markers.on('mouseout', function (e) {
    e.layer.closePopup()
})
*/

// Popups test
/*
markers.on('click',function (e) {
    e.layer.unbindPopup();

    var mPopup = $('#m-popup').html()
    var popupObject = {}

    var i = 1

    var feature = e.layer.feature;
    popupObject.location = feature.properties.name
    popupObject.address = feature.properties.address
    popupObject.name = trucks[i].name
    popupObject.until = trucks[i].until

    $('#popup-layer').html(Mustache.render(mPopup, popupObject))
    $('#popup').fadeIn(200)
});
// Clear the tooltip when map is clicked
map.on('click',function (e) {
    $('#popup').fadeOut(200)
});
*/