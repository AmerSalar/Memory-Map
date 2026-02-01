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
const locateBtn = document.querySelector('.locate-btn');
const colorPicker = document.getElementById('color-picker');

let stateOfMenu = 0;
let stateOfPin = 0;

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

function popMessage(message) {
    if(stateOfMenu === 1) toggleMenu();
    popup.style.display = 'flex';
    popupText.textContent = message;
}

function popNote(note, date, id) {
    if(stateOfMenu === 1) toggleMenu();
    const pinID = id;
    // log('Pin ID: '+pinID);
    popupNoteCont.style.display = 'flex';
    popupNote.textContent = note; 
    document.querySelector('.popup-note-date').textContent = date;
}