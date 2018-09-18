import React, { Component } from 'react';
import GeoJsonLoader from './GeoJsonLoader';
import Country from './Country';
import JSZip from 'jszip';
import { getCountryName, processCountries } from './utils/geojsonUtils';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            countries: [],
            filter: 'spain',
        };

        this.handleJsonLoad = this.handleJsonLoad.bind(this);
        this.filterChanged = this.filterChanged.bind(this);
        this.downloadAll = this.downloadAll.bind(this);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Country Shape generator</h1>
                </header>
                <div className="App-intro">
                    <GeoJsonLoader onLoad={ this.handleJsonLoad }/>
                    <div>
                        <button onClick={ this.downloadAll }>Download all</button>
                    </div>

                    <div>
                    {
                        !!this.state.countries.length &&
                        <React.Fragment>
                            <div>
                                <label>
                                    Filter by:
                                    <input value={ this.state.filter } onChange={ this.filterChanged } />
                                </label>
                            </div>
                            <div className="App-countries">
                                {
                                    this.state.countries
                                        .filter(country => countryContainsFilter(country, this.state.filter))
                                        .map((country) =>
                                            <Country
                                                key={country.country_code}
                                                countryInfo={country}
                                                ></Country>
                                        )
                                }
                            </div>
                        </React.Fragment>
                    }
                    </div>
                </div>
            </div>
        );
    }

    handleJsonLoad(geojson) {
        // TODO check geojson is correct
        this.setState({
            countries: processCountries(geojson.features)//.filter(country => country.properties.NAME === 'Spain'),
        })
    }

    filterChanged(event) {
        this.setState({
            filter: event.target.value,
        });
    }

    downloadAll() {
        const zip = new JSZip();
        zip.file("hello.txt", "Hello World\n");
        zip.generateAsync({type:"base64"})
            .then((base64) => {
                window.location = "data:application/zip;base64," + base64;
            }, (err) => {
                console.warn(err);
            });
    }

}

function countryContainsFilter(country, filter) {
    if(!filter) {
        return true;
    }
    const countryName = getCountryName(country);
    return countryName.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
}

export default App;
