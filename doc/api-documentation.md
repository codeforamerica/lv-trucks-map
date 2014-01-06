# Food trucks map data documention and API reference

This repository contains the front-end user interface for the food trucks map. It is designed to be a static, single-page application that can be run from any server environment that serves web pages over HTTP (e.g. [GitHub Pages](http://pages.github.com/), where it is currently hosted). Program logic either happens on the client-side (particularly when it affects the view or presentation of data), or on a separate [back-end component](https://github.com/codeforamerica/food_trucks) (used primarily for data management and logging) that the front-end interacts with through a public API. This separation of concerns allows the different pieces of the application to be developed and maintained independently of each other, and each component can designed to best suit the technology available or target user group(s). 

To ensure that the application system as a whole operates smoothly, communication between the front-end and back-end is essential. This documentation outlines how the front-end expects to communicate with the back-end.


## General specifications

The back-end server location is set in a configuration variable ``API_SERVER``. By default, it is set to ``http://lv-food-trucks.herokuapp.com/api/``. It should include the ``http://`` portion, the full host name (e.g. ``lv-food-trucks.herokuapp.com``), and any portion of the path that is shared by the API (e.g. ``/api``) plus a trailing slash ``/``.

The front-end makes asynchronous HTTP GET requests to the back-end server location. (For more information about how this call is made, refer to the [jQuery documentation on its AJAX method](http://api.jquery.com/jquery.ajax/). We also [polyfill jQuery with the Microsoft-specific XDomainRequest functionality](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest) so that the application can successfully retrieve data in Internet Explorer 8 and 9.)

The data is returned from the back-end in [JSON format](http://www.json.org/). We do not support data returned as JSONP ([JSON with padding](http://en.wikipedia.org/wiki/JSONP)), which was a necessity on Internet Explorer 8, but the XDomainRequest polyfill takes care of this issue for us. We will go into more detail on the data schema of these JSON responses in the _Data model_ section below.

## Data model

The front-end needs to know three things: (1) the locations of food truck spots, (2) the food truck vendors themselves, and (3) the schedule of which vendors are at which spots and when. To obtain this information, it asks for each from the back-end using separate API calls when the application is first loaded into the browser.

Lastly, a fourth API is needed for submitting the feedback form. Unlike the first three, this is not a request made on page load, but rather a POST request that occurs when a user submits a form. It does not receive any information from the back-end server.

The following describes the schema of each JSON request that is either received from, or sent to, the back-end API. The path to each request is set in configuration variables in accordance with the back-end API.

### Locations API

The locations response adheres to the [GeoJSON specification](http://geojson.org/). This allows any open-source map-based application, not just the Food Trucks Map, to make use of the response returned by the API. We will only cover portions of this response that the Food Trucks Map requires.

#### Sample response
```
{
    "type": "FeatureCollection",
    "features": [
        {
            "id": 1,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    "-115.148586",
                    "36.168154"
                ]
            },
            "properties": {
                "name": "City Hall",
                "address": "1 Lewis Ave., Las Vegas, NV 89101",
                "current_vendor_id": null
            }
        },
        {
            "id": 2,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    "-115.14793",
                    "36.164935"
                ]
            },
            "properties": {
                "name": "Bonneville Transit Center",
                "address": "100 E. Bonneville Ave., Las Vegas NV 89101",
                "current_vendor_id": 2
            }
        },
        {
            "id": 3,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    "-115.145243",
                    "36.166723"
                ]
            },
            "properties": {
                "name": "Regional Justice Center",
                "address": "400 South 3rd St., Las Vegas NV 89101",
                "current_vendor_id": [3, 6, 9]
            }
        }
    ]
}
```

The response above will cause the map to automatically zoom and pan to the bounding box of all the points that are returned. Administrators can add an arbitrary number of points and the map should still function correctly.

``id`` This is an ID number for the location. It is used by the Timeslots API to match vendors to their respective locations.
``geometry`` This is a required member of a GeoJSON feature object.
- ``coordinates`` This must reside within the ``geometry`` member, as defined by the GeoJSON specification, and is an array containing a longitude (x) and latitude (y) pair. Note that the GeoJSON specification requires this data in a number format, but currently our back-end returns them as strings. Regardless, it is parsed correctly by our map library.
``properties`` This is a required member of a GeoJSON feature object. All other properties related to the location belongs here. The following are utilized by the Food Trucks Map:
- ``name`` The name of the location to be displayed.
- ``address`` The address of the location to be displayed. Although not required, this should be something that returns a result in Google Maps so people can obtain directions to it.
- ``current_vendor_id`` This is the ID of any vendors currently at the location, if any. It should correspond with the vendor ID returned by the Vendor API. The back-end server is responsible for checking with any real-time parking interface (in downtown Las Vegas, this is the Parkeon parking meter API) and reporting this information to the front end in this location. If there is no current vendor, the value returned is ``null``. If there is one vendor, only a single ID is necessary. If this is a location that allows multiple vendors, this can be returned as an array of IDs, eg. ``[3, 6, 9]``.





