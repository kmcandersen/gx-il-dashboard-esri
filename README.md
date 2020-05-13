# Illinois Highway-Rail Grade Crossing Collision Dashboard

---

This interactive, responsive dashboard allows users to explore Federal Railroad Administration collision data for Illinois highway-rail grade crossings (where a highway crosses a railroad at grade level). The dashboard shows collision locations and other crossings on a map, lists crossing and collision details, and displays charts of crossing-specific and systemwide data. Users can view data for specific crossings by clicking the crossing on the map, selecting a crossing from the list of "Priority Crossings" (those with three or more collisions during the time range), or searching by crossing ID number or street name.

The dashboard is built with the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) and [Chart.js](https://www.chartjs.org/).

The project originated during a four-day solo hackathon as part of Fullstack Academy's Software Engineering Immersive Program, and I continued to improve the dashboard after graduation.

---

## Data sources

Federal Railroad Administration Office of Safety Analysis

- [Highway Rail Accidents](https://safetydata.fra.dot.gov/OfficeofSafety/publicsite/on_the_fly_download.aspx) (Jan. 2015 - Oct. 2019)
- [Highway-Rail Crossing Database](https://safetydata.fra.dot.gov/OfficeofSafety/publicsite/DownloadCrossingInventoryData.aspx)

Note: The dashboard excludes crossings inside rail yards.
