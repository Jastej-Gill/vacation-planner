/* this file shows the first page and second page of planning a new vacation 
Key functions are   : 1.Vehicle type option function
                      2. Select friendly name and date for vacation
                      3.categorize Poi types fuction
                      4. Warning check function
                      5. Distance between two points and total distance calculator function
                      6. Geocoding functions
                      7. Poi search function 
                      8. function to display marker and draw route on the map 
*/

// Global variables
// currentLocation used to store user's starting location before saving into local storage
// lat is latitude number, lng is longitude number and address is string of starting location address
let currentLocation = { lat: 0, lng: 0, address: "" };
// used to store a single poi object
let poiLocation = {};
// Global array to store locations
let locations = [];
// searchPoiLocations is an array to store temporary poi objects when user searches for pois
let searchPoiLocations = [];
// array used to store confirmed and added poi objects
let poiLocations = [];
// global variable to store poi category selected by user in poi radio input
let query = "";
// array used to store all markers added to the map by user
let markers = [];
// array used to store temporary markers when user searches for poi area
let tempMarkers = [];
// array used to store coordinates of route polyline displayed on map
let routeCoordinates = [];
// index of vacation in vacationsJournal object's planned vacations array
let index = retrieveLSData(VACATIONS_KEY);
// boolean to prevent user from adding pois if route and pois added are not feasible
let feasible = true;

// Functions for newVacation.html
/**
 * processRadioInputsVehicleType function
 * Runs when the next button is clicked in newVacation.html.
 * Saves vehicle range associated with the vehicle type into local storage
 */
function processRadioInputsVehicleType() {
    let vehicleRange = 0;
    let vehicleType = document.getElementsByName("options");
    if (vehicleType[0].checked) {
        vehicleRange = 1000;
    }

    else if (vehicleType[1].checked) {
        vehicleRange = 850;
    }

    else if (vehicleType[2].checked) {
        vehicleRange = 600;
    }

    else if (vehicleType[3].checked) {
        vehicleRange = 450;
    }
    return vehicleRange;
}

/**
 * confirmAddVacation1 function
 * Runs when the search icon button of an item is clicked in newVacation.html.
 * Uses user input for date, friendly name and vehicle type to create a vacation object.
 * Saves vacation object into global journal object vacationsJournal and saves journal into local storage.
 */
function confirmAddVacation1() {
    let vacationNameRef = document.getElementById("vacationName");
    let vacationDateRef = document.getElementById("vacationDate");
    let vehicleRange = processRadioInputsVehicleType();

    // Check if info inputted by user is valid
    if(vacationNameRef.value.length > 0)
    {
        let vacation = new PlannedVacation;
        vacation.friendlyName = vacationNameRef.value;
        vacation.beginDate = new Date(vacationDateRef.value);
        vacation.vehicleRange = vehicleRange;

        if (confirm("Confirm vacation details?")) 
        {
        // Find index of vacation and save data to local storage
        vacationsJournal.addVacation(vacation);
        let vacationArray = vacationsJournal._plannedVacations;
        let vacationIndex = vacationArray.findIndex(vacationArray => vacationArray === vacation);
        updateLSData(VACATIONS_KEY, vacationIndex);
        updateLSData(JOURNAL_KEY, vacationsJournal);

        window.location = "newVacation2.html";
        }
    }

    else
    {
        alert("Please provide friendly name for your vacation");
    }
    

    

}

// Functions for newVacation2.html

/**
 * setDefaultStartingLocation function.
 * Runs when user loads newVacation2.html.
 * Gets users current location coordinates using geocoding API.
 * Converts coordinates into an address and sets starting location input textbox value as the user's current location address.
 */
function setDefaultStartingLocation() {
    // Get user's current location coordinates
    getUserCurrentLocationUsingGeolocation(geoLocationCurrentLocationCallback);
    // Convert user's current location coordinates into an address        
    sendWebServiceRequestForReverseGeocoding(currentLocation.lat, currentLocation.lng, "reverseGeocodeCallbackStartingLocation");
}

