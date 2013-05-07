
// Initialize map
//var map = L.mapbox.map('map', 'examples.map-4l7djmvo')
var map = L.mapbox.map('map', 'examples.map-y7l23tes')
    .setView([36.1665, -115.1479], 17);

// Set up truck icon
var truckMarker = L.icon({
    iconUrl: 'img/marker-truck.svg',

    iconSize:     [55, 30], // size of the icon
    iconAnchor:   [27, 5], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// City hall location
L.marker([36.167866, -115.147866], {
    icon: truckMarker
}).addTo(map);

// Bonneville Transit Center
L.marker([36.164973, -115.148048], {
    icon: truckMarker
}).addTo(map);

// RJC
L.marker([36.166047, -115.145667], {
    icon: truckMarker
}).addTo(map);

