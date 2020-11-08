import React from 'react';
import './App.css';
import { maxHomeplanetsPopulationVehicle, getAllPlanetData } from './swapi';
import Chartbar from './Chartbar';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      maxPopulationVehicleInfo: null,
      planetData: null
    };
  }

  async componentDidMount() {
    const maxInfo    = await maxHomeplanetsPopulationVehicle();
    const planetData = await getAllPlanetData();
    console.log (planetData);
    this.setState({
      loading: false,
      maxPopulationVehicleInfo: maxInfo,
      planetData
    });
  }

  render() {
    return (
      <div id="container">
        { 
        this.state.loading ? 
          <div> Loading, please wait... </div>
          :
          <div>
            <h1>Part 1:</h1>
            <table border="1">
              <tbody>
                <tr>
                  <th> Vehicle name with the largest pilots' home planets' population sum: </th>
                  <td>{ this.state.maxPopulationVehicleInfo.vehicleName }</td>
                </tr>
                <tr>
                  <th> Related home planets and their respective population: </th>
                  <td> [{ this.state.maxPopulationVehicleInfo.homePlanets.map(planetObj=>
                          <div>
                            <span>Name: {planetObj.name}</span>, &nbsp; 
                            <span>Population: {planetObj.population}</span>
                            </div>) 
                      } ]
                  </td>
                </tr>
                <tr>
                  <th> Related pilot names: </th>
                  <td> { this.state.maxPopulationVehicleInfo.pilotNames } </td>
                </tr>
              </tbody>
            </table>

            <h1>Part 2:</h1>
            
            <div className="barchart-container">
            { this.state.planetData.map(planet=> 
              <Chartbar amount={planet.amount} name={planet.name} key={planet.name} />)
            }
            </div>

          </div>
        }
      </div>
    );
  }
}

export default App;