/**
* geoLocationCurrentLocationCallback function.
* Callback function after sending web service request for current location in setDefaultStartingLocation function.
* Gets latitude and longitude of user's current location
* @param {number} lat latitude number returned by web service request for current location.
* @param {number} lng longitude number returned by web service request for current location.   
*/
function geoLocationCurrentLocationCallback(lat, lng) {
    // Reassign global current location object
    currentLocation = { lat: lat, lng: lng, address: "" };
    // Convert current location coordinates into an address string
    sendWebServiceRequestForReverseGeocoding(currentLocation.lat, currentLocation.lng, "reverseGeocodeCallbackStartingLocation");
}

/**
 * reverseGeocodeCallbackStartingLocation function.
 * Callback function after sending web service request for reverse geocoding in setDefaultStartingLocation function.
 * Converts coordinates into an address string and sets starting location input textbox value as the user's current location address.
 * @param {object} data object returned by web service request for reverse geocoding.  
 */
function reverseGeocodeCallbackStartingLocation(data) {
    // Get address from data returned
    let address = data.results[0].formatted;
    // Check if longitude and latitude are not equal to zer
    if (address != "Null Island") {
        // Set text field for start location input as the user's current location address
        let startLocationRef = document.getElementById("startingAddress");
        startLocationRef.value = address;
    }

}

/**
 * confirmAddStartingLocation function.
 * Runs when user clicks on add location button.
 * Displays marker and saves starting location data into local storage.
 */
function confirmAddStartingLocation() {
    // Get user input for starting location's address
    let startLocationRef = document.getElementById("startingAddress");
    // Convert address input into coordinate
    sendWebServiceRequestForForwardGeocoding(startLocationRef.value, "forwardGeocodeCallbackStartingLocation");
}

/**
 * forwardGeocodeCallbackStartingLocation function.
 * Callback function after sending web service request for forward geocoding in setDefaultStartingLocation function.
 * Converts user's start location textfield input into coordinates.
 * @param {object} data object returned by web service request for forward geocoding.  
 */
function forwardGeocodeCallbackStartingLocation(data) {
    // Get coordinate from data object
    let coordinate = data.results[0].geometry;
    // Assign coordinate to vacation object's start location attribute
    vacationsJournal.plannedVacations[index]._navigation.startLocation = coordinate;

    updateLSData(JOURNAL_KEY, vacationsJournal);

    // Create location object containing start location's cordinates and descirption
    let location = { coordinates: [vacationsJournal.plannedVacations[index]._navigation.startLocation.lng, vacationsJournal.plannedVacations[index]._navigation.startLocation.lat], description: "Start Location" };
    // Push location object into global locations array and display marker and get address for start location
    if (locations.length == 0) {
        locations.push(location);
        displayStartingLocationMarkers(locations);
        getStartLocationAddress(locations[0].coordinates[1], locations[0].coordinates[0]);
    }

    // Create coordinate array for start location coordinates and pan map to start location marker
    let tempCoordinate = [vacationsJournal.plannedVacations[index]._navigation.startLocation.lng, vacationsJournal.plannedVacations[index]._navigation.startLocation.lat];
    map.panTo(tempCoordinate);
}

/**
* getStartLocationAddress function.
* Callback function after sending web service request for current location in setDefaultStartingLocation function.
* Gets latitude and longitude of a location.
* Converts the coordinate into an address String
* Runs after user click on add location marker after inputting start loation address in start location text field.
* @param {number} lat latitude number of coordinate.
* @param {number} lng longitude number of coordinate.   
*/
function getStartLocationAddress(lat, lng) {
    sendWebServiceRequestForReverseGeocoding(lat, lng, "startAddressReverseGeocodingCallback");
}

