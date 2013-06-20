
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
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
})

// Get data
var data = document.data()

// This information is now also available back in main.js
var locations = data.locations
var trucks = data.trucks
var calendar = data.calendar


// Populate map with locations

map.markerLayer.setGeoJSON(locations);
/*
var locationGroup = new L.FeatureGroup()
var locationMarker = []

for (i = 0; i < locations.length; i++) {
    var lat = locations[i].lat
    var lng = locations[i].lng
    var locationID = locations[i].id

    locationMarker[locationID] = new L.Marker([lat, lng], {
        icon: truckMarker,
        riseOnHover:  true,
        title:        locations[i].name

    }).addTo(locationGroup)
}

locationGroup.addTo(map)
*/
// Set view based on locations
map.fitBounds(locationGroup.getBounds().pad(0.10))


locationGroup.on('click', function (e) {
    map.panTo(e.getLatLng())
})



