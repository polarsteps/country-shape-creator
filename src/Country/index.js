import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CountrySvg from '../CountrySvg';
import { getLimitedViewBoxFromSelection } from '../utils/svgUtils';

import './style.css';

const SHOW_TEST_LAT_LON = false;

class Country extends Component {

    constructor(props) {
        super(props);

        this.updateLat = this.updateLat.bind(this);
        this.updateLon = this.updateLon.bind(this);
        this.handleInitSvgBoundaries = this.handleInitSvgBoundaries.bind(this);
        this.handleChangeAreaSelection = this.handleChangeAreaSelection.bind(this);

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
                <div className='Country-maps'>
                    <CountrySvg
                        countryInfo={this.props.countryInfo}
                        allowSelectArea={true}
                        latLonToProject={ SHOW_TEST_LAT_LON? {
                            lat: parseFloat(this.state.lat),
                            lon: parseFloat(this.state.lon),
                        } : null }
                        onInitSvgBoundaries={ this.handleInitSvgBoundaries }
                        onChangeAreaSelection={ this.handleChangeAreaSelection }
                    />
                    {
                        this.state.limitedViewBox &&
                        <CountrySvg
                            countryInfo={this.props.countryInfo}
                            latLonToProject={ {
                                lat: parseFloat(this.state.lat),
                                lon: parseFloat(this.state.lon),
                            } }
                            limitedViewBox={ this.state.limitedViewBox }
                            onChangeSvgDisplayed={ this.props.onSvgChanged }
                        />
                    }
                </div>
                {
                    SHOW_TEST_LAT_LON &&
                    <div>
                        <label>
                            Lat:
                            <input value={ this.state.lat } onChange={ this.updateLat } />
                        </label>

                        <label>
                            Lon:
                            <input value={ this.state.lon } onChange={ this.updateLon } />
                        </label>
                    </div>
                }
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

    handleInitSvgBoundaries(newBounds) {
        this.setState({
            svgBounds: newBounds,
        });
    }

    handleChangeAreaSelection(newArea) {
        const limitedViewBox = getLimitedViewBoxFromSelection(this.state.svgBounds, newArea);
        this.setState({
            limitedViewBox,
        });
    }

}

Country.propTypes = {
    countryInfo: PropTypes.object.isRequired,
    onSvgChanged: PropTypes.func,
};

export default Country;