/**
 * startAddressReverseGeocodingCallback function.
 * Callback function after sending web service request for reverse geocoding in getStartLocationAddress function.
 * Converts coordinate into an address string.
 * @param {object} data object returned by web service request for reverse geocoding.  
 */
function startAddressReverseGeocodingCallback(data) {
    // Get address from data object returned.
    let address = data.results[0].formatted;
    // Assign address to starting address attribute in vacation object.
    vacationsJournal._plannedVacations[index]._navigation._startAddress = address;
    // Store address into local storage.
    updateLSData(JOURNAL_KEY, vacationsJournal);
    // Assign address to start location text field inputs.
    let startLocationRef = document.getElementById("startingAddress");
    startLocationRef.value = address;
}

/**
 * displayStartingLocationMarkers function.
 * Displays starting location marker in map using Mapbox Api
 * @param {array} locations array of location coordinates to be displayed
**/
function displayStartingLocationMarkers(locations) {
    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#CEFA05" });
        marker._draggable = true;

        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45 });
        popup.setText(location.description);

        marker.setPopup(popup);

        // Display the marker.
        marker.addTo(map);



        // Display the popup.
        popup.addTo(map);

        markers.push(marker);

        if (markers.indexOf(marker) == 0) {
            marker.on('dragend', onDragStartLocation);
        }
    }
}

/**
 * onDragStartLocation function.
 * Updates start location coordinates when start location marker is dragged by user.
**/
function onDragStartLocation() {
    // Get coordinate of new marker position.
    let lngLat = markers[0].getLngLat();
    // Save new coordinates to vacation object.
    vacationsJournal._plannedVacations[index]._navigation._startLocation.lat = ltngLa.lat;
    vacationsJournal._plannedVacations[index]._navigation._startLocation.lng = lngLat.lng;
    // Save data into local storage.
    updateLSData(JOURNAL_KEY, vacationsJournal);
    // Update start location corrdinate values in global locations array.
    locations[0].coordinates[0] = lngLat.lng;
    locations[0].coordinates[1] = lngLat.lat;
}




// mapbox access token
// retrieved from config.js
mapboxgl.accessToken = MAPBOX_KEY;
// map display
let map = new mapboxgl.Map({
    container: 'map',
    center: [101.6869, 3.139],
    zoom: 16,
    style: 'mapbox://styles/mapbox/streets-v11'
});

/**
 * searchPoi function.
 * Searches for pois in area and category inputted by user.
 * Runs when search button next to poi area address text field and poi categories radio is clicked.
**/
function searchPoi() {
    let poiAreaRef = document.getElementById("poiArea");

    // Remove any temporary markers previously displayed
    for (let i = 0; i < tempMarkers.length; i++) {
        tempMarkers[i].remove();
    }

    // Convert search are address inputted by user into coordinates
    sendWebServiceRequestForForwardGeocoding(poiAreaRef.value, "forwardGeocodeCallbackPoi");
}

/**
 * forwardGeocodeCallbackStartingLocation function.
 * Callback function after sending web service request for forward geocoding in setDefaultStartingLocation function.
 * Converts user's start location textfield input into coordinates.
 * @param {object} data object returned by web service request for forward geocoding.  
 */
function forwardGeocodeCallbackPoi(data) {
    // Assign area coordinates obtained
    let coordinate = data.results[0].geometry;
    // Get category from radio input      
    query = proccessRadioInputsPoiCategory();
    // Pan map to coordinate
    map.panTo(coordinate);
    // Search for pois in coordinate obtained
    sendXMLRequestForPlaces(query, coordinate.lng, coordinate.lat, sendXMLRequestForSearchPoiCallback);
}

/**
 * sendXMLRequestForSearchPoiCallback function.
 * Callback function after sending web service request for requesting places in forwardGeocodeCallbackPoifunction.
 * Finds poi using coordinates of address and category inputted by user.
 * @param {object} data object returned by web service request for forward geocoding.  
 */
