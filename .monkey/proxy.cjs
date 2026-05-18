(function () {
  try {
    if (process.env.MONKEY_NO_PROXY === '1') return;
    var gw = '172.19.0.1';
    try {
      var fs = require('fs');
      var lines = fs.readFileSync('/proc/net/route', 'utf8').split('\n');
      for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(/\s+/);
        if (p.length > 2 && p[1] === '00000000') {
          var h = p[2];
          gw = parseInt(h.substr(6,2),16) + '.' + parseInt(h.substr(4,2),16) + '.' + parseInt(h.substr(2,2),16) + '.' + parseInt(h.substr(0,2),16);
          break;
        }
      }
    } catch (_) {}
    var PROXY = process.env.MONKEY_PROXY_URL || ('http://' + gw + ':38080');
    var undici;
    try { undici = require('undici'); } catch (_) { return; }
    class MonkeyAgent extends undici.Agent {
      dispatch(opts, handler) {
        try {
          var o = opts.origin;
          var s = typeof o === 'string' ? o : (o && (o.origin || o.host || o.hostname)) || '';
          if (s.indexOf('discord.com') !== -1 || s.indexOf('discordapp.com') !== -1) {
            opts.origin = PROXY;
          }
        } catch (_) {}
        return super.dispatch(opts, handler);
      }
    }
    undici.setGlobalDispatcher(new MonkeyAgent());
  } catch (_) {}
})();
