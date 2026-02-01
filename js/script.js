import { MemoryApp } from "./firebase.js";
window.addEventListener('load', () => {
    loadNotes();
});
const map = L.map('map').setView([33.3, 44.4], 6);
const datePicker = document.getElementById('date-picker');
const todayDate = new Date();
const today = todayDate.toISOString().split('T')[0];


datePicker.max = today;
datePicker.value = today;

menuBtn.addEventListener('click', e => {
    toggleMenu();
    getPinDate();
});

document.querySelector('.fun').addEventListener('click', () => {
    toggleMenu();
});

pinBtn.addEventListener('click', e => {
    togglePin();
});

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

locateBtn.addEventListener('click', e =>{
    locateMe();
});
let userDot = null;

map.on('locationfound', e => {
    if(e.accuracy > 250) {
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

document.querySelector('.yes-btn').addEventListener('click', e=> {
    const myNote = note.value;
    const date = getPinDate();
    placeNote(mapLastClick, myNote, date);
    popup.style.display = 'none';
    note.value = '';
    colorPicker.value = 0;
});

document.querySelector('.no-btn').addEventListener('click', e=> {
    togglePin();
    note.value = '';
    datePicker.value = today;
    popup.style.display = 'none';
});

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

cancelBtn.addEventListener('click', e=>{
    popupNoteCont.style.display = 'none';
});

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

function locateMe() {
    loader(1);
    map.locate({
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
    });
}