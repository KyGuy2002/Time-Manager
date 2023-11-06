export {}

// Start timer
let active: boolean = false;
let startTime: number;





chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if (request.msg == "toggle") toggle();
        if (request.msg == "info") sendResponse({active: active, startTime: startTime});
    }
);


function toggle() {
    active = !active;

    if (active) {
        startTime = Date.now();
    }
}