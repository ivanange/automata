import AF from "./AF";

// try using interfaces instead of classes  
export default class AFN extends AF {
    public constructor(Q: Set<any>, Qi: any, F: Set<any>, E: Set<string>, S: Array<transition>) {
        super(Q, Qi, F, E, S);
        // make sure there are no by call to check_completeness method of AF then continue or throw error
        // use eval to create object of dynamic class name
        // implement AFN class with its 
    }
}