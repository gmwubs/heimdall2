<template>
  <v-row no-gutters>
    <v-col class="pa-0" :cols="2">
      <slot name="status" />
    </v-col>

    <v-col class="pa-0" :cols="1">
      <v-card tile flat class="fill-height">
        <slot name="id" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="1">
      <v-card tile flat class="fill-height">
        <slot name="severity" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="5">
      <v-card tile flat class="fill-height">
        <slot name="title" />
      </v-card>
    </v-col>

    <v-col class="pa-0" :cols="3">
      <v-card tile flat class="fill-height">
        <slot name="tags" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Row extends Vue {}
</script>

<style scoped>
.v-card {
  background-color: rgba(0, 0, 0, 0);
}
</style>
