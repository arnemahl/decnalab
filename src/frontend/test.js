/*eslint-disable*/

var stateIndex;
var state;
var error;

var rendering = false;
var isLoading = true;
var justFinishedLoading = false;

var magicSpace = ' '; // Not pruned by SVG.js (U+2007: figure space -- https://en.wikipedia.org/wiki/Whitespace_character)

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

    var drawGameState = (function() {

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

                // Show controls, add onclick listener to Left and Right buttons
                document.getElementById('game-controls').style.display = 'unset';
                document.getElementById('button-next').onclick = nextState;
                document.getElementById('button-previous').onclick = previousState;

                // Add Listener for Left and Right arrow keys
                window.onkeydown = function(event) {
                    if (event.code === 'ArrowLeft') {
                        previousState();
                    }
                    if (event.code === 'ArrowRight') {
                        nextState();
                    }
                }
            }
        })();

        function drawCircle(position, size, text, attr) {
            paper.circle(size)
                .center(position.x, position.y)
                .opacity(0.7)
                .attr(attr);
            paper.text(text)
                .x(position.x)
                .y(position.y)
                .dy(-40)
                .font({size: 40, anchor: 'middle'})
                .fill('snow');
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

        function drawMapBackground() {
            paper.rect(state.map.width, state.map.height).fill('#222');
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
                var teamAttrUnderConstruction = {fill: team.id, stroke: '#222', opacity: 0.3};

                team.structures.forEach(function(structure) {
                    if (structure.isUnderConstruction) {
                        drawSquare(structure.position, team.structureSpecs[structure.type].size, structure.type + '\n\[under construction\]', teamAttrUnderConstruction);
                    } else {
                        drawSquare(structure.position, team.structureSpecs[structure.type].size, structure.type, teamAttr);
                    }
                });
                team.units.forEach(function(unit) {
                    drawCircle(unit.position, team.unitSpecs[unit.type].size, unit.type, teamAttr);
                });
                drawCircle(team.unitSpawnPosition, 500, 'spawn location', {fill: '#333', stroke: team.id, 'stroke-width': 5});
            });
        }

        function drawTeamResources() {
            var resourceTypeAttrs = {
                abundant: {fill: 'darkturquoise'},
                sparse: {fill: 'hotpink'}
            };

            var text = staticPaper.text(function(add) {
                add.tspan('Resources');

                state.teams.forEach(function(team) {
                    add.tspan('').newLine();
                    add.tspan('Team '+team.id).fill(team.id).style('text-transform: capitalize').newLine();

                    Object.keys(team.resources).forEach(function(resourceType) {
                        var ammount = team.resources[resourceType];
                        var textPadding = Array(15-(resourceType + ammount).length).fill(magicSpace).join('');
                        add.tspan(resourceType + textPadding + ammount).attr(resourceTypeAttrs[resourceType]).newLine();
                    });
                });
            });

            text.x(20)
                .y(14)
                .font({size: 14});

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

        return function() {
            ensureNavigationListenersAreInitialized();
            document.getElementById('state-index').textContent = 'State '+stateIndex+' | Tick '+state.tick;

            drawMapBackground();
            drawResourceSites();
            drawTeamsUnitsAndStructures();
            drawTeamResources();
        }
    })();

    function _render () {
        rendering = true;

        paper.clear();
        staticPaper.clear();


        if (error) {
            drawError();
        } else if (state) {
            drawGameState();
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

    if (isLoading) {
        justFinishedLoading = true;
        isLoading = false;
    }

    Renderer.render();
});

socket.on('error', function(newError) {
    error = newError;
    Renderer.render();
});

function previousState() {
    if (rendering) return;
    socket.emit('previous-state');
}
function nextState() {
    if (rendering) return;
    socket.emit('next-state');
}

/*eslint-enable*/
