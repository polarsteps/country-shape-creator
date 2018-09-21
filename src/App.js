import React, { Component } from 'react';
import GeoJsonLoader from './GeoJsonLoader';
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
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Country Shape generator</h1>
                </header>
                <div className="App-intro">
                    {
                        !this.state.countries.length &&
                        <GeoJsonLoader onLoad={ this.handleJsonLoad }/>
                    }
                    <div>
                    {
                        !!this.state.countries.length &&
                        <React.Fragment>
                            <div className="App-tools">
                                <button className="App-reset button" onClick={ this.reset }>Reset and start again</button>

                                <label>
                                    Filter by:
                                    <input value={ this.state.filter } onChange={ this.filterChanged } />
                                </label>

                                <button className="App-download button" onClick={ this.downloadAll }>Download all</button>
                            </div>
                            <div className="App-countries">
                                {
                                    this.state.countries
                                        .filter(country => countryContainsFilter(country, this.state.filter))
                                        .map((country) =>
                                            <Country
                                                key={country.country_code}
                                                countryInfo={country}
                                                onSvgChanged={ this.handleSvgChanged }
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
