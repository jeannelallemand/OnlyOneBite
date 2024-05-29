
src="https://d3js.org/d3.v7.min.js";
src="https://d3js.org/d3-scale-chromatic.v2.min.js";
src="https://d3js.org/d3-geo-projection.v3.min.js";

var svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(150)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Data and color scale
var colorScale2 = d3.scaleThreshold()
    .domain([0.1, 10, 100, 300, 1000])
    .range(["#DCE2F5", "#C0D2FE", "#96B2F5", "#4C77E1", "#001AFF"]);

var colorScale1 = d3.scaleThreshold()
    .domain([1, 10, 100, 1000, 1000])
    .range(["#DCE2F5", "#C4C1FE", "#A08EF5", "#8660FF", "#6B46E1"]);

var colorScale = colorScale2;
var csvData = [];
var currentDataset = "assets/data/incidence-of-malaria.csv";

function loadData(dataset) {
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv(dataset)
    ]).then(function (values) {
        var topo = values[0];
        var data = values[1];
        csvData = data;
        ready(topo);
    }).catch(function (error) {
        throw error;
    });
}
function ready(topo) {
    // Draw the map
    svg.selectAll("*").remove();
    var map = svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
        .attr("d", path.projection(projection))
        .attr("fill", "#DCE2F5");

    function updateMap(year) {
        var yearData = csvData.filter(function (d) {
            return +d.Year === year;
        });

        var yearMap = new Map();
        yearData.forEach(function (d) {
            yearMap.set(d.code, +d.pop);
        });

        map.attr("fill", function (d) {
            var pop = yearMap.get(d.id) || 0;
            return colorScale(pop);
        });
    }

    var slider = d3.select("#yearSlider")
        .on("input", function () {
            updateMap(+this.value);
        });

    // Initial map update with the current slider value
    updateMap(+slider.property("value"));
}

document.getElementById("dengueButton").addEventListener("click", function () {
    csvData = [];
    currentDataset = "assets/data/dengue_cases2.csv";
    loadData(currentDataset);
    colorScale = colorScale1;
});

document.getElementById("malariaButton").addEventListener("click", function () {
    csvData = [];
    currentDataset = "assets/data/incidence-of-malaria.csv";
    loadData(currentDataset);
    colorScale = colorScale2;
});

// Load initial dataset
loadData(currentDataset);