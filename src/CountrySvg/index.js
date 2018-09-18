import React, { Component } from 'react';
import PropTypes from 'prop-types';
import geojson2svg from 'geojson-to-svg';
import { getBoundaries } from '../utils/geojsonUtils';
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
                <div className='CountrySvg-inner'>
                    {
                        this.state.svg &&
                        <div dangerouslySetInnerHTML={this.state.svg}
                            ref={this.svgRef}
                        ></div>
                    }
                    {
                        this.canShowDot() &&
                        <div
                            className='CountrySvg-dot'
                            style={this.getDotStyle()}>
                            {
                                `Lat ${this.props.latLonToProject.lat}, Lon: ${this.props.latLonToProject.lon}`
                            }
                        </div>

                    }
                </div>
            </div>
        );
    }

    canShowDot() {
        const result = this.props.latLonToProject && this.props.countryInfo && this.svgRef.current;
        return result;
    }

    getDotStyle() {
        const pixelInfo = project(
            this.props.latLonToProject,
            getBoundaries(this.props.countryInfo),
            this.svgRef.current.getBoundingClientRect(),
        );
        return {
            top: `${pixelInfo.y}px`,
            left: `${pixelInfo.x}px`,
        };
    }
}

function project(latlon, latlonBoundaries, boundingBox) {
    const minLat = latlonBoundaries.bottomRight[0];
    const maxLat = latlonBoundaries.topLeft[0];
    const minLon = latlonBoundaries.topLeft[1];
    const maxLon = latlonBoundaries.bottomRight[1];

    const relativeX = getRelativePosition(latlon.lon, minLon, maxLon);
    const relativeY = getRelativePosition(latlon.lat, minLat, maxLat);
    return {
        x: relativeX * boundingBox.width,
        y: (1 - relativeY) * boundingBox.height,
    };

}

function getRelativePosition(x, min, max) {
    return (x - min) / (max - min);
}

CountrySvg.propTypes = {
    countryInfo: PropTypes.object.isRequired,
    latLonToProject: PropTypes.object,
};

export default CountrySvg;
