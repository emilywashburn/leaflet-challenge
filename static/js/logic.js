let url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create function to determine marker colour by earthquake depth
function colors(depth) {
  if (depth < 10) return "green";
  else if (depth < 30) return "yellow";
  else if (depth < 50) return "orange";
  else if (depth < 70) return "red";
  else if (depth < 90) return "blue";
  else return "purple";
}

// Create function to determine marker size by earthquake magnitude
function magmarkers(magnitude) {
  return magnitude * 30000;
}

// Create empty array to store earthquake markers
let markers = [];

d3.json(url).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Create popup that describes the place and time of the earthquake and create earthquake circle markers
  function onEachFeature(feature, layer) {
    markers.push(
      L.circle(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        {
          stroke: true,
          weight: 0.5,
          fillOpacity: 0.5,
          fillColor: colors(feature.geometry.coordinates[2]),
          radius: magmarkers(feature.properties.mag),
        }
      ).bindPopup(
        `<h3>${
          feature.properties.place
        }</h3><hr><div>Magnitude: ${feature.properties.mag.toLocaleString()}. Depth: ${feature.geometry.coordinates[2].toLocaleString()} metres.</div><p>${new Date(
          feature.properties.time
        )}</p>`
      )
    );
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers
  let street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  // Create baseMaps object to contain the streetmap 
  let baseMaps = {
    Street: street,
  };
  // Create layer group for earthquake marker
  let eqLayer = L.layerGroup(markers);
  let overlayMaps = {
    Earthquakes: eqLayer,
  };

  // Create initial blank map
  let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [street, eqLayer],
  });

  // Create layer control containing baseMaps and overlayMaps, add them to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let limits = [
      "-10-10", "10-30", "30-50", "50-70", "70-90", "90+",
    ];
    let colors = [
      "green", "yellow", "orange", "red", "blue", "purple",
    ];

    for (let i = 0; i < limits.length; i++) {
      div.innerHTML += `<div><i style="background:${colors[i]}"></i> 
            ${limits[i]}</div>`;
    }
    return div;
  };
  legend.addTo(myMap);
}