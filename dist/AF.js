import "./bootstrap";
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
        this.currentState = state !== undefined ? state : this.currentState;
        return this.optimize(this.transitions
            .filter(el => el[0] + "" === this.currentState + "" && el[1] === symbol)
            .map(el => el[2]));
    }
    transiterArray(symbol, states) {
        return this.optimize([].concat(...states.map(el => this.transiter(symbol, el))));
    }
    eSingleFermeture(state, usedStates = []) {
        let s = this.transiter(AF.e, state);
        return this.optimize([].concat([state], ...(s.length > 0 ? s.filter(e => usedStates.indexOf(e) == -1).map(el => this.eSingleFermeture(el, [...usedStates, state])) : [[]])));
    }
    eFermeture(es) {
        return this.optimize([].concat(...es.map(el => this.eSingleFermeture(el))));
    }
    eTransiter(symbol, state) {
        state = state !== undefined ? state : this.currentState;
        return this.optimize(this.eFermeture(this.transiterArray(symbol, this.eSingleFermeture(state))));
    }
    reset() {
        this.currentState = this.initialState;
        return this;
    }
    analyze(word, currentState) {
        this.hasETransitions = this.hasETransitions !== undefined ? this.hasETransitions : this.isEAFN();
        this.currentState = currentState !== undefined ? currentState : this.currentState;
        let next = word.shift();
        let transitionFunction = this.hasETransitions ? "eTransiter" : "transiter";
        return this.optimize(word.length == 0 ?
            this[transitionFunction](next) :
            [].concat(...this[transitionFunction](next).map((el) => this.analyze([...word], el))));
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
        pullState = pullState !== undefined ? pullState : [...this.states].join(""); // creat pull state
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
            return AF.make(this);
    }
    getRandomInt(exclusion = []) {
        let upperBound = 50;
        let n = AF.i + "";
        AF.i++;
        while (exclusion.find((val) => {
            return (val + "") === n;
        }) !== undefined) {
            n = (upperBound * Math.random()).toFixed(2);
        }
        return n;
    }
    thompsonSymbol(symbol) {
        let is = this.getRandomInt();
        let fs = this.getRandomInt([is]);
        return {
            initialState: is,
            alphabet: new Set([symbol]),
            finalStates: new Set([fs]),
            states: new Set([is, fs]),
            transitions: [
                [is, symbol, fs]
            ]
        };
    }
    thompsonConcatenate(afs) {
        return afs.reduce((acc, el) => {
            return acc = {
                initialState: acc.initialState,
                alphabet: acc.alphabet.pushArray([...el.alphabet]),
                finalStates: el.finalStates,
                states: acc.states.pushArray([...el.states]),
                transitions: [
                    ...acc.transitions,
                    ...el.transitions,
                    [[...acc.finalStates][0], AF.e, el.initialState]
                ]
            };
        });
    }
    thompsonUnite(afs) {
        return afs.reduce((acc, el) => {
            let is = this.getRandomInt([...acc.states, ...el.states]);
            let fs = this.getRandomInt([...acc.states, ...el.states, is]);
            let accFinalState = [...acc.finalStates][0];
            let elFinalState = [...el.finalStates][0];
            return acc = {
                initialState: is,
                alphabet: acc.alphabet.pushArray([...el.alphabet]),
                finalStates: new Set([fs]),
                states: acc.states.pushArray([...el.states, is, fs]),
                transitions: [
                    ...acc.transitions,
                    ...el.transitions,
                    [is, AF.e, el.initialState],
                    [is, AF.e, acc.initialState],
                    [elFinalState, AF.e, fs],
                    [accFinalState, AF.e, fs],
                ]
            };
        });
    }
    thomposnIterate(af) {
        let is = this.getRandomInt([...af.states]);
        let fs = this.getRandomInt([...af.states, is]);
        let afFinalState = [...af.finalStates][0];
        return {
            ...af,
            initialState: is,
            finalStates: new Set([fs]),
            states: af.states.pushArray([is, fs]),
            transitions: [
                ...af.transitions,
                [is, AF.e, fs],
                [is, AF.e, af.initialState],
                [afFinalState, AF.e, af.initialState],
                [afFinalState, AF.e, fs],
            ]
        };
    }
    isValid(str) {
        let o = str.indexOf("(");
        let c = str.indexOf(")");
        return o <= c;
    }
    parseRegex(regex) {
        let split;
        let exp = /\((.+)\)(\*?)|([^\+\.\*\(\)]+)(\*?)/g;
        let i;
        if ((split = (exp).exec(regex))
            && (i = split[1] ? 1 : 3)
            && split[0].length == regex.length
            && this.isValid(split[i])) {
            let af;
            if (i > 2) {
                af = this.thompsonSymbol(split[i].trim());
            }
            else {
                af = this.parseRegex(split[i]);
            }
            return split[i + 1] ? this.thomposnIterate(af) : af;
        }
        exp = /(\(.+?\)\*?)\+|([^\+\*\(\)]+\*?)\+/g;
        if ((split = exp.exec(regex))
            && (i = split[1] ? 1 : 2)
            && this.isValid(split[i])
            && regex.startsWith(split[i][0])) {
            return this.thompsonUnite([this.parseRegex(split[i]), this.parseRegex(regex.slice(exp.lastIndex))]);
        }
        exp = /(\(.+?\)\*?)\.|([^\.\*\(\)]+\*?)\./g;
        if ((split = exp.exec(regex))
            && (i = split[1] ? 1 : 2)
            && this.isValid(split[i])
            && regex.startsWith(split[i][0])) {
            return this.thompsonConcatenate([this.parseRegex(split[i]), this.parseRegex(regex.slice(exp.lastIndex))]);
        }
        else {
            throw "Invalid Expression";
        }
    }
    static make(af) {
        return new AF(af.states, af.initialState, af.finalStates, af.alphabet, af.transitions);
    }
    fromRegex(regex) {
        return AF.make(this.parseRegex(regex));
    }
    toAFN(state) {
        if (this.isDeterministic())
            return this.unDeterminise(state);
        else
            return this.eAFNtoAFN();
    }
    toAFD() {
        if (this.isDeterministic())
            return AF.make(this);
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
AF.i = 0;
