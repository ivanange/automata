<template>
  <div id="app">
    <b-navbar type="dark" variant="dark" id="nav" class="mb-2">
      <b-navbar-brand to="/" class="pr-5 mr-5">Automata</b-navbar-brand>
      <b-navbar-nav class="ml-5 pl-5">
        <b-nav-item to="/">Home</b-nav-item>
        <b-nav-item to="/aboutjs">Source JS file</b-nav-item>
        <b-nav-item to="/aboutts">Source TS file</b-nav-item>
        <b-nav-item to="/authors">Authors</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>


<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0px;
  padding-top: 0px;
}
</style>
