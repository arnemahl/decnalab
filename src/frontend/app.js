/*eslint-disable*/

var ANIMATE_MOVES = true;
var MS_PER_TICK = 20;

var stateIndex;
var state;
var nextState;
var replayFinished;
var error;

var rendering = false;
var isLoading = true;
var justFinishedLoading = false;

var magicSpace = ' '; // Not pruned by SVG.js (U+2007: figure space -- https://en.wikipedia.org/wiki/Whitespace_character)

var cssDisableTextSelection = 'user-select: none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;';

var Renderer = (function() {

    if (!SVG.supported) {
        alert('Your browser does not support SVG');
        return;
    }

    var paper = SVG('game-map').size('100%', '100%');
    var staticPaper = SVG('game-overlay').size('100%', '100%');

    function drawLoadingScreen() {

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
          var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

          return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
          };
        }

        function describeArc(x, y, radius, startAngle, endAngle){

            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

            return [
                "M", start.x, start.y, 
                "A", radius, radius, 0, arcSweep, 0, end.x, end.y
            ].join(" ");
        }

        var center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };

        function spinner(color, radius, rotation) {
            return staticPaper.path(describeArc(0, 0, radius, 0, 270))
            .attr({
                fill: 'none',
                stroke: color,
                'stroke-width': 10
            })
            .center(center.x, center.y)
            .animate(2000)
            .rotate(rotation)
            .loop();
        }

        spinner('mediumvioletred', 50, 360);
        spinner('mediumseagreen', 70, -360);

        staticPaper.text('LOADING')
            .x(center.x)
            .y(center.y)
            .dy(150)
            .font({size: 54, anchor: 'middle'})
            .fill('peachpuff')
            .animate(1000, '>')
            .attr({opacity: 0.5})
            .loop(true, true);
    }

    function drawError() {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        var center = {
            x: ww / 2,
            y: wh / 2
        };

        staticPaper.text(error).center(center.x, center.y);
    }

    function drawReplayFinished() {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        var center = {
            x: ww / 2,
            y: wh / 2
        };

        staticPaper.text('Replay finished').center(center.x, center.y).font({size: ww / 15, anchor: 'middle'}).fill('mediumvioletred');
    }

    var drawGameState = (function() {

        var selectedUnits = []; // user selected units

        function isSelected(unit) {
            return selectedUnits.indexOf(unit) !== -1;
        }

        function getMapArea(screenArea) {
            var viewbox = paper.viewbox();

            // Magic to adjust for the fact that all of the viewbox will fit on the screen,
            // and to perserve aspet ratio some padding may be added on one one of the dimensions
            var xx = document.documentElement.clientWidth / viewbox.width;
            var yy = document.documentElement.clientHeight / viewbox.height;

            var offsetX = xx <= yy ? 0 : (xx - yy) * 0.5 * viewbox.width;
            var offsetY = yy <= xx ? 0 : (yy - xx) * 0.5 * viewbox.height;

            return {
                x: viewbox.x + (screenArea.x - offsetX) / viewbox.zoom,
                y: viewbox.y + (screenArea.y - offsetY) / viewbox.zoom,
                width: screenArea.width / viewbox.zoom,
                height: screenArea.height / viewbox.zoom
            }
        }

        function contains(mapArea, position) {
            return mapArea.x <= position.x && position.x <= mapArea.x + mapArea.width
                && mapArea.y <= position.y && position.y <= mapArea.y + mapArea.height;
        }

        function getUnitsInScreenArea(area) {
            var mapArea = getMapArea(area);

            var allUnits = state.teams[0].units.concat(state.teams[1].units);

            var selectedUnits = allUnits.filter(function(unit) {
                return contains(mapArea, calculateUnitPosition(unit, state.tick));
            });

            return selectedUnits;
        }

        function selectUnitsInArea(area) {
            selectedUnits = getUnitsInScreenArea(area);

            console.log('selectedUnits:', selectedUnits); // DEBUG

            Renderer.render();
        }

        function getUnitInState(gameState, teamId, unitId) {
            return gameState && gameState
                .teams.find(team => team.id === teamId)
                .units.find(unit => unit.id === unitId);
        }

        function calculateUnitPosition(unit, currentTick) {
            return {
                x: unit.position.x + unit.speed.x * (currentTick - unit.speedSetAtTick),
                y: unit.position.y + unit.speed.y * (currentTick - unit.speedSetAtTick)
            };
        }


        var ensureNavigationListenersAreInitialized = (function() {
            return function() {
                ensureNavigationListenersAreInitialized = function() {}

                var wbx = 29000;
                var wby = 8000;
                var span = 4000;

                paper.viewbox(wbx, wby, span, span);

                document.addEventListener('wheel', function(event) {
                    event.preventDefault();
                    if (event.ctrlKey) {
                        var zoom = span / 1000 * event.deltaY;

                        if (100000 < (span + zoom) || (span + zoom) < 10) {
                            return;
                        }

                        span += zoom;
                        wbx -= zoom * event.clientX / window.innerWidth;
                        wby -= zoom * event.clientY / window.innerHeight;
                    } else {
                        wbx += event.deltaX * span / 2000;
                        wby += event.deltaY * span / 2000;
                    }
                    paper.viewbox(wbx, wby, span, span);
                });

                // Enable drag selection of units
                document.addEventListener('mousedown', asdf = function(event) {
                    var rectX = event.pageX;
                    var rectY = event.pageY;

                    var rect = staticPaper
                        .rect(0, 0)
                        .move(rectX, rectY)
                        .fill({
                            color: 'olivedrab',
                            opacity: 0.3
                        })
                        .stroke({
                            color: 'olivedrab',
                            opacity: 0.8,
                            width: 1
                        });

                    var getSelectionArea = function(event) {
                        var x = Math.min(event.pageX, rectX);
                        var width = Math.max(event.pageX, rectX) - x;

                        var y = Math.min(event.pageY, rectY);
                        var height = Math.max(event.pageY, rectY) - y;

                        return {
                            x: x,
                            y: y,
                            width: width,
                            height: height
                        };
                    }

                    var onMouseMove = (function() {
                        return function(event) {
                            rect.attr(getSelectionArea(event));
                        }
                    })();

                    var onMouseUp = (function() {
                        return function(event) {
                            rect.remove();
                            rect = void 0;
                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);

                            selectUnitsInArea(getSelectionArea(event));
                        }
                    })();

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });

                // Show controls, add onclick listener to Left and Right buttons
                document.getElementById('game-controls').style.display = 'unset';
                document.getElementById('button-next').onclick = goToNextState;
                document.getElementById('button-previous').onclick = goToPreviousState;

                // Add Listener for Left and Right arrow keys
                window.onkeydown = function(event) {
                    if (event.code === 'ArrowLeft') {
                        skipBack(event.ctrlKey ? 10 : 1);
                    }
                    if (event.code === 'ArrowRight') {
                        skipForward(event.ctrlKey ? 10 : 1);
                    }
                    if (event.code === 'PageUp') {
                        skipBack(100);
                    }
                    if (event.code === 'PageDown') {
                        skipForward(100);
                    }
                    if (event.code === 'Home') {
                        skipBack(1000);
                    }
                    if (event.code === 'End') {
                        skipForward(1000);
                    }

                    if (event.code === 'Space') {
                        ANIMATE_MOVES = !ANIMATE_MOVES;
                        Renderer.render();
                    }
                    if (event.code === 'ArrowUp') {
                        MS_PER_TICK /= 1.5;
                        Renderer.render();
                    }
                    if (event.code === 'ArrowDown') {
                        MS_PER_TICK *= 1.5;
                        Renderer.render();
                    }
                }
            }
        })();

        function drawCircle(position, size, text, attr) {
            var circle = paper.circle(size)
                .center(position.x, position.y)
                .opacity(0.7)
                .attr(attr);
            var text = paper.text(text)
                .x(position.x)
                .y(position.y)
                .dy(-40)
                .font({size: 40, anchor: 'middle'})
                .fill('snow');

            return paper.set().add(circle, text);
        }
        function drawSquare(position, size, text, attr) {
            paper.rect(size, size)
                .center(position.x, position.y)
                .opacity(0.7)
                .attr(attr);
            paper.text(text)
                .x(position.x)
                .y(position.y)
                .dy(-54)
                .font({size: 54, anchor: 'middle'})
                .opacity(0.9)
                .fill('snow');
        }
        function drawHealthBar(commandable, specs) {
            return paper.rect(commandable.healthLeftFactor * specs.size, 20)
                .center(commandable.position.x, commandable.position.y - specs.radius - 30)
                .attr({ fill: 'green' });
        }
        function drawCommands(commandable, specs) {
            return paper.text(commandable.commands.join('\n'))
                .x(commandable.position.x)
                .y(commandable.position.y)
                .font({ size: 36, anchor: 'middle'})
                .opacity(0.7)
                .fill('snow');
        }
        function drawUnit(unit, specs, circleAttr, nextUnitState) {

            var unitElement = paper.nested();

            // circle
            unitElement.circle(specs.size)
                .center(specs.radius, specs.radius)
                .opacity(0.7)
                .attr(circleAttr);
            // unit type
            unitElement.text(unit.type)
                .x(specs.radius)
                .y(specs.radius - 32)
                .font({size: 40, anchor: 'middle'})
                .fill('snow');
            // health bar
            unitElement.rect(unit.healthLeftFactor * specs.size, 20)
                .center(specs.radius, -20)
                .attr({ fill: 'green' });
            // commands
            unitElement.text(unit.commands[0]/*.join('\n')*/)
                .x(specs.radius)
                .y(specs.radius + 10)
                .font({size: 30, anchor: 'middle'})
                .opacity(0.7)
                .fill('white');

            // move to current position
            var currentPosition = calculateUnitPosition(unit, state.tick);

            unitElement.move(currentPosition.x, currentPosition.y);

            if (ANIMATE_MOVES && nextUnitState) {
                const ticksToAnimate = nextState.tick - state.tick;
                const nextPosition = calculateUnitPosition(nextUnitState, nextState.tick);

                if (unit.speed && (unit.speed.x !== 0 || unit.speed.y !== 0)) {
                    unitElement.animate(MS_PER_TICK * ticksToAnimate, '-').move(nextPosition.x, nextPosition.y);
                }
            }
        }

        function drawMapBackground() {
            paper.rect(state.map.width, state.map.height).fill('#222').back();
        }

        function drawResourceSites() {
            var resourceTypeAttrs = {
                abundant: {fill: 'darkturquoise'},
                sparse: {fill: 'hotpink'}
            };

            state.map.resourceSites.forEach(function(arr) {
                arr.forEach(function(rs) {
                    drawSquare(rs.position, rs.size, rs.resourceType + '\nresource site', resourceTypeAttrs[rs.resourceType]);
                });
            });
        }

        function drawTeamsUnitsAndStructures() {
            state.teams.forEach(function(team) {
                var teamAttr = {fill: team.id, stroke: '#222'}; // TODO make this sensible. Currently, teamId = 'blue'||'red'
                var teamAttrSelected = {fill: 'coral'};
                var teamAttrOnlyPlanned = {fill: 'transparent', stroke: team.id, 'stroke-width': 3};
                var teamAttrUnderConstruction = {fill: team.id, stroke: '#222', opacity: 0.3};

                team.structures.forEach(function(structure) {
                    const specs = team.structureSpecs[structure.type];

                    if (structure.isOnlyPlanned) {
                        drawSquare(structure.position, specs.size, structure.type + '\n\[planned\]', teamAttrOnlyPlanned);
                    } else if (structure.isUnderConstruction) {
                        drawSquare(structure.position, specs.size, structure.type + '\n\[under construction\]', teamAttrUnderConstruction);
                    } else {
                        drawSquare(structure.position, specs.size, structure.type, teamAttr);
                    }
                    drawHealthBar(structure, specs);
                    drawCommands(structure, specs);
                });
                team.units.forEach(function(unit) {
                    const specs = team.unitSpecs[unit.type];
                    const nextUnitState = nextState && getUnitInState(nextState, team.id, unit.id);

                    if (isSelected(unit)) {
                        drawUnit(unit, specs, teamAttrSelected, nextUnitState);
                    } else {
                        drawUnit(unit, specs, teamAttr, nextUnitState);
                    }
                });
                drawCircle(team.unitSpawnPosition, 500, 'spawn location', {fill: '#333', stroke: team.id, 'stroke-width': 5}).back();
            });
        }

        function drawTeamResources() {
            var resourceTypeAttrs = {
                abundant: {fill: 'darkturquoise'},
                sparse: {fill: 'hotpink'},
                supply: {fill: 'slategray'}
            };

            var text = staticPaper.text(function(add) {
                add.tspan('Resources');

                state.teams.forEach(function(team) {
                    add.tspan('').newLine();
                    add.tspan('Team '+team.id).fill(team.id).style('text-transform: capitalize').newLine();

                    function foo(resourceType, amount) {
                        var textPadding = Array(15-(resourceType + amount).length).fill(magicSpace).join('');
                        add.tspan(resourceType + textPadding + amount).attr(resourceTypeAttrs[resourceType]).newLine();
                    }

                    Object.keys(team.resources).forEach(function(resourceType) {
                        var amount = team.resources[resourceType];
                        foo(resourceType, amount);
                    });

                    var supplyValues = '' + team.usedSupply + '/' + team.supply;
                        foo('supply', supplyValues);
                });
            });

            text.x(20)
                .y(14)
                .font({size: 14})
                .style(cssDisableTextSelection);

            var bbox = text.bbox();

            staticPaper.rect(bbox.width, bbox.height)
                .x(bbox.x)
                .y(bbox.y)
                .fill('snow')
                .stroke('#222')
                .stroke({width: 2, opacity: 0.85})
                .scale(1.4, 1.25)
                .opacity(0.85)
                .back();
        }

        function drawFogOfWar() {
            state.map.visionSectors
                .filter(sector => state.teams.every(team =>
                    team.visibleMapSectorIds.indexOf(sector.id) === -1
                ))
                .forEach(sector => {
                    // Draw for of war
                    paper.rect(sector.width, sector.height)
                        .center(
                            sector.x + sector.width / 2,
                            sector.y + sector.height / 2
                        )
                        .fill('#272727')
                        .back();
                });
        }

        return function() {
            ensureNavigationListenersAreInitialized();
            document.getElementById('state-index').textContent = 'State '+stateIndex+' | Tick '+state.tick;

            drawResourceSites();
            drawTeamsUnitsAndStructures();
            drawTeamResources();
            drawFogOfWar();
            drawMapBackground();
        }
    })();

    let timeout;

    function _render () {
        rendering = true;

        paper.clear();
        staticPaper.clear();

        if (error) {
            drawError();
        } else if (state) {
            drawGameState();

            clearTimeout(timeout);

            if (ANIMATE_MOVES && nextState) {
                timeout = setTimeout(goToNextState, (nextState.tick - state.tick) * MS_PER_TICK);
            }
            if (replayFinished) {
                drawReplayFinished();
            }
        } else {
            drawLoadingScreen();
        }
        rendering = false;
    }

    return {
        render: function() {
            if (justFinishedLoading) {
                justFinishedLoading = false;
                paper.opacity(0);

                staticPaper.animate(250)
                    .opacity(0)
                    .after(function() {
                        _render();
                        staticPaper.animate(250).opacity(1);
                        paper.animate(250).opacity(1).after(function() {
                            Renderer.render = _render;
                            window.onresize = _render;
                        });
                    });
            } else {
                _render();
            }
        }
    };

})();

(function init() {
    Renderer.render();
    window.onresize = Renderer.render;
})();


var maxLoops = 1000;

var socket = io();

socket.emit('simulate-game', maxLoops);

socket.on('game-state', function(update) {
    stateIndex = update.stateIndex;
    state = update.state;
    nextState = update.nextState;

    if (isLoading) {
        justFinishedLoading = true;
        isLoading = false;
    }
    replayFinished = !update.nextState;

    Renderer.render();
});

socket.on('replay-finished', function() {
    replayFinished = true;
    Renderer.render();
});

socket.on('error', function(newError) {
    error = newError;
    Renderer.render();
});

function goToPreviousState() {
    if (rendering) return;
    socket.emit('skip-back', 1);
}
function goToNextState() {
    if (rendering) return;
    socket.emit('skip-forward', 1);
}
function skipForward(nofSkips) {
    if (rendering) return;
    socket.emit('skip-forward', nofSkips);
}
function skipBack(nofSkips) {
    if (rendering) return;
    socket.emit('skip-back', nofSkips);
}

/*eslint-enable*/
