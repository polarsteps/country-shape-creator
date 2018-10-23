import React, { Component } from 'react';
import PropTypes from 'prop-types';
import geojson2svg from 'geojson-to-svg';
import RegionSelect from 'react-region-select';
import merc from 'mercator-projection';
import {
    getViewBoxFromElement,
    getSvgBoundaries,
    makeSvgElementSquare,
    updateSvgElementViewBox,
    getLatLonBoundsFromViewBox,
} from '../utils/svgUtils';
import { getRelativePosition } from '../utils/proportions';
import './style.css';

class CountrySvg extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            svg: null,
        };
        this.svgRef = React.createRef();
        this.initSvg = this.initSvg.bind(this);
        this.initRegion = this.initRegion.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
    }

    componentDidMount() {
        this.initSvgTimeout = setTimeout(this.initSvg);
    }

    static getDerivedStateFromProps(props, state) {
        if(props.limitedViewBox && state.lastUsedViewBox && (props.limitedViewBox.toString() !== state.lastUsedViewBox.toString())) {
            const newState = getStateFromSvgAndProps(state.svgElement, props);
            notifySvgChanged({ ...state, ...newState}, props);
            return newState;
        }
        return {};
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
                        this.props.allowSelectArea && this.state.regionReady &&
                        <div className='CountrySvg-areaSelector'>
                            <RegionSelect
                                maxRegions={1}
                                regions={ this.state.regions }
                                constraint={ true }
                                onChange={ this.onRegionChange }>
                                <div className='CountrySvg-areaSelector-inner'></div>
                            </RegionSelect>
                        </div>
                    }
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

    componentWillUnmount() {
        if(this.initSvgTimeout) {
            clearTimeout(this.initSvgTimeout);
            this.initSvgTimeout = null;
        }
    }

    initSvg() {
        this.initSvgTimeout = null;
        const svgElement = this.getNewSvgElement();
        this.setState(getStateFromSvgAndProps(svgElement, this.props));
        notifySvgChanged(this.state, this.props);

        if(this.props.onInitSvgBoundaries) {
            this.props.onInitSvgBoundaries(getViewBoxFromElement(svgElement));
        }

        this.initRegion();
    }

    initRegion() {
        const initialRegion = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            data: {},
        };

        this.setState({
            regions: [ initialRegion ],
            regionReady: true,
            loading: false,
        });

        if(this.props.onChangeAreaSelection) {
            this.props.onChangeAreaSelection({ ...initialRegion });
        }
    }

    onRegionChange(changes) {
        const regionChange = changes[0];
        if(regionChange.isChanging) {
            this.setState({
                regions: [{
                    ...regionChange
                }],
            });
            if(this.props.onChangeAreaSelection) {
                this.props.onChangeAreaSelection({ ...regionChange });
            }
        }
    }

    canShowDot() {
        const result = this.props.latLonToProject && this.props.countryInfo && this.svgRef.current;
        return result;
    }

    getDotStyle() {
        const pixelInfo = projectLatLonIntoArea(
            this.props.latLonToProject,
            getSvgBoundaries(this.svgRef.current.querySelector('svg')),
            this.svgRef.current.getBoundingClientRect(),
        );
        return {
            top: `${pixelInfo.y}px`,
            left: `${pixelInfo.x}px`,
        };
    }

    getNewSvgElement() {
        const svg = geojson2svg()
            .styles({ MultiPolygon: { fill: '#000000', stroke: 'none' } })
            .projection((coord) => {
                const projected = merc.fromLatLngToPoint({ lat: coord[1], lng: coord[0] });
                return [projected.x, projected.y];
            })
            .data(this.props.countryInfo)
            .render();

        const parser = new DOMParser();
        return parser.parseFromString(svg, "image/svg+xml").querySelector('svg');
    }

}

function getStateFromSvgAndProps(svgElement, props) {
    if(props.limitedViewBox) {
        updateSvgElementViewBox(svgElement, props.limitedViewBox);
    }
    const lastUsedViewBox = makeSvgElementSquare(svgElement);
    return {
        svg: {
            __html: svgElement.outerHTML,
        },
        svgElement,
        lastUsedViewBox,
    };
}

function projectLatLonIntoArea(latlon, svgBoundaries, boundingBox) {
    const { minX, minY, maxX, maxY } = svgBoundaries;
    const { x, y } = merc.fromLatLngToPoint({ lat: latlon.lat, lng: latlon.lon });
    const relativeX = getRelativePosition(x, minX, maxX);
    const relativeY = getRelativePosition(y, minY, maxY);
    return {
        x: relativeX * boundingBox.width,
        y: relativeY * boundingBox.height,
    };
}

function notifySvgChanged(state, props) {
    if(props.onChangeSvgDisplayed) {
        props.onChangeSvgDisplayed({
            svg: state.svg.__html,
            viewBox: state.lastUsedViewBox,
            latLonBounds: getLatLonBoundsFromViewBox(state.lastUsedViewBox),
            countryCode: props.countryInfo.country_code,
        });
    }
}

CountrySvg.propTypes = {
    countryInfo: PropTypes.object.isRequired,
    latLonToProject: PropTypes.object,
    allowSelectArea: PropTypes.bool,
    onInitSvgBoundaries: PropTypes.func,
    onChangeAreaSelection: PropTypes.func,
    limitedViewBox: PropTypes.array,
    onChangeSvgDisplayed: PropTypes.func,
};

export default CountrySvg;
