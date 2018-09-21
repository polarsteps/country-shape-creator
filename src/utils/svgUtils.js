import merc from 'mercator-projection';

export const getLatLonBoundsFromViewBox = (viewbox) => {
    const [minX, minY, width, height] = viewbox;
    return {
        northWest: merc.fromPointToLatLng({ x: minX, y: minY }),
        southEast: merc.fromPointToLatLng({ x: minX + width, y: minY + height }),
    };
};

export const getViewBoxFromElement = (element) => {
    const viewBox = element.getAttribute('viewBox');
    return viewBox.split(' ').map(string => parseFloat(string));
};


export const getSvgBoundaries = (element) => {
    return getBoundariesFromViewBox(getViewBoxFromElement(element));
};

function getBoundariesFromViewBox(viewBox) {
    const [minX, minY, width, height] = viewBox;
    return {
        minX,
        minY,
        maxX: minX + width,
        maxY: minY + height
    };
}

export const updateSvgElementViewBox = (element, viewBox) => {
    const [minX, minY, width, height] = viewBox;
    element.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    return element;
};

export const makeSvgElementSquare = (element) => {
    let [minX, minY, width, height] = getViewBoxFromElement(element);

    if(width < height) {
        const diff = height - width;
        minX = minX - (diff / 2);
        width = height;
    } else {
        const diff = width - height;
        minY = minY - (diff / 2);
        height = width;
    }

    updateSvgElementViewBox(element, [minX, minY, width, height]);
    return [minX, minY, width, height];
};

export const getLimitedViewBoxFromSelection = (originalViewBox, selection) => {
    const [minX, minY, width, height] = originalViewBox;
    const newWidth = width * selection.width / 100;
    const newHeight = height * selection.height / 100;
    const newMinX = minX + ( selection.x * width / 100 );
    const newMinY = minY + ( selection.y * height / 100 );
    return [newMinX, newMinY, newWidth, newHeight];
};
