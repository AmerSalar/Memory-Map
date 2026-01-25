// const { use } = require("react");

const loadingIcon = document.querySelector('.loading-icon');
function print(input) {
    console.log(input);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function loader(toggle) {
    if(toggle == 1) {
        loadingIcon.style.display = 'block';
    } else {
        loadingIcon.style.display = 'none';
    }
}

const map = L.map('map').setView([33.3, 44.4], 6);
let sateliteUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

let sateliteLayer = L.tileLayer(sateliteUrl, {
    // attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
});
sateliteLayer.addTo(map);

const locateBtn = document.querySelector('.locate-btn');
locateBtn.addEventListener('click', e =>{
    locateMe();
});
let userDot = null;
map.on('locationfound', e => {
    if(e.accuracy > 100) {
        locateBtn.textContent = 'Something is wrong!';
        locateMe();
        return null;
    }
    locateBtn.textContent = '^-^';
    map.setView(e.latlng, 16);
    if(!userDot) {
        userDot = L.circleMarker(e.latlng,{
            radius: 8,
            fillColor: '#7e654b', 
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        }).addTo(map);
    } else {
        userDot.setLatLng(e.latlng);
    }
    loader(0);
});
function locateMe() {
    loader(1);
    map.locate({
        enableHighAccuracy: true,
        maximumAge: 0
    });
}











