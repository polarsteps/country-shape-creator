import merc from 'mercator-projection';
import { parse, stringify } from 'svg-path-tools';

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
        maxY: minY + height,
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
    const newMinX = minX + (selection.x * width / 100);
    const newMinY = minY + (selection.y * height / 100);
    return [newMinX, newMinY, newWidth, newHeight];
};

export const makeSVGExportable = (svgCode, viewBox) => {
    const correctSizedSVG = makeSVGSize(svgCode, 100);
    return maskSVG(correctSizedSVG);
};

function makeSVGSize(svgCode, size) {
    const element = document.createElement('div');
    element.innerHTML = svgCode;
    const svgElement = element.querySelector('svg');

    const viewBox = getViewBoxFromElement(svgElement);
    const scaleFactor = size / viewBox[2];
    const xTranslate = -viewBox[0];
    const yTranslate = -viewBox[1];
    updateSvgElementViewBox(svgElement, [0, 0, size, size]);
    const allPaths = Array.from(svgElement.querySelectorAll('path'));
    allPaths.forEach((path) => {
        const pathString = path.getAttribute('d');
        const parsedPath = parse(pathString);
        const newPath = parsedPath.map(command => transformCommand(command, scaleFactor, xTranslate, yTranslate));
        path.setAttribute('d', stringify(newPath));
    });

    return svgElement.outerHTML;
}

function transformCommand(command, scaleFactor, xTranslate, yTranslate) {
    let newValues = command.values;
    if(newValues.length === 2) {
        newValues[0] = (newValues[0] + xTranslate) * scaleFactor;
        newValues[1] = (newValues[1] + yTranslate) * scaleFactor;
    }
    return {
        ...command,
        values: newValues
    };
}

function maskSVG(svgCode) {
    const element = document.createElement('div');
    element.innerHTML = svgCode;
    const svgElement = element.querySelector('svg');

    const viewBox = getViewBoxFromElement(svgElement);
    Array.from(svgElement.childNodes).forEach(child => child.setAttribute('mask', 'url(#viewBoxMask)'));
    const maskElement = document.createElement('mask');
    maskElement.setAttribute('id', 'viewBoxMask');
    const rectangle = document.createElement('rect');
    rectangle.setAttribute('x', viewBox[0]);
    rectangle.setAttribute('y', viewBox[1]);
    rectangle.setAttribute('width', viewBox[2]);
    rectangle.setAttribute('height', viewBox[3]);
    rectangle.setAttribute('fill', 'white');
    maskElement.appendChild(rectangle);
    svgElement.insertBefore(maskElement, svgElement.firstChild);
    return svgElement.outerHTML;
}
