# decnalab

A Real-Time Strategy Game for AI development that runs through NodeJS.

## Installation

1. `git clone https://github.com/arnemahl/decnalab.git`
2. `npm install`
3. Run a command

## Commands

### `npm run evo [name]`

Runs a coveolutionary algorithm to evolve strategies.
The optional parameter lets you provide a name of the experiment. When provided, statistics and found strategies will be stored in `dump/<name>`.

### `npm start [name] [name2]`
Plays a game between two strategies and serves the replay at `localhost:3000`

The two optional arguments lets you decide which strategies will be used.

* If `<name>` is not provided, randomly generated strategies will be used.
* If only `<name>` is provided, and not `<name2>` the strategies chosen will be the two first strategies from population in `dump/<name>/strategies.js`.
* If both `<name>` and `<name2>` are provided, the strategies chosen will be the first strategy from population in `dump/<name>/strategies.js` and the first first strategy from population in `dump/<name2>/strategies.js`.

The way strategeis are chosen can be changed in [cli.js](./src/util/cli.js), and you if you want you may hard-code which strategies to use in that file, e.g. by copy-pasting the entire strategies into `cli.js`.


### Example

Run an experiment called "my-experiment". When done, show simulations of games between the two best solutions from the experiment.

1. `npm run evo my-experiment`
2. `npm run start my-experiment`
