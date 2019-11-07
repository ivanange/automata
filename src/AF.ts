import "./bootstrap";

// node -r esm dist/AF.js

export default class AF {

    public readonly e = ""; //epselon
    protected readonly transitions: Array<transition>;
    protected readonly alphabet: Set<string>;
    protected readonly states: Set<any>;
    protected readonly finalStates: Set<any>;
    protected readonly initialState: any;
    protected currentState: any

    public constructor(Q: Set<any>, Qi: any, F: Set<any>, E: Set<string>, S: Array<transition>) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(el => [...E].filter(s => s.match(el)).length > 1) // verifie que aucun symbol n'est contenu dans un autres


        if (Q.contains(Qi)
            && Q.isSubset(F)
            && E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1])))
            && Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]]))))
            && invalidSet.length == 0
        ) {
            this.states = Q;
            this.initialState = Qi;
            this.finalStates = F;
            this.alphabet = E;
            this.transitions = S;
            this.currentState = this.initialState;
        }

        else {
            throw `Properties specified are invalid ,  possible Errors :
                    - Invalid alphabet ( ambiguous )  symbols contained in other symbols : ${String(invalidSet || '')}
                    - Initial state not element of Sigma(alphabet)
                    - Final states not subset of Q (set of all states)
                    - A state used in a transition does not exist in Q (set of all states)
                    - Symbol used in a transition does not exist in Sigma(alphabet)
                `;
        }
    }

    public transiter(symbol: string): Array<transition> {
        return this.transitions
            .filter(el => el[0] === this.currentState && el[1] === symbol)
            .map(el => el[2]);
    }

    public reset(): AF {
        this.currentState = this.initialState;
        return this;
    }

    public analyze(word: Array<string>, currentState?): Array<any> {
        this.currentState = currentState || this.currentState;
        let next = word.shift();
        if (word.length == 0) {
            return this.transiter(next);
        }
        else {
            return [].concat(
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
        return this.reset()
            .analyze(this.slice(word))
            .filter(el => this.finalStates.contains(el))
            .length > 0;
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
        }).length > 0).length == 0 && this.transitions.filter(el => el[1] == '').length == 0;
    }

    // test function to check completeness
    // test function to check determinism
    // use interfaces & mixins instead of classes or both
    // complete interface : only available for non-complete automatas
    // non-deterministic interface : determinize method that will complete if necccessary and determinize
    // deterministic interface: non-determinize method that will complete if necccessary and non-determinize
    // be able to produce all automatas AF, AFD, AFC, AFN, AFNC, AFDC
    // functionalities : complete, determinize, un-determinize, uncomplete

}




