const Fieldtype = {
  mixins: [window.Storyblok.plugin],
  template: `<div>
{{ errorMessage }}
<div v-if="loading">Loading...</div>
<div v-if="!loading && !errorMessage">
<div class="uk-form-label">Experiment</div>
<div v-if="experiments.length > 0">
  <select v-model="model.experiment" class="uk-width-1-1">
    <option></option>
    <option v-for="experiment in experiments" :value="experiment.id">{{ experiment.name }}</option>
  </select>
</div>
<div v-if="variations.length > 0" class="uk-margin-top">
<div class="uk-form-label">Variation</div>
<select v-model="model.variation" class="uk-width-1-1">
  <option></option>
  <option v-for="variation in variations" :value="variation.key">{{ variation.name }}</option>
</select>
</div>
<div class="uk-margin-top uk-margin-bottom">
<a @click="showSegments = !showSegments">Show segments</a>
</div>
<div class="options" v-if="selectOptions.length > 0 && showSegments">
  <label v-for="segment in selectOptions">
    <div class="uk-flex uk-flex-middle">
      <input type="checkbox" :value="segment.id" :key="segment.id" v-model="model.segments" />
      <div class="options_info">
        {{ segment.name }}
      </div>
    </div>
  </label>
</div>
</div>
</div>`,
  data() {
    return {
      selectOptions: [],
      experiments: [],
      errorMessage: '',
      showSegments: false,
      loading: false
    }
  },
  computed: {
    variations() {
      return (this.experiments.filter((e) => {
        return e.id == this.model.experiment
      })[0] || {variations: []}).variations
    }
  },
  methods: {
    getAjax(url, token, success, error) {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'text'

      xhr.onload = function() {
        var response = xhr.response || xhr.responseText
        var status = xhr.status === 1223 ? 204 : xhr.status
        if (status === 0) {
          status = response ? 200 : 0
        }

        if (200 <= status && status <= 300) {
          success(JSON.parse(response), xhr)
        } else {
          if (typeof error === 'function') {
            error('Please configure your token and projectId in the field type settings', xhr)
          }
        }
      }

      xhr.onerror = function(errorMsg) {
        if (typeof error === 'function') {
          error(errorMsg, xhr)
        }
      }

      xhr.setRequestHeader('Authorization', 'Bearer ' + token)
      xhr.send()
      return xhr
    },
    initWith() {
      return {
        plugin: 'optimizely',
        segments: [],
        variation: null,
        experiment: null
      }
    },
    pluginCreated() {
      this.errorMessage = ''
      this.loading = true
      this.getAjax('https://api.optimizely.com/v2/audiences?project_id=' + this.options.projectId, this.options.token, (response) => {
        var audiences = response.filter(function (item) {
          return !item.archived
        })
        this.selectOptions = audiences

        this.getAjax('https://api.optimizely.com/v2/experiments?project_id=' + this.options.projectId, this.options.token, (response) => {
          this.experiments = response
          this.loading = false
        }, (error) => {
          this.loading = false
          this.errorMessage = error
        })
      }, (error) => {
        this.loading = false
        this.errorMessage = error
      })
    }
  },
  watch: {
    'model': {
      handler: function (value) {
        this.$emit('changed-model', value);
      },
      deep: true
    }
  }
}