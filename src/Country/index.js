import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

const Country = (props) => {
    return (
        <div className='Country'>{
            props.countryInfo.properties.NAME
        }</div>
    );
}

Country.propTypes = {
    countryInfo: PropTypes.object.isRequired
};

export default Country;
