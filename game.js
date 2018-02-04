
// Initiate the game
const game = new Game();
game.drawTargetName(game.target);
game.drawCounters(game.target);
game.drawActionButtons(game.target);
game.drawModifierButtons(game.target);
game.activatePruneButtons(game.target);
game.activateModifierButtons(game.target);
game.activateStartButton();
game.activateResetButton();



/* Target Class */
function Target(name, domID, totalSegments, maxSegments, maxPrunes, animationTimeDiff, trunkSegments, postBranchSegments) {
    this.name = name;
    this.domID = domID; // id of the HTML element containing the target
    this.segmentCount = 0; // number of growth segments the target (tree) has added
    this.currentSegmentNumber = 0; // the data-segOrder attribute of the last-added growth segment
    this.totalSegments = totalSegments;
    this.originalMaxSegments = maxSegments;
    this.maxSegments = maxSegments; // maximum number of segments allowed before game is lost (31 is minimum to win)
    this.prunes = 0; // number of prune-actions enacted by user
    this.originalMaxPrunes = maxPrunes;
    this.maxPrunes = maxPrunes; // maximum number of prune-actions allowed (11 is minimum to win)
    this.trunkSegments = trunkSegments;
    this.postBranchSegments = postBranchSegments; // data-segOrder attributes of target (tree) segments immediately following a branch-point
    this.getSegments = getSegments;
    this.originalAnimationTimeDiff = animationTimeDiff;
    this.animationTimeDiff = animationTimeDiff;
    this.timeouts = [];
    this.animateGrowth = animateGrowth;
    this.updateSegmentCount = updateSegmentCount;
    this.updateCurrentSegment = updateCurrentSegment;
    this.prune = prune;
    this.modifiers = []; // modifier items can include "clouds", "moonlight", and "handicap"
    this.giveItem = giveItem;
    this.toggleVisibility = toggleVisibility;
}


/* Target Class methods */

function toggleVisibility(state) {
    const targetElt = document.querySelector(`#${this.domID}`);
    const segments = Array.from(targetElt.querySelectorAll(".tree-seg"));
    segments.forEach( segment => {
        if (state === "hide") {
            segment.classList.add("hidden");
        } else if (state === "show") {
            segment.classList.remove("hidden");
        }
    });
}

