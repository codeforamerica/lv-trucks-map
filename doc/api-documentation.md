# Food trucks map data documention

This repository contains the front-end user interface for the food trucks map. It is designed to be a static, single-page application that can be run from any server environment that serves web pages over HTTP (e.g. [GitHub Pages](http://pages.github.com/), where it is currently hosted). Program logic either happens on the client-side (particularly when it affects the view or presentation of data), or on a separate [back-end component](https://github.com/codeforamerica/food_trucks) (used primarily for data management and logging) that the front-end interacts with through a public API. This separation of concerns allows the different pieces of the application to be developed and maintained independently of each other, and each component can designed to best suit the technology available or target user group(s). 

To ensure that the application system as a whole operates smoothly, communication between the front-end and back-end is essential. This documentation outlines how the front-end expects to communicate with the back-end.


## General specifications

The back-end server location is set in a configuration variable ``API_SERVER``. By default, it is set to ``http://lv-food-trucks.herokuapp.com/api/``. It should include the ``http://`` portion, the full host name (e.g. ``lv-food-trucks.herokuapp.com``), and any portion of the path that is shared by the API (e.g. ``/api``) plus a trailing slash ``/``.

The front-end makes asynchronous HTTP GET requests to the back-end server location. (For more information about how this call is made, refer to the [jQuery documentation on its AJAX method](http://api.jquery.com/jquery.ajax/). We also [polyfill jQuery with the Microsoft-specific XDomainRequest functionality](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest) so that the application can successfully retrieve data in Internet Explorer 8 and 9.)

The data is returned from the back-end in [JSON format](http://www.json.org/). We do not support data returned as JSONP ([JSON with padding](http://en.wikipedia.org/wiki/JSONP)), which was a necessity on Internet Explorer 8, but the XDomainRequest polyfill takes care of this issue for us. We will go into more detail on the data schema of these JSON responses in the _Data model_ section below.


## Data model

The front-end needs to know three things: (1) the locations of food truck spots, (2) the food truck vendors themselves, and (3) the schedule of which vendors are at which spots and when. To obtain this information, it asks for each from the back-end using separate API calls when the application is first loaded into the browser.

Lastly, a fourth API is needed for submitting the feedback form. Unlike the first three, this is not a request made on page load, but rather a POST request that occurs when a user submits a form. It does not receive any information from the back-end server.

The following describes the schema of each JSON request that is either received from, or sent to, the back-end API.

### Locations

The locations response adheres to the [GeoJSON standard](http://geojson.org/). This allows any open-source map-based application, not just the Food Trucks application, to make use of the response returned by the API.


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
                "current_vendor_id": null
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
                "current_vendor_id": null
            }
        }
    ]
}
```




