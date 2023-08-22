// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function markerSize(mag){
    return mag * 5;
}

function getColor(depth) {
    if (depth < 10) {
      return "#00FF00";
    } else if (depth < 30) {
      return "greenyellow";
    } else if (depth < 50) {
      return "yellow";
    } else if (depth < 70) {
      return "#orange";
    } else if (depth < 90) {
      return "#orangered";
    } else {
      return "#FF0000";
    }
  }

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p>
    <hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        let markers = {
            radius: markerSize(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
        }
        return L.circleMarker(latlng, markers);
    }
  });
  createMap(earthquakes);
}

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (){
    var div = L.DomUtil.create('div', 'info legend'),
    depth = [0, 10, 30, 50, 70, 90];
    div.innerHTML += "<h3 style='text-align: center;'>Depth</h3>"
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML += "<i style='background:" + getColor(depth[i]) + "'></i> " + depth[i] + (depth[i + 1]? "&ndash;" + depth[i + 1] + "<br>" : "+");
    }
    return div;
};
legend.addTo(myMap);

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

}