import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#3f51b5',
    secondary: '#e91e63',
    accent: '#ffc107',
    error: '#f44336',
    warning: '#00bcd4',
    info: '#607d8b',
    success: '#2196f3'
  }
})
