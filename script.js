// print(L);
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
const redCheck = document.querySelector('.red-check');
const greenCheck = document.querySelector('.green-check');
const blueCheck = document.querySelector('.blue-check');

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
function toggleColor(color) {
    const colors = document.querySelectorAll('.color-check');
    colors.forEach(e => {
        e.classList.remove('active-check');
    });
    if(color) color.classList.add('active-check');
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
let sateliteUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
let sateliteLayer = L.tileLayer(sateliteUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});
sateliteLayer.addTo(map);
const noteClusters = L.markerClusterGroup({
    maxClusterRadius:30,
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
    const date = getPinDate();
    placeNote(mapLastClick, myNote, date);
    popup.style.display = 'none';
    note.value = '';
    colorPicker.value = 0;
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
async function placeNote(latlng, note, date) {
    togglePin();
    const fColor = getPinColor();
    print(latlng.lat);
    saveToFirebase({
        lat: latlng.lat,
        lng: latlng.lng,
        note: note,
        color: fColor,
        date: date
    });
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: fColor,
        color: '#000',
        weight: 1,
        fillOpacity: 1
    });
    pin.addEventListener('click', e=> {
        popNote(note, date);
    });
    toggleColor();
    noteClusters.addLayer(pin);
}
function popNote(note, date) {
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
    } else if (val === 47) {
        color = "hsl(0, 0%, 100%)";
    } else {
        const hue = (val - 1) * (360/45);
        color = `hsl(${hue}, 100%, 50%)`;
    }
    const colorHex = hslToHex(color);
    const altColorHex = colorHex + "90";
    document.documentElement.style.setProperty("--color", colorHex);
    document.documentElement.style.setProperty("--alt-color", altColorHex);
});
// This hslToHex is not mine
function hslToHex(hsl) {
    const dummy = document.createElement("div");
    dummy.style.color = hsl;
    document.body.appendChild(dummy);
    const rgb = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);

    const res = rgb.match(/\d+/g).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    return `#${res}`;
}
function getPinColor() {
    const color = document.documentElement.style.getPropertyValue("--alt-color");
    return color;
}
function getPinDate() {
    const date = document.getElementById('date-picker').value;
    return date;
}
function loadNote(lat, lng, note, color, date) {
    const latlng = {
        lat: lat,
        lng: lng
    };
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: color,
        color: '#000',
        weight: 1,
        fillOpacity: 1
    });
    pin.addEventListener('click', e=> {
        popNote(note, date);
    });
    noteClusters.addLayer(pin);
}
async function saveToFirebase(noteObj) {
    try{
        const memory = {
            lat: noteObj.lat,
            lng: noteObj.lng,
            note: noteObj.note,
            color: noteObj.color,
            date: noteObj.date
        }
        const docRef = await window.addDoc(window.collection(window.db, "memories"), memory); 
        print('memory saved: '+docRef.id);
    } catch(e) {
        print('Saving to firebase had error!');
    }
}
async function loadNotes() {
    loader(1);
    const snapshot = await window.getDocs(window.collection(window.db, "memories"));
    
    snapshot.forEach(doc => {
        const pin = doc.data();
        loadNote(pin.lat, pin.lng, pin.note, pin.color, pin.date);
    });
    await sleep(250);
    loader(0);
}














