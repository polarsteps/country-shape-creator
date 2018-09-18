import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

const GeoJsonLoader = (props) => {
    return (
        <label>
            Load a GeoJsonFile with countries info:

            <input
                accept=".geojson, .json"
                type="file"
                onChange={
                    (event) => {
                        const reader = new FileReader();
                        reader.onload = onReaderLoad;
                        reader.readAsText(event.target.files[0]);

                        function onReaderLoad(event2){
                            const obj = JSON.parse(event2.target.result);
                            props.onLoad(obj);
                        }
                    }
                }
            />
        </label>
    );
}

GeoJsonLoader.propTypes = {
    onLoad: PropTypes.func.isRequired
};

export default GeoJsonLoader;
