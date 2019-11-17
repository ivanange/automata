import "./bootstrap";
// node -r esm dist/AF.js
export default class AF {
    constructor(Q, Qi, F, E, S) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(el => [...E].filter(s => s.match(el)).length > 1); // verifie que aucun symbol n'est contenu dans un autres
        if (!Q.contains(Qi))
            throw "Initial state not element of Q (set of all states)";
        else if (!Q.isSubset(F))
            throw "Final states not subset of Q (set of all states)";
        else if (!E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1]))))
            throw "A Symbol used in a transition does not exist in Sigma(alphabet)";
        else if (!Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]])))))
            throw "A state used in a transition does not exist in Q (set of all states)";
        else if (invalidSet.length > 0)
            throw "Invalid alphabet ( ambiguous )  symbols contained in other symbols : ${String(invalidSet || '')}";
        else {
            this.states = Q;
            this.initialState = Qi;
            this.finalStates = F;
            this.alphabet = E;
            this.transitions = S;
            this.currentState = this.initialState;
        }
    }
    optimize(array) {
        let set = new Set();
        return [...set.pushArray(array)];
    }
    transiter(symbol, state) {
        this.currentState = typeof state !== "undefined" ? state : this.currentState;
        return this.optimize(this.transitions
            .filter(el => el[0] + "" === this.currentState + "" && el[1] === symbol)
            .map(el => el[2]));
    }
    transiterArray(symbol, states) {
        return this.optimize([].concat(...states.map(el => this.transiter(symbol, el))));
    }
    eSingleFermeture(state) {
        let s = this.transiter(AF.e, state);
        return this.optimize([].concat([state], ...(s.length > 0 ? s.map(el => this.eSingleFermeture(el)) : [[]])));
    }
    eFermeture(es) {
        return this.optimize([].concat(...es.map(el => this.eSingleFermeture(el))));
    }
    eTransiter(symbol, state) {
        state = typeof state !== "undefined" ? state : this.currentState;
        return this.optimize(this.eFermeture(this.transiterArray(symbol, this.eSingleFermeture(state))));
    }
    reset() {
        this.currentState = this.initialState;
        return this;
    }
    analyze(word, currentState) {
        this.hasETransitions = typeof this.hasETransitions !== "undefined" ? this.hasETransitions : this.isEAFN();
        this.currentState = typeof currentState !== "undefined" ? currentState : this.currentState;
        let next = word.shift();
        let transitionFunction = this.hasETransitions ? "eTransiter" : "transiter";
        return this.optimize(word.length == 0 ?
            this[transitionFunction](next) :
            [].concat(...this[transitionFunction](next).map(el => this.analyze([...word], el))));
    }
    slice(word) {
        // change visibility to protected
        let sliced = [word];
        this.alphabet.forEach(s => sliced = [].concat(...sliced.map(el => el.split(new RegExp(`(${s})`)))));
        return sliced.filter(el => el.length > 0); // remove empty symbols from word
    }
    recognize(word) {
        return [...new Set(this.reset().analyze(this.slice(word)))]
            .filter(el => this.finalStates.contains(el))
            .length > 0;
    }
    isEAFN() {
        return this.transitions.filter(el => el[1] == '').length > 0;
    }
    isComplete() {
        // check if each state has as many different transitions as there are symbols in the alphabet
        return [...this.states].filter(el => this.transitions.filter(e => e[0] == el).length < this.alphabet.size).length == 0;
    }
    isDeterministic() {
        // check that for each given state there is only 1 transition given a certain symbol and no epselon transitions
        return [...this.states].filter(el => [...this.alphabet].filter(s => {
            this.currentState = el;
            return this.transiter(s).length > 1;
        }).length > 0).length == 0 && !this.isEAFN();
    }
    complete(pullState) {
        pullState = typeof pullState !== "undefined" ? pullState : [...this.states].join(""); // creat pull state
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
    unDeterminise(state) {
        // create an epselon transition on a random state
        // give possibility to pass states on which to create epselon transitions as arguments [ [from, to], ... ]
        return this;
    }
    eAFNtoAFN() {
        if (this.isEAFN()) {
            let finalStates = new Set([...this.states]
                .filter(el => this.finalStates.intersect(new Set(this.eSingleFermeture(el))).size > 0));
            let transitions = [];
            [...this.states].map(state => {
                this.alphabet.forEach(el => {
                    let targets = this.transiterArray(el, this.eSingleFermeture(state));
                    if (targets.length) {
                        targets.map(target => transitions.push([state, el, target]));
                    }
                });
            });
            return new AF(this.states, this.initialState, finalStates, this.alphabet, transitions);
        }
        else
            return new AF(this.states, this.initialState, this.finalStates, this.alphabet, this.transitions);
    }
    toAFN(state) {
        if (this.isDeterministic())
            return this.unDeterminise(state);
        else
            return this.eAFNtoAFN();
    }
    toAFD() {
        if (this.isDeterministic())
            return new AF(this.states, this.initialState, this.finalStates, this.alphabet, this.transitions);
        else
            this.toAFN().determinise();
    }
    toEAFN(state) {
        // add reflexive e-transition on a state
        return this;
    }
    type() {
        return `${this.isEAFN() ? "e-" : ""}AF${this.isDeterministic() ? "D" : "N" + this.isComplete() ? "C" : ""}`;
    }
    toString(notation = "{,}", propsnotation = ',', enclose = ',') {
        let encloseA = enclose.split(",");
        encloseA[1] = encloseA[1] || encloseA[0];
        let propsnotationA = propsnotation.split(",");
        propsnotationA[1] = propsnotationA[1] || propsnotationA[0];
        return `
            ${encloseA[0]}
                ${propsnotationA[0]}states${propsnotationA[1]} :  ${this.states.toString(notation, propsnotation)}, 
                ${propsnotationA[0]}initialState${propsnotationA[1]} : ${typeof this.initialState == "object" ? this.initialState.toString(notation, propsnotation) : this.initialState},
                ${propsnotationA[0]}currentState${propsnotationA[1]} : ${typeof this.currentState == "object" ? this.currentState.toString(notation, propsnotation) : this.currentState},
                ${propsnotationA[0]}finalStates${propsnotationA[1]} : ${this.finalStates.toString(notation, propsnotation)} ,  
                ${propsnotationA[0]}alphabet${propsnotationA[1]} : ${this.alphabet.toString(notation, propsnotation)}, 
                ${propsnotationA[0]}transitions${propsnotationA[1]} : ${this.transitions.toString(notation, propsnotation)}   
            ${encloseA[1]}
        `;
    }
    toJson() {
        return this.toString("[,]", '","', "{,}");
    }
}
AF.e = ""; //epselon
