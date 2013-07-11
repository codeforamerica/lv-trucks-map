// LAS VEGAS FOOD TRUCKS MAP - map-related Javascripts

/*************************************************************************
// 
// CONFIGURATION
//
// ***********************************************************************/

var mapboxID = 'codeforamerica.map-wzcm8dk0'
var mapboxIDRetina = 'codeforamerica.map-dfs3qfso'
//var mapboxID = 'codeforamerica.map-lam6vthg'
//var mapboxIDRetina = 'codeforamerica.map-6wzjbm7l'

var mapStyle = getQueryStringParams('m')


/*************************************************************************
// 
// MAPBOX.JS HACKS
// Extend map with a variant of map.panTo() method to accept center offset
//
// ***********************************************************************/

L.Map.prototype.panToOffset = function (latlng, offset, options) {
    var x = this.latLngToContainerPoint(latlng).x - offset[0]
    var y = this.latLngToContainerPoint(latlng).y - offset[1]
    var point = this.containerPointToLatLng([x, y])
    return this.setView(point, this._zoom, { pan: options })
}

var centerOffset = getCenterOffset()


/*************************************************************************
// 
// INITIALIZE MAP
// Sets initial location, view, attribution, marker types
//
// ***********************************************************************/

var map = L.mapbox.map('map')
    .setView([36.1665, -115.1479], 14)  // This will be overridden later when map bounds are set based on available markers.

if (mapStyle) {
    // If a custom map style is required for testing
    map.addLayer(L.mapbox.tileLayer(mapStyle))
}
else {
    // Use normal map
    map.addLayer(L.mapbox.tileLayer(mapboxID, {
        detectRetina: true,
        retinaVersion: mapboxIDRetina
    }))
}

// Map imagery attribution
// Note that mapbox.js provides its own separate attribution, which I don't know how to edit, so I've hidden it with CSS (super hacky!) 
var control = L.control.attribution({
    prefix: 'Map imagery by <a href=\'http://www.mapbox.com/about/maps/\' target=\'_blank\'>MapBox</a>. Data &copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>.'
}).addTo(map)

// Set up icons for markers

var markerIconSize =    [36, 62], // size of the icon
    markerIconAnchor =  [18, 50], // point of the icon which will correspond to marker's location
    markerPopupAnchor = [0, -55]  // point from which the popup should open relative to the iconAnchor

var vendorMarker = L.icon({
    iconUrl: 'img/pin-food.png',

    iconSize:     markerIconSize,
    iconAnchor:   markerIconAnchor,
    popupAnchor:  markerPopupAnchor
})

var vendorMarkerOff = L.icon({
    iconUrl: 'img/pin-food-off.png',

    iconSize:     markerIconSize,
    iconAnchor:   markerIconAnchor,
    popupAnchor:  markerPopupAnchor
})

// Not used - currently using Mapbox version of this icon.
var hereMarker = L.icon({
    iconUrl: 'img/pin-here.png',

    iconSize:     markerIconSize,
    iconAnchor:   markerIconAnchor,
    popupAnchor:  markerPopupAnchor
})


/*************************************************************************
// 
// RETRIEVE DATA
//
// ***********************************************************************/

// This calls data function from main.js
var data = document.data()

// This information is now global and available for use in main.js
var locations = data.locations // this is a GeoJSON format
var vendors = data.vendors
var timeslots = data.timeslots


/*************************************************************************
// 
// DISPLAY DATA ON MAP
// Plus various things to set up markers, popups, etc.
//
// ***********************************************************************/

// Populate map with locations
var markers = L.mapbox.markerLayer(locations, {
    filter: function (feature) {
        return true
        // disabled active filter
        // return feature.properties.active === true
    }
}).eachLayer(function (marker) {

    // set options here directly on the marker object
    marker.options.icon = vendorMarkerOff  // set this to be off by default
    marker.options.riseOnHover = true

    // Obtain truck information if there is a current vendor present, according to Locations API
    // Note that marker.feature is a synonym for data.locations.features[x] - location
    // data is now attached to the marker itself.
    if (marker.feature.properties.current_vendor_id) {
        for (var j =0; j < data.vendors.length; j++) {
            if (data.vendors[j].id == marker.feature.properties.current_vendor_id) {
                marker.vendor = vendors[j]
                break
            }
        }
    }

    // Popup construction and marker on
    var popupHTML = '<div class=\'popup-message\'>No truck at <br><strong>' + marker.feature.properties.name + '</strong></div>'

    if (marker.vendor) {
        // Generate popup information through Mustache template        
        var mPopleaf = $('#mustache-popleaf').html()
        var popupHTML = Mustache.render(mPopleaf, marker)

        // Turn on marker
        marker.options.icon = vendorMarker
    }

    marker.bindPopup(popupHTML, {
        closeButton: false,
        minWidth: 200,
        autoPanPadding: [30, 20]
    })

}).addTo(map)

// Set the bounding area for the map
map.fitBounds(markers.getBounds().pad(0.3), {
    paddingTopLeft: centerOffset
})
map.setMaxBounds(markers.getBounds().pad(6))

// Center marker on click
markers.on('click', function (e) {
    map.panToOffset(e.layer.getLatLng(), getCenterOffset())
})


/*************************************************************************
// GEOLOCATE!
// This uses the HTML5 geolocation API, which is available on
// most mobile browsers and modern browsers, but not in Internet Explorer
//
// See this chart of compatibility for details:
// http://caniuse.com/#feat=geolocation
// ***********************************************************************/

if (navigator.geolocation) {
    map.locate()
}

// Once we've got a position, add a marker.
map.on('locationfound', function (e) {
    map.markerLayer.setGeoJSON({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: {
            'marker-size': 'large',
            'marker-color': '#cd0000',
            'marker-symbol': 'star-stroked',
            'title': '<div class=\'popup-message\'>You are here</div>'
        }
    })
})


/*************************************************************************
// 
// MISCELLANEOUS
//
// ***********************************************************************/

$(window).on('resize', function (e) {
    // This is in case we need to do anything to the map if window gets resized.
    map.invalidateSize()
})
