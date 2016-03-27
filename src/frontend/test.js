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
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        function drawCircle(thing, specs, attr) {
            paper.circle(specs.size)
                .center(thing.position.x, thing.position.y)
                .attr(attr);
            paper.text(thing.type)
                .center(thing.position.x, thing.position.y)
                .attr({
                    fill: 'red'
                });
        }
        function drawSquare(thing, specs, attr) {
            console.log('sqr thing:', thing); // DEBUG
            console.log('thing.type:', thing.type); // DEBUG
            paper.rect(specs.size, specs.size)
                .center(thing.position.x, thing.position.y)
                .attr(attr);
            paper.text(thing.type)
                .font({
                    size: 54,
                    // anchor:   'middle',
                    // leading:  '1.5em'
                })
                .center(thing.position.x, thing.position.y)
                .attr({
                    fill: 'red',

                });
        }

        return function() {
            paper.viewbox(29000, 28000, 4000, 4000);

            state.map.resourceSites.forEach(function(arr) {
                console.log('arr:', arr); // DEBUG
                arr.forEach(function(rs) {
                    console.log('rs:', rs); // DEBUG
                    if (rs.resourceType === 'abundant') {
                        drawSquare(rs, {size: 800}, {fill: 'cyan'});
                        return;
                    }
                    if (rs.resourceType === 'sparse') {
                        drawSquare(rs, {size: 300}, {fill: 'mangenta'});
                        return;
                    }
                    // unknown
                    drawSquare(rs, {radius: 1000}, {fill: 'black'});
                });
            });

            state.teams.forEach(function(team) {
                var attr = {fill: team.id}; // TODO make this sensible. Currently, teamId = 'blue'||'red'

                team.units.forEach(function(unit) {
                    drawCircle(unit, team.unitSpecs[unit.type], attr);
                });
                team.structures.forEach(function(structure) {
                    drawSquare(structure, team.structureSpecs[structure.type], attr);
                });
            });
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
