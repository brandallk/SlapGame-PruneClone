
// Initiate the game
const game = new Game();
game.drawCounters(game.target);
game.drawButtons();
game.activate();
// game.drawTargetName(game.target); // (In this game's context, it doesn't really make sense to display the target's name.)


/*********************
    Target Class 
**********************/
function Target(name, domID, totalSegments, maxSegments, maxPrunes, animationTimeDiff, trunkSegments, postBranchSegments) {
    this.name = name;
    this.domID = domID; // id of the HTML element containing the target

    this.totalSegments = totalSegments;
    this.maxSegments = maxSegments; // maximum number of segments allowed before game is lost (31 is minimum to win)
    this.originalMaxSegments = maxSegments;
    this.trunkSegments = trunkSegments;
    this.postBranchSegments = postBranchSegments; // data-segOrder attributes of target (tree) segments immediately following a branch-point
    this.segmentCount = 0; // number of growth segments the target (tree) has added
    this.currentSegmentNumber = 0; // the data-segOrder attribute of the last-added growth segment

    this.maxPrunes = maxPrunes; // maximum number of prune-actions allowed (11 is minimum to win)
    this.originalMaxPrunes = maxPrunes;
    this.prunes = 0; // number of prune-actions enacted by user

    this.animationTimeDiff = animationTimeDiff;
    this.originalAnimationTimeDiff = animationTimeDiff;
    this.timeouts = [];

    this.modifiers = []; // modifier items can include "clouds", "moonlight", and "handicap"
    this.giveItem = giveItem;

    this.prune = prune;
    this.animateGrowth = animateGrowth;
    this.getSegments = getSegments;
    this.updateSegmentCount = updateSegmentCount;
    this.updateCurrentSegment = updateCurrentSegment;
    this.toggleVisibility = toggleVisibility;
}

