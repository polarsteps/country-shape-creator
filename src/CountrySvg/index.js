import React, { Component } from 'react';
import PropTypes from 'prop-types';
import geojson2svg from 'geojson-to-svg';
import './style.css';

class CountrySvg extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            svg: null,
        };
        this.svgRef = React.createRef();
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
            <div className='CountrySvg'>
                {
                    this.state.loading &&
                    <div> Loading... </div>
                }
                {
                    this.state.svg &&
                    <div dangerouslySetInnerHTML={this.state.svg}
                        ref={this.svgRef}
                    ></div>
                }
                {
                    this.props.latLonToProject &&
                    `Lat ${this.props.latLonToProject.lat}, Lon: ${this.props.latLonToProject.lon}`
                }
            </div>
        );
    }
}

CountrySvg.propTypes = {
    countryInfo: PropTypes.object.isRequired,
    latLonToProject: PropTypes.object,
};

export default CountrySvg;
