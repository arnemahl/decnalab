/*eslint-disable*/

var state;
var error;

var redraw = (function() {
    var paper = SVG('svg').size('100%', '100%');
    // var paper = Snap('#snap-svg');

    function drawInit() {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        var center = {
            x: ww / 2,
            y: wh / 2
        };

        paper
            .circle(500)
            .center(center.x, center.y)
            .attr({
                fill: '#bada55',
                stroke: '#000',
                strokeWidth: 5
            })
            .click(function() {
                console.log('click');
                startSimulation();
            });

    }

    function drawError() {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        var center = {
            x: ww / 2,
            y: wh / 2
        };
        console.log('draw error', error);

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
            }
        })();

        function drawCircle(position, size, text, attr) {
            paper.circle(size)
                .center(position.x, position.y)
                .attr(attr);
            paper.text(text)
                .x(position.x)
                .y(position.y)
                .dy(-40)
                .font({size: 40, anchor: 'middle'})
                .attr({
                    fill: 'white'
                });
        }
        function drawSquare(position, size, text, attr) {
            paper.rect(size, size)
                .center(position.x, position.y)
                .attr(attr);
            paper.text(text)
                .x(position.x)
                .y(position.y)
                .dy(-54)
                .font({size: 54, anchor: 'middle'})
                .attr({
                    fill: 'white',

                });
        }

        function drawMapBackground() {
            paper.rect(state.map.width, state.map.height).attr({
                fill: '#111'
            });
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

        function drawTeams() {
            state.teams.forEach(function(team) {
                var teamAttr = {fill: team.id}; // TODO make this sensible. Currently, teamId = 'blue'||'red'

                team.units.forEach(function(unit) {
                    drawCircle(unit.position, team.unitSpecs[unit.type].size, unit.type, teamAttr);
                });
                team.structures.forEach(function(structure) {
                    drawSquare(structure.position, team.structureSpecs[structure.type].size, structure.type, teamAttr);
                });
            });
        }

        return function() {
            ensureNavigationListenersAreInitialized();

            drawMapBackground();
            drawResourceSites();
            drawTeams();
        }
    })();

    return function () {
        paper.clear();
        console.log(!!error);

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


var socket = io();

var startSimulation = (function() {
    var started = false;

    return function() {
        console.log('simulate-game');
        if (started === true) {
            return;
        }

        started = true;
        socket.emit('simulate-game', 1);
    }
})();

socket.on('game-state', function(nextState) {
    state = nextState;
    redraw();
});

socket.on('error', function(newError) {
    error = newError;
    redraw();
});

/*eslint-enable*/
