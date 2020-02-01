import AF from "../../dist/AF";
import {
    resultObject
} from "./objects";

var af;
self.onmessage = function (e) {
    let data = e.data;
    let result;
    let callback = data.callback;
    let args = data.args.map(el => el === "this" ? af : el);
    args = callback.map ? args.map(el => callback.excludeThis && el == af ? el : (callback.static ? AF : af)[callback.map](el)) : args;
    console.log(data);
    console.log(af);
    console.log(args);

    try {
        let object;
        if (!data.operation.static) {
            if (!(af instanceof AF)) throw "No current Automaton defined";
            object = af;
        } else {
            object = AF;
        }
        args = data.spread ? args : [args];
        console.log(args);
        result = {
            ...resultObject,
            data: object[data.operation.name](...args),
            callerId: data.callerId,
        };

        if (result.data instanceof AF) {
            if (data.useResult || data.useResult == null) {
                af = result.data;
            }
            result.regex = result.data.toRegex();
            result.type = typeof result.data;
        }
    } catch (error) {
        result = {
            ...resultObject,
            status: "ERROR",
            data: error,
            callerId: data.callerId,
        };
    }
    self.postMessage(result);
}