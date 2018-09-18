import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CountrySvg from '../CountrySvg';

import './style.css';

class Country extends Component {

    constructor(props) {
        super(props);

        this.updateLat = this.updateLat.bind(this);
        this.updateLon = this.updateLon.bind(this);

        this.state = {
            latLonToShow: '',
            lat: '40.415363',
            lon: '-3.707398'
        };
    }

    render() {
        return (
            <div className='Country'>
                <div className='Country-title'>
                    { this.props.countryInfo.properties.NAME }
                </div>
                <div>
                    <CountrySvg
                        countryInfo={this.props.countryInfo}
                        latLonToProject={ {
                            lat: parseFloat(this.state.lat),
                            lon: parseFloat(this.state.lon),
                        } }
                    />
                </div>
                <label>
                    Lat:
                    <input value={ this.state.lat } onChange={ this.updateLat } />
                </label>

                <label>
                    Lon:
                    <input value={ this.state.lon } onChange={ this.updateLon } />
                </label>
            </div>
        );
    }

    updateLat(event) {
        this.setState({
            lat: event.target.value,
        });
    }

    updateLon(event) {
        this.setState({
            lon: event.target.value,
        });
    }
}


Country.propTypes = {
    countryInfo: PropTypes.object.isRequired
};

export default Country;
