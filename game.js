
var blacktree = document.querySelector("#blacktree svg");
// var blacktreeTrunk = blacktree.querySelector(".trunk");
// var blacktreeTrunkSegs = Array.from(blacktreeTrunk.querySelectorAll(".tree-seg"));
var blacktreeSegs = Array.from(blacktree.querySelectorAll(".tree-seg"));

blacktreeSegs = blacktreeSegs.sort( (segmentA, segmentB) => {
    segOrderA = segmentA.dataset.segorder;
    segOrderB = segmentB.dataset.segorder;
    return segOrderA - segOrderB;
});

// console.log(blacktreeSegs);

function delayDisplay(element, interval) {
    function unhide() {
        element.classList.toggle("hidden");
    }
    setTimeout(unhide, interval);
}

blacktreeSegs.forEach( (segment, index) => {
    const timeDiff = 500;
    delayDisplay(segment, index * timeDiff);
});