function prune(multiplier) {
    
    if (this.prunes + multiplier <= this.maxPrunes) { // Can't exceed the maximum allowed number of prune actions
        this.prunes += multiplier; // Update the prune count
        const pruneCounterSpan = document.querySelector(`#${this.domID} .prunes-counter`);
        pruneCounterSpan.innerText = this.prunes;
    
        if (!this.trunkSegments.includes(this.currentSegmentNumber) && // No pruning the trunk!
            this.currentSegmentNumber <= this.totalSegments) { // No pruning after the animation is over!

            const segment1Back = document.querySelector(`#${this.domID} .tree-seg[data-segorder='${this.currentSegmentNumber - 1}']`);
            const segment2Back = document.querySelector(`#${this.domID} .tree-seg[data-segorder='${this.currentSegmentNumber - 2}']`);
            const segment3Back = document.querySelector(`#${this.domID} .tree-seg[data-segorder='${this.currentSegmentNumber - 3}']`);

            if (multiplier >= 2) {
                if (segment1Back && !this.trunkSegments.includes(Number(segment1Back.getAttribute("data-segorder")))) {
                    segment1Back.classList.add('hidden');
                    this.updateSegmentCount(-1);
                }
                if (segment2Back && !this.trunkSegments.includes(Number(segment2Back.getAttribute("data-segorder")))) {
                    segment2Back.classList.add('hidden');
                    this.updateSegmentCount(-1);
                }
            }
            if (multiplier === 3) {
                if (segment3Back && !this.trunkSegments.includes(Number(segment3Back.getAttribute("data-segorder")))) {
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
            if (target.segmentCount < target.maxSegments) {
                element.classList.toggle("hidden");
            }
            if (target.segmentCount >= target.maxSegments ||
                target.currentSegmentNumber === target.totalSegments) {
                    game.end(game.getResult(target));
            } else {
                if (target.segmentCount < target.maxSegments) {
                    target.updateSegmentCount(); // Also update the growth-segments count
                    target.updateCurrentSegment(); // ...and the current-segment record
                }
            }
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

function giveItem(modifier) {
    if (!this.modifiers.includes(modifier)) {
        this.modifiers.push(modifier);
        modifier.modifierEffect1();
        if (modifier.modifierEffect2 !== null) {
            modifier.modifierEffect2();
        }
        game.drawCounters(this);
    }
}


/* Modifier Class */
function Modifier(name, modifier, modifierEffect1, modifierEffect2, description) {
    this.name = name;
    this.modifier = modifier;
    this.modifierEffect1 = modifierEffect1;
    this.modifierEffect2 = modifierEffect2;
    this.description = description;
}


/* Game Class */
function Game() {
    this.target = new Target("blacktree", "black-tree", 144, 54, 8, 400, [
        1,2,3,21,22,27,28,57,58,59,60,83,84,95,96,101,102,117,118,119,120,121,129,130,135,136,137,138,142,143,144
    ], [
        21, 27, 33, 57, 83, 95, 101, 117, 129, 135, 142
    ]);

    this.drawTargetName = drawTargetName;
    this.drawCounters = drawCounters;
    this.drawActionButtons = drawActionButtons;
    this.activatePruneButtons = activatePruneButtons;
    this.activateStartButton = activateStartButton;
    this.activateResetButton = activateResetButton;

    this.inProgress = false;
    this.start = start;
    this.end = end;
    this.getResult = getResult;
    this.reset = reset;

    this.modifiers = {
        clouds: new Modifier(
            "clouds",
            [1.5, 5],
            function() { game.target.animationTimeDiff *= this.modifier[0] },
            function() { game.target.maxSegments -= this.modifier[1] },
            "Clouds reduce the target (tree) growth rate, but also decrease the maximum allowed growth segments."
        ),
        moonlight: new Modifier(
            "moonlight",
            [8, 2],
            function() { game.target.maxSegments += this.modifier[0] },
            function() { game.target.maxPrunes -= this.modifier[1] },
            "Moonlight increases maximum allowed growth segments, but also reduces the maximum allowed prune actions."
        ),
        handicap: new Modifier(
            "handicap",
            10,
            function() { game.target.maxSegments += this.modifier },
            null,
            "Handicap adds 10 to the maxiumum allowed growth segments."
        )
    }

    this.drawModifierButtons = drawModifierButtons;
    this.activateModifierButtons = activateModifierButtons;
    this.activate = activate;
}

function reset(target) {
    target.segmentCount = 0;
    target.currentSegmentNumber = 0;
    target.maxSegments = target.originalMaxSegments;
    target.prunes = 0;
    target.maxPrunes = target.originalMaxPrunes;
    target.modifiers = [];
    target.animationTimeDiff = target.originalAnimationTimeDiff;

    const targetSVG = document.querySelector(`#${this.target.domID} svg`);
    targetSVG.classList.toggle("faded");

    target.toggleVisibility("show");
    this.drawCounters(target);
}

function activateResetButton() {
    const resetButton = document.querySelector(".main-control button.reset");
    const startButton = document.querySelector(".main-control button.begin");

    resetButton.addEventListener("click", () => {
        this.reset(this.target);
        resetButton.classList.add("hidden");
        startButton.classList.remove("hidden");
    });
}

function activateStartButton() {
    const button = document.querySelector(".main-control button.begin");

    button.addEventListener("click", () => {
        this.start();
        button.classList.add("hidden");
    });
}

function start() {
    const targetSVG = document.querySelector(`#${this.target.domID} svg`);
    targetSVG.classList.toggle("faded");

    this.target.toggleVisibility("hide");
    this.target.animateGrowth(this.target, 1, this.target.animationTimeDiff);
    this.inProgress = true;
    this.target.updateCurrentSegment();
    this.drawCounters(this.target);
}

function end(gameResult) {
    // Halt the current animation
    this.target.timeouts.forEach( timeoutID => {
        clearTimeout(timeoutID);
    });
    this.inProgress = false;

    const msgHeading = document.querySelector(".main-control .game-result");
    if (gameResult === "success") {
        msgHeading.innerText = "SUCCESS!";
    } else {
        msgHeading.innerText = "FAILURE!";
    }

    const beginButton = document.querySelector(".main-control button.begin");
    const resetButton = document.querySelector(".main-control button.reset");
    beginButton.classList.add("hidden");
    resetButton.classList.remove("hidden");
}

function getResult(target) {
    if (target.segmentCount < target.maxSegments) {
        return "success";
    }
    return "failure";
}

function drawModifierButtons(target) {
    const targetDiv = document.querySelector(`#${target.domID}`);

    buttonsDiv = document.createElement("div");
    buttonsDiv.className = "target-counters";
    targetDiv.insertAdjacentElement('beforebegin', buttonsDiv);

    const template = `
        <button class="modifier handicap btn">HANDICAP</button>
        <button class="modifier clouds btn">CLOUDS</button>
        <button class="modifier moonlight btn">MOONLIGHT</button>
    `;
    buttonsDiv.innerHTML = template;
}

function activateModifierButtons(target) {
    const buttons = document.querySelectorAll(`.modifier.btn`);
    
    buttons.forEach( button => {
        button.addEventListener("click", () => {
            if (!this.inProgress) {
                const buttonClasses = Array.from(button.classList);
                if (buttonClasses.includes("handicap")) {
                    target.giveItem(game.modifiers.handicap);
                }
                if (buttonClasses.includes("clouds")) {
                    target.giveItem(game.modifiers.clouds);
                }
                if (buttonClasses.includes("moonlight")) {
                    target.giveItem(game.modifiers.moonlight);
                }
            }
        });
    });
}

function activate() {

}

function activatePruneButtons(target) {
    const buttons = document.querySelectorAll(`#${target.domID} .prune.btn`);
    
    buttons.forEach( button => {
        button.addEventListener("click", () => {
            if (this.inProgress) {
                let multiplier = 1;
                const buttonClasses = Array.from(button.classList);
                if (buttonClasses.includes("x2")) {
                    multiplier = 2;
                }
                if (buttonClasses.includes("x3")) {
                    multiplier = 3;
                }
                target.prune.bind(target)(multiplier);
            }
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
    let countersDiv = document.querySelector(`#${target.domID} div.target-counters`);

    if (countersDiv) {
        countersDiv.innerHTML = "";
    } else {
        countersDiv = document.createElement("div");
        countersDiv.className = "target-counters";
        targetDiv.insertAdjacentElement('afterbegin', countersDiv);
    }

    const template = `
        <div class="game-stats-counter">
            <span class="counter-label">Growth segments (of ${target.maxSegments} max): </span>
            <span class="segments-counter">${target.currentSegmentNumber}</span>
        </div>
        <div class="game-stats-counter">
            <span class="counter-label">Prunes used (of ${target.maxPrunes} max): </span>
            <span class="prunes-counter">${target.prunes}</span>
        </div>
    `;
    countersDiv.innerHTML = template;
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
