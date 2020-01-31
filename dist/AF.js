import "./bootstrap";
export default class AF {
    /*
    @param Q : states, Qi : initial state, F : final states, E : alphabet, S : transitions
    return AF
    */
    constructor(Q, Qi, F, E, S) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(el => [...E].filter(s => s.match(el)).length > 1); // verifie que aucun symbol n'est contenu dans un autres
        if (!(Q.size && Qi != undefined && F.size && E.size && S.length))
            throw "Unspecified properties, make sure you define every property (alphabet, states, initial satate, final states, transitions )";
        if (!Q.contains(Qi))
            throw "Initial state not element of Q (set of all states)";
        else if (!Q.isSubset(F))
            throw "Final states not subset of Q (set of all states)";
        else if (!E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1]))))
            throw "A Symbol used in a transition does not exist in Sigma(alphabet)";
        else if (!Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]])))))
            throw "A state used in a transition does not exist in Q (set of all states)";
        else if (invalidSet.length > 0)
            throw `Invalid alphabet ( ambiguous )  symbols contained in other symbols : ${String(invalidSet || '')}`;
        else {
            this.states = Q;
            this.initialState = Qi;
            this.finalStates = F;
            this.alphabet = E;
            this.transitions = S;
            this.currentState = this.initialState;
            this.kind = this.type();
        }
    }
    static optimize(array) {
        let set = new Set();
        return [...set.pushArray(array)];
    }
    transiter(symbol, state) {
        this.currentState = state !== undefined ? state : this.currentState;
        return AF.optimize(this.transitions
            .filter(el => el[0] + "" === this.currentState + "" && el[1] === symbol)
            .map(el => el[2]));
    }
    transiterArray(symbol, states) {
        return AF.optimize([].concat(...states.map(el => this.transiter(symbol, el))));
    }
    eSingleFermeture(state, usedStates = []) {
        let s = this.transiter(AF.e, state);
        return AF.optimize([].concat([state], ...(s.length > 0 ? s.filter(e => usedStates.indexOf(e) == -1).map(el => this.eSingleFermeture(el, [...usedStates, state])) : [[]])));
    }
    eFermeture(es) {
        return AF.optimize([].concat(...es.map(el => this.eSingleFermeture(el))));
    }
    eTransiter(symbol, state) {
        state = state !== undefined ? state : this.currentState;
        return AF.optimize(this.eFermeture(this.transiterArray(symbol, this.eSingleFermeture(state))));
    }
    reset() {
        this.currentState = this.initialState;
        return this;
    }
    analyze(word, currentState = undefined, rapid = false) {
        this.hasETransitions = this.hasETransitions !== undefined ? this.hasETransitions : this.isEAFN();
        this.currentState = currentState !== undefined ? currentState : this.currentState;
        let next = word.shift();
        let transitionFunction = this.hasETransitions ? "eTransiter" : "transiter";
        if (!rapid) {
            return AF.optimize(word.length == 0 ?
                this[transitionFunction](next) :
                [].concat(...this[transitionFunction](next).map((el) => this.analyze([...word], el))));
        }
        else {
            let result = this[transitionFunction](next);
            if (word.length == 0) {
                return AF.optimize(result).filter(el => this.finalStates.contains(el)).length > 0
                    ? true : false;
            }
            else {
                for (let state of result) {
                    if (this.analyze([...word], state, true))
                        return true;
                }
                return false;
            }
        }
    }
    slice(word) {
        // change visibility to protected
        let sliced = [word];
        this.alphabet.forEach(s => sliced = [].concat(...sliced.map(el => el.split(new RegExp(`(${s})`)))));
        return sliced.filter(el => el.length > 0); // remove empty symbols from word
    }
    minimise() {
        if (!this.isDeterministic())
            return this.toAFD().minimise();
        if (!this.isComplete())
            return this.complete().minimise();
        var seperate = (partition, symbol) => {
            let splits = {};
            let destPartition;
            partition.forEach((state) => {
                let dest = this.transiter(symbol, state)[0];
                destPartition = [...partitions].filter(el => el.contains(dest))[0];
                splits[destPartition + ""] = (new Set()).pushArray([...(splits[destPartition + ""] || []), state]);
            });
            let newPartitions = Object.values(splits);
            let seperated = newPartitions.length > 1;
            if (seperated) {
                partitions = (new Set()).pushArray(newPartitions.concat([...partitions].filter(el => el + "" != partition + "")));
            }
            else {
                newTransitions.push([partition, symbol, destPartition]);
            }
            return seperated;
        };
        let partitions = new Set([
            new Set([...this.states].filter(el => !this.finalStates.contains(el))),
            new Set([...this.finalStates])
        ]);
        let seperated = false;
        let newTransitions = [];
        do {
            newTransitions = [];
            for (let partition of partitions) {
                for (let symbol of this.alphabet) {
                    seperated = seperate(partition, symbol);
                    if (seperated) {
                        break;
                    }
                }
                if (seperated) {
                    break;
                }
            }
        } while (seperated == true);
        return AF.make({
            states: partitions,
            alphabet: this.alphabet,
            initialState: [...partitions].filter(el => el.contains(this.initialState))[0],
            finalStates: new Set([...partitions].filter(el => [...el].filter(e => this.finalStates.contains(e)).length > 0)),
            transitions: newTransitions
        });
    }
    /*
    @praram : word: the word to recognize
    */
    recognize(word) {
        return this.reset().analyze(this.slice(word), undefined, true);
    }
    /*
        test if AF is an e-AFN
    */
    isEAFN() {
        return this.transitions.filter(el => el[1] == AF.e).length > 0;
    }
    /*
        test if AF is Complete
    */
    isComplete() {
        // check if each state has as many different transitions as there are symbols in the alphabet
        for (let state of this.states) {
            let symbols = new Set(this.transitions.filter(e => e[0] + "" == state + "").map(trans => trans[1]));
            if ([...this.alphabet].filter(el => symbols.contains(el)).length != this.alphabet.size) {
                return false;
            }
        }
        return true;
    }
    /*
        test if AF is an AFD
    */
    isDeterministic() {
        // check that for each given state there is only 1 transition given a certain symbol and no epselon transitions
        return [...this.states].filter(el => [...this.alphabet].filter(s => {
            this.currentState = el;
            return this.transiter(s).length > 1;
        }).length > 0).length == 0 && !this.isEAFN();
    }
    complete(pullState) {
        pullState = pullState !== undefined ? pullState : AF.getRandomInt([...this.states]); // creat pull state
        let af = {
            ...AF.parseJson(this.toJson()),
            states: new Set([...this.states, pullState])
        };
        this.states.forEach((s) => {
            this.alphabet.forEach((el) => {
                if (this.transiter(el, s).length == 0)
                    af.transitions.push([s, el, pullState]);
                af.transitions.push([pullState, el, pullState]);
            });
        });
        // creer un état puis avecc toutes les transition sortantes qui revienent
        // sur lui et les transition manquante qui vont sur lui 
        return AF.make(af);
    }
    determinise() {
        if (this.isEAFN())
            return this.toAFN().determinise();
        let af = {
            ...AF.parseJson(this.toJson()),
            initialState: new Set([this.initialState]),
            finalStates: new Set(),
            transitions: [],
            states: new Set()
        };
        af.states.push(af.initialState);
        for (let s of af.states) {
            if ([...s].filter(el => this.finalStates.contains(el)).length > 0)
                af.finalStates.push(s);
            this.alphabet.forEach((el) => {
                let state = [...s].map(e => this.analyze([el], e))
                    .filter(a => a.length > 0)
                    .reduce((acc, val) => {
                    return acc = new Set([...acc, ...val]);
                }, new Set());
                if (state.size) {
                    af.states.push(state);
                    af.transitions.push([s, el, state]);
                }
            });
        }
        return AF.make(af);
    }
    unDeterminise(state) {
        let af = AF.parseJson(this.toJson());
        state = state || [...af.states][Math.floor(Math.random() * af.states.size)];
        let newState = AF.getRandomInt([...af.states]);
        af.states.push(newState);
        af.transitions.concat(af.transitions.filter(el => el[0] + "" === state + "" || el[2] + "" === state + "")
            .map(el => [el[0] + "" === state + "" ? newState : el[0], el[1], el[1] + "" === state + "" ? newState : el[1]]));
        return AF.make(af);
    }
    eAFNtoAFN() {
        if (this.isEAFN()) {
            let af = {
                ...AF.parseJson(this.toJson()),
                transitions: [],
                finalStates: new Set([...this.states]
                    .filter(el => this.finalStates.intersect(new Set(this.eSingleFermeture(el))).size > 0)),
            };
            [...this.states].map(state => {
                this.alphabet.forEach(el => {
                    let targets = this.transiterArray(el, this.eSingleFermeture(state));
                    if (targets.length) {
                        targets.map(target => af.transitions.push([state, el, target]));
                    }
                });
            });
            return AF.make(af);
        }
        else
            return AF.make(this);
    }
    static getRandomInt(exclusion = []) {
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
    static thompsonSymbol(symbol) {
        if (symbol === AF.E)
            return AF.thompsonSymbol(AF.e);
        let is = AF.getRandomInt();
        let fs = AF.getRandomInt([is]);
        return {
            initialState: is,
            alphabet: new Set(symbol ? [symbol] : []),
            finalStates: new Set([fs]),
            states: new Set([is, fs]),
            transitions: [
                [is, symbol, fs]
            ]
        };
    }
    static thompsonConcatenate(afs) {
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
    static thompsonUnite(afs) {
        return afs.reduce((acc, el) => {
            let is = AF.getRandomInt([...acc.states, ...el.states]);
            let fs = AF.getRandomInt([...acc.states, ...el.states, is]);
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
    static thompsonIterate(af) {
        let is = AF.getRandomInt([...af.states]);
        let fs = AF.getRandomInt([...af.states, is]);
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
    static isValid(str) {
        let i = 0;
        for (let el of str.split("").filter(e => e === "(" || e === ")")) {
            i = i + (el === "(" ? 1 : -1);
            if (i < 0)
                return false;
        }
        return i === 0 ? true : false;
    }
    static parseRegex(regex) {
        regex = regex.trim();
        let s;
        if ((s = regex.indexOf("(")) === -1) {
            return AF.parse(regex);
        }
        let i = 1;
        let e = s;
        let iter;
        while (i !== 0) {
            i += regex[e + 1] === "(" ? 1 : regex[e + 1] === ")" ? -1 : 0;
            e++;
        }
        let first = AF.parseRegex(regex.slice(s + 1, e));
        first = (iter = (regex[e + 1] === "*")) ? AF.thompsonIterate(first) : first;
        for (let [start, end, op, condition, reverse] of [
            [0, s - 1, s - 1, s > 0, false],
            [iter = e + (iter ? 3 : 2), regex.length, e + iter - 1, iter < regex.length, true]
        ].sort((f, s) => regex[f[2]] === "." ? -1 : 1)) {
            if (condition) {
                let operands = [AF.parseRegex(regex.slice(start, end)), first];
                first = AF[regex[op] === "+" ? "thompsonUnite" : "thompsonConcatenate"](reverse ? operands.reverse() : operands);
            }
        }
        return first;
        // simplify parse function 
    }
    static parse(regex) {
        let split;
        let exp = /([^\+\.\*\(\)]+)(\*?)/g;
        regex = regex.split(" ").filter(el => el !== "").join("");
        if ((split = (exp).exec(regex))
            && split[0].length == regex.length) {
            let af;
            af = AF.thompsonSymbol(split[1]);
            return split[2] ? AF.thompsonIterate(af) : af;
        }
        exp = /([^\+\*\(\)]+\*?)\+/g;
        if (split = exp.exec(regex)) {
            return AF.thompsonUnite([AF.parse(split[1]), AF.parse(regex.slice(exp.lastIndex))]);
        }
        exp = /([^\.\*\(\)]+\*?)\./g;
        if (split = exp.exec(regex)) {
            return AF.thompsonConcatenate([AF.parse(split[1]), AF.parse(regex.slice(exp.lastIndex))]);
        }
        else {
            throw "Invalid Expression";
        }
    }
    static parseJson(json) {
        let object = JSON.parse(json);
        object.states = object.states.toSet();
        object.alphabet = object.alphabet.toSet();
        object.initialState = object.initialState instanceof Array ? object.initialState.toSet() : object.initialState;
        object.finalStates = object.finalStates.toSet();
        object.transitions = object.transitions.map(e => e.mapToSet());
        return object;
    }
    /*
        convert AF to regular expression
    */
    toRegex() {
        let af = AF.parseJson(this.toJson());
        // case E + a.b, AF.wrap(s)
        if (af.finalStates.contains(af.initialState) || af.transitions.filter(el => el[2] + "" === af.initialState + "").length > 0) {
            let is = AF.getRandomInt([...af.states]);
            let oldState = af.initialState;
            af.states.push(is);
            af.initialState = is;
            af.transitions.push([is, AF.e, oldState]);
        }
        if (!(af.finalStates.size == 1 && af.transitions.filter(el => af.finalStates.contains(el[0])).length === 0)) {
            let fs = AF.getRandomInt([...af.states]);
            let oldStates = [...af.finalStates];
            af.states.push(fs);
            af.finalStates = new Set([fs]);
            oldStates.forEach(oldState => af.transitions.push([oldState, AF.e, fs]));
        }
        let toDelete = [...af.states].filter(el => el + "" !== af.initialState + "" && (!af.finalStates.contains(el)));
        toDelete.forEach(s => {
            s += "";
            let star = af.transitions.filter(el => el[0] + "" === s && el[2] + "" === s);
            star = star.length ? AF.wrap(star.map(e => e[1]).reduce((acc, val) => (acc || AF.E) + "+" + (val || AF.E)), true) + "*" : "";
            star = star.length > 1 ? star : "";
            let entrantes = af.transitions.filter(el => el[2] + "" === s && el[0] + "" !== s);
            let sortantes = af.transitions.filter(el => el[0] + "" === s && el[2] + "" !== s);
            entrantes.forEach(it => {
                sortantes.forEach(ot => {
                    let doubles = [];
                    let indices = [];
                    let transition = it[1] + (it[1] && star ? "." + star : star) + (ot[1] && (star || it[1]) ? "." + ot[1] : ot[1]);
                    //`(${it[1] + (star ? star + "*" : "") + ot[1]})`
                    af.transitions.push([it[0], AF.wrap(transition), ot[2]]);
                    doubles = af.transitions.filter((el, i) => {
                        if (el[0] + "" === it[0] + "" && el[2] + "" === ot[2] + "") {
                            indices.push(i);
                            return true;
                        }
                        return false;
                    });
                    if (doubles.length > 1) {
                        af.transitions.push([
                            it[0],
                            AF.wrap(doubles.map(e => e[1]).reduce((acc, val) => (acc || AF.E) + "+" + (val || AF.E))),
                            ot[2]
                        ]);
                        indices.forEach(i => delete af.transitions[i]);
                    }
                });
            });
            af.transitions = af.transitions.filter(el => el[0] + "" !== s && el[2] + "" !== s);
        });
        let regex = af.transitions.map(el => el[1])[0];
        return AF.unwrap(AF.simplify(regex));
        //AF.unwrap(AF.simplify(regex));
        //regex;
    }
    static wrap(str, star = false) {
        str = str.trim();
        let split;
        if ((split = (/.+\+.+/g).exec(str))
            && split[0].length == str.length
            && (!(str.startsWith("(") && str.endsWith(")"))
                || !AF.isValid((/\((.+)\)/g).exec(str)[1]))
            || (star && (/.+[\+\.].+/g).exec(str))) {
            return `(${str})`;
        }
        return str;
    }
    static unwrap(str) {
        str = str.trim();
        let split;
        if ((split = (/\((.+)\)/g).exec(str))
            && split[0].length == str.length
            && AF.isValid(split[1])) {
            return AF.unwrap(split[1]);
        }
        return str;
    }
    static simplify(str) {
        let result;
        while ((result = str.replace(/\(([^\+\(\)]+?)\)\.(.+)/g, "$1.$2")
            .replace(/(.+?)\*?\.(\1\*)/g, "$2")
            .replace(/(.+?)\.(\(\1\)\*)/g, "$2")
            .replace(/(.+?)\*\.(\1)\*?/g, "$1*")
            .replace(/\((.+?)\)\*\.(\1)/g, "($1)*")
            .replace(/ɛ\+([^\.\+\(\)\*]+\*)/g, "$1")
            .replace(/ɛ\*?\.(.+)/g, "$1")
            .replace(/(.+?)\+(\1\*)/g, "$2")) !== str) {
            str = result;
        }
        return str;
    }
    static make(af) {
        return new AF(af.states, af.initialState, af.finalStates, af.alphabet, af.transitions);
    }
    /*
    @param : regex : regular expression
        convert  regular expression to AF
    */
    static fromRegex(regex) {
        return AF.make(AF.parseRegex(AF.simplify(regex)));
    }
    /*
    @param : json : json string
        convert  json string to AF
    */
    static fromJson(json) {
        return AF.make(AF.parseJson(json));
    }
    /*
    convert AF to AFN
    */
    toAFN(state) {
        if (this.isDeterministic())
            return this.unDeterminise(state);
        else
            return this.eAFNtoAFN();
    }
    /*
    convert AF to AFD
    */
    toAFD() {
        if (this.isDeterministic())
            return AF.make(this);
        else
            return this.toAFN().determinise();
    }
    /*
    convert AF to e-AFN
    */
    toEAFN(state) {
        if (this.isEAFN())
            return AF.make(this);
        let af = AF.parseJson(this.toJson());
        state = state || af.initialState;
        af.transitions.push([state, AF.e, state]);
        af.states.push(state);
        return AF.make(af);
    }
    static clotureComplementation(af) {
        return AF.make({
            ...af,
            finalStates: new Set([...af.states].filter(e => !af.finalStates.has(e)))
        });
    }
    static clotureEnsemble(afs, union = true) {
        return afs.map(el => el.toAFD().complete()).reduce((acc, af) => {
            let states = acc.states.zip(af.states);
            let alphabet = new Set([...acc.alphabet, ...af.alphabet]);
            return acc = AF.make({
                alphabet: alphabet,
                states: states,
                initialState: new Set([acc.initialState, af.initialState]),
                finalStates: new Set(union ?
                    [
                        ...acc.finalStates.zip(af.states),
                        ...acc.states.zip(af.finalStates)
                    ]
                    : [...acc.finalStates.zip(af.finalStates)]),
                transitions: [].concat(...[...states.zip(alphabet)].map(couple => {
                    let [state, symbol] = [...couple];
                    let [accState, afState] = [...state];
                    return acc.transiter(symbol, accState).zip(af.transiter(symbol, afState)).map(el => {
                        return [
                            state,
                            symbol,
                            el
                        ];
                    });
                }).filter(e => e.length !== 0)),
            });
        });
    }
    static clotureUnion(afs) {
        return AF.clotureEnsemble(afs, true);
    }
    static clotureIntersection(afs) {
        return AF.clotureEnsemble(afs, false);
    }
    static clotureMiroir(af) {
        if (af.finalStates.size > 1)
            throw "Automaton has more than one final state";
        return AF.make({
            ...af,
            initialState: [...af.finalStates][0],
            finalStates: new Set([af.initialState]),
            transitions: af.transitions.map(e => [e[2], e[1], e[0]])
        });
    }
    static clotureConcatenation(afs) {
        return AF.make(afs.reduce((acc, af) => {
            if ([...acc.states].filter(el => af.states.contains(el)).length > 0)
                throw "Automaton state are not disjoint";
            else if (acc.finalStates.size > 1)
                throw "Automaton has more than 1 final state";
            else if (acc.transitions.filter(e => acc.finalStates.contains(e[0])).length > 0)
                "Automatons final state degree is not nul (has putgoing transitions)";
            return acc = {
                ...acc,
                alphabet: new Set([...acc.alphabet, ...af.alphabet]),
                states: new Set([...acc.states, ...af.states]),
                finalStates: af.finalStates,
                transitions: acc.transitions.concat(af.transitions, [[[...acc.finalStates][0], AF.e, af.initialState]])
            };
        }));
    }
    static clotureEtoile(af) {
        return AF.make({
            ...af,
            transitions: af.transitions.concat([...af.finalStates].map(e => [e, AF.e, af.initialState]))
        });
    }
    /*
        public minimise(): AF {
            if (!this.isDeterministic()) return this.determinise().minimise();
            if (!this.isComplete()) return this.complete().minimise();
    
            let partitions: Set<Array<any>> = new Set([
                new Set([...this.states].filter(el => !this.finalStates.contains(el))),
                new Set([...this.finalStates])
            ]);
    
            function test(parts: Set<Array<any>>) {
                let af = {
                    states: new Set(parts),
                };
                let destination;
                for (let part in parts) {
                    d = [];
                    for (let [s1, s2] in part.zip(part)) {
                        for (let symbol in this.alphabet) {
                            d1 = this.transiter(symbol, s1);
                            d2 = this.transiter(symbol, s2);
    
                            d.concat([d1, d2]);
                            // construit u af a chaque appelle de test
                            //if s1 and s2 on any symbol not in the same set
                            //mettre s2 dans le dans une nouvelle classe ( ajouter transitions ) et enlever le l'ancien
    
                        }
                    }
                }
                // arriver ici on a fini on make(af)
            }
    
        }
    */
    /*
    returns type of the AF as string
    */
    type() {
        return `${this.isEAFN() ? "e-" : ""}AF${(this.isDeterministic() ? "D" : "N") + (this.isComplete() ? "C" : "")} `;
    }
    toString(notation = "{,}", propsnotation = ',', enclose = ',') {
        let encloseA = enclose.split(",");
        encloseA[1] = encloseA[1] || encloseA[0];
        let propsnotationA = propsnotation.split(",");
        propsnotationA[1] = propsnotationA[1] || propsnotationA[0];
        return `
                ${encloseA[0]}
                ${propsnotationA[0]}states${propsnotationA[1]} : ${this.states.toString(notation, propsnotation)},
                ${propsnotationA[0]}initialState${propsnotationA[1]} : ${typeof this.initialState == "object" ? this.initialState.toString(notation, propsnotation) : this.initialState},
                ${propsnotationA[0]}currentState${propsnotationA[1]} : ${typeof this.currentState == "object" ? this.currentState.toString(notation, propsnotation) : this.currentState},
                ${propsnotationA[0]}finalStates${propsnotationA[1]} : ${this.finalStates.toString(notation, propsnotation)} ,
                ${propsnotationA[0]}alphabet${propsnotationA[1]} : ${this.alphabet.toString(notation, propsnotation)},
                ${propsnotationA[0]}transitions${propsnotationA[1]} : ${this.transitions.toString(notation, propsnotation)}
                ${encloseA[1]}
                `;
    }
    /*
    convert AF to json string
    */
    toJson() {
        return this.toString("[,]", '","', "{,}");
    }
}
AF.e = "";
AF.E = "ɛ"; //epselon
AF.i = 0;
