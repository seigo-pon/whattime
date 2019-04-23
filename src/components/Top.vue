<template>
  <v-container>
    <v-layout
      text-xs-center
      wrap
    >
      <v-flex
        xs12
        mb-4
      >
        <v-container>
          <v-layout wrap>
            <v-flex
              xs12
              sm10
              md10
            >
              <v-form onSubmit="return false;">
                <v-text-field
                  single-line
                  v-model="inputDateTime"
                  label="Unix Time, UTC, JCT...and more."
                  ref="textfield"
                ></v-text-field>
              </v-form>
            </v-flex>

            <v-flex
              xs12
              sm2
              md2
              text-xs-right
            >
              <v-btn
                class="success"
                @click="convertDateTime"
              >
                Convert
              </v-btn>
            </v-flex>
          </v-layout>

          <v-layout wrap>
            <v-flex
              xs12
              sm5
              md5
              text-xs-left
            >
              <v-btn
                outline
                small
                color="secondary"
                @click="inputCopyDateTime(nowDate)"
              >
                Now
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>

      <v-flex
        xs12
        mb-4
        v-if="isResult()"
      >
        <v-card
          class="elevation-2"
          ref="result"
        >
          <v-list>
            <v-subheader>
              <v-icon>access_time</v-icon>
              <span class="ml-1 font-weight-light text-uppercase">Result</span>
            </v-subheader>

            <template v-for="(dateTime, resultKey, index) in resultDateTimes">
              <v-divider
                :key="index"
                v-if="index !== 0"
              ></v-divider>

              <v-list-tile :key="resultKey">
                <v-list-tile-content>
                  <v-list-tile-title
                    v-text="resultKey"
                    class="font-weight-medium grey--text text-uppercase"
                  ></v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action class="align-end">
                  <v-btn
                    flat
                    large
                    @click="copyResultDateTime(dateTime)"
                  >
                    {{ dateTime }}
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>

      <v-flex
        xs12
        mb-4
      >
        <v-expansion-panel>
          <v-expansion-panel-content>
            <template v-slot:header>
              <div class="text-xs-left">
                <v-icon>history</v-icon>
                <span class="ml-1 font-weight-light text-uppercase">History</span>
              </div>
            </template>

            <v-card class="elevation-0">
              <v-container>
                <v-layout>
                  <v-flex xs12>
                    <v-data-table
                      :items="historyDateTimes"
                      hide-headers
                      hide-actions
                      class="elevation-1"
                    >
                      <template slot="items" slot-scope="props">
                        <td class="font-weight-thin text-xs-left">
                          {{ props.item.createdAt.toLocaleString() }}
                        </td>
                        <td class="text-xs-left">
                          <v-btn
                            flat
                            @click="inputCopyDateTime(props.item.input)"
                          >
                            {{ props.item.input }}
                          </v-btn>
                        </td>
                      </template>
                    </v-data-table>
                    <div
                      class="pt-2"
                    >
                      <div class="text-xs-right">
                        <v-btn
                          fab
                          flat
                          small
                          @click="deleteHistoryDateTimeAll"
                        >
                          <v-icon>delete_forever</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>

    <v-snackbar
        v-model="clipboardSnackbar"
        :right="true"
        color="info"
        :timeout="6000"
      >
        Copy to clipboard.
        <v-btn
          dark
          flat
          @click="clipboardSnackbar = false"
        >
          Close
        </v-btn>
      </v-snackbar>

      <v-flex id="floating">
        <v-btn
          dark
          fab
          fixed
          bottom
          right
          color="accent"
          @click="scrollToTop"
        >
          <v-icon>keyboard_arrow_up</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Datastore from 'nedb'
  import moment from 'moment-timezone'
  import 'moment/locale/ja'

  // moment.js set locale to japanese
  moment.locale('ja')

  // instance of local db
  const db = new Datastore({
    filename: 'whattime.db',
    autoload: true
  })
  db.loadDatabase()

  export default {
    data () {
      return {
        nowDate: "",
        inputDateTime: "",
        resultDateTimes: {},
        historyDateTimes: [],
        clipboardSnackbar: false
      }
    },
    methods: {
      tickDate () {
        this.nowDate = moment().tz('Asia/Tokyo').format()
      },
      convertDateTime () {
        // Empty data is disabled.
        if (this.inputDateTime === '') {
          console.log('Input data is empty.')
          return
        }
        console.log(this.inputDateTime)

        // Is this input data unixtime?
        let format = 'JST'
        if (!isNaN(this.inputDateTime)) {
          format = 'unixtime'
        } else if (String(this.inputDateTime).indexOf('GMT') !== -1) {
          format = 'UTC'
        }
        console.log(format)

        // Input data convert to date.
        let dateTime = null
        switch (format) {
        case 'unixtime': {
          let unixtimeString = String(this.inputDateTime)

          // Because foramt of unixtime is used milliseconds, input number is needed to 13 digits.
          for (let i = unixtimeString.length; i < 13; i++) {
            unixtimeString += '0'
          }
          console.log(unixtimeString)

          dateTime = moment(Number(unixtimeString))
          break
        }

        case 'JST':
          dateTime = moment(this.inputDateTime)
          break

        case 'UTC':
        default:
          dateTime = moment.utc(this.inputDateTime)
          break
        }
        console.log(dateTime)

        // result data
        this.resultDateTimes = {
          'unixtime': dateTime.valueOf(),
          'UTC': dateTime.utc().format(),
          'ISO': dateTime.toISOString(),
          'JST': dateTime.tz('Asia/Tokyo').format(),
          'Locale': dateTime.format('LLLL'),
          'Calendar': dateTime.calendar(),
          'Time from now': dateTime.fromNow()
        }
        console.log(this.resultDateTimes)

        // Scroll to result
        this.$nextTick(() => {
          this.$vuetify.goTo(250)
        })

        // history data
        const historyDateTime = {
          'createdAt': new Date(),
          'input': this.inputDateTime,
          'result': this.resultDateTimes[format === 'unixtime' ? 'UTC' : 'unixtime']
        }

        // History data is saved to local db.
        db.insert(historyDateTime, (err, doc) => {
          if (err) {
            console.log(err)
          } else {
            console.log(doc)
            this.historyDateTimes.unshift(doc)
          }
        })
      },
      inputCopyDateTime (dateTime) {
        console.log(dateTime)

        // data to input textfield
        this.inputDateTime = dateTime

        // Text field is focus.
        this.$refs.textfield.focus()
      },
      isResult () {
        // Result data is after pressed convert button.
        return Object.keys(this.resultDateTimes).length > 0
      },
      copyResultDateTime (dateTime) {
        console.log(dateTime)

        // data to clipboard
        this.$clipboard(dateTime)

        // Snackbar show.
        this.clipboardSnackbar = true
      },
      deleteHistoryDateTimeAll () {
        db.remove({}, (err, runRemoved) => {
          if (err) {
            console.log(err)
          } else {
            console.log(runRemoved)
            this.historyDateTimes = []
          }
        })
      },
      scrollToTop () {
        this.$nextTick(() => {
          this.$vuetify.goTo(0)
        })
      }
    },
    mounted () {
      // History data is loaded from local db.
      db.find({}, (err, docs) => {
        if (err) {
          console.log(err)
        } else {
          console.log(docs)
          this.historyDateTimes = docs
        }
      })

      // Timer started.
      this.tickDate()
      this.timer = setInterval(() => {
        this.tickDate()
      }, 1000)

      // Started focus is text field.
      this.$refs.textfield.focus()
    },
    destroyed() {
      // Clear timer
      clearInterval(this.timer)
    },
  }
</script>

<style>
#floating .v-btn--floating {
  margin: 0 0 24px 0;
}
</style>
