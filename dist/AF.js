import "./bootstrap";
// node -r esm dist/AF.js
export default class AF {
    constructor(Q, Qi, F, E, S) {
        // check there are no duplicate transitions
        // use switchcase to provide precise errors
        let invalidSet = [...E].filter(el => [...E].filter(s => s.match(el)).length > 1); // verifie que aucun symbol n'est contenu dans un autres
        if (Q.contains(Qi)
            && Q.isSubset(F)
            && E.isSubset(new Set(S.filter(e => e[1] != "").map(el => el[1])))
            && Q.isSubset(new Set([].concat(...S.map(el => [el[0], el[2]]))))
            && invalidSet.length == 0) {
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
    transiter(symbol) {
        return this.transitions
            .filter(el => el[0] === this.currentState && el[1] === symbol)
            .map(el => el[2]);
    }
    reset() {
        this.currentState = this.initialState;
        return this;
    }
    analyze(word, currentState) {
        this.currentState = currentState || this.currentState;
        let next = word.shift();
        if (word.length == 0) {
            return this.transiter(next);
        }
        else {
            return [].concat(...this.transiter(next)
                .map(el => this.analyze([...word], el)));
        }
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
    isComplete() {
        // check if each state has as many different transitions as there are symbols in the alphabet
        return [...this.states].filter(el => this.transitions.filter(e => e[0] == el).length < this.alphabet.size).length == 0;
    }
    isDeterministic() {
        // check that for each given state there is only 1 transition given a certain symbol and no epselon transitions
        return [...this.states].filter(el => [...this.alphabet].filter(s => {
            this.currentState = el;
            return this.transiter(s).length > 1;
        }).length > 0).length == 0 && this.transitions.filter(el => el[1] == '').length == 0;
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
