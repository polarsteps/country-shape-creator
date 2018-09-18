import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getBoundaries, getLatLonFromString } from '../utils/geojsonUtils';
import CountrySvg from '../CountrySvg';

import './style.css';

class Country extends Component {

    constructor(props) {
        super(props);

        this.updateLatLon = this.updateLatLon.bind(this);

        this.state = {
            originalBounds: null,
            latLonToShow: '',
            latLon: null
        };
    }

    componentDidMount() {
        this.setState({
            originalBounds: getBoundaries(this.props.countryInfo),
        });
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
                        latLonToProject={this.state.latLon}
                    />
                </div>
                <input value={ this.state.latLonToShow } onChange={ this.updateLatLon } />
            </div>
        );
    }

    updateLatLon(event) {
        this.setState({
            latLonToShow: event.target.value,
            latLon: getLatLonFromString(event.target.value)
        });
    }
}


Country.propTypes = {
    countryInfo: PropTypes.object.isRequired
};

export default Country;
