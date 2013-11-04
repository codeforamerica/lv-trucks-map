lv-trucks-map
=============

![Logo](https://raw.github.com/codeforamerica/lv-trucks-map/master/apple-touch-icon.png)

Public-facing map for City of Las Vegas mobile food vendor app.

Food truck applications are not new. However, most existing apps rely on scraping social media or asking vendors to update a calendar through an administration interface. 

Code for America fellows, in partnership with the City of Las Vegas, developed this application to demonstrate how __real-time parking information__ can be utilized to provide up-to-date information that citizens can benefit from.

### Context

In July of 2013, the City of Las Vegas installed new electronic parking meters throughout Downtown. They also started a new six-month pilot program to officially designate approved spots for mobile vendors, with a corresponding lottery system to assign scheduled time slots to participating vendors. 

The city recognized that the new meters had an ability to report whether trucks had parked when they were supposed to. Their initial interest in this project was to record meter data for code enforcement purposes. However, they now recognize that this data can also be utilized for public benefit as well.

The parking meters' API, and the data retrieved from it, is owned and operated by the meter vendor, Parkeon. Through our partnership with the city, we obtain data from these meters, match it to a participating vendor, and translate it to a format that can be consumed by a front-end.

Our application shows only the designated vendor spots, and vendors participating in the City's program. However, our [scheduling admin interface][back-end] outputs its own API that is publicly accessible. Therefore, other application developers (who may use social media or other strategies to obtain food truck information) may use the real-time information to enrich their own applications.

[back-end]: http://github.com/rclosner/food_trucks/

## Visit the live site

You can see a running version of the application [here][live].

[live]: http://codeforamerica.github.io/lv-trucks-map/

## Usage / Installation

This the front end is static HTML 5 and Javascript; just load into a browser and run. It was designed to run as-is on [GitHub Pages](http://pages.github.com/).

The application relies on a second part: a Rails-based server that publishes vendor and schedule data through a public API. See the [back-end code repository][back-end] for details.

If you want to customize the stylesheet, this application reads from ```css/styles.css```, which is pre-compiled from ```css/styles.less```.  I use LiveReload to automatically generate the css file, but you can use a LESS compiler of choice.

## Contributing
In the spirit of [free software][free-sw], **everyone** is encouraged to help improve this project.

[free-sw]: http://www.fsf.org/licensing/essays/free-sw.html

Here are some ways *you* can contribute:

* by using alpha, beta, and prerelease versions
* by reporting bugs
* by suggesting new features
* by writing or editing documentation
* by writing specifications
* by writing code (**no patch is too small**: fix typos, add comments, clean up inconsistent whitespace)
* by refactoring code
* by closing [issues][]
* by reviewing patches
* [financially][]

[issues]: https://github.com/codeforamerica/lv-trucks-map/issues
[financially]: https://secure.codeforamerica.org/page/contribute

## Submitting an Issue
We use the [GitHub issue tracker][issues] to track bugs and features. Before submitting a bug report or feature request, check to make sure it hasn't already been submitted. You can indicate support for an existing issue by voting it up. When submitting a bug report, please include a [Gist][] that includes a stack trace and any details that may be necessary to reproduce the bug, including your gem version, Ruby version, and operating system. Ideally, a bug report should include a pull request with failing specs.

[gist]: https://gist.github.com/

## Submitting a Pull Request
1. Fork the project.
2. Create a topic branch.
3. Implement your feature or bug fix.
4. Commit and push your changes.
5. Submit a pull request. 

## Copyright
Copyright (c) 2013 Code for America. See [LICENSE][] for details.

See ```humans.txt``` for credits and technology colophon.

[license]: https://github.com/codeforamerica/lv-trucks-map/blob/master/LICENSE.md

[![Code for America Tracker](http://stats.codeforamerica.org/codeforamerica/lv-trucks-map.png)][tracker]

[tracker]: http://stats.codeforamerica.org/projects/lv-trucks-map
