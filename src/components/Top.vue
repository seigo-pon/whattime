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
          <v-layout>
            <v-flex class="text-xs-left">
              <v-icon>create</v-icon>
              <span class="ml-1 font-weight-light text-uppercase">Input date time</span>
            </v-flex>
          </v-layout>

          <v-layout>
            <v-flex
              xs12
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
              md2
            >
              <v-btn
                class="success"
                @click="convertDateTime"
              >
                Convert
              </v-btn>
            </v-flex>
          </v-layout>

          <v-layout>
            <v-flex
              xs12
              md5
              text-xs-left
            >
              <span class="font-weight-medium grey--text text-uppercase">Now:</span>
              <v-btn
                flat
                small
                color="secondary"
                @click="inputCopyDateTime(nowDate)"
              >
                {{ nowDate }}
              </v-btn>
            </v-flex>

            <v-flex
              xs12
              text-xs-left
            >
              <v-btn
                outline
                small
                @click="toggleNowDateFormat"
              >
                {{ nowDateFormat }}
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
                  <v-list-tile-title v-text="resultKey">:</v-list-tile-title>
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
        <v-expansion-panel v-model="historyPanelIndex">
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
                      :headers="historyHeaders"
                      :items="historyDateTimes"
                      hide-actions
                      :pagination.sync="historyPagenation"
                      class="elevation-1"
                    >
                      <template slot="items" slot-scope="props">
                        <td class="font-weight-thin text-xs-left">{{ props.item.createdAt.toLocaleString() }}</td>
                        <td class="text-xs-left">
                          <v-btn
                            flat
                            @click="inputCopyDateTime(props.item.input)"
                          >
                            {{ props.item.input }}
                          </v-btn>
                        <td class="text-xs-left">
                          <v-btn
                            flat
                            @click="inputCopyDateTime(props.item.result)"
                          >
                            {{ props.item.result }}
                          </v-btn>
                        </td>
                      </template>
                    </v-data-table>
                    <div
                      v-if="historyPages > 0"
                      class="text-xs-center pt-2"
                    >
                      <v-pagination
                        v-model="historyPagenation.page"
                        :length="historyPages"
                      ></v-pagination>
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
        nowDateFormat: "UTC",
        timer: null,
        inputDateTime: "",
        resultDateTimes: {},
        historyDateTimes: [],
        historyPanelIndex: null,
        historyHeaders: [
          { text: 'input at', align: "left", value: 'createdAt' },
          { text: 'input value', value: 'input' },
          { text: 'result value', value: 'result' }
        ],
        historyPagenation: {
          descending: true,
          sortBy: 'createdAt'
        },
        clipboardSnackbar: false
      }
    },
    watch: {
      historyPanelIndex () {
        if (this.historyPanelIndex !== null) {
          // Scroll to history
          this.$nextTick(() => {
            this.$vuetify.goTo(1000)
          })
        }
      }
    },
    computed: {
      historyPages () {
        if (this.historyPagenation.rowsPerPage == null || this.historyPagenation.totalItems == null) {
          return 0
        }
        return Math.ceil(this.historyPagenation.totalItems / this.historyPagenation.rowsPerPage)
      }
    },
    methods: {
      getBrowserLocale () {
        if (window.navigator.languages) {
          return window.navigator.languages[0]
        }
        return window.navigator.userLanguage || window.navigator.language
      },
      tickDate () {
        const date = moment()
        switch (this.nowDateFormat) {
        case 'unixtime':
          this.nowDate = date.valueOf()
          break

        case 'JST':
          this.nowDate = date.tz('Asia/Tokyo').format()
          break

        case 'UTC':
        default:
          this.nowDate = date.utc().format()
          break
        }
      },
      toggleNowDateFormat () {
        switch (this.nowDateFormat) {
        case 'unixtime':
          this.nowDateFormat = 'JST'
          break

        case 'JST':
          this.nowDateFormat = 'UTC'
          break

        case 'UTC':
        default:
          this.nowDateFormat = 'unixtime'
          break
        }
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
        case 'unixtime':
          dateTime = moment(Number(this.inputDateTime))
          break

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
          this.$vuetify.goTo(280)
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
            this.historyPagenation.totalItems = this.historyDateTimes.length
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
          this.historyPagenation.totalItems = this.historyDateTimes.length
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

</style>
