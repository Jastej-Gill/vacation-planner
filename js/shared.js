//This file contains the classes and setup code
"use strict";

//Navigation class
class Navigation 
{
    constructor(startAddress = "", startLocation = {lat: 0, lng: 0}, pois = [], distance = 0, route = []) 
    {   
       this._startAddress = startAddress;
       this._distance = distance;
       this._startLocation = startLocation; 
       this._route = route; 
       this._pois = pois;
    }

    get startLocation(){return this._startLocation};
    get startAddress(){return this._startAddress};
    get distance(){return this._distance};

    /**
     * @param {object} location
     */
     set startAddress(address)
     {
        this._startAddress = address;
     }

    set startLocation(location)
    {
       this._startLocation = location;
    }

    /**
     * @param {number} newDistance
     */
    set distance(newDistance)
    {
        this._distance = newDistance;
    }

   
    removePoi(poiIndex)
    {
        this._pois.splice(poiIndex, 1);
    }
    
    fromData(data)
    {
        this._startAddress = data._startAddress;
        
        this._startLocation = data._startLocation;
        
        this._distance = data._distance;
        
        this._pois = [];
        for(let i = 0; i < data._pois.length; i++)
        {
            let poi = {
                coordinates: [data._pois[i].coordinates[0], data._pois[i].coordinates[1]],
                description: data._pois[i].description,
                address: data._pois[i].address,
                category: data._pois[i].category
            }
            this._pois.push(poi);
        }

        this._route = [];
        for(let i = 0; i < data._route.length; i++)
        {
            let coordinate = data._route[i];
            this._route.push(coordinate)
        }
        
    }
}

//Code for planned vacations
class PlannedVacation 
{
    constructor(beginDate = new Date(2000, 10, 2), friendlyName = "", vehicleRange = 0, navigation = new Navigation)
    {
        this._beginDate = beginDate;
        this._friendlyName = friendlyName;
        this._vehicleRange = vehicleRange;
        this._navigation = navigation;
    }

    get beginDate(){return this._beginDate;}
    get friendlyName(){return this._friendlyName;}
    get vehicleRange(){return this._vehicleRange;}
    
    set beginDate(newBeginDate)
    {
        this._beginDate = newBeginDate;
    }

    set friendlyName(newFriendlyName)
    {
        this._friendlyName = newFriendlyName;
    }

    set vehicleRange(newVehicleRange)
    {
        this._vehicleRange = newVehicleRange;
    }

    addNavigation(navigation)
    {
        if(navigation instanceof Navigation){
             this._navigation = navigation;
        }
    }
    //Methods
    addPoi(poiLongitude, poiLatitude, poiDescription, poiAddress, poiCategory)
    {
        let newPoi = {coordinates: [poiLongitude, poiLatitude], description: poiDescription, address:poiAddress, category: poiCategory};
        this._navigation._pois.push(newPoi);
    }

    fromData(data)
    {
        this._beginDate = data._beginDate;
        this._friendlyName = data._friendlyName;
        this._vehicleRange = data._vehicleRange;
        let navigation = new Navigation();
        navigation.fromData(data._navigation);
        this._navigation = navigation;
        
    }
}



//Code for Journal class
class Journal
{
    constructor()
    {
        this._plannedVacations = [];
    }

    get plannedVacations(){return this._plannedVacations;}

    addVacation(newVacation)
    {
        if(newVacation instanceof PlannedVacation){
            this._plannedVacations.push(newVacation)
        }
        
    }

    removeVacation(vacationIndex)
    {
        this._plannedVacations.splice(vacationIndex,1);
    }

    getVacation(vacationIndex)
    {
        return this._plannedVacations[vacationIndex];
    }

    fromData(data)
    {
        this._plannedVacations = [];

        for(let i = 0; i < data._plannedVacations.length; i++)
        {
            let vacation = new PlannedVacation;
            let vacationData = data._plannedVacations[i]
            vacation.fromData(vacationData);
            this._plannedVacations.push(vacation);
        }
    }
}


/**
 * checkLSData function
 * Used to check if any data in LS exists at a specific key
 * @param {string} key LS Key to be used
 * @returns true or false representing if data exists at key in LS
 */
function checkLSData(key)
{
    if (localStorage.getItem(key) != null)
    {
        return true;
    }
    return false;
}
/**
 * retrieveLSData function
 * Used to retrieve data from LS at a specific key. 
 * @param {string} key LS Key to be used
 * @returns data from LS in JS format
 */
function retrieveLSData(key)
{
    let data = localStorage.getItem(key);
    try
    {
        data = JSON.parse(data);
    }
    catch(err){}
    finally
    {
        return data;
    }
}
/**
 * updateLSData function
 * Used to store JS data in LS at a specific key
 * @param {string} key LS key to be used
 * @param {any} data data to be stored
 */
function updateLSData(key, data)
{
    let json = JSON.stringify(data);
    localStorage.setItem(key, json);
}

let vacationsJournal = new Journal; // Global variable for list of vacations

// Check if data available in LS before continuing
if (checkLSData(JOURNAL_KEY))
{
    // If data exists, retrieve it
    let data = retrieveLSData(JOURNAL_KEY);
    // Restore data into inventory
    vacationsJournal.fromData(data);
}
