/*************************************************************************
//
// CONFIGURATION
// User editable options (global variables)
//
// ***********************************************************************/

var DATE_PROGRAM_START  = 'August 1, 2013',
    DATE_PROGRAM_END    = 'February 1, 2014'

var API_SERVER          = 'http://lv-food-trucks.herokuapp.com/api/'
                          // local environments use 'http://localhost:3000/'

var API_LOCATIONS       = 'locations/search.geojson',
    API_VENDORS         = 'vendors.json',
    API_TIMESLOTS       = 'time_slots.json',
    API_FEEDBACK        = 'feedbacks'

var MAPBOX_ID           = 'codeforamerica.map-wzcm8dk0',
    MAPBOX_ID_RETINA    = 'codeforamerica.map-dfs3qfso'

var MAP_INIT_LATLNG     = [36.1665, -115.1479],
    MAP_INIT_ZOOM       = 16,
    MAP_FIT_PADDING     = 0.25,
    MAP_MAX_PADDING     = 6
