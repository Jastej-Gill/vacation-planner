"use strict";
/* Vacation details
things to have: name, start date, map with full route, total distance, 
number of stops, stop details(address,type), vehicle type and range.
*/

// Global code to retrieve data to be displayed
let vacationIndex = localStorage.getItem(VACATIONS_KEY);
let selectedVacation = vacationsJournal.getVacation(vacationIndex);

//html code for POI table
let poiDetails = `<table class="mdl-data-table mdl-js-data-table">
                    <thead>
                        <tr>
                        <td style="text-align:center">Address</td>
                        <td style="text-align:center">Type of Place</td>
                        </tr>
                    <thread>
                    <tbody>`;

//Display details for each poi in vacation
let poi = selectedVacation._navigation._pois;
for (let j = 0; j < poi.length; j++) {
    if (poi.length > 0) {
        let poiHTML = `
        <tr>
            <td class="mdl-data-table__cell--non-numeric">${poi[j].address}</td>
            <td>${poi[j].category}</td>
        </tr>`;

        poiDetails += poiHTML;
    }
}

poiDetails += `
        <t/body>
    </table>
</div>`;

// Creating map
// Create location objects for markers
// Create array for location objects
let locations = [];
// Add start location to locations array
let startLocation = {coordinates: [selectedVacation._navigation._startLocation.lng, selectedVacation._navigation._startLocation.lat], description: "Starting location" };
locations.push(startLocation);
// Add poi objects to locations array                   
for (let i = 0; i < selectedVacation._navigation._pois.length; i++) {
    locations.push(selectedVacation._navigation._pois[i]);
}
// Get route coordinates
let routeCoordinates = selectedVacation._navigation._route;

function showPath(coordinates) {
    let object = {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: []
            }
        }
    };

    for (let i = 0; i < coordinates.length; i++) {
        object.data.geometry.coordinates.push(coordinates[i]);
    }
    map.addLayer({
        id: "routes",
        type: "line",
        source: object,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#00ECFA", "line-width": 6 }
    });
}

// Assign access token
mapboxgl.accessToken = MAPBOX_KEY;
// map display
let map = new mapboxgl.Map({
    container: 'map',
    center: [startLocation.coordinates[0], startLocation.coordinates[1]],
    zoom: 16,
    style: 'mapbox://styles/mapbox/streets-v11'
});

// Display route and markers after map loads
map.on('load', function () {
    // Display markers
    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#CEFA05" });
        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45 });
        popup.setText(location.description);

        marker.setPopup(popup)

        // Display the marker.
        marker.addTo(map);

        // Display the popup.
        popup.addTo(map);
    }
    // Draw route
    showPath(routeCoordinates);

});

//Data to display in table
document.getElementById("VacationName").innerHTML = `<p>${selectedVacation._friendlyName}</p>`;
document.getElementById("VacationDate").innerHTML = `<p>${selectedVacation._beginDate.substring(0, 10)}</p>`;
document.getElementById("TravelDistance").innerHTML = `<p>${selectedVacation._navigation._distance.toFixed(0)}km</p>`;
document.getElementById("numberOfStops").innerHTML = `<p>${selectedVacation._navigation._pois.length}</p>`;
document.getElementById("StopsDetails").innerHTML = poiDetails;
document.getElementById("VehicleType").innerHTML = `<p>${vehicleType(selectedVacation._vehicleRange)}</p>`;
document.getElementById("VehicleRange").innerHTML = `<p>${selectedVacation._vehicleRange.toFixed(0)}km</p>`;

//function to display vehicle type
function vehicleType(vehicleRange)
{
    if (vehicleRange == 1000){
        return "Sedan";
    }

    else if(vehicleRange == 850){
        return "SUV";
    }

    else if(vehicleRange == 600){
        return "Van";
    }

    else if(vehicleRange == 450){
        return "Minibus";
    }
}

//back button function
function back()
{
    window.location = "journal.html";
}

