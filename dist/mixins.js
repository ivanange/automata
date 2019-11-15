import AF from "./AF";
export default AF.e;
// use interface implementation to solve dependency problem between methods
export class NC extends AF {
    complete(pullState) {
        pullState = pullState || [...this.states].join(""); // creat pull state
        let states = new Set([...this.states, pullState]);
        let transitions = [];
        this.states.forEach((s) => {
            this.alphabet.forEach((el) => {
                if (this.analyze([el], s).length == 0)
                    transitions.push([s, el, pullState]);
                transitions.push([pullState, el, pullState]);
            });
        });
        transitions = [].concat(this.transitions, transitions);
        // creer un état puis avecc toutes les transition sortantes qui revienent
        // sur lui et les transition manquante qui vont sur lui 
        return new AF(states, this.initialState, this.finalStates, this.alphabet, transitions);
    }
}
export class C extends AF {
    uncomplete() {
        // take as arguements the transitions to remove to create an incomplete automaton
        return;
    }
}
export class ND extends AF {
    determinise() {
        // check algorithm in doc
        // this.complete();
        // foreach does not consider modifications on the iterated object
        let initialState = new Set([this.initialState]);
        let finalStates = new Set();
        let transitions = [];
        let states = new Set([initialState]);
        for (let s of states) {
            if ([...s].filter(el => this.finalStates.contains(el)).length > 0)
                finalStates.push(s);
            this.alphabet.forEach((el) => {
                let state = [...s].map(e => this.analyze([el], e))
                    .filter(a => a.length > 0)
                    .reduce((acc, val) => {
                    return acc = new Set([...acc, ...val]);
                }, new Set());
                if (state.size) {
                    states.push(state);
                    transitions.push([s, el, state]);
                }
            });
        }
        return new AF(states, initialState, finalStates, this.alphabet, transitions);
    }
}
export class D extends AF {
    unDeterminise() {
        // create an epselon transition on a random state
        // give possibility to pass states on which to create epselon transitions as arguments [ [from, to], ... ]
        return;
    }
}
// use mixins to create different class combinations 
// check if its possible to create mixin with its own construcor
// check if exporting mixined class affects mixined methods
// exporting mixins
