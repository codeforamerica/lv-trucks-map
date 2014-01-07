# Back-end interaction / API reference

### NOTE: WORK IN PROGRESS DO NOT RELY ON THIS YET

This repository contains the front-end user interface for the food trucks map. It is designed to be a static, single-page application that can be run from any server environment that serves web pages over HTTP (e.g. [GitHub Pages](http://pages.github.com/), where it is currently hosted). Program logic either happens on the client-side (particularly when it affects the view or presentation of data), or on a separate [back-end component](https://github.com/codeforamerica/food_trucks) (used primarily for data management and logging) that the front-end interacts with through a public API. This separation of concerns allows the different pieces of the application to be developed and maintained independently of each other, and each component can designed to best suit the technology available or target user group(s). 

To ensure that the application system as a whole operates smoothly, communication between the front-end and back-end is essential. This documentation outlines how the front-end expects to communicate with the back-end.


## General specifications

The back-end server location is set in a configuration variable ``API_SERVER``. By default, it is set to ``http://lv-food-trucks.herokuapp.com/api/``. It should include the ``http://`` portion, the full host name (e.g. ``lv-food-trucks.herokuapp.com``), and any portion of the path that is shared by the API (e.g. ``/api``) plus a trailing slash ``/``.

The front-end makes asynchronous HTTP GET requests to the back-end server location. (For more information about how this call is made, refer to the [jQuery documentation on its AJAX method](http://api.jquery.com/jquery.ajax/). We also [polyfill jQuery with the Microsoft-specific XDomainRequest functionality](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest) so that the application can successfully retrieve data in Internet Explorer 8 and 9.)

The data is returned from the back-end in [JSON format](http://www.json.org/). We do not support data returned as JSONP ([JSON with padding](http://en.wikipedia.org/wiki/JSONP)), which was a necessity on Internet Explorer 8, but the XDomainRequest polyfill takes care of this issue for us. We will go into more detail on the data schema of these JSON responses in the _Data model_ section below.

## Data model

The front-end needs to know three things: (1) the locations of food truck spots, (2) the food truck vendors themselves, and (3) the schedule of which vendors are at which spots and when. To obtain this information, it asks for each from the back-end using separate API calls when the application is first loaded into the browser.

Lastly, a fourth API is needed for submitting the feedback form. Unlike the first three, this is not a request made on page load, but rather a POST request that occurs when a user submits a form. It does not receive any information from the back-end server.

The following describes the schema of each JSON request that is either received from, or sent to, the back-end API. The path to each request is set in configuration variables in accordance with the back-end API. Because JSON responses can contain additional information (e.g. other properties), the actual responses returned by the API may appear different than the sample responses below. We will only describe the properties that are absolutely required by the front-end to ensure a good user experience.

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
- Additional properties that should be exposed publicly will go here in side the ``properties`` object.

To make sure a GeoJSON response is valid, here is a [GeoJSON linter](http://geojsonlint.com/).

### Vendors API

The Vendors API is an array of hashes whose properties describe each vendor currently in the program. Any number of vendors can be provided.

#### Sample response
```
[
    {
        "id": 16,
        "name": "A1 Mobile Catering",
        "cuisine": "",
        "website": "https://www.facebook.com/pages/A1-Mobile-Catering/169430916432920",
        "logo_url": null
    },
    {
        "id": 6,
        "name": "Sauced",
        "cuisine": "New American Comfort Food",
        "website": "www.saucedvegas.com/",
        "logo_url": null
    },
    {
        "id": 13,
        "name": "ABreast of Vegas Chicken",
        "cuisine": "Fresh All Breast Meat",
        "website": "www.facebook.com/AbvChickentruck",
        "logo_url": null
    },
    {
        "id": 10,
        "name": "Hawaiian Shaved Ice",
        "cuisine": "Shaved Ice",
        "website": "www.hawaiianshavedicelasvegas.com",
        "logo_url": null
    }
]
```

* ``id`` (required) The ID of the vendor. This is used to associate with the ``current_vendor_id`` provided by the Locations API as well as ``vendor_id`` in the Timeslots API.
* ``name`` (required) The name of the vendor to display.
* ``cuisine`` (optional) The type of food the vendor serves. 
* ``website`` (optional) The website for the the vendor.
* ``logo_url`` (optional) A URL to an image of the vendor's logo. It is used in an ``img`` tag and is valid as long as the browser is able to reach the location (either as a relative path, absolute path or a full URL). (SEE NOTE #2)

**NOTE:** The actual response will contain many more additional properties that are available from the current back-end administration system, such as ``phone``, ``email``, ``contact_name``, or ``business_license_number``. Some of this is extremely handy for other functions, such as administrative tasks, and is used to create the e-mail list for the [daily schedule notification system](https://github.com/codeforamerica/lv-trucks-notifier). Only the properties currently used by the Food Trucks Map is listed in the sample response above.

**NOTE #2:** Currently, the image file for ``logo_url`` is not being maintained or stored by the back-end. Instead, a work-around / hack is utilized on the front-end. This was done to test this functionality before baking it into the data structure utilized on the back-end (which would also necessitate some infrastruture for file upload or basic image editing). Since this data is not being provided by the back-end, it is currently stored on the front-end site, with URL data being injected into the response as soon as it is retrieved from the API. Work will need to be done on both the front end and back end applications to improve this functionality.

### Timeslots API

#### Sample response
```
[
    {
        "id": 81,
        "location_id": 3,
        "vendor_id": 6,
        "start_at": "2014-01-23T10:00:00-08:00",
        "finish_at": "2014-01-23T14:00:00-08:00",
        "vendor": {
            "business_license_number": "M25-000240-4-160618",
            "contact_name": "Mike Booth",
            "created_at": "2013-06-26T21:36:35-07:00",
            "cuisine": "New American Comfort Food",
            "email": "mike@saucedvegas.com",
            "id": 6,
            "name": "Sauced ",
            "phone": "702-539-3553",
            "updated_at": "2013-07-29T07:52:23-07:00",
            "website": "www.saucedvegas.com/"
        }
    },
    {
        "id": 91,
        "location_id": 3,
        "vendor_id": 16,
        "start_at": "2014-01-10T10:00:00-08:00",
        "finish_at": "2014-01-10T14:00:00-08:00",
        "vendor": {
            "business_license_number": "M25-0070-4-083579",
            "contact_name": "John Margaretis",
            "created_at": "2013-07-24T06:25:45-07:00",
            "cuisine": "",
            "email": "a1mobilecatering@yahoo.com",
            "id": 16,
            "name": "A1 Mobile Catering",
            "phone": "702-452-5229",
            "updated_at": "2013-07-28T16:17:49-07:00",
            "website": "https://www.facebook.com/pages/A1-Mobile-Catering/169430916432920"
        }
    },
    {
        "id": 92,
        "location_id": 3,
        "vendor_id": 16,
        "start_at": "2014-01-24T10:00:00-08:00",
        "finish_at": "2014-01-24T14:00:00-08:00",
        "vendor": {
            "business_license_number": "M25-0070-4-083579",
            "contact_name": "John Margaretis",
            "created_at": "2013-07-24T06:25:45-07:00",
            "cuisine": "",
            "email": "a1mobilecatering@yahoo.com",
            "id": 16,
            "name": "A1 Mobile Catering",
            "phone": "702-452-5229",
            "updated_at": "2013-07-28T16:17:49-07:00",
            "website": "https://www.facebook.com/pages/A1-Mobile-Catering/169430916432920"
        }
    },
    {
        "id": 113,
        "location_id": 3,
        "vendor_id": 22,
        "start_at": "2014-01-29T10:00:00-08:00",
        "created_at": "2013-07-29T09:34:42-07:00",
        "vendor": {
            "business_license_number": "M25-00258-4-165223",
            "contact_name": "Ashley Hoff",
            "created_at": "2013-07-24T06:38:26-07:00",
            "cuisine": "Gourmet Hot Dogs",
            "email": "Ashley@sincitydogs.com",
            "id": 22,
            "name": "Sin City Dogs",
            "phone": "702-513-7699",
            "updated_at": "2013-07-29T21:36:59-07:00",
            "website": "www.sincitydogs.com/"
        }
    },
    {
        "id": 118,
        "location_id": 3,
        "vendor_id": 19,
        "start_at": "2014-01-09T10:00:00-08:00",
        "finish_at": "2014-01-09T14:00:00-08:00",
        "vendor": {
            "business_license_number": "M25-00237-4-161739",
            "contact_name": "JoAnn Bronson",
            "created_at": "2013-07-24T06:31:15-07:00",
            "cuisine": "Tex-Mex-Fresh",
            "email": "jobron@aol.com",
            "id": 19,
            "name": "Señor Blues",
            "phone": "702-610-4472",
            "updated_at": "2013-07-29T21:36:19-07:00",
            "website": "www.senorbluesmobile.com/"
        }
    },
    {
        "id": 65,
        "location_id": 3,
        "vendor_id": 22,
        "start_at": "2014-01-07T10:00:00-08:00",
        "finish_at": "2014-01-07T14:00:00-08:00",
        "vendor": {
            "business_license_number": "M25-00258-4-165223",
            "contact_name": "Ashley Hoff",
            "created_at": "2013-07-24T06:38:26-07:00",
            "cuisine": "Gourmet Hot Dogs",
            "email": "Ashley@sincitydogs.com",
            "id": 22,
            "name": "Sin City Dogs",
            "phone": "702-513-7699",
            "updated_at": "2013-07-29T21:36:59-07:00",
            "website": "www.sincitydogs.com/"
        }
    }
]
```




### Feedback API

This is a POST request sent to the back-end server's Feedback API. It should be formatted like so:

#### Sample request
```
{
    "feedback": {
        "category": "app",
        "body": "This is the content of the feedback to be sent.",
        "email": "user@domain.com"
    }
}
```

* ``category`` (required) The type of feedback provided, so that the back-end can determine whether this is application feedback (for the developers) or food truck program feedback (for the city). The valid values are ``app`` or ``city``. It is possible for the front-end to provide extra values; it will be the responsibility of the back-end to validate and sort appropriately.
* ``body`` (required) A string containing the text of the feedback. The front-end currently limits the length of this string to 2048 characters to prevent responses that are egregiously large.
* ``email`` (optional) A string containing the e-mail of the user. The front-end uses HTML5 form validation to check for a valid e-mail address.

When POSTed, it is the responsibility of the back-end server to validate the request and accept or reject. The server does not return anything except for an HTTP status code which the front end relies on to determine whether the request has succeeded or failed.

### The end



