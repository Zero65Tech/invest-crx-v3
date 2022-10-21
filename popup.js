var app = new Vue({
  el: '#app',
  methods: {
    login: (userId) => {
      chrome.runtime.sendMessage(userId);
    }
  }
});
