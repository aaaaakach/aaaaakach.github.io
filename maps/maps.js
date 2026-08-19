const travelData = {
  visitedCountries: [
    { code: "CHN", name: "China", visited: true },
    { code: "FRA", name: "France", visited: true },
    { code: "GBR", name: "United Kingdom", visited: true },
    { code: "ITA", name: "Italy", visited: true },
    { code: "JPN", name: "Japan", visited: true },
    { code: "KOR", name: "South Korea", visited: true },
    { code: "NLD", name: "Netherlands", visited: true },
    { code: "USA", name: "United States of America", visited: true }
  ],
  provinceRegions: [
    { code: "110000", name: "Beijing" }, { code: "310000", name: "Shanghai" },
    { code: "330000", name: "Zhejiang" }, { code: "440000", name: "Guangdong" },
    { code: "510000", name: "Sichuan" }
  ],
  cities: [
    { code: "110100", name: "北京市", countryCode: "CHN", countryName: "China", provinceCode: "110000", provinceName: "北京市", lat: 39.9042, lng: 116.4074 },
    { code: "310100", name: "上海市", countryCode: "CHN", countryName: "China", provinceCode: "310000", provinceName: "上海市", lat: 31.2304, lng: 121.4737 },
    { code: "330100", name: "杭州市", countryCode: "CHN", countryName: "China", provinceCode: "330000", provinceName: "浙江省", lat: 30.2741, lng: 120.1551 },
    { code: "440100", name: "广州市", countryCode: "CHN", countryName: "China", provinceCode: "440000", provinceName: "广东省", lat: 23.1291, lng: 113.2644 },
    { code: "510100", name: "成都市", countryCode: "CHN", countryName: "China", provinceCode: "510000", provinceName: "四川省", lat: 30.5728, lng: 104.0668 }
  ],
  pins: []
};

const visitedCountries = travelData.visitedCountries.filter(country => country.visited);
const visitedProvinces = travelData.provinceRegions.filter(province =>
  travelData.cities.some(city => city.provinceCode === province.code));
const updatePlaces = () => {
  const currentCountries = travelData.visitedCountries.filter(country => country.visited);
  document.querySelector("#country-count").textContent = currentCountries.length;
  document.querySelector("#city-count").textContent = travelData.cities.length;
  document.querySelector("#places-country-count").textContent = currentCountries.length;
  document.querySelector("#places-city-count").textContent = travelData.cities.length;
};

updatePlaces();
console.assert(Number(document.querySelector("#country-count").textContent) === visitedCountries.length);

const shell = document.querySelector(".maps-shell");
const stage = document.querySelector("#globe");
const status = document.querySelector("#globe-status");
const chinaView = document.querySelector("#china-view");
const chinaMap = document.querySelector("#china-map");
const chinaStatus = document.querySelector("#china-status");
const provinceGroup = document.querySelector("#china-provinces");
const chinaPinGroup = document.querySelector("#china-pins");
const worldReturn = document.querySelector("#world-return");
const planeLaunch = document.querySelector("#plane-launch");
const toPanel = document.querySelector("#to-panel");
const destinationForm = document.querySelector("#destination-form");
const destinationInput = document.querySelector("#destination");
const destinationList = document.querySelector("#destination-list");
const destinationStatus = document.querySelector("#destination-status");
const flightPlane = document.querySelector("#flight-plane");
const impactRipple = document.querySelector("#impact-ripple");
const pinLaunch = document.querySelector("#pin-launch");
const pinPanel = document.querySelector("#pin-panel");
const pinForm = document.querySelector("#pin-form");
const pinLatitude = document.querySelector("#pin-latitude");
const pinLongitude = document.querySelector("#pin-longitude");
const pinNote = document.querySelector("#pin-note");
const pinStatus = document.querySelector("#pin-status");
const pinLabel = document.querySelector("#pin-label");
const dataStatus = document.querySelector("#data-status");
const card = document.querySelector("#memory-card");
const cardType = document.querySelector("#memory-type");
const cardTitle = document.querySelector("#memory-title");
const cardNote = document.querySelector("#memory-note");
const photos = document.querySelector("#memory-photos");
const line = document.querySelector("#leader-line");
const linePath = line.querySelector("path");
const memoryEdit = document.querySelector("#memory-edit");
const memoryForm = document.querySelector("#memory-form");
const memoryName = document.querySelector("#memory-name");
const memoryNoteInput = document.querySelector("#memory-note-input");
const memoryPhotoInput = document.querySelector("#memory-photo-input");
const memoryExistingPhotos = document.querySelector("#memory-existing-photos");
const memoryCancel = document.querySelector("#memory-cancel");
const memoryStatus = document.querySelector("#memory-status");
const pinDelete = document.querySelector("#pin-delete");
const placesOpen = document.querySelector("#places-open");
const placesPanel = document.querySelector("#places-panel");
const placesClose = document.querySelector("#places-close");
const countryList = document.querySelector("#country-list");
const cityList = document.querySelector("#city-list");
const countryAddForm = document.querySelector("#country-add-form");
const countryAdd = document.querySelector("#country-add");
const countryAddList = document.querySelector("#country-add-list");
const cityAddForm = document.querySelector("#city-add-form");
const cityAdd = document.querySelector("#city-add");
const cityAddList = document.querySelector("#city-add-list");
const placesStatus = document.querySelector("#places-status");
const visitedCodes = new Set(visitedCountries.map(country => country.code));
const visitedProvinceCodes = new Set(visitedProvinces.map(province => province.code));
const countryCode = feature => feature.properties.ADM0_A3 || feature.properties.ISO_A3;
const countryName = feature => feature.properties.ADMIN || feature.properties.NAME;
const provinceCode = feature => String(feature.properties.adcode);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const supabaseConfig = window.MAPS_SUPABASE || {};
let database = null;
let editMode = false;
let editingPinId = null;
let memoryEditing = false;

