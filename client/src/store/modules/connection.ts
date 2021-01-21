import { Module } from 'vuex';

const connectionModule: Module<any, any> = {
  namespaced: true,

  state: {
    connected: false,
  },

  getters: {

  },

  mutations: {
    setConnected(state, status) {
      state.connected = status;
    },
  },

  actions: {

  },
};

export default connectionModule;