function giveItem(modifier) {
    if (!this.modifiers.includes(modifier)) {
        this.modifiers.push(modifier);
        modifier.modifierEffect1();
        if (modifier.modifierEffect2 !== null) {
            modifier.modifierEffect2();
        }
        game.drawCounters(this);

        modifier.toggleIndicator.classList.remove("faded");
    }

    const currentModNames = this.modifiers.map( modifier => {
        return modifier.name;
    });

    const gameWindow = document.querySelector("div.game-window");
    const handicapIndicator = document.querySelector("div.handicap span.indicator");
    if (currentModNames.includes("clouds") && currentModNames.includes("moonlight")) {
        gameWindow.classList.add("darker-bluer-background")
    } else if (currentModNames.includes("clouds")) {
        gameWindow.classList.add("darker-background")
    } else if (currentModNames.includes("moonlight")) {
        gameWindow.classList.add("bluer-background")
    }
    if (currentModNames.includes("handicap")) {
        handicapIndicator.innerHTML = "&#10003;";
    }
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

function updateCurrentSegment(number) {
    if (!number) { // Update by 1 if no argument was given
        this.currentSegmentNumber += 1;
    } else { // Otherwise, update to match the given argument
        this.currentSegmentNumber = number;
    }
}

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


/*********************
    Modifier Class 
**********************/
function Modifier(name, modifier, modifierEffect1, modifierEffect2, description, toggleIndicator) {
    this.name = name;
    this.modifier = modifier;
    this.modifierEffect1 = modifierEffect1;
    this.modifierEffect2 = modifierEffect2;
    this.description = description;
    this.toggleIndicator = toggleIndicator;
}


/*********************
    Game Class 
**********************/
function Game() {
    this.target = new Target(
        "blacktree",
        "black-tree",
        144,
        54,
        8,
        600,
        [1,2,3,21,22,27,28,57,58,59,60,83,84,95,96,101,102,117,118,119,120,121,129,130,135,136,137,138,142,143,144], 
        [21, 27, 33, 57, 83, 95, 101, 117, 129, 135, 142]
    );
    this.modifiers = {
        clouds: new Modifier(
            "clouds",
            [1.5, 5],
            function() { game.target.animationTimeDiff *= this.modifier[0] },
            function() { game.target.maxSegments -= this.modifier[1] },
            "Clouds reduce the target (tree) growth rate, but also decrease the maximum allowed growth segments.",
            document.querySelector("img.clouds")
        ),
        moonlight: new Modifier(
            "moonlight",
            [8, 2],
            function() { game.target.maxSegments += this.modifier[0] },
            function() { game.target.maxPrunes -= this.modifier[1] },
            "Moonlight increases maximum allowed growth segments, but also reduces the maximum allowed prune actions.",
            document.querySelector("img.moonlight")
        ),
        handicap: new Modifier(
            "handicap",
            10,
            function() { game.target.maxSegments += this.modifier },
            null,
            "Handicap adds 10 to the maxiumum allowed growth segments.",
            document.querySelector("div.handicap.badge")
        )
    };
    this.inProgress = false;

    this.drawCounters = drawCounters;
    this.drawButtons = drawButtons;
    this.activate = activate;

    this.start = start;
    this.end = end;
    this.getResult = getResult;
    this.reset = reset;
    // this.drawTargetName = drawTargetName;  // (In this game's context, it doesn't really make sense to display the target's name.)
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
        <div class="row">
            <div class="game-stats-counter col-10">
                <p class="counter-label text-right">growth segments (${target.maxSegments} max): </p>
                <p class="counter-label text-right">prunes (${target.maxPrunes} max): </p>
            </div>
            <div class="game-stats-counter col-2">
                <p class="segments-counter">${target.currentSegmentNumber}</p>
                <p class="prunes-counter">${target.prunes}</p>
            </div>
        </div>
    `;
    countersDiv.innerHTML = template;
}

function drawButtons() {
    drawModifierButtons();
    drawActionButtons();
}

function activate() {
    activateStartButton(this);
    activateResetButton(this);
    activatePruneButtons(this);
    activateModifierButtons(this);
}

function start() {
    const targetSVG = document.querySelector(`#${this.target.domID} svg`);
    targetSVG.classList.toggle("faded");

    this.target.toggleVisibility("hide");
    this.target.animateGrowth(this.target, 1, this.target.animationTimeDiff);
    this.inProgress = true;
    this.target.updateCurrentSegment();
    this.drawCounters(this.target);

    const blossoms = document.querySelector("img.tree-blossoms");
    blossoms.classList.remove("faded");
    blossoms.classList.add("hidden");
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

        const blossoms = document.querySelector("img.tree-blossoms");
        blossoms.classList.remove("hidden");
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

function reset(target) {
    target.segmentCount = 0;
    target.currentSegmentNumber = 0;
    target.maxSegments = target.originalMaxSegments;
    target.prunes = 0;
    target.maxPrunes = target.originalMaxPrunes;
    target.animationTimeDiff = target.originalAnimationTimeDiff;

    target.modifiers.forEach( modifier => {
        modifier.toggleIndicator.classList.add("faded");        
    });
    target.modifiers = [];

    const targetSVG = document.querySelector(`#${this.target.domID} svg`);
    targetSVG.classList.toggle("faded");

    target.toggleVisibility("show");
    this.drawCounters(target);

    const blossoms = document.querySelector("img.tree-blossoms");
    blossoms.classList.add("faded");
    blossoms.classList.remove("hidden");

    const msgHeading = document.querySelector(".main-control .game-result");
    msgHeading.innerText = "";

    const gameWindow = document.querySelector("div.game-window");
    const handicapIndicator = document.querySelector("div.handicap span.indicator");
    gameWindow.className = "game-window col-12 col-md-9";
    handicapIndicator.innerHTML = "no";
}

function drawActionButtons() {
    const targetDiv = document.querySelector(".main-control div.row");
    const newDiv = document.createElement("div");
    newDiv.className = "action-buttons col-12 mb-4 mb-md-0 col-md-6 text-center";
    targetDiv.insertAdjacentElement('afterbegin', newDiv);

    const template = `
        <button class="prune x1 btn btn-sm btn-outline-danger">PRUNE (x1)</button>
        <button class="prune x2 btn btn-sm btn-outline-danger">PRUNE (x2)</button>
        <button class="prune x3 btn btn-sm btn-outline-danger">PRUNE (x3)</button>
    `;
    newDiv.innerHTML = template;
}

function drawModifierButtons() {
    const targetDiv = document.querySelector(".main-control");

    rowDiv = document.createElement("div");
    rowDiv.className = "row";
    targetDiv.insertAdjacentElement('afterbegin', rowDiv);

    buttonsDiv = document.createElement("div");
    buttonsDiv.className = "modifier-buttons col-12 col-md-6 text-center";
    rowDiv.insertAdjacentElement('afterbegin', buttonsDiv);

    const template = `
        <button class="modifier handicap btn btn-sm btn-outline-danger">HANDICAP</button>
        <button class="modifier clouds btn btn-sm btn-outline-danger">CLOUDS</button>
        <button class="modifier moonlight btn btn-sm btn-outline-danger">MOONLIGHT</button>
    `;
    buttonsDiv.innerHTML = template;
}

function activateStartButton(game) {
    const button = document.querySelector(".main-control button.begin");

    button.addEventListener("click", () => {
        game.start();
        button.classList.add("hidden");
    });
}

function activateResetButton(game) {
    const resetButton = document.querySelector(".main-control button.reset");
    const startButton = document.querySelector(".main-control button.begin");

    resetButton.addEventListener("click", () => {
        game.reset(game.target);
        resetButton.classList.add("hidden");
        startButton.classList.remove("hidden");
    });
}

function activatePruneButtons(game) {
    const buttons = document.querySelectorAll(".prune.btn");
    
    buttons.forEach( button => {
        button.addEventListener("click", () => {
            if (game.inProgress) {
                let multiplier = 1;
                const buttonClasses = Array.from(button.classList);
                if (buttonClasses.includes("x2")) {
                    multiplier = 2;
                }
                if (buttonClasses.includes("x3")) {
                    multiplier = 3;
                }
                game.target.prune.bind(game.target)(multiplier);
            }
        });
    });
}

function activateModifierButtons(game) {
    const buttons = document.querySelectorAll(`.modifier.btn`);
    
    buttons.forEach( button => {
        button.addEventListener("click", () => {
            if (!game.inProgress) {
                const buttonClasses = Array.from(button.classList);
                if (buttonClasses.includes("handicap")) {
                    game.target.giveItem(game.modifiers.handicap);
                }
                if (buttonClasses.includes("clouds")) {
                    game.target.giveItem(game.modifiers.clouds);
                }
                if (buttonClasses.includes("moonlight")) {
                    game.target.giveItem(game.modifiers.moonlight);
                }
            }
        });
    });
}

 // (In this game's context, it doesn't really make sense to display the target's name.)
// function drawTargetName(target) {
//     const targetDiv = document.querySelector(`#${target.domID}`);
//     const newElt = document.createElement("p");
//     newElt.className = "target-name";
//     newElt.innerText = target.name;
//     targetDiv.appendChild(newElt);
// }
