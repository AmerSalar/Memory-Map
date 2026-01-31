import {MemoryApp} from "./firebase.js";
window.addEventListener('load', () => {
    loadNotes();
});

const datePicker = document.getElementById('date-picker');
const todayDate = new Date();
const today = todayDate.toISOString().split('T')[0];
datePicker.max = today;
datePicker.value = today;

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
function log(input) {
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
    togglePopups();
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

function togglePopups() {
    popup.style.display = 'none';
    popupNoteCont.style.display = 'none';
}
menuBtn.addEventListener('click', e => {
    toggleMenu();
    getPinDate();
})

document.querySelector('.fun').addEventListener('click', () => {
    toggleMenu();
})

pinBtn.addEventListener('click', e => {
    togglePin();
})

const map = L.map('map').setView([33.3, 44.4], 6);
map.attributionControl.setPrefix('');
let layerUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
let layer = L.tileLayer(layerUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});
layer.addTo(map);
const noteClusters = L.markerClusterGroup({
    maxClusterRadius:30,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true
});
map.addLayer(noteClusters);

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
            radius: 10,
            fillColor: '#7e654b', 
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        });
        userDot.addTo(map);
    } else {
        userDot.setLatLng(e.latlng);
    }
    loader(0);
});
map.on('locationerror', e => {
    loader(0);
    message.textContent = 'Something went wrong! try again.';
})
let mapLastClick = null;
map.on('click', e => {
    if(stateOfPin == 1) {
        if(map.getZoom() <= 15) {
        message.textContent = "Please zoom in more to place a pin.";
        setTimeout( () => {
            message.textContent = '';
        }, 2500);
        }
        if(map.getZoom() > 15) {
            mapLastClick = e.latlng;
            popMessage('Do you want to place a pin?');
        }
    }
    log(e.latlng);
});

function popMessage(message) {
    if(stateOfMenu === 1) toggleMenu();
    popup.style.display = 'flex';
    popupText.textContent = message;
}

document.querySelector('.yes-btn').addEventListener('click', e=> {
    const myNote = note.value;
    const date = getPinDate();
    placeNote(mapLastClick, myNote, date);
    popup.style.display = 'none';
    note.value = '';
    colorPicker.value = 0;
});

document.querySelector('.no-btn').addEventListener('click', e=> {
    note.value = '';
    datePicker.value = today;
    popup.style.display = 'none';
});

function locateMe() {
    loader(1);
    map.locate({
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    });
}

async function placeNote(latlng, note, date) {
    togglePin();
    const fColor = getPinColor();
    const pinID = await saveToFirebase({
        lat: latlng.lat,
        lng: latlng.lng,
        note: note,
        color: fColor,
        date: date
    });
    if(!pinID) {
        message.textContent = 'Could not save pin. Check your connection. Try again later.';
        setTimeout( () => {
            message.textContent = '';
        }, 2500);
    } else {
        const pin = L.circleMarker(latlng, {
            radius: 8,
            fillColor: fColor,
            color: '#000',
            weight: 1,
            fillOpacity: 0.9
        });
        pin.addEventListener('click', e=> {
            popNote(note, date, pinID);
        });
        noteClusters.addLayer(pin);
    }  
}

function popNote(note, date, id) {
    if(stateOfMenu === 1) toggleMenu();
    const pinID = id;
    // log('Pin ID: '+pinID);
    popupNoteCont.style.display = 'flex';
    popupNote.textContent = note; 
    document.querySelector('.popup-note-date').textContent = date;
}

cancelBtn.addEventListener('click', e=>{
    popupNoteCont.style.display = 'none';
});

const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    let color;
    if(val === 0) {
        color = "hsl(0, 0%, 0%)";
    } else if (val === 63) {
        color = "hsl(0, 0%, 100%)";
    } else {
        const hue = (val - 1) * (360/61);
        color = `hsl(${hue}, 100%, 50%)`;
    }
    document.documentElement.style.setProperty("--color", color);
});

function getPinColor() {
    const color = document.documentElement.style.getPropertyValue("--color");
    return color;
}

function getPinDate() {
    const date = document.getElementById('date-picker').value;
    if(date > today) return today;
    return date;
}

function loadNote(lat, lng, note, color, date, id) {
    const latlng = {
        lat: lat,
        lng: lng
    };
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: color,
        color: '#000',
        weight: 1,
        fillOpacity: 0.9
    });
    pin.addEventListener('click', e=> {
        popNote(note, date, id);
    });
    noteClusters.addLayer(pin);
}

async function saveToFirebase(memory) {
    try{
        const id = await MemoryApp.save(memory); 
        log('memory saved: '+id);
        return id;
    } catch(e) {
        log('Saving to firebase had error!');
        return null;
    }
}

async function loadNotes() {
    loader(1);
    try {
        const snapshot = await MemoryApp.load();
        snapshot.forEach(pin => {
            loadNote(pin.lat, pin.lng, pin.note, pin.color, pin.date, pin.id);
        });
        await sleep(250);
    } catch(e) {
        log('Loading from firebase had error!' + e);
    } finally {
        loader(0);
    }  
}














