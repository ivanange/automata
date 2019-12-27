import AF from "../../dist/AF";

var af;
self.onmessage = function (e) {
    let data = e.data;
    let result;
    let map = data.map;
    let args = data.args.map(el => el === "this" ? af : (map ? AF[map](el) : el))
    console.log(data);
    console.log(af);
    console.log(args);
    try {
        result = {
            status: "OK",
            data: (data.static ? AF : af)[data.operation](...(data.nospread ? [args] : args))
        };

        af = typeof result.data === "object" ? result.data : af;
    } catch (error) {
        result = {
            status: "ERROR",
            data: error
        };
    }
    self.postMessage(result);
}