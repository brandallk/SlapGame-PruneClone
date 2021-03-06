### "Prune" Game (a simplified version)

Link to the live project: [Prune Game](https://brandallk.github.io/SlapGame-PruneClone/)

This game is an adaptation of the popular indie game ["Prune"](http://www.prunegame.com/).

This game animates the growth of a ("target") tree whose branches can be "pruned" in 3 different ways as it grows -- in order to guide its growth toward a light-source before the maximum growth-size of the tree runs out.

The game "modifiers" are three conditions ("clouds", "moonlight", and "handicap") that modify game-play potentially to the advantage of the player. The modifier conditions can be applied via a button for each. (They can be mixed/matched, but each can be added only once. Also, modifiers must be added before game-play starts; the button event-listeners won't apply modifiers if the game is in progress.)

The tree's animation was built by: 1. Creating a tree SVG in Adobe Illustrator that has 144 different "segments", each of which is a separate element inside the SVG, referenced by a class-name and a data-attribute "data-segOrder". 2. Placing the SVG into the index.html file, then "hiding" its segments by applying a CSS class "hidden". 3. Using a JavaScript function to apply setTimeout delays to each tree segment in a staggered way so that each is "unhidden" be removing the "hidden" CSS class from it according to a schedule.

FYI, for testing: a good way to "win" the game without altering the settings on lines 256-258 in game.js is...Use the "PRUNE X1" button to prune each branch at its first segment except for banches 2, 3, and 10.

##### How the app was made

The game was built using vanilla JavaScript and CSS3.

This app was built by me, [Randy King](https://github.com/brandallk), while a full-stack web developer student at the Boise CodeWorks bootcamp.