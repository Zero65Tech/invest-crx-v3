const backend = 'https://zerodha.zero65.in/api';
var userId = 'LV0248';
var cookies = undefined;



chrome.runtime.onMessage.addListener(async (data, sender, callback) => {

  console.log(sender.url, data);
  if((sender.origin != 'https://kite.zerodha.com' || data != 'login') && sender.id != 'pekfkmmpdkcdkbppoajoenpaopjcjnpe')
    return;

  if(data != 'login')
    userId = data;


  cookies = await psHttpGet(`${ backend }/session?userId=${ userId }&timestamp=${ data == 'login' ? cookies.timestamp : 0 }`);
  console.log(cookies);

  let _cookie = (str, host) => {
    let details = {};
    str.split(';').forEach((kv, i) => {
      kv = kv.trim();
      let [ key, value ] = kv.indexOf('=') == -1 ? [ kv, true ] : kv.split('=');
      if(i == 0) {
        details.name = key;
        details.value = value;
      } else if(key == 'path')
        details.url = host + value;
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
  };

  for(let str in cookies.kite)
    await psSetCookie(_cookie(str, 'https://kite.zerodha.com'));

  for(let str in cookies.console)
    await psSetCookie(_cookie(str, 'https://console.zerodha.com'));


  chrome.tabs.query({ url:'*://kite.zerodha.com/*' }, (tabs) => {
    if(!tabs.length)
      chrome.tabs.create({ 'url': 'https://kite.zerodha.com/positions', 'active':true });
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

});
