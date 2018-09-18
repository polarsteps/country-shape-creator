import React, { Component } from 'react';
import GeoJsonLoader from './GeoJsonLoader';
import Country from './Country';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            countries: [],
        };

        this.handleJsonLoad = this.handleJsonLoad.bind(this);
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
                    {
                        !!this.state.countries.length &&
                        <div className="App-countries">
                            {
                                this.state.countries.map((country) =>
                                    <Country
                                        key={country.country_code}
                                        countryInfo={country}
                                        ></Country>
                                )
                            }
                        </div>

                    }
                    </div>
                </div>
            </div>
        );
    }

    handleJsonLoad(geojson) {
        // TODO check geojson is correct
        this.setState({
            countries: processCountries(geojson.features),
        })
    }

}

function processCountries(countries) {
    return countries
        .map(country => Object.assign({}, country, { country_code: getCountryCode(country) }))
        .filter(country => country.country_code !== null)
        .filter(country => !shouldRemoveCountry(country));
}

function getCountryCode(country) {
    if(country.properties.ISO_A2 !== '-99') {
        return country.properties.ISO_A2;
    }
    if(country.properties.FIPS_10_ !== '-99') {
        return country.properties.FIPS_10_;
    }
    if(country.properties.WB_A2 !== '-99') {
        return country.properties.WB_A2;
    }
    return null;
}

function shouldRemoveCountry(country) {
    const TYPES_TO_REMOVE = ['Dependency', 'Indeterminate'];
    const countryType = country.properties.TYPE;
    return TYPES_TO_REMOVE.includes(countryType);

    // All types:
    // Country
    // Dependency
    // Disputed
    // Indeterminate
    // Lease
    // Sovereign country
}

export default App;
