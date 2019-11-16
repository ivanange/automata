import "./bootstrap";

// node -r esm dist/AF.js
export default class AF {

    public static readonly e = ""; //epselon
    protected readonly transitions: Array<transition>;
    protected readonly alphabet: Set<string>;
    protected readonly states: Set<any>;
    protected readonly finalStates: Set<any>;
    protected readonly initialState: any;
    protected currentState: any;
    protected hasETransitions;

    public constructor(Q: Set<any>, Qi: any, F: Set<any>, E: Set<string>, S: Array<transition>) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(el => [...E].filter(s => s.match(el)).length > 1) // verifie que aucun symbol n'est contenu dans un autres


        if (!Q.contains(Qi)) throw "Initial state not element of Q (set of all states)";
        else if (!Q.isSubset(F)) throw "Final states not subset of Q (set of all states)";
        else if (!E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1])))) throw "A Symbol used in a transition does not exist in Sigma(alphabet)";
        else if (!Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]]))))) throw "A state used in a transition does not exist in Q (set of all states)";
        else if (invalidSet.length > 0) throw "Invalid alphabet ( ambiguous )  symbols contained in other symbols : ${String(invalidSet || '')}";
        else {
            this.states = Q;
            this.initialState = Qi;
            this.finalStates = F;
            this.alphabet = E;
            this.transitions = S;
            this.currentState = this.initialState;
        }
    }

    public optimize(array: Array<any>) {
        let set = new Set();
        return [...set.pushArray(array)];
    }

    public transiter(symbol: string, state?: any): Array<any> {
        this.currentState = state || this.currentState;
        return this.optimize(
            this.transitions
                .filter(el => el[0] + "" === this.currentState + "" && el[1] === symbol)
                .map(el => el[2])
        );
    }

    public transiterArray(symbol: string, state: Array<any>): Array<any> {

        return this.optimize(
            [].concat(...state.map(el => this.transiter(symbol, el)))
        );
    }

    public eSingleFermeture(e: any): Array<any> {
        this.currentState = e;
        let s = this.transiter(AF.e);
        return this.optimize(
            [].concat(
                [e],
                ...(s.length > 0 ? s.map(el => this.eSingleFermeture(el)) : [[]])
            )
        );
    }

    public eFermeture(es: Array<any>): Array<any> {
        return this.optimize(
            [].concat(...es.map(el => this.eSingleFermeture(el)))
        );
    }

    public eTransiter(symbol: string, state?: any): Array<any> {
        state = state || this.currentState;
        return this.optimize(
            this.eFermeture(
                this.transiterArray(symbol, this.eSingleFermeture(state))
            )
        );
    }

    public reset(): AF {
        this.currentState = this.initialState;
        return this;
    }

    public analyze(word: Array<string>, currentState?): Array<any> {
        this.hasETransitions = this.hasETransitions || this.isEAFN();
        this.currentState = currentState || this.currentState;
        let next = word.shift();

        if (this.hasETransitions) {

            return word.length == 0 ?
                this.eTransiter(next) :
                [].concat(
                    ...this.eTransiter(next).map(el => this.analyze([...word], el))
                );
        }

        else {
            return word.length == 0 ?
                this.transiter(next) :
                [].concat(
                    ...this.transiter(next)
                        .map(el => this.analyze([...word], el))
                );

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

    public recognize(word: string): Boolean {
        return [... new Set(this.reset().analyze(this.slice(word)))]
            .filter(el => this.finalStates.contains(el))
            .length > 0;
    }

    public isEAFN(): Boolean {
        return this.transitions.filter(el => el[1] == '').length > 0;
    }

    public isComplete(): Boolean {
        // check if each state has as many different transitions as there are symbols in the alphabet
        return [...this.states].filter(
            el => this.transitions.filter(e => e[0] == el).length < this.alphabet.size
        ).length == 0;
    }

    public isDeterministic(): Boolean {
        // check that for each given state there is only 1 transition given a certain symbol and no epselon transitions
        return [...this.states].filter(el => [...this.alphabet].filter(s => {
            this.currentState = el;
            return this.transiter(s).length > 1
        }).length > 0).length == 0 && !this.isEAFN();
    }

    public complete(pullState?: any): AF {
        pullState = pullState || [...this.states].join(""); // creat pull state
        let states: Set<any> = new Set([...this.states, pullState]);
        let transitions: Array<transition> = [];
        this.states.forEach((s) => {
            this.alphabet.forEach((el) => {
                if (this.analyze([el], s).length == 0) transitions.push([s, el, pullState]);
                transitions.push([pullState, el, pullState]);
            });
        });
        transitions = [].concat(this.transitions, transitions)
        // creer un état puis avecc toutes les transition sortantes qui revienent
        // sur lui et les transition manquante qui vont sur lui 
        return new AF(states, this.initialState, this.finalStates, this.alphabet, transitions);
    }


    public determinise(): AF {
        // check algorithm in doc
        // this.complete();
        // foreach does not consider modifications on the iterated object
        let initialState: Set<any> = new Set([this.initialState]);
        let finalStates: Set<any> = new Set();
        let transitions: Array<transition> = [];
        let states: Set<any> = new Set([initialState]);

        for (let s of states) {
            if ([...s].filter(el => this.finalStates.contains(el)).length > 0) finalStates.push(s);
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

    public toString(notation = "{,}", propsnotation = ',', enclose = ',') {
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

    public unDeterminise(): AF {
        // create an epselon transition on a random state
        // give possibility to pass states on which to create epselon transitions as arguments [ [from, to], ... ]
        return;
    }

    public toJson() {
        return this.toString("[,]", '","', "{,}");
    }



    // static make : return new automaton from json string : recursively ( to any depth ) convert each array to set, except transitions array itself (but not whats in it)
    // renameStates([new names]) : AF
    // from string 
    // e-AFN mixin
    // use interfaces & mixins instead of classes or both
    // complete interface : only available for non-complete automatas
    // non-deterministic interface : determinize method that will complete if necccessary and determinize
    // deterministic interface: non-determinize method that will complete if necccessary and non-determinize
    // be able to produce all automatas AF, AFD, AFC, AFN, AFNC, AFDC, e-AFN
    // functionalities : complete, determinize, un-determinize, uncomplete
    // to regexp, from regexp
    // use jsdoc to generate documentation
    // D : unique transitions for each state ans symbol and no epselon transition 
    // C: transition function is total ie all possible transitions are defined
    // e- : has epselon transition(s)
    // N : is not deterministic
    // etats accessibles, co-accessibles, utiles, emondés



}




