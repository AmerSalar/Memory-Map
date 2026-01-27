// print(L);
const menuBtn = document.querySelector('.menu-btn');
const menuCont = document.querySelector('.menu-cont');
const message = document.querySelector('.message');
const loadingIcon = document.querySelector('.loading-icon');
const pinBtn = document.querySelector('.marker-btn');
const popup = document.querySelector('.popup-message');
const popupText = document.querySelector('.popup-text');
const note = document.getElementById('note');
const popupNote = document.querySelector('.popup-note-p');
const popupNoteCont = document.querySelector('.popup-note');
const cancelBtn = document.querySelector('.cancel-btn');

let stateOfMenu = 0;
let stateOfPin = 0;
function print(input) {
    console.log(input);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function refresh() {
    location.reload();
}
function loader(toggle) {
    if(toggle == 1) {
        loadingIcon.style.display = 'block';
    } else {
        loadingIcon.style.display = 'none';
    }
}
function toggleMenu() {
    menuCont.classList.remove('left-trigger', 'right-trigger');
    void menuCont.offsetWidth;
    if(stateOfMenu === 1) {
        menuCont.classList.add('left-trigger');
        stateOfMenu = 0;
    } 
    else {
        menuCont.classList.add('right-trigger');
        stateOfMenu = 1;
    }
}
function togglePin() {
    pinBtn.classList.remove('on-btn', 'off-btn');
    if(stateOfPin === 0) {
        pinBtn.classList.add('on-btn');
        stateOfPin = 1;
    } else {
        pinBtn.classList.add('off-btn');
        stateOfPin = 0;
    }
}
menuBtn.addEventListener('click', e => {
    toggleMenu();
})
pinBtn.addEventListener('click', e => {
    togglePin();
})


const map = L.map('map').setView([33.3, 44.4], 6);
map.attributionControl.setPrefix('');
let sateliteUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

let sateliteLayer = L.tileLayer(sateliteUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        message.textContent = 'Something went wrong! try again.';
        return null;
    }
    message.textContent = '';
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
let mapLastClick = null;
map.on('click', e => {
    if(stateOfPin === 1 && map.getZoom() > 15) {
        mapLastClick = e.latlng;
        popMessage('Do you want to place a pin?');
    }
    print(e.latlng);
    print(map.getZoom());
});

function popMessage(message) {
    popup.style.display = 'flex';
    popupText.textContent = message;
}

document.querySelector('.yes-btn').addEventListener('click', e=> {
    const myNote = note.value;
    placePin(mapLastClick, myNote);
    popup.style.display = 'none';
    note.value = '';
});
document.querySelector('.no-btn').addEventListener('click', e=> {
    note.value = '';
    popup.style.display = 'none';
});

function locateMe() {
    loader(1);
    map.locate({
        enableHighAccuracy: true,
        maximumAge: 0
    });
}
function placePin(latlng, note) {
    togglePin(0);
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#000099aa',
        color: '#eeeeee',
        weight: 2,
        fillOpacity: 1
    });
    pin.addEventListener('click', e=> {
        popNote(note);
        print(note);
    });
    pin.addTo(map);
}
function popNote(note) {
    popupNoteCont.style.display = 'flex';
    popupNote.textContent = note; 
}
cancelBtn.addEventListener('click', e=>{
    popupNoteCont.style.display = 'none';
});











