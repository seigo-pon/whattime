import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#3f51b5',
    secondary: '#e91e63',
    accent: '#ff5722',
    error: '#f44336',
    warning: '#00bcd4',
    info: '#009688',
    success: '#2196f3'
  }
})
