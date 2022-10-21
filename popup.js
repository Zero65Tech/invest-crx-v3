var app = new Vue({
  el: '#app',
  data() {
    return {
      userIds: [ 'DEMO' ]
    }
  },
  mounted() {
    chrome.storage.sync.get(['userIds'], (map) => this.userIds = map.userIds);
  },
  methods: {
    login: (userId) => {
      chrome.runtime.sendMessage(userId);
    }
  }
});