function sendXMLRequestForSearchPoiCallback(data) {
    // Get center of poi area search results
    let poiCenter = [data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]];
    poiLocation = {};
    searchPoiLocations = [];
    // Create poi objects and push into global poiLocations array
    for (let i = 0; i < 10; i++) {
        poiLocation = { coordinates: [data.features[i].geometry.coordinates[0], data.features[i].geometry.coordinates[1]], description: data.features[i].place_name.substr(0, data.features[i].place_name.indexOf(',')), address: data.features[i].place_name, category: query };
        searchPoiLocations.push(poiLocation);
    }
    // Display pois found
    displayTempMarkers(searchPoiLocations);
    // Pan to center of search area
    map.panTo(poiCenter);
    // Display poi names in dropdown list to be selected by user
    displayPoiOptions();
}

/**
 * processRadioInputsPoiCategory function.
 * Runs when the search icon button of an item is clicked in newVacation.html.
 * Saves vehicle range associated with the vehicle type into local storage.
 */
function proccessRadioInputsPoiCategory() {
    let poiCategory = "";
    let categoriesRef = document.getElementsByName("categories");
    if (categoriesRef[0].checked) {
        poiCategory = "restaurant";
    }

    else if (categoriesRef[1].checked) {
        poiCategory = "gas station";
    }

    else if (categoriesRef[2].checked) {
        poiCategory = "lodging";
    }

    else if (categoriesRef[3].checked) {
        poiCategory = "landmark";
    }
    return poiCategory;
}


/**
 * displayTempMarkers function.
 * Displays temporary markers in map after user searches for pois using Mapbox Api
 * @param {array} locations array of location coordinates to be displayed
**/
function displayTempMarkers(locations) {
    // Create a 'LngLatBounds' with the first coordinate.
    let sw = new mapboxgl.LngLat(locations[0].coordinates[0], locations[0].coordinates[1]);
    let ne = new mapboxgl.LngLat(locations[0].coordinates[0], locations[0].coordinates[1]);
    const bounds = new mapboxgl.LngLatBounds(sw, ne);
    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#A9A9B0" });
        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45 });

        popup.setText(location.description);

        marker.setPopup(popup);

        // Display the marker.
        marker.addTo(map);

        // Display the popup.
        popup.addTo(map);

        tempMarkers.push(marker);
    }
}

/**
 * displayPoiOptions function.
 * Displays name of pois in a dropdown list after user searches for pois using Mapbox Api
**/
function displayPoiOptions() {
    let selectPoiRef = document.getElementById("selectPoi");
    let output = `<option value= "${0}">${searchPoiLocations[0].description}</option>`;
    for (let i = 1; i < searchPoiLocations.length; i++) {
        output += `<option value="${i}">${searchPoiLocations[i].description}</option>`;
    }
    // Button to confirm poi selected
    output += `<button class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored">
                    <i class="material-icons">add</i>
                </button>`

    selectPoiRef.innerHTML = output;
}

/**
 * confirmPoi function.
 * Runs when user clicks on add location button after slecting poi from dropdown list.
 * Displays poi marker, route, table, calculates distance, swap functionality and saves poi data into local storage.
 */
