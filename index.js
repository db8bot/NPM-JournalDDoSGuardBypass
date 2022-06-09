const axios = require("axios");
const scp = require("set-cookie-parser");
const random_ua = require("random-ua");

exports.bypass = function(url, log, cb) {
  if (typeof log == "function") {
    cb = log;
    log = false;
  } else if (typeof log !== "boolean") {
    var log = false;
  }
  const ua = random_ua.generate();
  if (log == true) console.log(`[ddos-guard-bypass] Generated user agent: ${ua}`); 
  axios({
    url: url,
    rejectHttpErrors: false,
    headers: {
      "User-Agent": ua,
      "Accept": "text/html",
      "Accept-Language": "en-US",
      "Connection": "keep-alive",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "TE": "trailers",
      "DNT": "1"
    }
  }).then(function(resp) {
    var c = scp.parse(resp.headers["set-cookie"]);
    if (log == true) console.log(`[ddos-guard-bypass] Parsed cookies on request 1.`);
    if (url.includes("://")) {var s = 3;} else {var s = 1;}
    var md = url.split("/").slice(0,s).join("/");
    if (log == true) console.log(`[ddos-guard-bypass] Generated request url for referer to ddos-guard.net's check.js "${md}"`)
    axios({
      url: "https://check.ddos-guard.net/check.js",
      headers: {
        "User-Agent": ua,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Referer": md,
        "Cookie": cookieString(c),
        "Sec-Fetch-Dest": "script",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site"
      }
    }).then(function(resp) {
      var id = resp.data.split(`'/.well-known/ddos-guard/id/`)[1].split(`'`)[0];
      if (log == true) console.log(`[ddos-guard-bypass] Retrived id from ddos-guard's check.js "${id}"`)
      axios({
        url: `${md}/.well-known/ddos-guard/id/${id}`,
        headers: {
          "User-Agent": ua,
          "Accept": "image/webp,*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          "Cache-Control": "no-cache",
          "Referer": md,
          "Cookie": cookieString(c),
          "Sec-Fetch-Dest": "script",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "cross-site"
        }
      }).then(function(resp) {
        var c2 = scp.parse(resp.headers["set-cookie"]);
        if (log == true) console.log(`[ddos-guard-bypass] Retrived final cookies from id request`)
        for (var d in c2) {
          c.push(c2[d]);
        }
        cb(null, {
          cookies: {
            object: c,
            string: cookieString(c)
          },
          headers: {
            "user-agent": ua,
            "referer": md,
            "cookie": cookieString(c)
          }
        });
      })
    });
  }).catch(function(err) {
    cb(err, null);
  })
}

function cookieString(cookie) {
  var s = "";
  for (var c in cookie) {
    s = `${s} ${cookie[c].name}=${cookie[c].value};`;
  }
  var s = s.substring(1);
  return s.substring(0, s.length - 1);
}