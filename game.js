
// Initiate the game
const game = new Game();
game.drawTargetName(game.target);
game.drawCounters(game.target);
game.drawActionButtons(game.target);
game.target.animateGrowth(game.target, 1, game.target.animationTimeDiff);
game.activatePruneButtons(game.target);


/* Target Class */
function Target(name, domID, totalSegments, maxSegments, maxPrunes, animationTimeDiff, trunkSegments, postBranchSegments) {
    this.name = name;
    this.domID = domID; // id of the HTML element containing the target
    this.segmentCount = 0; // number of growth segments the target (tree) has added
    this.currentSegmentNumber = 1; // the data-segOrder attribute of the last-added growth segment
    this.totalSegments = totalSegments;
    this.maxSegments = maxSegments; // maximum number of segments allowed before game is lost (31 is minimum to win)
    this.prunes = 0; // number of prune-actions enacted by user
    this.maxPrunes = maxPrunes; // maximum number of prune-actions allowed (11 is minimum to win)
    this.trunkSegments = trunkSegments;
    this.postBranchSegments = postBranchSegments; // data-segOrder attributes of target (tree) segments immediately following a branch-point
    this.userActions = []; // can include "prune", "fertilize", and "poison"
    this.modItems = []; // items can include "sunlight", "moonlight", and "rain"
    this.getSegments = getSegments;
    this.animationTimeDiff = animationTimeDiff;
    this.timeouts = [];
    this.animateGrowth = animateGrowth;
    this.updateSegmentCount = updateSegmentCount;
    this.updateCurrentSegment = updateCurrentSegment;
    this.prune = prune;
    this.giveItem = giveItem;
    this.addMods = addMods;
}


/* Target Class methods */

