const backend = 'https://zerodha.zero65.in/api';
var userId = 'LV0248';
var cookies = undefined;

chrome.runtime.onMessage.addListener(async (data, sender, callback) => {

  console.log(sender.url, data);

  if((sender.origin == 'https://kite.zerodha.com' && data == 'login') || sender.origin.startsWith('chrome-extension://')) {

    if(data != 'login')
      userId = data;

    cookies = await psHttpGet(`${backend}/session?userId=${ userId }&timestamp=${ data == 'login' ? cookies.timestamp : 0 }`);
     
    console.log(cookies);

    for(let c = 0; c < cookies.kite.length; c++) {
      let details = {};
      cookies.kite[c].split(';').forEach((kv, i) => {
        kv = kv.trim();
        var key   = kv.indexOf('=') == -1 ? kv   : kv.substring(0, kv.indexOf('='));
        var value = kv.indexOf('=') == -1 ? true : kv.substring(kv.indexOf('=') + 1);
        if(i == 0) {
          details.name = key;
          details.value = value;
        } else if(key == 'path')
          details.url = 'https://kite.zerodha.com' + value;
        else if(key == 'expires')
          details.expirationDate = Math.ceil(new Date(value).getTime()/1000);
        else if(key == 'HttpOnly')
          details.httpOnly = value;
        else if(key == 'SameSite') {
          // if(value != 'None')
            // details.sameSite = value.toLowerCase();
        } else if(key == 'Secure')
          details.secure = value;
        else
          details[key] = value;
      });
      await psSetCookie(details);
    }

    for(let c = 0; c < cookies.console.length; c++) {
      let details = {};
      cookies.console[c].split(';').forEach((kv, i) => {
        kv = kv.trim();
        var key   = kv.indexOf('=') == -1 ? kv   : kv.substring(0, kv.indexOf('='));
        var value = kv.indexOf('=') == -1 ? true : kv.substring(kv.indexOf('=') + 1);
        if(i == 0) {
          details.name = key;
          details.value = value;
        } else if(key == 'path')
          details.url = 'https://console.zerodha.com' + value;
        else if(key == 'expires')
          details.expirationDate = Math.ceil(new Date(value).getTime()/1000);
        else if(key == 'HttpOnly')
          details.httpOnly = value;
        else if(key == 'SameSite')
          details.sameSite = value.toLowerCase();
        else if(key == 'Secure')
          details.secure = value;
        else if(key == 'Max-Age')
          return;
        else
          details[key] = value;
      });
      await psSetCookie(details);
    }

    chrome.tabs.query({url:'*://kite.zerodha.com/*'}, (tabs) => {
      if(!tabs.length)
        chrome.tabs.create({'url': 'https://kite.zerodha.com/holdings', 'active':true});
      else
        tabs.forEach((tab) => {
          if(!tab.url.startsWith('https://kite.zerodha.com/chart/ext/'))
            chrome.tabs.reload(tab.id);
        });
    });

    chrome.tabs.query({url:'*://console.zerodha.com/*'}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });

  }

});
