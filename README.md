lv-trucks-map
=============

Public-facing map for City of Las Vegas mobile food vendor app.

Food truck applications are not new. However, they generally rely on scraping Twitter feeds or asking vendors to update a calendar through an administration interface. This one demonstrates how food truck information can be reported in real time using city resources and communication channels.

In July of 2013, the City of Las Vegas (a Code for America partner city) installed new electronic parking meters throughout Downtown. They also started a new six-month pilot program for officially designated spots at these meters for food trucks. The city recognized that the new meters could report what truck was parked where, and when, and use it as a code enforcement tool in conjunction with their mobile food vendor program. Working together with the city, we intend to show that it could also be used for public benefit as well.

While the API from these parking meters are owned and operated by Parkeon, the city's parking meter vendor, we would hope that information such as this could become publicly accessible, and feed directly into other food truck app developers, who would be able to provide a much more robust experience for truck customers.

There are two components to this software. This is the front end public facing map. An administration interface for the city to manage location, vendors, and scheduling is located [here][back-end].

[back-end]: http://github.com/rclosner/food_trucks/

## Visit the live site

You can see a running version of the application [here][live].

[live]: http://codeforamerica.github.io/lv-trucks-map/

## Usage / Installation

This the front end is all Javascript and HTML5; just load into a browser and run. The back-end is a Rails server; see [that page][back-end] for details.

If you need to customize the stylesheet, ```css/styles.css``` is auto-generated from ```css/styles.less```.  You can use a LESS compiler of choice.

## Contributing
In the spirit of [free software][free-sw], **everyone** is encouraged to help
improve this project.

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