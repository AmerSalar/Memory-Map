// print(L);
window.addEventListener('load', () => {
    loadNotes();
});
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
const noteClusters = L.markerClusterGroup();
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
            radius: 8,
            fillColor: '#7e654b', 
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        });
        noteClusters.addLayer(userDot);
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
async function placePin(latlng, note) {
    togglePin(0);
    const fColor = checkColor();
    print(latlng.lat);
    saveToFirebase({
        lat: latlng.lat,
        lng: latlng.lng,
        note: note,
        color: fColor
    });
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: fColor,
        color: '#eeeeee',
        weight: 2,
        fillOpacity: 1
    });
    pin.addEventListener('click', e=> {
        popNote(note);
    });
    toggleColor();
    noteClusters.addLayer(pin);
}
function popNote(note) {
    popupNoteCont.style.display = 'flex';
    popupNote.textContent = note; 
}
cancelBtn.addEventListener('click', e=>{
    popupNoteCont.style.display = 'none';
});
redCheck.addEventListener('click', e => {
    toggleColor(redCheck);
});
blueCheck.addEventListener('click', e => {
    toggleColor(blueCheck);
});
greenCheck.addEventListener('click', e => {
    toggleColor(greenCheck);
});
function checkColor() {
    const colors = document.querySelectorAll('.color-check');
    let activeColor = null;
    colors.forEach(e => {
        if(e.classList.contains('active-check')) {
            activeColor = e;
        }
    });
    if(activeColor == redCheck) return '#aa000075';
    else if(activeColor == greenCheck) return '#00aa0075';
    else if(activeColor == blueCheck) return '#0000aa75';
    else return '#dddddd';
}

function loadPin(lat, lng, note, color) {
    const latlng = {
        lat: lat,
        lng: lng
    };
    const pin = L.circleMarker(latlng, {
        radius: 8,
        fillColor: color,
        color: '#eeeeee',
        weight: 2,
        fillOpacity: 1
    });
    pin.addEventListener('click', e=> {
        popNote(note);
    });
    noteClusters.addLayer(pin);
}
async function saveToFirebase(noteObj) {
    try{
        const memory = {
            lat: noteObj.lat,
            lng: noteObj.lng,
            note: noteObj.note,
            color: noteObj.color
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
        loadPin(pin.lat, pin.lng, pin.note, pin.color);
    });
    await sleep(250);
    loader(0);
}













