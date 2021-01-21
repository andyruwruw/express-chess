<template>
  <div :class="$style.component">
    <h1>
      Express Chess
    </h1>

    <h4>
      by Andrew Young
    </h4>

    <v-btn
      :class="$style.button"
      outlined
      width="13rem">
      Find a Game
    </v-btn>

    <v-btn
      :class="$style.button"
      outlined
      width="13rem">
      Return to Game
    </v-btn>

    <v-btn
      :class="$style.button"
      outlined
      width="13rem">
      About
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Landing',
});
</script>

<style lang="scss" module>
.component {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;

  background-image: linear-gradient(#F3F4F4, #DDE4ED);

  h4 {
    margin-bottom: 2rem;
  }
}

.button {
  margin: 1rem 0;
}
</style>
