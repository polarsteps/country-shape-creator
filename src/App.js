import React, { Component } from 'react';
import GeoJsonLoader from './GeoJsonLoader';
import Country from './Country';
import { sortBy } from 'lodash';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            countries: [],
            filter: '',
        };

        this.handleJsonLoad = this.handleJsonLoad.bind(this);
        this.filterChanged = this.filterChanged.bind(this);
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

}

function countryContainsFilter(country, filter) {
    if(!filter) {
        return true;
    }
    const countryName = getCountryName(country);
    return countryName.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
}

function processCountries(countries) {
    const unsorted = countries
        .map(country => Object.assign({}, country, { country_code: getCountryCode(country) }))
        .filter(country => country.country_code !== null)
        .filter(country => !shouldRemoveCountry(country));
    return sortBy(unsorted, country => getCountryName(country).toLowerCase() );
}

function getCountryName(country) {
    return country.properties.NAME || country.properties.name;
}

function getCountryCode(country) {
    if(country.properties.ISO_A2 && country.properties.ISO_A2 !== '-99') {
        return country.properties.ISO_A2;
    }
    if(country.properties.FIPS_10_ && country.properties.FIPS_10_ !== '-99') {
        return country.properties.FIPS_10_;
    }
    if(country.properties.WB_A2 && country.properties.WB_A2 !== '-99') {
        return country.properties.WB_A2;
    }
    if(country.properties.iso_a2 && country.properties.iso_a2 !== '-99') {
        return country.properties.iso_a2;
    }
    if(country.properties.fips_10_ && country.properties.fips_10_ !== '-99') {
        return country.properties.fips_10_;
    }
    if(country.properties.wb_a2 && country.properties.wb_a2 !== '-99') {
        return country.properties.wb_a2;
    }
    return null;
}

function shouldRemoveCountry(country) {
    const TYPES_TO_REMOVE = ['Dependency', 'Indeterminate'];
    const countryType = country.properties.TYPE || country.properties.type;
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
