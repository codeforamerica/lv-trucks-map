
// Initialize map & set initial location / view
//var map = L.mapbox.map('map', 'examples.map-4l7djmvo')
var map = L.mapbox.map('map', 'examples.map-y7l23tes')
            .setView([36.1665, -115.1479], 17)
/*
var attrib = 'Map tiles by <a href="http://mapbox.com">MapBox</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'

var layer = L.mapbox.tileLayer('examples.map-y7l23tes', {
    mapAttribution: attrib
})
*/

// Set up truck icon
var truckMarker = L.icon({
    iconUrl: 'img/marker-truck.svg',

    iconSize:     [70, 60], // size of the icon
    iconAnchor:   [35, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [3, -55] // point from which the popup should open relative to the iconAnchor
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
})

// Marker + popup construction
var locationMarker = []
markers.eachLayer(function (marker) {

    marker.options.icon = truckMarker
    marker.options.riseOnHover = true

    var markerProperties = marker.feature.properties

    var popupHTML = '<strong>' + markerProperties.name + '</strong><br>' + markerProperties.address

    marker.bindPopup(popupHTML, {
        closeButton: false,
        minWidth: 200
    })
    marker.on('click', function (e) {
        map.panTo(marker.getLatLng())
    })

    // Some guidance about displaying information in another part of DOM apart from leaflet-generated popups.
    // http://www.mapbox.com/mapbox.js/example/v1.0.0/marker-tooltips-outside-map/


}).addTo(map)

// Set view based on locations
map.fitBounds(markers.getBounds().pad(0.10))





