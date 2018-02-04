
// Initiate the game
const blacktree = new Target("blacktree", "black-tree", 60, 20);
blacktree.animateGrowth(blacktree.getSegments(), 500);


/* Target Class */
function Target(name, domID, maxSegments, maxPrunes) {
    this.name = name;
    this.domID = domID; // id of the HTML element containing the target
    this.maxSegments = maxSegments; // maximum number of segments allowed before game is lost (42 is minimum to win)
    this.prunes = 0; // number of prune-actions enacted by user
    this.maxPrunes = maxPrunes; // maximum number of prune-actions allowed (11 is minimum to win)
    this.userActions = []; // can include "prune", "fertilize", and "poison"
    this.modItems = []; // items can include "sunlight", "moonlight", and "rain"
    this.getSegments = getSegments;
    this.animateGrowth = animateGrowth;
    this.giveItem = giveItem;
    this.addMods = addMods;
}

// Sort the target (tree) growth segments in order from the tree's base to its top
function getSegments() {
    const targetElt = document.querySelector(`#${this.domID}`);
    const segments = Array.from(targetElt.querySelectorAll(".tree-seg"));
    return segments.sort( (segmentA, segmentB) => {
        segOrderA = segmentA.dataset.segorder;
        segOrderB = segmentB.dataset.segorder;
        return segOrderA - segOrderB;
    });
}

/* Animate the target (tree) "growth" by unhiding its growth segments one at a time.
   timeDifferential = number of miliseconds delay between unhiding sequential segments */
function animateGrowth(segments, timeDifferential) {

    // Set staggered timeouts for the target (tree) growth segments
    segments.forEach( (segment, index) => {
        const timeDiff = timeDifferential;
        delayDisplay(segment, index * timeDiff);
    });

    // Unhide growth segments on a staggered time-schedule
    function delayDisplay(element, interval) {
        function unhide() {
            element.classList.toggle("hidden");
        }
        setTimeout(unhide, interval);
    }
}

function giveItem() {

}

function addMods() {

}



