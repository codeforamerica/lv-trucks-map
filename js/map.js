// LV TRUCKS MAP - map-related Javascripts

// Initialize map & set initial location / view
var map = L.mapbox.map('map')
    .setView([36.1665, -115.1479], 14)  // This will be overridden later when map bounds are set based on available markers.
    .addLayer(L.mapbox.tileLayer('louh.map-vio2jxma', {
        detectRetina: true,
        retinaVersion: 'louh.map-2lywy8ei'
    }))

// Generate center offset amounts for different views
var centerOffsetH = 0,
    centerOffsetV = 0

if ($('#truck-data').is(':visible')) {
    centerOffsetH = $('#truck-data').width() / 2
}

/*
if ($('#truck-data').is(':visible')) {
    centerOffsetH = $('#truck-data').width()
} else {
    centerOffsetV = $(window).height() / 4
}

// See here for source and discussion of following mixin
// https://github.com/Leaflet/Leaflet/issues/859
MapCenterOffsetMixin = {
    UIOffset: [centerOffsetH, centerOffsetV], // x, y
    getBounds: function(){
        var a=this.getPixelBounds(),
            b=this.unproject(new L.Point(a.min.x+this.UIOffset[0],a.max.y+this.UIOffset[1]), this._zoom,!0),
            c=this.unproject(new L.Point(a.max.x,a.min.y),this._zoom,!0);
            return new L.LatLngBounds(b,c)
    },
    _latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
        var targetPoint = this.project(newCenter, newCenter).subtract([this.UIOffset[0]/2, this.UIOffset[1]/2]),
            newCenter = this.unproject(targetPoint, newZoom);
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
    },
    _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize().divideBy(2).add([this.UIOffset[0]/2, this.UIOffset[1]/2]));
    },
    _resetView: function (a, b, c, d) {
        var e = this._zoom !== b;
        // Change the center
        var targetPoint = this.project(a, b).subtract([this.UIOffset[0] / 2, this.UIOffset[1]/2]),
            a = this.unproject(targetPoint, b);
        d || (this.fire("movestart"), e && this.fire("zoomstart")), this._zoom = b, this._initialTopLeftPoint = this._getNewTopLeftPoint(a);
        if (!c) L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
        else {
            var f = L.DomUtil.getPosition(this._mapPane);
            this._initialTopLeftPoint._add(f)
        }
        this._tileLayersToLoad = this._tileLayersNum, this.fire("viewreset", {
            hard: !c
        }), this.fire("move"), (e || d) && this.fire("zoomend"), this.fire("moveend"), this._loaded || (this._loaded = !0, this.fire("load"))
    }
}

L.Map.include(MapCenterOffsetMixin);
*/

// Map imagery attribution
// Note that mapbox.js provides its own separate attribution, which I don't know how to edit, so I've hidden it with CSS (super hacky!) 
var control = L.control.attribution({
    prefix: 'Map imagery by <a href=\'http://www.mapbox.com/about/maps/\' target=\'_blank\'>MapBox</a>. Data &copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>.'
}).addTo(map)

// Set up icons for markers

var markerIconSize =    [36, 62], // size of the icon
    markerIconAnchor =  [18, 50], // point of the icon which will correspond to marker's location
    markerPopupAnchor = [0, -55]  // point from which the popup should open relative to the iconAnchor

var truckMarker = L.icon({
    iconUrl: 'img/pin-food.png',

    iconSize:     markerIconSize,
    iconAnchor:   markerIconAnchor,
    popupAnchor:  markerPopupAnchor
})

var truckMarkerOff = L.icon({
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


// Get data
var data = document.data()

// This information is now also available back in main.js
var locations = data.locations // this is a GeoJSON format
var trucks = data.trucks
var calendar = data.calendar

// Populate map with locations
var markers = L.mapbox.markerLayer(locations, {
    filter: function (feature) {
        return true
        // disabled active filter
        // return feature.properties.active === true
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

    // Popup construction and marker on
    var popupHTML = 'No truck at <strong>' + marker.feature.properties.name + '</strong><br>' + marker.feature.properties.address
    if (marker.truck) {
        // var popupHTML = '<strong>' + marker.truck.name + '</strong> is at <strong>' + marker.feature.properties.name + '</strong><br><span class=\'typcn typcn-location-arrow-outline\'></span>' + marker.feature.properties.address + '<br>until ' + marker.calendar.until
        
        var mPopleaf = $('#m-popleaf').html()
        var popupHTML = Mustache.render(mPopleaf, marker)

        // Turn on marker
        marker.options.icon = truckMarker
    }

    marker.bindPopup(popupHTML, {
        closeButton: false,
        minWidth: 200,
        autoPanPadding: [20, 40]
    })

    // Center marker on click
    marker.on('click', function (e) {
        map.panTo(marker.getLatLng())
    })

}).addTo(map)

// Set the bounding area for the map
map.fitBounds(markers.getBounds().pad(0.5), {
    paddingTopLeft: [centerOffsetH, centerOffsetV]
})
map.setMaxBounds(markers.getBounds().pad(6))

// Open popups on mouseover (test)
markers.on('mouseover', function (e) {
    e.layer.openPopup()
})

// GEOLOCATE!
// This uses the HTML5 geolocation API, which is available on
// most mobile browsers and modern browsers, but not in Internet Explorer
//
// See this chart of compatibility for details:
// http://caniuse.com/#feat=geolocation
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
            'title': '<div style=\'text-align: center; margin: 0 10px\'>You are here</div>'
        }
    })
})

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