function confirmPoi() {
    // Get poi selected from dropdown list
    let selectedPoi = searchPoiLocations[document.getElementById("selectPoi").value];
    let tempCoordinate = selectedPoi.coordinates;

    // Check if poi has description
    if (selectedPoi.description != null) {
        // Prompt user to confirm
        if (confirm("Are you sure you want to add poi selected?")) {
            // Check if poi is feasible
            warningCheck(selectedPoi);
            if (feasible) {
                // Add poi to vacation object in vacationsJournal
                vacationsJournal._plannedVacations[index].addPoi(selectedPoi.coordinates[0], selectedPoi.coordinates[1], selectedPoi.description, selectedPoi.address, selectedPoi.category);
                // Save vacationsJournal to local storage
                updateLSData(JOURNAL_KEY, vacationsJournal);
                // Get marker with matching information as poi selected and change its color to indicate it has been added
                for (let j = 0; j < tempMarkers.length; j++) {
                    if ((tempMarkers[j]._lngLat.lng == tempCoordinate[0]) && (tempMarkers[j]._lngLat.lat == tempCoordinate[1])) {
                        // Add poi selected to global poiLocations array
                        poiLocations.push(selectedPoi);

                    }
                }
                // Display marker for poi selected
                displayPoiMarkers(poiLocations);
                // Display poi information in table
                displayPoiTable();
                // Allow user to swap poi if more than one poi addedd
                if (poiLocations.length > 1) {
                    displaySwapPoi();
                }
                // Display route to poi
                displayPoiRoute();
                // Calculate distance
                calculateTotalDistance(poiLocations);
                // Pan to poi marker added by user
                map.panTo(selectedPoi.coordinates);
            }
            // If poi added not feasible alert user
            else if (!feasible) {
                alert("Unable to add poi, distance exceeds vehicle range!")
            }
        }

    }

}

/**
 * displayPoiMarkers function.
 * Displays poi markers in map after user has added poi.
 * @param {array} locations array of location coordinates to be displayed.
 * Runs when user clicks on add location button after slecting poi from dropdown list.
**/
function displayPoiMarkers(locations) {
    //You may access the marker in the array for removing it
    for (let j = 1; j < markers.length; j++) //You can adjust the markers.length to remove the marker
    {
        markers[j].remove();
    }


    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#CEFA05" });
        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45 });
        popup.setText(location.description);

        marker.setPopup(popup);

        // Display the marker.
        marker.addTo(map);

        // Display the popup.
        popup.addTo(map);

        markers.push(marker);
    }
}

/**
 * displayPoiTable function.
 * Displays information of pois added in the form of a table.
 * Runs when user clicks on add location button after slecting poi from dropdown list.
**/
function displayPoiTable() {
    let output =

        `<table class="mdl-data-table mdl-js-data-table">
                <thead>
                    <tr>
                        <th class="mdl-data-table__cell--non-numeric">Poi Index</th>
                        <th style="text-align:center">Poi Name</th>
                        <th style="text-align:center">Address</th>
                        <th style="text-align:center">Poi Category</th>
                        <th style="text-align:center">Delete</th>
                    </tr>
                </thead>`

    let poiTableRef = document.getElementById("poiTable");
    for (let i = 0; i < poiLocations.length; i++) {
        output +=
            `<tbody>
            <tr>
                <td class="mdl-data-table__cell--non-numeric" style="text-align:center">${i}</td>
                <td style="text-align:center">${poiLocations[i].description}</td>
                <td style="text-align:center">${poiLocations[i].address}</td>
                <td style="text-align:center">${poiLocations[i].category}</td>
                <td>
                    <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" onclick = "deletePoi(${i})">
                        <i class="material-icons">clear</i>
                    </button>
                </td>`;
    }
    output +=
        `    </tbody>
       </table>`;

    poiTableRef.innerHTML = output;
}

/**
 * displaySwapPoi function.
 * Displays dropdown list with poi index to swap poi when more than one poi is added by user.
 * Runs when user clicks on add location button after slecting poi from dropdown list and adds more than one poi.
**/
function displaySwapPoi() {
    let swapPoiRef = document.getElementById("swapPoi");
    let output = ``;
    for (let i = 0; i < poiLocations.length; i++) {
        output += `<option value="${i}">${i}</option>`;
    }

    swapPoiRef.innerHTML = output;

    let swapPoiTargetRef = document.getElementById("swapPoiTarget");
    let targetOutput = ``;
    for (let i = 0; i < poiLocations.length; i++) {
        targetOutput += `<option value="${i}">${i}</option>`;
    }

    swapPoiTargetRef.innerHTML = targetOutput;
}

