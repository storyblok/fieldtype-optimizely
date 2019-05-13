const Fieldtype = {
  mixins: [window.Storyblok.plugin],
  template: `<div>
{{ errorMessage }}
<div v-if="loading">Loading audiences...</div>
<div class="options" v-if="selectOptions.length > 0">
  <label v-for="segment in selectOptions">
    <div class="uk-flex uk-flex-middle">
      <input type="checkbox" :value="segment.id" :key="segment.id" v-model="model.segments" />
      <div class="options_info">
        {{ segment.name }}
      </div>
    </div>
  </label>
</div>
</div>`,
  data() {
    return {
      selectOptions: [],
      errorMessage: '',
      loading: false
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
            error('Please check your token and projectId', xhr)
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
        segments: []
      }
    },
    pluginCreated() {
      this.errorMessage = ''
      this.loading = true
      this.getAjax('https://api.optimizely.com/v2/audiences?project_id=' + this.options.projectId, this.options.token, (response) => {
        var audiences = response.filter(function (item) {
          return !item.archived
        })
        this.loading = false
        this.selectOptions = audiences
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