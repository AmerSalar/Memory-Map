function log(input) {
    console.log(input);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function refresh() {
    location.reload();
}