/**
 * swapPoi function.
 * Allows user to swap two pois.
 * Runs when user clicks on swap button next to the swapPoi dropdown list.
**/
function swapPoi() {
    // Check is poiLocations contains pois
    if (poiLocations.length > 0) {
        // Get index from dropdown list
        let swapIndex = document.getElementById("swapPoi").value;
        let swapTargetIndex = document.getElementById("swapPoiTarget").value;
        // Check if poi indexes are equivalent
        if (swapIndex != swapTargetIndex) {
            // Update poiLocations array
            let tempPoi = poiLocations[swapTargetIndex];
            poiLocations[swapTargetIndex] = poiLocations[swapIndex];
            poiLocations[swapIndex] = tempPoi;
            // Update table after swapping
            displayPoiTable();
            // Save updated array into local storage
            vacationsJournal._plannedVacations[index]._navigation._pois[swapTargetIndex] = poiLocations[swapTargetIndex];
            vacationsJournal._plannedVacations[index]._navigation._pois[swapIndex] = poiLocations[swapIndex];
            updateLSData(JOURNAL_KEY, vacationsJournal);
            // Update distance
            calculateTotalDistance(poiLocations); 
            // Update route
            displayPoiRoute();
        }
        // Alert user if poi indexes are the same 
        else {
            alert("Cannot swap poi with itself!");
        }
    }
}

/**
 * displayPoiRoute function.
 * Displays iroute between pois and starting location.
 * Runs when user clicks on add location button after slecting poi from dropdown list.
**/
function displayPoiRoute() {
    // Create temporary coordinates array to store coordinates of points in route
    let coordinates = [];
    // Empty global routeCoordinates array
    routeCoordinates = [];
    // Get start location
    let startLocation = vacationsJournal._plannedVacations[index]._navigation._startLocation;
    // Insert start location coordinates into coordinates array
    coordinates.push([startLocation.lng, startLocation.lat]);
    // Insert pois in global poiLocations array into coordinates array
    for (let i = 0; i < poiLocations.length; i++) {
        let poiCoordinate = poiLocations[i].coordinates;
        coordinates.push(poiCoordinate);
    }
    // Get coordinates of route between each pair of points using geocoding API
    for (let i = 0; i < coordinates.length - 1; i++) {
        let lat1 = coordinates[i][1];
        let lng1 = coordinates[i][0];  
        let lat2 = coordinates[i + 1][1];
        let lng2 = coordinates[i + 1][0];

        sendXMLRequestForRoute(lat1, lng1, lat2, lng2, processRouteData);
    }
}

/**
* processRouteData function.
* Callback function after sending web service request for route.
* Gets array of coordinates for route between two or more points.
* @param {object} data object returned by web service request for route.    
*/
function processRouteData(data) {
    // Assign coordinates for route between two points
    let tempCoordinates = data.routes[0].geometry.coordinates;
    // Combine coordinates to get entire route
    routeCoordinates.push(tempCoordinates);
    // Display route
    showPath();
}

/**
* showPath function.
* Draws polyline using routeCoordinates array.
* Gets array of coordinates for route between multiple points.
*/
function showPath() {
    // Create an array with all coordinates combined into a single array instead of one array for each pair of points
    let listedRouteCoordinates = [];
    // Reset route coordinates in vacation object
    vacationsJournal._plannedVacations[index]._navigation._route = [];
    for (let i = 0; i < routeCoordinates.length; i++) {
        for (let j = 0; j < routeCoordinates[i].length; j++) {
            // Ensure same coordinate not added twice
            if (routeCoordinates.includes(routeCoordinates[i][j]) === false) {      
                listedRouteCoordinates.push(routeCoordinates[i][j]);
                console.log(routeCoordinates[i][j][0]);
            }
        }
    }
    // Update route coordinates in vacation object
    vacationsJournal._plannedVacations[index]._navigation._route = listedRouteCoordinates;
    updateLSData(JOURNAL_KEY, vacationsJournal);
    // Remove prviously drawn polyline
    removeLayer("routes");
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

    for (let i = 0; i < listedRouteCoordinates.length; i++) {
        object.data.geometry.coordinates.push(listedRouteCoordinates[i]);
    }
    map.addLayer({
        id: "routes",
        type: "line",
        source: object,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#00ECFA", "line-width": 6 }
    });
}

