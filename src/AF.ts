import "./bootstrap";

// node -r esm dist/AF.js

export interface AFProps {
    states: Set<any>;
    initialState: any;
    finalStates: Set<any>;
    alphabet: Set<string>;
    transitions: Array<transition>;
}

export default class AF {

    public static readonly e = "";
    public static readonly E = "ɛ"; //epselon
    public readonly transitions: Array<transition>;
    public readonly alphabet: Set<string>;
    public readonly states: Set<any>;
    public readonly finalStates: Set<any>;
    public readonly initialState: any;
    protected currentState: any;
    protected hasETransitions: Boolean;
    protected static i: number = 0;
    public kind: string;
    public name: string;

	/*
	@param Q : states, Qi : initial state, F : final states, E : alphabet, S : transitions
	return AF
	*/
    public constructor(Q: Set<any>, Qi: any, F: Set<any>, E: Set<string>, S: Array<transition>, name?: string) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(
            el => [...E].filter(
                s => s.match(el.replace(/([\[\]\^\.\|\?\*\+\(\)\$])/g, "\\$1"))
            ).length > 1
        ); // verifie que aucun symbol n'est contenu dans un autres


        if (!(Q.size && Qi != undefined && F.size && E.size && S.length)) throw "Unspecified properties, make sure you define every property (alphabet, states, initial satate, final states, transitions )";
        if (!Q.contains(Qi)) throw "Initial state not element of Q (set of all states)";
        else if (!Q.isSubset(F)) throw "Final states not subset of Q (set of all states)";
        else if (!E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1])))) throw "A Symbol used in a transition does not exist in Sigma(alphabet)";
        else if (!Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]]))))) throw "A state used in a transition does not exist in Q (set of all states)";
        else if (invalidSet.length > 0) throw `Invalid alphabet ( ambiguous )  symbols contained in other symbols : ${String(invalidSet || '')}`;
        else {
            this.states = Q;
            this.initialState = Qi;
            this.finalStates = F;
            this.alphabet = E;
            this.transitions = S;
            this.currentState = this.initialState;
            this.kind = this.type();
            this.name = name;
        }
    }

    public static optimize(array: Array<any>): Array<any> {
        let set = new Set();
        return [...set.pushArray(array)];
    }

    public transiter(symbol: string, state?: any): Array<any> {
        this.currentState = state !== undefined ? state : this.currentState;
        return AF.optimize(
            this.transitions
                .filter(el => el[0] + "" === this.currentState + "" && el[1] === symbol)
                .map(el => el[2])
        );
    }

    public transiterArray(symbol: string, states: Array<any>): Array<any> {

        return AF.optimize(
            [].concat(...states.map(el => this.transiter(symbol, el)))
        );
    }

    public eSingleFermeture(state: any, usedStates: any[] = []): Array<any> {
        let s = this.transiter(AF.e, state);

        return AF.optimize(
            [].concat(
                [state],
                ...(s.length > 0 ? s.filter(e => usedStates.indexOf(e) == -1).map(el => this.eSingleFermeture(el, [...usedStates, state])) : [[]])
            )
        );
    }

    public eFermeture(es: Array<any>): Array<any> {
        return AF.optimize(
            [].concat(...es.map(el => this.eSingleFermeture(el)))
        );
    }

    public eTransiter(symbol: string, state?: any): Array<any> {
        state = state !== undefined ? state : this.currentState;
        return AF.optimize(
            this.eFermeture(
                this.transiterArray(symbol, this.eSingleFermeture(state))
            )
        );
    }

    public reset(): AF {
        this.currentState = this.initialState;
        return this;
    }

    public analyze(word: Array<string>, currentState: undefined = undefined, rapid: boolean = false): Array<any> | boolean {
        this.hasETransitions = this.hasETransitions !== undefined ? this.hasETransitions : this.isEAFN();
        this.currentState = currentState !== undefined ? currentState : this.currentState;
        let next = word.shift();
        let transitionFunction = this.hasETransitions ? "eTransiter" : "transiter";

        if (!rapid) {
            return AF.optimize(
                word.length == 0 ?
                    this[transitionFunction](next) :
                    [].concat(
                        ...this[transitionFunction](next).map((el: any) => this.analyze([...word], el))
                    )
            );
        }
        else {
            let result: Array<any> = this[transitionFunction](next);
            if (word.length == 0) {
                return AF.optimize(
                    result
                ).filter(el => this.finalStates.contains(el)).length > 0
                    ? true : false;
            }
            else {
                for (let state of result) {
                    if (this.analyze([...word], state, true)) return true;
                }
                return false;
            }
        }
    }

    public slice(word: string): Array<string> {
        // change visibility to protected
        let sliced = [word];

        this.alphabet.forEach(s => sliced = [].concat(
            ...sliced.map(el => el.split(new RegExp(`(${s})`)))
        ));
        return sliced.filter(el => el.length > 0); // remove empty symbols from word
    }
    public minimise(): AF {
        if (!this.isDeterministic()) return this.toAFD().minimise();
        if (!this.isComplete()) return this.complete().minimise();

        var seperate = (partition: Set<any>, symbol: string): boolean => {
            let splits: Object = {};
            let destPartition: Set<any>;
            partition.forEach((state) => {
                let dest = this.transiter(symbol, state)[0];
                destPartition = [...partitions].filter(el => el.contains(dest))[0];
                splits[destPartition + ""] = (new Set()).pushArray([...(splits[destPartition + ""] || []), state]);

            });

            let newPartitions: Array<Set<any>> = Object.values(splits);
            let seperated: boolean = newPartitions.length > 1;

            if (seperated) {
                partitions = (new Set()).pushArray(
                    newPartitions.concat([...partitions].filter(el => el + "" != partition + ""))
                );
            }
            else {
                newTransitions.push([partition, symbol, destPartition]);
            }
            return seperated;

        }

        let partitions: Set<Set<any>> = new Set([
            new Set([...this.states].filter(el => !this.finalStates.contains(el))),
            new Set([...this.finalStates])
        ]);

        let seperated = false;
        let newTransitions: Array<transition> = [];
        do {
            newTransitions = [];
            for (let partition of partitions) {
                for (let symbol of this.alphabet) {
                    seperated = seperate(partition, symbol)
                    if (seperated) {
                        break;
                    }
                }
                if (seperated) {
                    break;
                }
            }
        }
        while (seperated == true);

        return AF.make({
            states: partitions,
            alphabet: this.alphabet,
            initialState: [...partitions].filter(el => el.contains(this.initialState))[0],
            finalStates: new Set(
                [...partitions].filter(el => [...el].filter(e => this.finalStates.contains(e)).length > 0)
            ),
            transitions: newTransitions
        });
    }

	/*
	@praram : word: the word to recognize
	*/
    public recognize(word: string): boolean | any[] {
        return this.reset().analyze(this.slice(word), undefined, true);
    }

    public static recognizeText(words: Array<string>, afs: Array<AF>): Array<string> {
        let regexs = afs.reduce((acc, af) => {
            acc[af.name] = af.toRegex();
            return acc;
        }, {});

        return words.map(word => {
            let recognized;
            for (let af of afs) {
                recognized = af.recognize(word);
                if (recognized) {
                    return `<${word} : ${af.name} ( ${regexs[af.name]} )>`;
                }
            }
            return `<${word} : unknown>`;
        })



    }



	/*
		test if AF is an e-AFN
	*/
    public isEAFN(): Boolean {
        return this.transitions.filter(el => el[1] == AF.e).length > 0;
    }

	/*
		test if AF is Complete
	*/
    public isComplete(): Boolean {
        // check if each state has as many different transitions as there are symbols in the alphabet

        for (let state of this.states) {
            let symbols: Set<any> = new Set(this.transitions.filter(e => e[0] + "" == state + "").map(trans => trans[1]));
            if ([...this.alphabet].filter(el => symbols.contains(el)).length != this.alphabet.size) {
                return false;
            }
        }
        return true;
    }

	/*
		test if AF is an AFD
	*/
    public isDeterministic(): Boolean {
        // check that for each given state there is only 1 transition given a certain symbol and no epselon transitions
        return [...this.states].filter(el => [...this.alphabet].filter(s => {
            this.currentState = el;
            return this.transiter(s).length > 1
        }).length > 0).length == 0 && !this.isEAFN();
    }

    public complete(pullState?: any): AF {
        pullState = pullState !== undefined ? pullState : AF.getRandomInt([...this.states]); // creat pull state
        let af = {
            ...AF.parseJson(this.toJson()),
            states: new Set([...this.states, pullState])
        };

        this.states.forEach((s) => {
            this.alphabet.forEach((el) => {
                if (this.transiter(el, s).length == 0) af.transitions.push([s, el, pullState]);
            });
        });
        this.alphabet.forEach((el) => af.transitions.push([pullState, el, pullState]));
        // creer un état puis avecc toutes les transition sortantes qui revienent
        // sur lui et les transition manquante qui vont sur lui 
        return AF.make(af);
    }

    public determinise(): AF {
        if (this.isEAFN()) return this.toAFN().determinise();
        let af: any = {
            ...AF.parseJson(this.toJson()),
            initialState: new Set([this.initialState]),
            finalStates: new Set(),
            transitions: [],
            states: new Set()
        };

        af.states.push(af.initialState);


        for (let s of af.states) {
            if ([...s].filter(el => this.finalStates.contains(el)).length > 0) af.finalStates.push(s);
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


    public unDeterminise(state?: any): AF {
        let af = AF.parseJson(this.toJson());
        state = state || [...af.states][Math.floor(Math.random() * af.states.size)];
        let newState = AF.getRandomInt([...af.states]);
        af.states.push(newState);
        af.transitions.concat(
            af.transitions.filter(el => el[0] + "" === state + "" || el[2] + "" === state + "")
                .map(el => [el[0] + "" === state + "" ? newState : el[0], el[1], el[1] + "" === state + "" ? newState : el[1]])
        );
        return AF.make(af);
    }

    public eAFNtoAFN(): AF {
        if (this.isEAFN()) {
            let af = {
                ...AF.parseJson(this.toJson()),
                transitions: [],
                finalStates: new Set(
                    [...this.states]
                        .filter(el => this.finalStates.intersect(new Set(this.eSingleFermeture(el))).size > 0)
                ),
            };

            [...this.states].map(state => {
                this.alphabet.forEach(el => {
                    let targets = this.transiterArray(el, this.eSingleFermeture(state));
                    if (targets.length) {
                        targets.map(target => af.transitions.push([state, el, target]));
                    }
                })
            });

            return AF.make(af);
        }
        else return AF.make(this);
    }

    public static getRandomInt(exclusion: Array<any> = []): any {
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

    public static thompsonSymbol(symbol: string): AFProps {
        if (symbol === AF.E) return AF.thompsonSymbol(AF.e);
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

    public static thompsonConcatenate(afs: Array<AFProps>): AFProps {
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

    public static thompsonUnite(afs: Array<AFProps>): AFProps {
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

    public static thompsonIterate(af: AFProps): AFProps {
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

    public static isValid(str: string): Boolean {
        let i = 0;
        for (let el of str.split("").filter(e => e === "(" || e === ")")) {
            i = i + (el === "(" ? 1 : -1);
            if (i < 0) return false;
        }
        return i === 0 ? true : false;
    }

    public static parseRegex(regex: string): AFProps {
        regex = regex.trim();
        let s: number;
        if ((s = regex.indexOf("(")) === -1) {
            return AF.parse(regex);
        }
        let i: number = 1;
        let e: number = s;
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
                first = AF[regex[op] === "+" ? "thompsonUnite" : "thompsonConcatenate"](
                    reverse ? operands.reverse() : operands
                );
            }
        }
        return first;
        // simplify parse function 
    }

    private static parse(regex: string): AFProps {
        let split: string[] | RegExpExecArray;
        let exp = /([^\+\.\*\(\)]+)(\*?)/g;

        regex = regex.split(" ").filter(el => el !== "").join("");

        if (
            (split = (exp).exec(regex))
            && split[0].length == regex.length
        ) {
            let af: AFProps;
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

    public static parseJson(json: string): AFProps {
        
        let object = JSON.parse(json);
        console.log(object);
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
    public toRegex(): string {
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


        let toDelete: Array<any> = [...af.states].filter(el => el + "" !== af.initialState + "" && (!af.finalStates.contains(el)));

        toDelete.forEach(s => {
            s += "";
            let star: any = af.transitions.filter(el => el[0] + "" === s && el[2] + "" === s);
            star = star.length ? AF.wrap(star.map(e => e[1]).reduce((acc, val) => (acc || AF.E) + "+" + (val || AF.E)), true) + "*" : "";
            star = star.length > 1 ? star : "";
            let entrantes: Array<transition> = af.transitions.filter(el => el[2] + "" === s && el[0] + "" !== s);
            let sortantes: Array<transition> = af.transitions.filter(el => el[0] + "" === s && el[2] + "" !== s);

            entrantes.forEach(it => {
                sortantes.forEach(ot => {
                    let doubles: Array<transition> = [];
                    let indices: Array<number> = [];
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
        let regex: string = af.transitions.map(el => el[1])[0];

        return AF.unwrap(AF.simplify(regex));
        //AF.unwrap(AF.simplify(regex));
        //regex;
    }

    public static wrap(str: string, star: boolean = false): string {
        str = str.trim();
        let split: string[] | RegExpExecArray;
        if (
            (split = (/.+\+.+/g).exec(str))
            && split[0].length == str.length
            && (
                !(str.startsWith("(") && str.endsWith(")"))
                || !AF.isValid((/\((.+)\)/g).exec(str)[1])
            )
            || (star && (/.+[\+\.].+/g).exec(str))
        ) {
            return `(${str})`;
        }
        return str;
    }

    public static unwrap(str: string): string {
        str = str.trim();
        let split: string[] | RegExpExecArray;
        if (
            (split = (/\((.+)\)/g).exec(str))
            && split[0].length == str.length
            && AF.isValid(split[1])
        ) {
            return AF.unwrap(split[1]);
        }
        return str;
    }

    public static simplify(str: string): string {
        let result: string;
        while (
            (
                result = str.replace(/\(([^\+\(\)]+?)\)\.(.+)/g, "$1.$2")
                    .replace(/(.+?)\*?\.(\1\*)/g, "$2")
                    .replace(/(.+?)\.(\(\1\)\*)/g, "$2")
                    .replace(/(.+?)\*\.(\1)\*?/g, "$1*")
                    .replace(/\((.+?)\)\*\.(\1)/g, "($1)*")
                    .replace(/ɛ\+([^\.\+\(\)\*]+\*)/g, "$1")
                    .replace(/ɛ\*?\.(.+)/g, "$1")
                    .replace(/(.+?)\+(\1\*)/g, "$2")
            ) !== str
        ) {
            str = result;
        }

        return str;
    }

    public static make({ states, initialState, finalStates, alphabet, transitions, name }: any): AF {
        return new AF(states, initialState, finalStates, alphabet, transitions, name);
    }

	/*
	@param : regex : regular expression
		convert  regular expression to AF
	*/
    public static fromRegex(regex: string, name?: string): AF {
        return AF.make({
            ...AF.parseRegex(AF.simplify(regex)),
            name: name
        });
    }

	/*
	@param : json : json string 
		convert  json string to AF
	*/
    public static fromJson(json: string): AF {
        return AF.make(AF.parseJson(json));
    }

	/*
	convert AF to AFN
	*/
    public toAFN(state?: undefined): AF {
        if (this.isDeterministic()) return this.unDeterminise(state);
        else return this.eAFNtoAFN();
    }

	/*
	convert AF to AFD
	*/
    public toAFD(): AF {
        if (this.isDeterministic()) return AF.make(this);
        else return this.toAFN().determinise();
    }

	/*
	convert AF to e-AFN
	*/
    public toEAFN(state?: any): AF {
        if (this.isEAFN()) return AF.make(this);
        let af = AF.parseJson(this.toJson());
        state = state || af.initialState;
        af.transitions.push([state, AF.e, state]);
        af.states.push(state);
        return AF.make(af);
    }

    public static clotureComplementation(af): AF {
        return AF.make({
            ...af,
            finalStates: new Set(
                [...af.states].filter(e => !af.finalStates.has(e))
            )
        });
    }

    public static clotureEnsemble(afs: Array<AF>, union = true, mergeAlphabet = false): AF {
        if (afs.filter(af => afs.filter(a => !a.alphabet.isSubset(af.alphabet)).length > 0).length > 0) {
            if (!mergeAlphabet) {
                throw "Automata should have the same alphabet";
            }
            else {
                let alphabet = afs.reduce(((acc, af) => acc = (new Set()).pushArray([...af.alphabet, ...acc])), []);
                afs = afs.map(af => AF.make({
                    ...af,
                    alphabet: alphabet
                }).complete());
            }
        }

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
                    : [...acc.finalStates.zip(af.finalStates)]
                ),
                transitions: [].concat(
                    ...[...states.zip(alphabet)].map(couple => {
                        let [state, symbol] = [...couple]
                        let [accState, afState] = [...state];
                        return acc.transiter(symbol, accState).zip(af.transiter(symbol, afState)).map(
                            el => {
                                return [
                                    state,
                                    symbol,
                                    el
                                ];
                            });
                    }).filter(e => e.length !== 0)
                ),
            });
        });
    }

    public static clotureUnion(afs: Array<AF>, mergeAlphabet = false): AF {
        return AF.clotureEnsemble(afs, true, mergeAlphabet);
    }

    public static clotureIntersection(afs: Array<AF>, mergeAlphabet = false): AF {
        return AF.clotureEnsemble(afs, false, mergeAlphabet);
    }

    public static clotureMiroir(af): AF {
        if (af.finalStates.size > 1) throw "Automaton has more than one final state";
        return AF.make({
            ...af,
            initialState: [...af.finalStates][0],
            finalStates: new Set([af.initialState]),
            transitions: af.transitions.map(e => [e[2], e[1], e[0]])
        });
    }

    public static clotureConcatenation(afs: Array<any>): AF {
        return AF.make(afs.reduce((acc, af) => {
            if ([...acc.states].filter(el => af.states.contains(el)).length > 0) throw "Automaton state are not disjoint";
            else if (acc.finalStates.size > 1) throw "Automaton has more than 1 final state";
            else if (acc.transitions.filter(e => acc.finalStates.contains(e[0])).length > 0) throw "Automatons final state degree is not nul (has putgoing transitions)";
            return acc = {
                ...acc,
                alphabet: new Set([...acc.alphabet, ...af.alphabet]),
                states: new Set([...acc.states, ...af.states]),
                finalStates: af.finalStates,
                transitions: acc.transitions.concat(af.transitions, [[[...acc.finalStates][0], AF.e, af.initialState]])
            };
        }));
    }

    public static clotureEtoile(af): AF {
        return AF.make({
            ...af,
            transitions: af.transitions.concat([...af.finalStates].map(e => [e, AF.e, af.initialState]))
        });
    }
	/*
	returns type of the AF as string
	*/
    public type(): string {
        return `${this.isEAFN() ? "e-" : ""}AF${(this.isDeterministic() ? "D" : "N") + (this.isComplete() ? "C" : "")} `;
    }



    public toString(notation = "{,}", propsnotation = ',', enclose = ','): string {
        let encloseA = enclose.split(",");
        encloseA[1] = encloseA[1] || encloseA[0];
        let propsnotationA = propsnotation.split(",");
        propsnotationA[1] = propsnotationA[1] || propsnotationA[0];
        return `
                ${ encloseA[0]}
                ${ propsnotationA[0]}states${propsnotationA[1]} : ${this.states.toString(notation, propsnotation)},
                ${ propsnotationA[0]}initialState${propsnotationA[1]} : ${typeof this.initialState == "object" ? this.initialState.toString(notation, propsnotation) : this.initialState},
                ${ propsnotationA[0]}currentState${propsnotationA[1]} : ${typeof this.currentState == "object" ? this.currentState.toString(notation, propsnotation) : this.currentState},
                ${ propsnotationA[0]}finalStates${propsnotationA[1]} : ${this.finalStates.toString(notation, propsnotation)} ,
                ${ propsnotationA[0]}alphabet${propsnotationA[1]} : ${this.alphabet.toString(notation, propsnotation)},
                ${ propsnotationA[0]}transitions${propsnotationA[1]} : ${this.transitions.toString(notation, propsnotation)},
                ${ propsnotationA[0]}kind${propsnotationA[1]} : "${this.kind + ""}",
                ${ propsnotationA[0]}name${propsnotationA[1]} : "${this.name + ""}"
                ${ encloseA[1]}
                `;
    }

	/*
	convert AF to json string
	*/
    public toJson(): string {
        return JSON.stringify(this);
    }


}




