export const resultObject = {
    status: "OK",
    data: {},
    type: "",
    callerId: "",
    regex: null // if result is af
};

export const dataObject = {
    useResult: null, // default true for type == AF
    args: [],
    operation: {
        name: "",
        static: false,
    },
    callback: {
        map: null,
        static: false,
        excludethis: true
    },
    callerId: "",
    type: "",
    spread: true

};