<template>
  <v-app>
    <v-toolbar
      app
      class="primary elevation-3"
    >
      <v-toolbar-title
        class="headline white--text font-weight-medium text-uppercase"
      >
        What time?
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        fab
        small
        href="https://github.com/seigo-pon/whattime"
        target="_blank"
      >
        <v-avatar
          fab
          size="32px"
        >
          <img src="./assets/GitHub-Mark-Light-64px.png" alt="Github">
        </v-avatar>
      </v-btn>
    </v-toolbar>

    <v-content>
      <Top />
    </v-content>

    <v-footer app>
      <v-flex
        xs12
        text-xs-center
      >
        &copy; 2019 - <strong>What Time</strong>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
import Top from './components/Top'

export default {
  name: 'App',
  components: {
    Top
  },
  data () {
    return {
    }
  }
}
</script>
