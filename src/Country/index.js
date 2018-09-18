import React, { Component } from 'react';
import PropTypes from 'prop-types';
import geojson2svg from 'geojson-to-svg';
import './style.css';

class Country extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            svg: null,
        };
    }

    componentDidMount() {
        const svg = geojson2svg()
            .styles({ 'MultiPolygon' : { fill: 'black', stroke: 'none' } })
            .projection((coord) => {
                return [coord[0], -coord[1]];
            })
            .data(this.props.countryInfo)
            .render();

        this.setState({
            loading: false,
            svg: {
                __html: svg
            },
        });
    }

    render() {
        return (
            <div className='Country'>
                <div className='Country-title'>
                    { this.props.countryInfo.properties.NAME }
                </div>
                {
                    this.state.loading &&
                    <div> Loading... </div>
                }
                {
                    this.state.svg &&
                    <div dangerouslySetInnerHTML={this.state.svg}></div>
                }
            </div>
        );
    }
}

Country.propTypes = {
    countryInfo: PropTypes.object.isRequired
};

export default Country;