/**
* removeLayer function.
* Removes polyline if polyline with layerId exists.
* @param {String} layerId string of polyline id to be removed from map.
*/
function removeLayer(layerId) {
    let hasPoly = map.getLayer(layerId);
    // Check if polyline exists 
    if (hasPoly !== undefined) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
    }
}

/**
* toRad function.
* Converts number in degrees to radians.
* @param {number} value number in degrees to be converted to radians.
*/
function toRad(value) {
    return value * Math.PI / 180;
}

/**
* distanceCalculator function.
* Calculates distance between two coordinates using Haversine formula.
* @param {number} lat1 latitude of first coordinate.
* @param {number} lat2 latitude of second coordinate.
* @param {number} lng1 longitude of first coordinate.
* @param {number} lng2 longitude of second coordinate.
*/
function distanceCalculator(lat1, lat2, lng1, lng2) {
    let latDelta = toRad(lat2 - lat1);
    let lngDelta = toRad(lng2 - lng1);
    let latitude1 = toRad(lat1);
    let latitude2 = toRad(lat2);
    const R = 6371;

    let a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) + (Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2) * Math.cos(latitude1) * Math.cos(latitude2));
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

/**
* calculateTotalDistance function.
* Calculates distance between multiple coordinates using distanceCalculator function for each pair of points.
* @param {array} poiArray array of poi objects.
**/
function calculateTotalDistance(poiArray) {
    // Reset distance and vehicleRange to initial values
    let distance = 0;
    let vehicleRange = vacationsJournal._plannedVacations[index]._vehicleRange;
    let distanceRef = document.getElementById("distance");
    let vehicleRangeRef = document.getElementById("vehicleRange");

    // Get start location coordinates
    let startLocationCoords = [vacationsJournal._plannedVacations[index]._navigation._startLocation.lng, vacationsJournal._plannedVacations[index]._navigation._startLocation.lat];
    // Initialise array for poi coordinates
    let poiCoords = [];
    // Initialise array for poi categories
    let poiCategories = [];

    // Check if poi array is undefined
    if (poiArray == undefined) {
        distanceRef.innerHTML = `<strong>Distance: ${distance.toFixed(0)}km</strong>`;
        vehicleRangeRef.innerHTML = `<strong>Remaining vehicle range: ${vehicleRange.toFixed(0)}km</strong>`;
    }

    else if (poiArray.length != 0) {
        // Populate poiCoords and poiCategories array by getting values from poiArray parameter
        for (let i = 0; i < poiArray.length; i++) {
            poiCoords.push(poiArray[i].coordinates);
            poiCategories.push(poiArray[i].category);
        }
        // Place coordinates of starting location at the beginning of the array
        poiCoords.unshift(startLocationCoords);
        // Calculate distance between each pair of coordinates
        for (let i = 0; i < poiCoords.length - 1; i++) {
            let coord1 = poiCoords[i];
            let coord2 = poiCoords[i + 1];

            distance += distanceCalculator(coord1[0], coord2[0], coord1[1], coord2[1]);
            vehicleRange -= distance;

            // If poi category is gas station, refuel car
            if (poiCategories[i] === "gas station") {
                vehicleRange = vacationsJournal._plannedVacations[index]._vehicleRange;
            }
        }

        //Check if route is feasible before saving data
        if (distance < vehicleRange) {
            // Save and display data
            vacationsJournal._plannedVacations[index]._navigation._distance = distance;
            updateLSData(JOURNAL_KEY, vacationsJournal);
            distanceRef.innerHTML = `<strong>Distance: ${distance.toFixed(0)}km</strong>`;
            vehicleRangeRef.innerHTML = `<strong>Remaining vehicle range: ${vehicleRange.toFixed(0)}km</strong>`;
        }
        else if (distance > vehicleRange) {
            // Assign false to global boolean variable for feasible route
            feasible = false;
            // Warn user
            alert("The route's distance exceeds vehicle range!");
        }
    }
}

