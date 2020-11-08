
// This module acts as a wrapper for the Star Wars API, for filtering and manipulating data, before returning to the main app

import axios from "axios";
const BASE_URL = "https://swapi.dev/api/";

// The keys will be planets' urls, the values will be an object with name and population
var planetData  = {};
// Each key is a resident (people) link, and the value is a planet from the planets object, where the resident resides.
var residentsToPlanets = new Map();

// A function to populate the above variables. Calls finishedCallback once done
function mapPlanets(next=null, finishedCallback) {
    if (!next) next = BASE_URL + "planets";
    axios.get(next).then(
        response=> {
            for (let planet of response.data.results) {
                planetData[planet.url] = { name: planet.name, population: Number(planet.population) };
                planet.residents.forEach(resident=> residentsToPlanets.set(resident, planet.url));
            }
            if (response.data.next) mapPlanets(response.data.next, finishedCallback);
            else finishedCallback();
        },
        err=> {
            console.log (err);
        }
    );
};

// Get next vehicles, filters in only vehicles with pilots
function getPilotedVehicles(next=null) {
    return new Promise((resolve,reject)=> {
        axios.get(next ? next : BASE_URL + 'vehicles')
        .then(
            response=> { 
                resolve ({
                    next: response.data.next || null,
                    vehicles: response.data.results ? response.data.results.filter(vehicle=>vehicle.pilots.length) : null
                });
            },
            err=> {
                console.log ("ERROR getting vehicles: " + err);
                reject(err);
            }
        );
    });
}

// A function to return the vehicle of which the summary of the populations of home planets of its pilots is the largest.
export function maxHomeplanetsPopulationVehicle() {
    return new Promise((resolve, reject)=> {
        mapPlanets(null, async ()=> {
            let maxPopulation = 0, 
                vehiclesResult = { next: null, vehicles: null };

            let resultInfo = {
                vehicleName: "",
                homePlanets: [],
                pilots: [],
                pilotNames: []
            };

            do {
                // Get the next "page" of vehicles that have pilots
                vehiclesResult = await getPilotedVehicles(vehiclesResult.next);
                for (let vehicle of vehiclesResult.vehicles) {
                    let homeplanetsPopulationSum = 0, planets = new Set(), planet;
                    for (let pilotURL of vehicle.pilots) {
                        // planet is an object with { name, population }
                        planet = planetData[residentsToPlanets.get(pilotURL)];
                        planets.add(planet);
                        homeplanetsPopulationSum += planet.population;
                    }
                    if (homeplanetsPopulationSum > maxPopulation) {
                        maxPopulation = homeplanetsPopulationSum;
                        resultInfo.vehicleName = vehicle.name;
                        resultInfo.homePlanets = Array.from(planets);
                        resultInfo.pilots      =  vehicle.pilots;
                    }
                }

            }
            while (vehiclesResult.next);

            // Get pilot names
            var getNamesPromises = [];
            for (let pilotURL of resultInfo.pilots) {
                getNamesPromises.push (
                    axios.get(pilotURL)
                    .then( response=> { resultInfo.pilotNames.push(response.data.name); } )
                );
            }

            Promise.all(getNamesPromises)
            .then(
                ()=> {
                    resolve(resultInfo);
                }
            );
        });
    });
}

// A function to get the names and population amounts of planets
function getPlanetData(api_url) {
    return new Promise((resolve,reject)=> {
        axios.get(api_url)
        .then (
            response=> {
                resolve ({
                    planetData: response.data.results.map(planet=> ({ name:planet.name, amount:planet.population})),
                    next: response.data.next
                });
            }
        );
    });
}
   
    
export function getAllPlanetData() {
    return new Promise(async (resolve, reject)=> {
        var planetData = [],
            next = BASE_URL + 'planets';

        while (next) {
            let data = await getPlanetData(next);
            Array.prototype.push.apply(planetData, data.planetData);
            next = data.next;
        }
        resolve (planetData);
    });
}

