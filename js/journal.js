"use strict";
/**
 * checkDetails function
 * runs when button is clicked
 * sends the user to the journal details page
 * @param {number} vacation category index in Journal
 */

function checkDetails(vacation)
{
    //store data in LS
    localStorage.setItem(VACATIONS_KEY,vacation);

    //redirect to Journal Details page
    window.location = "journalDetails.html";
}

/**
 * displayVacations function
 * updates journal.html with latest list of planned vacations
 */
function displayVacations(journal)
{
    let finalOutput = "";
    //for each vacationIndex, add a new row
    let allVacations = journal.plannedVacations;
    for(let i = 0; i < allVacations.length; i++)
    {
        let htmlPart = `
        <tr>
            <td>${allVacations[i]._friendlyName}</td>
            <td>${allVacations[i]._beginDate.substring(0,10)}</td>
            <td>${allVacations[i]._navigation._startAddress}</td>
            <td>${vehicleType(allVacations[i]._vehicleRange)}</td>
            <td>${allVacations[i]._navigation._distance.toFixed(0)}km</td>
            <td>${allVacations[i]._navigation._pois.length}</td>
            <td>
                    <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" onclick ="checkDetails(${i})">
                        <i class="material-icons">visibility</i>
                    </button>
            </td>
        </tr>`;

        finalOutput += htmlPart;
    }

    document.getElementById("plannedVacationsData").innerHTML = finalOutput; 
}   

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

//Sort vacations by date
function sortByDate(journal)                 
{   
    for (let i = 0; i < journal._plannedVacations.length; i++)
    {   
        if(journal._plannedVacations[i+1] != null)
            {
                let date1 = new Date(journal._plannedVacations[i]._beginDate.substring(0,10));
                let date2 = new Date(journal._plannedVacations[i+1]._beginDate.substring(0,10));
                let dateDiff = date1 - date2;

                if (dateDiff > 0)
                {   
                    let counter = i;
                    let temp = [];
                    temp = journal._plannedVacations[counter];
                    journal._plannedVacations[counter] = journal._plannedVacations[counter+1];
                    journal._plannedVacations[counter+1] = temp;
                    i = -1;
                }
            }
    }
}

//function to redirect upon clicking on the hyperlink
function planNewVacation()
{
    //redirect to new vacation page
    window.location = "newVacation.html";
}


//Run when screen loads
sortByDate(vacationsJournal);
displayVacations(vacationsJournal);
