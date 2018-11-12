import { sortBy } from 'lodash';
import bounds from 'geojson-bounds';

export const getCountryName = (country) => {
    return country.properties.NAME || country.properties.name;
};

export const processCountries = (countries, maxCountries = -1) => {
    const unsorted = countries
        .map(country => Object.assign({}, country, { country_code: getCountryCode(country) }))
        .filter(country => country.country_code !== null)
        .filter(country => !shouldRemoveCountry(country));

    // const notshown = countries
    //     .map(country => Object.assign({}, country, { country_code: getCountryCode(country) }))
    //     .filter(country => shouldRemoveCountry(country))
    //     .map(country => country.properties);
    // console.log(notshown);
    // console.log(JSON.stringify(notshown, undefined, 2));
    let limited = unsorted;
    if(maxCountries > -1) {
        limited = limited.slice(0, maxCountries);
    }
    return sortBy(limited, country => getCountryName(country).toLowerCase() );
};

function getCountryCode(country) {
    if(country.properties.ISO_A2 && country.properties.ISO_A2 !== '-99') {
        return country.properties.ISO_A2;
    }
    if(country.properties.FIPS_10_ && country.properties.FIPS_10_ !== '-99') {
        return country.properties.FIPS_10_;
    }
    if(country.properties.WB_A2 && country.properties.WB_A2 !== '-99') {
        return country.properties.WB_A2;
    }
    if(country.properties.iso_a2 && country.properties.iso_a2 !== '-99') {
        return country.properties.iso_a2;
    }
    if(country.properties.fips_10_ && country.properties.fips_10_ !== '-99') {
        return country.properties.fips_10_;
    }
    if(country.properties.wb_a2 && country.properties.wb_a2 !== '-99') {
        return country.properties.wb_a2;
    }
    return null;
}

function shouldRemoveCountry(country) {
    const TYPES_TO_REMOVE = ['Dependency', 'Indeterminate'];
    const countryType = country.properties.TYPE || country.properties.type;
    return TYPES_TO_REMOVE.includes(countryType);

    // All types:
    // Country
    // Dependency
    // Disputed
    // Indeterminate
    // Lease
    // Sovereign country
}

export const getBoundaries = (country) => {
    return {
        topLeft: [bounds.yMax(country), bounds.xMin(country)],
        bottomRight: [bounds.yMin(country), bounds.xMax(country)],
    };
};

export const getLatLonFromString = (latlonString) => {
    if(!latlonString) {
        return null;
    }
    const [latString, lonString] = latlonString.split(',');
    return {
        lat: parseFloat(latString.trim()),
        lon: parseFloat(lonString.trim()),
    };
};
