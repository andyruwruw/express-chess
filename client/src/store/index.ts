import Vue from 'vue';
import Vuex, { Module } from 'vuex';

import connection from './modules/connection';

Vue.use(Vuex);

export const modules: ModuleTree<> {
  connection,
};

export default new Vuex.Store({
  modules,
});