/**
 * warningCheck function
 * Runs when user clicks on add poi location button next to drop down list of pois.
 * Checks if route is feasible before adding poi object to poiLocations array and vacation object.
 * Calculates distance between pois.
 * @param {Object} poiObject poi object to be added to route
 */

function warningCheck(poiObject) {
    let tempPoiArray = [];
    for (let i = 0; i < poiLocations.length; i++) {
        tempPoiArray.push(poiLocations[i]);
    }
    tempPoiArray.push(poiObject);

    calculateTotalDistance(tempPoiArray);
}

/**
 * cancelVacation function
 * Runs when user clicks on cancel button.
 * Redirects user to splash page.
 * Deletes vacation saved from local storage
 */
function cancelVacation() {
    // remove vacation from vacationsJournal
    vacationsJournal.removeVacation(index);
    updateLSData(JOURNAL_KEY, vacationsJournal);
    // Redirect to homepage
    window.location = "homePage.html";
}

/**
 * cancelVacation function
 * Runs when user clicks on save button.
 * Redirects user to journal page.
 * Confirms if user wants to save vacation
 */
function confirmVacation2() {
    if (confirm("Do you want to save vacation and go to your journal?")) {
        if (poiLocations.length == 0) {
            alert("Unable to add vacation, no pois selected!")
        }
        else {
            // Redirect to journal page
            window.location = "journal.html";
        }

    }
}

/**
 * removePoi function
 * Runs when user clicks on clear button in poi table.
 * Removes poi from poiLocations array and vacation object.
 * Updates route, marker, table and swapPoi displays and recalculates distance after removal.
 * @param {number} poiIndex index of poi to be removed
 */
function deletePoi(poiIndex) {
    if (confirm("Are you sure you want to delete poi?")) {
        if (poiLocations.length != 1) {
            // Remove poi from poiLocations array
            poiLocations.splice(poiIndex, 1);
            // Remove poi from vacations journal
            vacationsJournal._plannedVacations[index]._navigation.removePoi(poiIndex);
            calculateTotalDistance(poiLocations);
            vacationsJournal._plannedVacations[index]._navigation._distance = distance;
            // Update local storage
            updateLSData(JOURNAL_KEY, vacationsJournal);
            displayStartingLocationMarkers(locations);
            markers[poiIndex + 1].remove();
            displayPoiMarkers(poiLocations);
            displayPoiRoute();
            displayPoiTable();
            // Update distance

        }
        // If zero remaining pois 
        else if ((poiLocations.length == 1) && (poiIndex == 0)) {
            // Assign poiLocations to empty array
            poiLocations = [];
            // Remove route
            removeLayer("routes");
            // Remove poi marker
            markers[poiIndex + 1].remove();
            // Ensure starting location marker is still displayed
            displayStartingLocationMarkers(locations);
            // Update marker, route and table display
            displayPoiMarkers(poiLocations);
            displayPoiRoute();
            displayPoiTable();
            // Update vactionsJournal object
            distance = 0;
            vacationsJournal._plannedVacations[index]._navigation._distance = distance;
            vacationsJournal._plannedVacations[index]._navigation._pois = [];
            // Update local storage
            updateLSData(JOURNAL_KEY, vacationsJournal);
            // Update distance
            let distanceRef = document.getElementById("distance");
            let vehicleRangeRef = document.getElementById("vehicleRange");

            distanceRef.innerHTML = "";
            vehicleRangeRef.innerHTML = "";
        }

    }

}

