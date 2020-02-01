require('es7-object-polyfill');
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';
import {
    mapState,
    mapGetters,
    mapActions,
    mapMutations
} from 'vuex';
import Vue from 'vue';
import {
    dataObject
} from "./objects";

Vue.use(Vuex)

const state = {
    state: {
        lang: "en",
        enviroments: {
            default: {
                current: { // current af 
                },
                saved: {
                    // name : value
                },
                history: [
                    //history of 
                ]
            }
        },
        enviroment: {
            current: {},
            saved: {},
            history: []
        },
        key: ""

    },
    getters: {
        enviromentsList: state => Object.values(state.enviroments),
        savedList: state => Object.values(state.enviroment.saved || {}),
    },
    mutations: {
        setEnviroment(state, key) {
            state.enviroment = state.enviroments[key];
            state.key = key;
        },
        addEnviroment(state, {key, enviroment}) {
            if (Object.keys(state.enviroments).indexOf(key) == -1) {
                state.commit('editEnviroment', key, enviroment);
            }
        },
        removeEnviroment(state, key) {
            Vue.delete(state.enviroments, key);
        },

        editEnviroment(state, {key, enviroment}) {
            Vue.set(state.enviroments, key, enviroment);
        },
        clearEnviroments(state) {
            state.enviroments = {
                default: {
                    current: {},
                    saved: {},
                    history: []
                }
            };
        },
        setHistory(state, history) {
            Vue.set(state.enviroment, "history", history);
        },
        addHistory(state, history) {
            state.enviroment.history.unshift(history);
        },
        deleteHistory(state, key) {
            Vue.delete(state.enviroment.history, key);
        },
        clearHistory(state) {
            state.enviroment.history = [];
        },
        addSaved(state, {name, saved}) {
            Vue.set(state.enviroment.saved, name, saved);
        },
        setSaved(state, saved) {
            Vue.set(state.enviroment, "saved", saved);
        },
        deleteSaved(state, key) {
            Vue.delete(state.enviroment.saved, key);
        },
        clearSaved(state) {
            state.enviroment.saved = {};
        },
        setCurrent(state, current) {
            Vue.set(state.enviroment, "current", current);
        },
        changeLang(state, lang) {
            state.lang = lang;
        },

    },

    actions: {
        saveEnviroment(context) {
            context.commit("editEnviroment", context.state.key, context.state.enviroment);
        }
    }
};

Vue.mixin({
    computed: {
        ...mapState([
            "lang",
            "enviroments",
            "enviroment",
            "key",
        ]),
        ...mapGetters([
            "enviromentsList",
            "savedList"
        ]),
    },
    methods: {
        ...mapActions([
            "saveEnviroment",

        ]),
        ...mapMutations([
            "addSaved",
            "setEnviroment",
            "addEnviroment",
            "removeEnviroment",
            "editEnviroment",
            "clearEnviroments",
            "setHistory",
            "addHistory",
            "deleteHistory",
            "clearHistory",
            "setSaved",
            "deleteSaved",
            "clearSaved",
            "setCurrent",
            "changeLang",
        ]),
        post(message) {
            this.$root.worker.postMessage({
                ...dataObject,
                ...message
            });
        },
        setupAF(af, regex) {
            this.$root.af = af;
            this.$root.regex = regex;
        },
        defaultHandler(message) {
            this.setupAF(message.data, message.regex);
        },
    },
    created() {
        if (this.callerId) {
            this.$root.$on(this.callerId, this.handler || this.defaultHandler);
        }
    }
});







const vuexLocalStorage = new VuexPersist({
    key: 'vuex',
    storage: window.localStorage,
})

const store = new Vuex.Store({
    ...state,
    plugins: [vuexLocalStorage.plugin],
});

export default store;