# China map data

`china-provinces-full.geojson` is a local copy of the DataV GeoAtlas
`100000_full.json` province-level dataset. It is stored locally so the Maps
page does not depend on DataV availability at runtime. The copy was obtained
from the MIT-licensed `lqb-zh/geojson-chinadata` mirror.

`china-city-data.js` supplies the city and province names currently loaded by
Maps. `china-cities.json` and `china-provinces.json` are retained as local
reference data for possible future use after entering the China view; the
current page does not load those two JSON files directly. Keep them unless the
owner approves a data cleanup.