if (!window.Globe) {
  status.textContent = "The globe could not be loaded.";
} else {
  let viewMode = "world";
  let hoveredCountry = null;
  let selectedCountry = null;
  let hoveredProvince = null;
  let selectedProvince = null;
  let dragging = false;
  let hoverExitTimer;
  let chinaLoaded = false;
  let worldFeatures = [];
  let provinceFeatures = [];
  let chinaCities = [];
  let chinaCitiesPromise = null;
  let chinaProjection = null;
  const provincePaths = new Map();

  const isVisitedCountry = feature => feature && visitedCodes.has(countryCode(feature));
  const isVisitedProvince = feature => feature && visitedProvinceCodes.has(provinceCode(feature));
  const activeRegion = () => viewMode === "china"
    ? selectedProvince || hoveredProvince
    : selectedCountry || hoveredCountry;

  const collectPoints = (coordinates, points = []) => {
    if (typeof coordinates[0] === "number") points.push(coordinates);
    else coordinates.forEach(item => collectPoints(item, points));
    return points;
  };

  const municipalities = new Map([
    ["110000", { name: "北京市", lat: 39.9042, lng: 116.4074 }],
    ["120000", { name: "天津市", lat: 39.0842, lng: 117.201 }],
    ["310000", { name: "上海市", lat: 31.2304, lng: 121.4737 }],
    ["500000", { name: "重庆市", lat: 29.563, lng: 106.5516 }]
  ]);
  const normalizeChinaCity = city => {
    const municipality = municipalities.get(city.provinceCode);
    if (!municipality) return city;
    return { ...city, name: municipality.name, provinceName: municipality.name, lat: municipality.lat, lng: municipality.lng };
  };
  const cityLabel = city => `${city.name}, ${city.provinceName}`;
  const findChinaCity = query => {
    const normalized = query.trim().toLocaleLowerCase();
    return chinaCities.find(city => {
      if (cityLabel(city).toLocaleLowerCase() === normalized) return true;
      const municipality = municipalities.get(city.provinceCode);
      return municipality && (city.name.toLocaleLowerCase() === normalized
        || city.name.replace(/市$/, "").toLocaleLowerCase() === normalized);
    });
  };
  const syncProvinceVisits = () => {
    const codes = new Set(travelData.cities.map(city => city.provinceCode));
    visitedProvinces.splice(0, visitedProvinces.length,
      ...travelData.provinceRegions.filter(region => codes.has(region.code)));
    visitedProvinceCodes.clear();
    visitedProvinces.forEach(region => visitedProvinceCodes.add(region.code));
  };

  const loadChinaCities = () => {
    if (chinaCitiesPromise) return chinaCitiesPromise;
    // china-division 2.7.0: 2023 National Bureau of Statistics-derived province/city codes (WTFPL).
    chinaCitiesPromise = Promise.resolve().then(async () => {
      const { cities, provinces } = window.CHINA_CITY_DATA || {};
      if (!Array.isArray(cities) || !Array.isArray(provinces)) throw new Error("China city data unavailable");
      const provinceNames = new Map(provinces.map(province => [String(province.code), province.name]));
      chinaCities = cities.map(city => normalizeChinaCity({
        code: `${city.code}00`,
        name: city.name,
        countryCode: "CHN",
        countryName: "China",
        provinceCode: `${city.provinceCode}0000`,
        provinceName: provinceNames.get(String(city.provinceCode)) || String(city.provinceCode),
        lat: null,
        lng: null
      }));
      return chinaCities;
      const supplementalProvinces = new Map([
        ["710000", "台湾省"], ["810000", "香港特别行政区"], ["820000", "澳门特别行政区"]
      ]);
      supplementalProvinces.clear();
      const supplementalData = await Promise.all([...supplementalProvinces].map(async ([code, name]) => {
        try {
          const response = await fetch(`data/${code}_full.json`);
          if (!response.ok) return [];
          const data = await response.json();
          return data.features.map(feature => ({
            code: String(feature.properties.adcode), name: feature.properties.name,
            countryCode: "CHN", countryName: "China", provinceCode: code, provinceName: name,
            lng: Number(feature.properties.center?.[0]), lat: Number(feature.properties.center?.[1])
          }));
        } catch { return []; }
      }));
      chinaCities.push(...supplementalData.flat().filter(city =>
        city.code && !chinaCities.some(existing => existing.code === city.code)));
      return chinaCities;
    }).catch(() => {
      reportPersistenceError("The complete China city list is temporarily unavailable.");
      return [];
    });
    return chinaCitiesPromise;
  };

  const resolveCityCoordinates = async city => {
    if (Number.isFinite(city.lat) && Number.isFinite(city.lng)) return city;
    const feature = provinceFeatures.find(item => provinceCode(item) === city.provinceCode);
    const center = feature?.properties?.center || feature?.properties?.centroid;
    if (!center) throw new Error("City coordinate is missing");
    city.lng = Number(center[0]);
    city.lat = Number(center[1]);
    return city;
  };

  const countryCoordinates = feature => {
    const labelLat = Number(feature.properties.LABEL_Y);
    const labelLng = Number(feature.properties.LABEL_X);
    if (Number.isFinite(labelLat) && Number.isFinite(labelLng)) return { lat: labelLat, lng: labelLng };

    const points = collectPoints(feature.geometry.coordinates);
    const lngs = points.map(point => point[0]);
    const lats = points.map(point => point[1]);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
  };

  const hideMemory = () => {
    card.classList.add("is-hidden");
    line.classList.add("is-hidden");
    setTimeout(() => {
      if (!activeRegion()) card.hidden = true;
    }, reducedMotion ? 0 : 240);
  };

  const positionCard = anchor => {
    const shellBox = shell.getBoundingClientRect();
    line.setAttribute("viewBox", `0 0 ${shellBox.width} ${shellBox.height}`);
    const cardBox = card.getBoundingClientRect();
    const margin = 20;
    const gap = 38;
    const onLeft = anchor.x < shellBox.width / 2;
    let left;
    let top;

    if (shellBox.width < 720) {
      left = (shellBox.width - cardBox.width) / 2;
      top = anchor.y < shellBox.height / 2
        ? Math.min(shellBox.height - cardBox.height - 92, anchor.y + 54)
        : Math.max(margin, anchor.y - cardBox.height - 54);
    } else {
      left = onLeft ? anchor.x - cardBox.width - gap : anchor.x + gap;
      top = anchor.y - cardBox.height / 2;
    }

    left = Math.max(margin, Math.min(shellBox.width - cardBox.width - margin, left));
    top = Math.max(margin, Math.min(shellBox.height - cardBox.height - margin, top));
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;

    const edgeX = onLeft ? left + cardBox.width : left;
    const edgeY = top + cardBox.height / 2;
    const elbowX = anchor.x + (edgeX - anchor.x) * 0.55;
    linePath.setAttribute("d", `M ${anchor.x} ${anchor.y} L ${elbowX} ${anchor.y} L ${edgeX} ${edgeY}`);
  };

  const positionCountryMemory = feature => {
    if (!feature || dragging || viewMode !== "world") return;
    const shellBox = shell.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const point = countryCoordinates(feature);
    const screen = globe.getScreenCoords(point.lat, point.lng, 0.02);
    positionCard({
      x: stageBox.left - shellBox.left + screen.x,
      y: stageBox.top - shellBox.top + screen.y
    });
  };

  const positionProvinceMemory = feature => {
    if (!feature || viewMode !== "china") return;
    const path = provincePaths.get(provinceCode(feature));
    if (!path) return;
    const shellBox = shell.getBoundingClientRect();
    const pathBox = path.getBoundingClientRect();
    positionCard({
      x: pathBox.left - shellBox.left + pathBox.width / 2,
      y: pathBox.top - shellBox.top + pathBox.height / 2
    });
  };

  const photoUrl = reference => {
    if (!reference) return "";
    if (/^https?:\/\//i.test(reference)) return reference;
    return database?.storage.from(supabaseConfig.photoBucket || "map-photos").getPublicUrl(reference).data.publicUrl || "";
  };

  const renderMemory = (record, fallbackName, type, persistent, position) => {
    card.dataset.regionType = type === "Visited country" ? "country" : "province";
    card.dataset.regionCode = record?.code || "";
    memoryForm.hidden = true;
    memoryEdit.hidden = !editMode;
    memoryStatus.textContent = "";
    cardType.textContent = type;
    cardTitle.textContent = record?.name || fallbackName;
    cardNote.textContent = record?.note || "";
    cardNote.hidden = !record?.note;
    const references = Array.isArray(record?.photos) ? record.photos.slice(0, 3) : [];
    photos.replaceChildren(...[1, 2, 3].map(number => {
      const photo = document.createElement("span");
      photo.className = "memory-photo";
      const source = photoUrl(references[number - 1]);
      if (source) {
        const image = document.createElement("img");
        image.src = source;
        image.alt = `${cardTitle.textContent} travel photo ${number}`;
        image.loading = "lazy";
        image.decoding = "async";
        photo.append(image);
      } else {
        photo.setAttribute("role", "img");
        photo.setAttribute("aria-label", `${cardTitle.textContent} photo placeholder ${number}`);
      }
      return photo;
    }));
    card.hidden = false;
    card.classList.remove("is-hidden");
    line.classList.remove("is-hidden");
    requestAnimationFrame(position);
    if (persistent) card.focus({ preventScroll: true });
  };

  const showCountryMemory = (feature, persistent = false) => {
    if (!isVisitedCountry(feature) || dragging || viewMode !== "world") return;
    const record = visitedCountries.find(country => country.code === countryCode(feature));
    renderMemory(record, countryName(feature), "Visited country", persistent, () => positionCountryMemory(feature));
  };

  const showProvinceMemory = (feature, persistent = false) => {
    if (!isVisitedProvince(feature) || viewMode !== "china") return;
    const record = visitedProvinces.find(province => province.code === provinceCode(feature));
    renderMemory(record, feature.properties.name, "Visited province", persistent, () => positionProvinceMemory(feature));
  };

  const countryFill = feature => {
    if (feature === selectedCountry) return "#526FA8";
    if (feature === hoveredCountry && isVisitedCountry(feature)) return "#627FB5";
    return isVisitedCountry(feature) ? "#7391C8" : "#E3E7F1";
  };
  const refreshCountries = () => globe.polygonCapColor(countryFill);
  const refreshProvinces = () => provincePaths.forEach((path, code) => {
    const visited = isVisitedProvince(path.feature);
    path.classList.toggle("is-visited", visited);
    path.classList.toggle("is-hovered", code === provinceCode(hoveredProvince || { properties: { adcode: "" } }));
    path.classList.toggle("is-selected", code === provinceCode(selectedProvince || { properties: { adcode: "" } }));
    path.setAttribute("tabindex", visited ? "0" : "-1");
    path.setAttribute("aria-label", `${path.feature.properties.name}. ${visited ? "Visited" : "Not visited"}.`);
    if (visited) path.setAttribute("role", "button");
    else path.removeAttribute("role");
  });

  const clearSelection = () => {
    if (memoryEditing) return;
    if (viewMode === "china") {
      selectedProvince = null;
      hoveredProvince = null;
      refreshProvinces();
    } else {
      selectedCountry = null;
      hoveredCountry = null;
      refreshCountries();
    }
    hideMemory();
  };

  const projectionFor = (features, width, height, margin) => {
    const points = features.flatMap(feature => collectPoints(feature.geometry.coordinates));
    const mercator = ([lng, lat]) => {
      const safeLat = Math.max(-85, Math.min(85, lat)) * Math.PI / 180;
      return [lng * Math.PI / 180, Math.log(Math.tan(Math.PI / 4 + safeLat / 2))];
    };
    const projected = points.map(mercator);
    const lngs = points.map(point => point[0]);
    const lats = points.map(point => point[1]);
    const xs = projected.map(point => point[0]);
    const ys = projected.map(point => point[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scale = Math.min((width - margin * 2) / (maxX - minX), (height - margin * 2) / (maxY - minY));
    const xOffset = margin + (width - margin * 2 - (maxX - minX) * scale) / 2;
    const yOffset = margin + (height - margin * 2 - (maxY - minY) * scale) / 2;
    return {
      minLat,
      contains: ([lng, lat]) => lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat,
      point: coordinate => {
        const [x, y] = mercator(coordinate);
        return [xOffset + (x - minX) * scale, yOffset + (maxY - y) * scale];
      }
    };
  };

  const geometryPath = (geometry, project) => {
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    return polygons.map(polygon => polygon.map(ring => ring.map((point, index) => {
      const [x, y] = project(point);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") + " Z").join(" ")).join(" ");
  };

  const bindProvince = (path, feature) => {
    path.feature = feature;
    const visited = () => isVisitedProvince(feature);
    path.classList.toggle("is-visited", visited());
    path.setAttribute("aria-label", `${feature.properties.name}. ${visited() ? "Visited" : "Not visited"}.`);
    path.setAttribute("tabindex", visited() ? "0" : "-1");
    if (visited()) path.setAttribute("role", "button");

    const preview = () => {
      clearTimeout(hoverExitTimer);
      if (selectedProvince || !visited()) return;
      hoveredProvince = feature;
      refreshProvinces();
      showProvinceMemory(feature);
    };
    const leave = () => {
      if (selectedProvince) return;
      hoverExitTimer = setTimeout(() => {
        if (card.matches(":hover")) return;
        hoveredProvince = null;
        refreshProvinces();
        hideMemory();
      }, 120);
    };
    const select = () => {
      if (!visited()) return;
      selectedProvince = feature;
      hoveredProvince = feature;
      refreshProvinces();
      showProvinceMemory(feature, true);
    };

    path.addEventListener("pointerenter", preview);
    path.addEventListener("pointerleave", leave);
    path.addEventListener("focus", preview);
    path.addEventListener("blur", leave);
    path.addEventListener("click", event => {
      event.stopPropagation();
      select();
    });
    path.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      select();
    });
  };

  const loadChinaMap = () => {
    if (chinaLoaded) return;
    // Alibaba Cloud DataV GeoAtlas: China province boundaries, including its South China Sea representation.
    // Source terms: DataV documents the dataset as AMAP-derived and intended for learning/communication use.
    fetch("data/china-provinces-full.geojson")
      .then(response => {
        if (!response.ok) throw new Error("Province data request failed");
        return response.json();
      })
      .then(data => {
        provinceFeatures = data.features;
        const names = new Set(data.features.map(feature => feature.properties.name));
        const projection = projectionFor(data.features, 700, 620, 24);
        chinaProjection = projection;
        if (!names.has("海南省") || !names.has("台湾省") || projection.minLat > 10) {
          throw new Error("Province data is missing required geographic coverage");
        }

        data.features.forEach(feature => {
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", geometryPath(feature.geometry, projection.point));
          path.setAttribute("fill-rule", "evenodd");
          path.dataset.code = provinceCode(feature);
          provincePaths.set(provinceCode(feature), path);
          bindProvince(path, feature);
          provinceGroup.append(path);
        });
        chinaLoaded = true;
        chinaView.classList.add("is-ready");
        renderChinaPins();
        loadChinaCities();
        console.assert(names.has("海南省") && names.has("台湾省") && projection.minLat <= 10);
      })
      .catch(() => {
        chinaStatus.textContent = "The China map is temporarily unavailable.";
      });
  };

  const wait = duration => new Promise(resolve => setTimeout(resolve, duration));
  const countryAnchor = feature => {
    const shellBox = shell.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const point = countryCoordinates(feature);
    const screen = globe.getScreenCoords(point.lat, point.lng, 0.02);
    return {
      x: stageBox.left - shellBox.left + screen.x,
      y: stageBox.top - shellBox.top + screen.y
    };
  };
  const cityAnchor = city => {
    const shellBox = shell.getBoundingClientRect();
    const [x, y] = chinaProjection.point([city.lng, city.lat]);
    const point = chinaMap.createSVGPoint();
    point.x = x;
    point.y = y;
    const screen = point.matrixTransform(chinaMap.getScreenCTM());
    return {
      x: screen.x - shellBox.left,
      y: screen.y - shellBox.top
    };
  };

  const closeDestinationPanel = () => {
    toPanel.hidden = true;
    planeLaunch.setAttribute("aria-expanded", "false");
    destinationStatus.textContent = "";
  };

  const openDestinationPanel = async () => {
    if (!requireEdit()) return;
    if (viewMode !== "world" && viewMode !== "china") return;
    const isWorld = viewMode === "world";
    if (!isWorld) await loadChinaCities();
    const available = isWorld
      ? worldFeatures.filter(feature => !isVisitedCountry(feature))
      : chinaCities.filter(city => !travelData.cities.some(visited => visited.code === city.code));
    destinationList.replaceChildren(...available
      .map(item => isWorld ? countryName(item) : cityLabel(item))
      .sort((a, b) => a.localeCompare(b))
      .map(name => {
        const option = document.createElement("option");
        option.value = name;
        return option;
      }));
    destinationInput.value = "";
    destinationInput.placeholder = isWorld ? "Country" : "City, Province";
    destinationStatus.textContent = available.length ? "" : `${isWorld ? "Countries" : "Cities"} are still loading.`;
    toPanel.hidden = false;
    planeLaunch.setAttribute("aria-expanded", "true");
    destinationInput.focus({ preventScroll: true });
  };

  const animateFlight = async destination => {
    const shellBox = shell.getBoundingClientRect();
    const launchBox = planeLaunch.getBoundingClientRect();
    const start = { x: launchBox.left - shellBox.left, y: launchBox.top - shellBox.top + launchBox.height / 2 };
    const duration = reducedMotion ? 180 : 1450;
    const throwHeight = Math.max(150, Math.min(270, Math.hypot(destination.x - start.x, destination.y - start.y) * .42));
    const controls = [
      start,
      { x: start.x + (destination.x - start.x) * .18, y: start.y - throwHeight },
      { x: destination.x - (destination.x - start.x) * .12, y: destination.y - throwHeight * .58 },
      destination
    ];
    const pointAt = t => {
      const u = 1 - t;
      return {
        x: u ** 3 * controls[0].x + 3 * u ** 2 * t * controls[1].x + 3 * u * t ** 2 * controls[2].x + t ** 3 * controls[3].x,
        y: u ** 3 * controls[0].y + 3 * u ** 2 * t * controls[1].y + 3 * u * t ** 2 * controls[2].y + t ** 3 * controls[3].y
      };
    };
    const tangentAt = t => {
      const u = 1 - t;
      return {
        x: 3 * u ** 2 * (controls[1].x - controls[0].x) + 6 * u * t * (controls[2].x - controls[1].x) + 3 * t ** 2 * (controls[3].x - controls[2].x),
        y: 3 * u ** 2 * (controls[1].y - controls[0].y) + 6 * u * t * (controls[2].y - controls[1].y) + 3 * t ** 2 * (controls[3].y - controls[2].y)
      };
    };
    let previousAngle = null;
    const frameCount = reducedMotion ? 2 : 61;
    const keyframes = Array.from({ length: frameCount }, (_, index) => {
      const t = index / (frameCount - 1);
      const point = pointAt(t);
      const tangent = tangentAt(t);
      let angle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI - 180;
      if (previousAngle !== null) {
        while (angle - previousAngle > 180) angle -= 360;
        while (angle - previousAngle < -180) angle += 360;
      }
      previousAngle = angle;
      const depth = t < .42 ? 1 - .2 * (t / .42) : .8 - .72 * ((t - .42) / .58) ** 1.25;
      return {
        transform: `translate(${point.x}px,${point.y}px) rotate(${angle}deg) scale(${depth})`,
        opacity: t < .88 ? 1 : Math.max(0, (1 - t) / .12),
        offset: t
      };
    });

    flightPlane.hidden = false;
    shell.classList.add("is-flying");
    const animation = flightPlane.animate(keyframes, { duration, easing: "linear", fill: "forwards" });
    try { await animation.finished; } catch {}
    flightPlane.hidden = true;
    shell.classList.remove("is-flying");
  };

  const showImpact = async destination => {
    impactRipple.style.left = `${destination.x}px`;
    impactRipple.style.top = `${destination.y}px`;
    impactRipple.classList.remove("is-active");
    void impactRipple.offsetWidth;
    impactRipple.classList.add("is-active");
    await wait(reducedMotion ? 80 : 550);
    impactRipple.classList.remove("is-active");
  };

  const hidePinNote = () => { pinLabel.hidden = true; };
  const showPinNote = (pin, target) => {
    if (!pin.note) return;
    const shellBox = shell.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    pinLabel.textContent = pin.note;
    pinLabel.hidden = false;
    const labelBox = pinLabel.getBoundingClientRect();
    const left = Math.max(12, Math.min(shellBox.width - labelBox.width - 12,
      targetBox.left - shellBox.left + targetBox.width / 2 - labelBox.width / 2));
    const top = Math.max(12, targetBox.top - shellBox.top - labelBox.height - 8);
    pinLabel.style.left = `${left}px`;
    pinLabel.style.top = `${top}px`;
  };

  const worldPinElement = pin => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `map-pin${pin.dropping ? " is-dropping" : ""}`;
    button.textContent = "📍";
    button.dataset.pinId = pin.id;
    button.setAttribute("aria-label", pin.note ? `Map pin: ${pin.note}` : "Map pin");
    return button;
  };

  const renderChinaPins = () => {
    chinaPinGroup.replaceChildren();
    if (!chinaProjection) return;
    travelData.pins.filter(pin => chinaProjection.contains([pin.lng, pin.lat])).forEach(pin => {
      const [x, y] = chinaProjection.point([pin.lng, pin.lat]);
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "text");
      marker.classList.add("china-pin");
      if (pin.dropping) marker.classList.add("is-dropping");
      marker.setAttribute("x", x);
      marker.setAttribute("y", y);
      marker.setAttribute("text-anchor", "middle");
      marker.setAttribute("role", "button");
      marker.setAttribute("tabindex", "0");
      marker.dataset.pinId = pin.id;
      marker.setAttribute("aria-label", pin.note ? `Map pin: ${pin.note}` : "Map pin");
      marker.textContent = "📍";
      chinaPinGroup.append(marker);
    });
  };

  const renderPins = () => {
    globe.htmlElementsData([...travelData.pins]);
    renderChinaPins();
  };

  const closePinPanel = () => {
    pinPanel.hidden = true;
    pinLaunch.setAttribute("aria-expanded", "false");
    pinStatus.textContent = "";
    editingPinId = null;
    pinDelete.hidden = true;
  };

  const openPinPanel = () => {
    if (!requireEdit()) return;
    closeDestinationPanel();
    pinPanel.hidden = false;
    pinLaunch.setAttribute("aria-expanded", "true");
    pinForm.reset();
    editingPinId = null;
    pinDelete.hidden = true;
    pinLatitude.focus({ preventScroll: true });
  };

  const placePin = async event => {
    event.preventDefault();
    if (!requireEdit()) return;
    const lat = Number(pinLatitude.value);
    const lng = Number(pinLongitude.value);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      pinStatus.textContent = "Enter a valid latitude and longitude.";
      return;
    }
    if (viewMode === "china" && (!chinaProjection || !chinaProjection.contains([lng, lat]))) {
      pinStatus.textContent = "That coordinate is outside the China map.";
      return;
    }

    if (editingPinId) {
      const pin = travelData.pins.find(item => item.id === editingPinId);
      const { error } = await database.from("map_pins").update({ latitude: lat, longitude: lng, note: pinNote.value.trim() || null, updated_at: new Date().toISOString() }).eq("id", editingPinId);
      if (error) return void (pinStatus.textContent = "Pin changes were not saved.");
      Object.assign(pin, { lat, lng, note: pinNote.value.trim() });
      closePinPanel(); renderPins(); return;
    }

    closePinPanel();
    clearSelection();
    pinLaunch.disabled = true;
    globe.controls().autoRotate = false;
    if (viewMode === "world") {
      globe.pointOfView({ lat, lng, altitude: 2.45 }, reducedMotion ? 0 : 650);
      await wait(reducedMotion ? 0 : 650);
    }

    const pin = { id: crypto.randomUUID(), lat, lng, note: pinNote.value.trim(), dropping: true };
    travelData.pins.push(pin);
    renderPins();
    await wait(reducedMotion ? 0 : 560);
    pin.dropping = false;
    document.querySelectorAll(`[data-pin-id="${pin.id}"]`).forEach(marker => marker.classList.remove("is-dropping"));
    renderChinaPins();
    await persistPin(pin);
    pinLaunch.disabled = false;
    globe.controls().autoRotate = viewMode === "world" && !reducedMotion;
    pinLaunch.focus({ preventScroll: true });
  };

  const reportPersistenceError = message => {
    dataStatus.textContent = message;
    setTimeout(() => {
      if (dataStatus.textContent === message) dataStatus.textContent = "";
    }, 6000);
  };

  const persistRegion = async (record, type) => {
    if (!database) return;
    const { error } = await database.from("map_regions").upsert({
      type,
      name: record.name,
      code: record.code,
      parent_country: type === "province" ? "China" : null,
      visited: record.visited,
      note: record.note || null,
      photos: record.photos || [],
      updated_at: new Date().toISOString()
    }, { onConflict: "type,code" });
    if (error) reportPersistenceError("Saved for this visit; remote write requires administrator access.");
  };

  const persistPin = async pin => {
    if (!database) return;
    const { error } = await database.from("map_pins").upsert({
      id: pin.id,
      latitude: pin.lat,
      longitude: pin.lng,
      note: pin.note || null,
      updated_at: new Date().toISOString()
    });
    if (error) reportPersistenceError("Pin kept for this visit; remote write requires administrator access.");
  };

  const persistCity = async city => {
    if (!database) return;
    const { error } = await database.from("map_cities").upsert({
      city_code: city.code,
      city_name: city.name,
      country_code: city.countryCode,
      country_name: city.countryName,
      province_code: city.provinceCode,
      province_name: city.provinceName,
      latitude: city.lat,
      longitude: city.lng,
      updated_at: new Date().toISOString()
    }, { onConflict: "city_code" });
    if (error) reportPersistenceError("City kept for this visit; remote write requires administrator access.");
  };

  const requireEdit = () => editMode && database;
  const renderPlacesManager = async () => {
    if (!requireEdit()) return;
    await loadChinaCities();
    updatePlaces();
    countryList.replaceChildren(...travelData.visitedCountries.filter(item => item.visited).map(country => {
      const row = document.createElement("li");
      row.append(document.createTextNode(country.name));
      if (country.code !== "CHN") {
        const remove = document.createElement("button");
        remove.type = "button"; remove.textContent = "×"; remove.dataset.removeCountry = country.code;
        remove.setAttribute("aria-label", `Remove ${country.name}`); row.append(remove);
      }
      return row;
    }));
    cityList.replaceChildren(...travelData.cities.map(city => {
      const row = document.createElement("li");
      row.append(document.createTextNode(cityLabel(city)));
      const remove = document.createElement("button");
      remove.type = "button"; remove.textContent = "×"; remove.dataset.removeCity = city.code;
      remove.setAttribute("aria-label", `Remove ${cityLabel(city)}`); row.append(remove);
      return row;
    }));
    const unvisitedCountries = worldFeatures.filter(feature => !isVisitedCountry(feature));
    countryAddList.replaceChildren(...unvisitedCountries.map(feature => Object.assign(document.createElement("option"), { value: countryName(feature) })));
    cityAddList.replaceChildren(...chinaCities.filter(city => !travelData.cities.some(item => item.code === city.code)).map(city => Object.assign(document.createElement("option"), { value: cityLabel(city) })));
  };

  const openPlacesManager = async () => {
    if (!requireEdit()) return;
    await renderPlacesManager();
    placesPanel.hidden = false;
    shell.classList.add("has-places-open");
    placesClose.focus({ preventScroll: true });
  };
  const closePlacesManager = () => {
    placesPanel.hidden = true;
    shell.classList.remove("has-places-open");
    placesOpen.focus({ preventScroll: true });
  };

  const removeCountry = async code => {
    if (code === "CHN" || !requireEdit()) return;
    const { error } = await database.from("map_regions").update({ visited: false, updated_at: new Date().toISOString() }).eq("type", "country").eq("code", code);
    if (error) return reportPersistenceError("Country was not removed.");
    const record = travelData.visitedCountries.find(item => item.code === code);
    if (record) record.visited = false;
    visitedCodes.delete(code);
    visitedCountries.splice(0, visitedCountries.length, ...travelData.visitedCountries.filter(item => item.visited));
    refreshCountries(); updatePlaces(); renderPlacesManager();
  };
  const removeCity = async code => {
    if (!requireEdit()) return;
    const { error } = await database.from("map_cities").delete().eq("city_code", code);
    if (error) return reportPersistenceError("City was not removed.");
    const index = travelData.cities.findIndex(item => item.code === code);
    if (index >= 0) travelData.cities.splice(index, 1);
    syncProvinceVisits(); refreshProvinces(); updatePlaces(); renderPlacesManager();
  };

  const loadPersistentData = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey || !window.supabase?.createClient) return;
    database = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
    dataStatus.textContent = "Loading travel memories…";
    const [regionsResult, citiesResult, pinsResult] = await Promise.all([
      database.from("map_regions").select("id,type,name,code,parent_country,visited,note,photos,created_at,updated_at"),
      database.from("map_cities").select("id,city_code,city_name,country_code,country_name,province_code,province_name,latitude,longitude,created_at,updated_at"),
      database.from("map_pins").select("id,latitude,longitude,note,created_at,updated_at"),
    ]);
    const error = regionsResult.error || citiesResult.error || pinsResult.error;
    if (error) {
      database = null;
      reportPersistenceError("Travel memories are temporarily using local fallback data.");
      return;
    }

    const countries = regionsResult.data.filter(region => region.type === "country").map(region => ({
      id: region.id, code: region.code, name: region.name, visited: region.visited,
      note: region.note, photos: region.photos || []
    }));
    const provinces = regionsResult.data.filter(region => region.type === "province").map(region => ({
      id: region.id, code: region.code, name: region.name, visited: region.visited,
      note: region.note, photos: region.photos || []
    }));
    travelData.visitedCountries.splice(0, travelData.visitedCountries.length, ...countries);
    travelData.provinceRegions.splice(0, travelData.provinceRegions.length, ...provinces);
    travelData.cities.splice(0, travelData.cities.length, ...citiesResult.data.map(city => {
      const record = {
        id: city.id, code: city.city_code, name: city.city_name,
        countryCode: city.country_code, countryName: city.country_name,
        provinceCode: city.province_code, provinceName: city.province_name,
        lat: city.latitude, lng: city.longitude
      };
      return record.countryCode === "CHN" ? normalizeChinaCity(record) : record;
    }));
    travelData.cities.filter(city => city.countryCode === "CHN").forEach(city => {
      if (!travelData.provinceRegions.some(region => region.code === city.provinceCode)) {
        travelData.provinceRegions.push({ code: city.provinceCode, name: city.provinceName, visited: true });
      }
    });
    visitedCountries.splice(0, visitedCountries.length, ...countries.filter(region => region.visited));
    visitedCodes.clear();
    visitedCountries.forEach(region => visitedCodes.add(region.code));
    syncProvinceVisits();
    travelData.pins.splice(0, travelData.pins.length, ...pinsResult.data.map(pin => ({
      id: pin.id, lat: pin.latitude, lng: pin.longitude, note: pin.note || "", dropping: false
    })));
    updatePlaces();
    refreshCountries();
    refreshProvinces();
    renderPins();
    dataStatus.textContent = "";
  };

  const lightCountry = async feature => {
    const code = countryCode(feature);
    visitedCodes.add(code);
    const record = { code, name: countryName(feature), visited: true, cities: 0 };
    travelData.visitedCountries.push(record);
    visitedCountries.push(record);
    refreshCountries();
    updatePlaces();
    await persistRegion(record, "country");
  };

  const lightProvince = async (feature, city) => {
    const code = provinceCode(feature);
    let record = travelData.provinceRegions.find(region => region.code === code);
    if (!record) {
      record = { code, name: feature.properties.name, visited: true };
      travelData.provinceRegions.push(record);
    }
    record.visited = true;
    travelData.cities.push(city);
    syncProvinceVisits();
    refreshProvinces();
    await persistRegion(record, "province");
    await persistCity(city);
    updatePlaces();
  };

  const sendDestination = async event => {
    event.preventDefault();
    if (!requireEdit()) return;
    const isWorld = viewMode === "world";
    if (!isWorld && viewMode !== "china") return;
    const query = destinationInput.value.trim().toLocaleLowerCase();
    const city = isWorld ? null : findChinaCity(query);
    const feature = isWorld
      ? worldFeatures.find(item => countryName(item).toLocaleLowerCase() === query)
      : provinceFeatures.find(item => provinceCode(item) === city?.provinceCode);

    if (!feature) {
      destinationStatus.textContent = "Choose a destination from the list.";
      return;
    }
    if (isWorld ? isVisitedCountry(feature) : travelData.cities.some(visited => visited.code === city.code)) {
      destinationStatus.textContent = "That destination is already visited.";
      return;
    }

    closeDestinationPanel();
    clearSelection();
    planeLaunch.disabled = true;
    worldReturn.disabled = true;
    globe.controls().autoRotate = false;

    if (isWorld) {
      const point = countryCoordinates(feature);
      globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 2.45 }, reducedMotion ? 0 : 650);
      await wait(reducedMotion ? 0 : 520);
    }

    if (!isWorld) {
      try { await resolveCityCoordinates(city); }
      catch {
        toPanel.hidden = false;
        planeLaunch.setAttribute("aria-expanded", "true");
        destinationStatus.textContent = "That city's map coordinate is temporarily unavailable.";
        planeLaunch.disabled = false;
        worldReturn.disabled = false;
        return;
      }
    }
    const destination = isWorld ? countryAnchor(feature) : cityAnchor(city);
    await animateFlight(destination);
    if (isWorld) await lightCountry(feature);
    else await lightProvince(feature, city);
    await showImpact(destination);

    planeLaunch.disabled = false;
    worldReturn.disabled = false;
    globe.controls().autoRotate = viewMode === "world" && !reducedMotion;
    planeLaunch.focus({ preventScroll: true });
  };

  const activeRegionRecord = () => card.dataset.regionType === "country"
    ? travelData.visitedCountries.find(item => item.code === card.dataset.regionCode)
    : travelData.provinceRegions.find(item => item.code === card.dataset.regionCode);
  const setMemoryEditing = enabled => {
    memoryEditing = enabled;
    globe.controls().enabled = !enabled;
    if (enabled) globe.controls().autoRotate = false;
    else globe.controls().autoRotate = viewMode === "world" && !reducedMotion && !stage.matches(":hover");
    if (viewMode === "china") worldReturn.disabled = enabled;
  };
  const renderExistingPhotoControls = record => {
    memoryExistingPhotos.replaceChildren(...(record.photos || []).map((reference, index) => {
      const item = document.createElement("span");
      item.className = "memory-existing-photo";
      const image = document.createElement("img");
      image.src = photoUrl(reference);
      image.alt = `${record.name} travel photo ${index + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "memory-photo-delete";
      remove.textContent = "×";
      remove.dataset.photoReference = reference;
      remove.setAttribute("aria-label", `Delete ${record.name} photo ${index + 1}`);
      item.append(image, remove);
      return item;
    }));
    memoryExistingPhotos.hidden = !(record.photos || []).length;
  };
  const openMemoryEditor = () => {
    if (!requireEdit()) return;
    const record = activeRegionRecord();
    if (!record) return;
    setMemoryEditing(true);
    memoryName.value = record.name;
    memoryNoteInput.value = record.note || "";
    memoryPhotoInput.value = "";
    renderExistingPhotoControls(record);
    memoryForm.hidden = false;
    memoryName.focus({ preventScroll: true });
  };
  const deleteMemoryPhoto = async reference => {
    if (!requireEdit()) return;
    const record = activeRegionRecord();
    const originalPhotos = [...(record?.photos || [])];
    if (!record || !originalPhotos.includes(reference)) return;
    if (/^https?:\/\//i.test(reference)) {
      memoryStatus.textContent = "This photo is not stored in map-photos.";
      return;
    }
    const nextPhotos = originalPhotos.filter(photo => photo !== reference);
    memoryStatus.textContent = "Deleting photo…";
    const region = database.from("map_regions");
    const { error: recordError } = await region.update({ photos: nextPhotos, updated_at: new Date().toISOString() })
      .eq("type", card.dataset.regionType).eq("code", record.code);
    if (recordError) {
      memoryStatus.textContent = "Photo could not be deleted.";
      return;
    }
    const { error: storageError } = await database.storage.from(supabaseConfig.photoBucket || "map-photos").remove([reference]);
    if (storageError) {
      const { error: rollbackError } = await region.update({ photos: originalPhotos, updated_at: new Date().toISOString() })
        .eq("type", card.dataset.regionType).eq("code", record.code);
      memoryStatus.textContent = rollbackError ? "Photo deletion failed; reload to verify the saved card." : "Storage deletion failed; the photo was kept.";
      return;
    }
    record.photos = nextPhotos;
    renderMemory(record, record.name, card.dataset.regionType === "country" ? "Visited country" : "Visited province", true,
      () => card.dataset.regionType === "country" ? positionCountryMemory(selectedCountry) : positionProvinceMemory(selectedProvince));
    openMemoryEditor();
    memoryStatus.textContent = "Photo deleted.";
  };
  const validateMemoryPhotos = () => {
    if ([...memoryPhotoInput.files].some(file => file.size > 512000)) {
      memoryPhotoInput.value = "";
      memoryStatus.textContent = "Image must be under 500 KB.";
      return false;
    }
    return true;
  };
  const saveMemory = async event => {
    event.preventDefault();
    if (!requireEdit()) return;
    const record = activeRegionRecord();
    if (!record) return;
    const files = [...memoryPhotoInput.files].slice(0, 3);
    if (memoryPhotoInput.files.length > 3) return void (memoryStatus.textContent = "Choose no more than three photos.");
    if (!validateMemoryPhotos()) return;
    const uploaded = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-");
      const path = `${card.dataset.regionType}/${record.code}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await database.storage.from(supabaseConfig.photoBucket || "map-photos").upload(path, file, { contentType: file.type });
      if (error) return void (memoryStatus.textContent = "Photo upload failed; nothing was changed.");
      uploaded.push(path);
    }
    const next = { name: memoryName.value.trim(), note: memoryNoteInput.value.trim(), photos: files.length ? uploaded : (record.photos || []) };
    const { error } = await database.from("map_regions").update({ ...next, updated_at: new Date().toISOString() }).eq("type", card.dataset.regionType).eq("code", record.code);
    if (error) {
      if (uploaded.length) await database.storage.from(supabaseConfig.photoBucket || "map-photos").remove(uploaded);
      return void (memoryStatus.textContent = "Changes were not saved.");
    }
    if (files.length && record.photos?.length) await database.storage.from(supabaseConfig.photoBucket || "map-photos").remove(record.photos);
    Object.assign(record, next);
    setMemoryEditing(false);
    memoryForm.hidden = true;
    renderMemory(record, record.name, card.dataset.regionType === "country" ? "Visited country" : "Visited province", true,
      () => card.dataset.regionType === "country" ? positionCountryMemory(selectedCountry) : positionProvinceMemory(selectedProvince));
  };

  const editPin = pin => {
    if (!requireEdit()) return;
    editingPinId = pin.id;
    pinPanel.hidden = false;
    pinLaunch.setAttribute("aria-expanded", "true");
    pinLatitude.value = pin.lat; pinLongitude.value = pin.lng; pinNote.value = pin.note || "";
    pinDelete.hidden = false;
    pinLatitude.focus({ preventScroll: true });
  };

  const positionPlane = () => {
    const shellBox = shell.getBoundingClientRect();
    const targetBox = viewMode === "china" ? chinaMap.getBoundingClientRect() : stage.getBoundingClientRect();
    const left = Math.max(16, Math.min(shellBox.width - planeLaunch.offsetWidth - 16,
      targetBox.right - shellBox.left + 16));
    const top = Math.max(20, Math.min(shellBox.height - planeLaunch.offsetHeight - 90,
      targetBox.top - shellBox.top + targetBox.height * .25));
    planeLaunch.style.left = `${left}px`;
    planeLaunch.style.top = `${top}px`;
  };

  const enterChina = feature => {
    if (viewMode !== "world") return;
    closeDestinationPanel();
    planeLaunch.disabled = true;
    clearSelection();
    selectedCountry = feature;
    refreshCountries();
    hideMemory();
    viewMode = "transition";
    loadChinaMap();
    globe.controls().enabled = false;
    globe.controls().autoRotate = false;
    chinaView.hidden = false;
    globe.pointOfView({ lat: 35, lng: 104, altitude: 2.45 }, reducedMotion ? 0 : 800);
    requestAnimationFrame(() => shell.classList.add("is-china"));
    setTimeout(() => {
      viewMode = "china";
      selectedCountry = null;
      hoveredCountry = null;
      stage.setAttribute("aria-hidden", "true");
      planeLaunch.disabled = false;
      positionPlane();
      worldReturn.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 850);
  };

  const returnToWorld = () => {
    if (viewMode !== "china") return;
    closeDestinationPanel();
    planeLaunch.disabled = true;
    clearSelection();
    viewMode = "transition";
    shell.classList.remove("is-china");
    setTimeout(() => {
      chinaView.hidden = true;
      stage.removeAttribute("aria-hidden");
      viewMode = "world";
      globe.controls().enabled = true;
      globe.controls().autoRotate = !reducedMotion;
      planeLaunch.disabled = false;
      positionPlane();
      stage.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 850);
  };

  const globe = new Globe(stage, { rendererConfig: { antialias: true, alpha: true } })
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(false)
    .polygonAltitude(() => 0.012)
    .polygonCapColor(countryFill)
    .polygonSideColor(() => "#D5DBE8")
    .polygonStrokeColor(() => "#52688F")
    .polygonsTransitionDuration(reducedMotion ? 0 : 400)
    .polygonLabel(() => "")
    .htmlLat(pin => pin.lat)
    .htmlLng(pin => pin.lng)
    .htmlAltitude(() => 0.018)
    .htmlElement(worldPinElement)
    .onPolygonHover(feature => {
      if (viewMode !== "world") return;
      clearTimeout(hoverExitTimer);
      hoveredCountry = isVisitedCountry(feature) ? feature : null;
      refreshCountries();
      stage.setAttribute("aria-label", feature
        ? `${countryName(feature)}. ${isVisitedCountry(feature) ? "Visited" : "Not visited"}.`
        : "Interactive world globe. Drag to rotate; use arrow keys when focused.");
      if (selectedCountry) return;
      if (hoveredCountry) showCountryMemory(hoveredCountry);
      else hoverExitTimer = setTimeout(() => {
        if (!card.matches(":hover")) hideMemory();
      }, 120);
    })
    .onPolygonClick(feature => {
      if (viewMode !== "world" || !isVisitedCountry(feature)) return;
      if (countryCode(feature) === "CHN") {
        enterChina(feature);
        return;
      }
      selectedCountry = feature;
      hoveredCountry = feature;
      refreshCountries();
      showCountryMemory(feature, true);
    })
    .onGlobeClick(() => {
      if (viewMode === "world") clearSelection();
    });

  const material = globe.globeMaterial();
  material.color.set("#000000");
  material.emissive?.set("#BDC6D9");
  material.emissiveIntensity = 1;
  material.shininess = 0;
  material.depthTest = true;
  material.depthWrite = true;
  globe.renderer().setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const camera = globe.camera();
  camera.near = Math.max(1, globe.getGlobeRadius() * .01);
  camera.far = globe.getGlobeRadius() * 12;
  camera.updateProjectionMatrix();
  globe.controls().enablePan = false;
  globe.controls().autoRotate = !reducedMotion;
  globe.controls().autoRotateSpeed = 0.7;

  card.addEventListener("pointerenter", () => clearTimeout(hoverExitTimer));
  card.addEventListener("pointerleave", () => {
    if (viewMode === "china" ? !selectedProvince : !selectedCountry) {
      if (viewMode === "china") {
        hoveredProvince = null;
        refreshProvinces();
      } else {
        hoveredCountry = null;
        refreshCountries();
      }
      hideMemory();
    }
  });
  card.addEventListener("pointerdown", event => event.stopPropagation());

  globe.controls().addEventListener("start", () => {
    if (viewMode !== "world") return;
    dragging = true;
    shell.classList.add("is-dragging");
  });
  globe.controls().addEventListener("end", () => {
    if (viewMode !== "world") return;
    setTimeout(() => {
      dragging = false;
      shell.classList.remove("is-dragging");
      if (selectedCountry || hoveredCountry) showCountryMemory(selectedCountry || hoveredCountry);
    }, 300);
  });
  globe.controls().addEventListener("change", () => {
    if (!dragging && viewMode === "world" && (selectedCountry || hoveredCountry)) {
      positionCountryMemory(selectedCountry || hoveredCountry);
    }
  });

  stage.addEventListener("pointerenter", () => { globe.controls().autoRotate = false; });
  stage.addEventListener("pointerleave", () => {
    if (viewMode !== "world") return;
    globe.controls().autoRotate = !reducedMotion;
    if (!selectedCountry && !card.matches(":hover")) {
      hoverExitTimer = setTimeout(() => {
        if (card.matches(":hover")) return;
        hoveredCountry = null;
        refreshCountries();
        hideMemory();
      }, 120);
    }
  });

  chinaMap.addEventListener("pointerdown", event => {
    if (event.target === chinaMap || event.target === provinceGroup) clearSelection();
  });
  planeLaunch.addEventListener("click", () => {
    closePinPanel();
    if (toPanel.hidden) openDestinationPanel();
    else closeDestinationPanel();
  });
  toPanel.addEventListener("pointerdown", event => event.stopPropagation());
  destinationForm.addEventListener("submit", sendDestination);
  pinLaunch.addEventListener("click", () => {
    if (pinPanel.hidden) openPinPanel();
    else closePinPanel();
  });
  pinPanel.addEventListener("pointerdown", event => event.stopPropagation());
  pinForm.addEventListener("submit", placePin);
  memoryEdit.addEventListener("click", openMemoryEditor);
  memoryCancel.addEventListener("click", () => {
    memoryForm.hidden = true;
    setMemoryEditing(false);
    card.focus({ preventScroll: true });
  });
  memoryForm.addEventListener("submit", saveMemory);
  memoryPhotoInput.addEventListener("change", validateMemoryPhotos);
  memoryExistingPhotos.addEventListener("click", event => {
    const reference = event.target.dataset.photoReference;
    if (reference) deleteMemoryPhoto(reference);
  });
  placesOpen.addEventListener("click", openPlacesManager);
  placesClose.addEventListener("click", closePlacesManager);
  placesPanel.addEventListener("pointerdown", event => event.stopPropagation());
  countryList.addEventListener("click", event => {
    const code = event.target.dataset.removeCountry;
    if (code) removeCountry(code);
  });
  cityList.addEventListener("click", event => {
    const code = event.target.dataset.removeCity;
    if (code) removeCity(code);
  });
  countryAddForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!requireEdit()) return;
    const feature = worldFeatures.find(item => countryName(item).toLocaleLowerCase() === countryAdd.value.trim().toLocaleLowerCase());
    if (!feature || isVisitedCountry(feature)) return void (placesStatus.textContent = "Choose an unvisited country from the list.");
    await lightCountry(feature); countryAdd.value = ""; renderPlacesManager();
  });
  cityAddForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!requireEdit()) return;
    const city = findChinaCity(cityAdd.value);
    const feature = provinceFeatures.find(item => provinceCode(item) === city?.provinceCode)
      || (city ? { properties: { adcode: city.provinceCode, name: city.provinceName } } : null);
    if (!city || travelData.cities.some(item => item.code === city.code)) return void (placesStatus.textContent = "Choose an unvisited city from the list.");
    try { await resolveCityCoordinates(city); } catch { return void (placesStatus.textContent = "That city's coordinate is unavailable."); }
    await lightProvince(feature, city); cityAdd.value = ""; renderPlacesManager();
  });
  pinDelete.addEventListener("click", async () => {
    if (!editingPinId || !requireEdit() || !confirm("Delete this pin?")) return;
    const { error } = await database.from("map_pins").delete().eq("id", editingPinId);
    if (error) return void (pinStatus.textContent = "Pin was not deleted.");
    const index = travelData.pins.findIndex(item => item.id === editingPinId);
    if (index >= 0) travelData.pins.splice(index, 1);
    closePinPanel(); renderPins(); hidePinNote();
  });
  const delegatedPin = event => {
    const target = event.target.closest?.(".map-pin,.china-pin");
    if (!target) return null;
    const pin = travelData.pins.find(item => String(item.id) === target.dataset.pinId);
    return pin ? { pin, target } : null;
  };
  shell.addEventListener("pointerover", event => {
    const match = delegatedPin(event);
    if (match) showPinNote(match.pin, match.target);
  });
  shell.addEventListener("pointerout", event => {
    const match = delegatedPin(event);
    if (match && !match.target.contains(event.relatedTarget)) hidePinNote();
  });
  shell.addEventListener("focusin", event => {
    const match = delegatedPin(event);
    if (match) showPinNote(match.pin, match.target);
  });
  shell.addEventListener("focusout", event => {
    if (delegatedPin(event)) hidePinNote();
  });
  shell.addEventListener("click", event => {
    const match = delegatedPin(event);
    if (!match) return;
    event.stopPropagation();
    if (editMode) editPin(match.pin);
    else showPinNote(match.pin, match.target);
  });
  window.addEventListener("adminchange", event => {
    editMode = !!event.detail.editMode;
    memoryEdit.hidden = !editMode;
    if (!editMode) {
      closeDestinationPanel(); closePinPanel(); if (!placesPanel.hidden) closePlacesManager();
      memoryForm.hidden = true;
      if (memoryEditing) setMemoryEditing(false);
    }
  });
  editMode = !!window.AKACH_ADMIN?.state().editMode;
  worldReturn.addEventListener("click", returnToWorld);
  shell.addEventListener("pointerdown", event => {
    if (event.target === shell) clearSelection();
  });
  document.addEventListener("pointerdown", event => {
    if (!toPanel.hidden && !toPanel.contains(event.target) && !planeLaunch.contains(event.target)) closeDestinationPanel();
    if (!activeRegion() || stage.contains(event.target) || chinaView.contains(event.target) || card.contains(event.target) || event.target.closest("a,button,input,select,textarea")) return;
    clearSelection();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (memoryEditing) {
      memoryForm.hidden = true;
      setMemoryEditing(false);
      card.focus({ preventScroll: true });
      return;
    }
    if (!toPanel.hidden) {
      closeDestinationPanel();
      planeLaunch.focus({ preventScroll: true });
      return;
    }
    if (!pinPanel.hidden) {
      closePinPanel();
      pinLaunch.focus({ preventScroll: true });
      return;
    }
    if (activeRegion()) {
      clearSelection();
      (viewMode === "china" ? chinaMap : stage).focus?.({ preventScroll: true });
    }
  });

  const setZoomLimit = () => {
    const camera = globe.camera();
    const verticalFov = camera.fov * Math.PI / 180;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const limitingHalfFov = Math.min(verticalFov, horizontalFov) / 2;
    globe.controls().minDistance = globe.getGlobeRadius() / Math.sin(limitingHalfFov) * 1.04;
    if (camera.position.length() < globe.controls().minDistance) {
      camera.position.setLength(globe.controls().minDistance);
      globe.controls().update();
    }
  };

  const resize = () => {
    const size = stage.clientWidth;
    globe.width(size).height(size);
    setZoomLimit();
    positionPlane();
    if (viewMode === "world" && (selectedCountry || hoveredCountry)) {
      requestAnimationFrame(() => positionCountryMemory(selectedCountry || hoveredCountry));
    }
    if (viewMode === "china" && (selectedProvince || hoveredProvince)) {
      requestAnimationFrame(() => positionProvinceMemory(selectedProvince || hoveredProvince));
    }
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  stage.addEventListener("keydown", event => {
    if (viewMode !== "world" || memoryEditing) return;
    const step = event.shiftKey ? 10 : 4;
    const view = globe.pointOfView();
    if (event.key === "ArrowLeft") view.lng -= step;
    else if (event.key === "ArrowRight") view.lng += step;
    else if (event.key === "ArrowUp") view.lat = Math.min(85, view.lat + step);
    else if (event.key === "ArrowDown") view.lat = Math.max(-85, view.lat - step);
    else return;
    event.preventDefault();
    globe.pointOfView(view, reducedMotion ? 0 : 180);
  });

  // Natural Earth Admin 0 data (public domain), redistributed by the Globe.GL example dataset.
  fetch("https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
    .then(response => {
      if (!response.ok) throw new Error("Country data request failed");
      return response.json();
    })
    .then(data => {
      worldFeatures = data.features.filter(feature => countryCode(feature) !== "ATA");
      globe.polygonsData(worldFeatures);
      stage.classList.add("is-ready");
    })
    .catch(() => {
      status.textContent = "The world map is temporarily unavailable.";
    });
  loadPersistentData();
}
