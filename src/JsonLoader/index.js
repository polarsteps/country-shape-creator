import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

const JsonLoader = (props) => {
    return (
        <label className="JsonLoader">
            { props.label }

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

JsonLoader.propTypes = {
    label: PropTypes.string,
    onLoad: PropTypes.func.isRequired
};

export default JsonLoader;
