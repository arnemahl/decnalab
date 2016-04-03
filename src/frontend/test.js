/*eslint-disable*/

var stateIndex;
var state;
var error;

var redraw = (function() {

    if (!SVG.supported) {
        alert('Your browser does not support SVG');
        return;
    }

    var paper = SVG('svg').size('100%', '100%');

    function drawInit() {

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
            return paper.path(describeArc(0, 0, radius, 0, 270))
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

        paper.text('LOADING')
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

        paper.text(error).center(center.x, center.y);
    }

    var drawState = (function() {

        var ensureNavigationListenersAreInitialized = (function() {
            var initalized = false;

            var wbx = 29000;
            var wby = 8000;
            var span = 4000;

            return function() {
                if (initalized) {
                    return;
                }
                initialized = true;

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
                .fill('white');
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
                // .opacity(0.7)
                .fill('white');
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

                team.structures.forEach(function(structure) {
                    drawSquare(structure.position, team.structureSpecs[structure.type].size, structure.type, teamAttr);
                });
                team.units.forEach(function(unit) {
                    drawCircle(unit.position, team.unitSpecs[unit.type].size, unit.type, teamAttr);
                });
            });
        }

        return function() {
            ensureNavigationListenersAreInitialized();
            document.getElementById('state-index').textContent = 'State '+stateIndex+' | Tick '+state.tick;

            drawMapBackground();
            drawResourceSites();
            drawTeamsUnitsAndStructures();
        }
    })();

    return function () {
        paper.clear();

        if (error) {
            drawError();
            return;
        }
        if (state) {
            drawState();
            return;
        } else {
            drawInit();
            return;
        }
    }
})();

(function init() {
    redraw();
    window.onresize = redraw;
})();


var maxLoops = 500;

var socket = io();

socket.emit('simulate-game', maxLoops);

socket.on('game-state', function(update) {
    stateIndex = update.stateIndex;
    state = update.state;
    redraw();
});

socket.on('error', function(newError) {
    error = newError;
    redraw();
});

function previousState() {
    socket.emit('previous-state');
}
function nextState() {
    socket.emit('next-state');
}

/*eslint-enable*/