function prune(multiplier) {
    
    if (this.prunes + multiplier <= this.maxPrunes) { // Can't exceed the maximum allowed number of prune actions
        this.prunes += multiplier; // Update the prune count
        const pruneCounterSpan = document.querySelector(`#${this.domID} .prunes-counter`);
        pruneCounterSpan.innerText = this.prunes;
    
        if (!this.trunkSegments.includes(this.currentSegmentNumber) && // No pruning the trunk!
            this.currentSegmentNumber <= this.totalSegments) { // No pruning after the animation is over!

            const segment1Back = document.querySelector(`#${this.domID} .tree-seg[data-segOrder='${this.currentSegmentNumber - 1}']`);
            const segment2Back = document.querySelector(`#${this.domID} .tree-seg[data-segOrder='${this.currentSegmentNumber - 2}']`);
            const segment3Back = document.querySelector(`#${this.domID} .tree-seg[data-segOrder='${this.currentSegmentNumber - 3}']`);

            if (multiplier >= 2) {
                if (segment1Back && !this.trunkSegments.includes(segment1Back.getAttribute("data-segOrder"))) {
                    segment1Back.classList.add('hidden');
                    this.updateSegmentCount(-1);
                }
                if (segment2Back && !this.trunkSegments.includes(segment2Back.getAttribute("data-segOrder"))) {
                    segment2Back.classList.add('hidden');
                    this.updateSegmentCount(-1);
                }
            }
            if (multiplier === 3) {
                if (segment3Back && !this.trunkSegments.includes(segment3Back.getAttribute("data-segOrder"))) {
                    segment3Back.classList.add('hidden');
                    this.updateSegmentCount(-1);
                }
            }

            // Find the position where the trunk continues after the current branch
            const nextPostBranchSegmentNumber = this.postBranchSegments.find( branchPointNumber => {
                return branchPointNumber >= this.currentSegmentNumber;
            });
            
            // Halt the current animation
            this.timeouts.forEach( timeoutID => {
                clearTimeout(timeoutID);
            });
        
            // Restart animation at the next trunk segment
            this.updateCurrentSegment(nextPostBranchSegmentNumber);
            this.animateGrowth(this, nextPostBranchSegmentNumber, this.animationTimeDiff);
        }
    }
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
   param timeDifferential = number of milliseconds delay between unhiding sequential segments.
   param startingSegment = the segment number (i.e. data-segOrder attribute) at which to begin animation. */
function animateGrowth(target, startingSegment, timeDifferential) {

    const segments = target.getSegments().slice(startingSegment - 1);

    // Set staggered timeouts for the target (tree) growth segments
    segments.forEach( (segment, index) => {
        const timeDiff = timeDifferential;
        delayDisplay(segment, index * timeDiff);
    });

    // Unhide growth segments on a staggered time-schedule
    function delayDisplay(element, interval) {
        function unhide() {
            element.classList.toggle("hidden");
            target.updateSegmentCount(); // Also update the growth-segments count
            target.updateCurrentSegment(); // ...and the current-segment record
        }
        const timeoutID = setTimeout(unhide, interval);
        target.timeouts.push(timeoutID);
    }
}

function updateCurrentSegment(number) {
    if (!number) { // Update by 1 if no argument was given
        this.currentSegmentNumber += 1;
    } else { // Otherwise, update to match the given argument
        this.currentSegmentNumber = number;
    }
}

// Update the count of growth segments that have been added to the target (tree)
function updateSegmentCount(number) {
    if (!number) { // Update by 1 if no argument was given
        this.segmentCount += 1;
    } else { // Otherwise, update by the given argument
        this.segmentCount += number;
    }
    const segmentCounterSpan = document.querySelector(`#${this.domID} .segments-counter`);
    segmentCounterSpan.innerText = this.segmentCount;
}

function giveItem() {

}

function addMods() {

}


/* Game Class */
function Game() {
    this.target = new Target("blacktree", "black-tree", 144, 54, 8, 800, [
        1,2,3,21,22,27,28,57,58,59,60,83,84,95,96,101,102,117,118,119,120,121,129,130,135,136,137,138,142,143,144
    ], [
        21, 27, 33, 57, 83, 95, 101, 117, 129, 135, 142
    ]);
    this.drawTargetName = drawTargetName;
    this.drawCounters = drawCounters;
    this.drawActionButtons = drawActionButtons;
    this.activatePruneButtons = activatePruneButtons;
    
    // this.activate = activate;
    // this.drawStatus = drawStatus;
    // this.activateModBtns = activateModBtns;
    // this.healthSpan = document.querySelector(".target-health");
    // this.hitsSpan = document.querySelector(".target-hits");
    // this.modifiers = {
    //     modifier1: new Modifier("modifier1", 0.25, "description1"),
    //     modifier2: new Modifier("modifier2", 0.5, "description2"),
    //     modifier3: new Modifier("modifier3", 0.75, "description3")
    // };
}

function activatePruneButtons(target) {
    const buttons = document.querySelectorAll(`#${target.domID} .prune.btn`);
    
    buttons.forEach( button => {
        button.addEventListener("click", () => {
            let multiplier = 1;
            const buttonClasses = Array.from(button.classList);
            if (buttonClasses.includes("x2")) {
                multiplier = 2;
            }
            if (buttonClasses.includes("x3")) {
                multiplier = 3;
            }
            target.prune.bind(target)(multiplier);
        });
    });
}

function drawTargetName(target) {
    const targetDiv = document.querySelector(`#${target.domID}`);
    const newElt = document.createElement("p");
    newElt.className = "target-name";
    newElt.innerText = target.name;
    targetDiv.appendChild(newElt);
}

function drawCounters(target) {
    const targetDiv = document.querySelector(`#${target.domID}`);
    const newDiv = document.createElement("div");
    newDiv.className = "target-counters";
    targetDiv.insertAdjacentElement('afterbegin', newDiv);

    const template = `
        <div class="game-stats-counter">
            <span class="counter-label">Growth segments (of ${target.maxSegments} max): </span>
            <span class="segments-counter">0</span>
        </div>
        <div class="game-stats-counter">
            <span class="counter-label">Prunes used (of ${target.maxPrunes} max): </span>
            <span class="prunes-counter">0</span>
        </div>
    `;
    newDiv.innerHTML = template;
}

function drawActionButtons(target) {
    const targetDiv = document.querySelector(`#${target.domID}`);
    const newDiv = document.createElement("div");
    newDiv.className = "action-buttons";
    targetDiv.appendChild(newDiv);

    const template = `
        <button class="prune x1 btn">PRUNE (x1)</button>
        <button class="prune x2 btn">PRUNE (x2)</button>
        <button class="prune x3 btn">PRUNE (x3)</button>
    `;
    newDiv.innerHTML = template;
}
