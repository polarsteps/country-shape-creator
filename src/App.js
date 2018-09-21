import React, { Component } from 'react';
import JsonLoader from './JsonLoader';
import Country from './Country';
import JSZip from 'jszip';
import { getCountryName, processCountries } from './utils/geojsonUtils';
import { saveAs } from 'file-saver/FileSaver';
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
        this.downloadAll = this.downloadAll.bind(this);
        this.handleSvgChanged = this.handleSvgChanged.bind(this);
        this.reset = this.reset.bind(this);
        this.handleBoundsJsonLoad = this.handleBoundsJsonLoad.bind(this);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Country Shape Generator</h1>

                    {
                        !!this.state.countries.length &&
                        <button className="App-reset button" onClick={ this.reset }>Reset and start again</button>
                    }

                    {
                        !!this.state.countries.length &&
                        <button className="App-download button" onClick={ this.downloadAll }>Download all</button>
                    }

                </header>
                {
                    !this.state.countries.length &&
                    <div className="App-intro">
                        <JsonLoader onLoad={ this.handleJsonLoad } label={"Load a GeoJsonFile with countries info: "}/>
                    </div>
                }
                {
                    !!this.state.countries.length &&
                    <React.Fragment>
                        <div className="App-tools">

                            <div>
                                <JsonLoader onLoad={ this.handleBoundsJsonLoad } label={"Load custom bounds: "}/>
                            </div>

                            <label>
                                Filter by:
                                <input className="App-tools-filter" value={ this.state.filter } onChange={ this.filterChanged } />
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
                                            predefinedBounds={ this.getPredefinedBoundsForCountry(country.country_code) }
                                            onSvgChanged={ this.handleSvgChanged }
                                            ></Country>
                                    )
                            }
                        </div>
                    </React.Fragment>
                }
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
        const svgsInfo = Object.values(this.allSvgs);
        const boundsInfo = getBoundsInfo(svgsInfo);
        const zip = new JSZip();
        zip.file('bounds.json', boundsInfo);
        svgsInfo.forEach((svgInfo) => {
            zip.file(`${svgInfo.countryCode}.svg`, svgInfo.svg);
        });
        zip.generateAsync({type:"blob"})
            .then((blob) => {
                saveAs(blob, "svgs_and_bounds.zip");
            }, (err) => {
                console.warn(err);
            });
    }

    handleSvgChanged(changeInfo) {
        this.allSvgs = this.allSvgs || {};
        this.allSvgs[changeInfo.countryCode] = changeInfo;
    }

    reset() {
        this.setState({
            countries: [],
        });
    }

    handleBoundsJsonLoad(bounds) {
        this.setState({
            predefinedBounds: bounds,
        });
    }

    getPredefinedBoundsForCountry(countryCode) {
        if(this.state.predefinedBounds && this.state.predefinedBounds[countryCode]) {
            return this.state.predefinedBounds[countryCode].viewBox;
        }
        return null;
    }

}

function getBoundsInfo(svgsInfo) {
    const json = {};

    svgsInfo.forEach((countryInfo) => {
        json[countryInfo.countryCode] = {
            latLonBounds: countryInfo.latLonBounds,
            viewBox: countryInfo.viewBox
        };
    });

    return JSON.stringify(json, undefined, 2);
}

function countryContainsFilter(country, filter) {
    if(!filter) {
        return true;
    }
    const countryName = getCountryName(country);
    return countryName.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
}

export default App;
