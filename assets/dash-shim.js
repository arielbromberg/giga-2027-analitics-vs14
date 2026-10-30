/* Автономная среда для дашборда: загрузка данных из data.js, вычисляемые наборы, палитра. */
(function(){
  var css = getComputedStyle(document.documentElement);
  var ds = {}, calcs = {}, cache = {}, cbs = [], ready = false;
  var colors = []; for (var i = 0; i < 8; i++) colors.push('var(--c' + i + ')');
  function data(id){
    if (ds[id]) return {status: 'ok', data: ds[id]};
    if (calcs[id]) {
      if (!ready) return {status: 'loading', data: []};
      if (!cache[id]) {
        try { var args = calcs[id].inputs.map(function(k){ var d = data(k); if (d.status !== 'ok') throw new Error('нет данных: ' + k); return d.data; });
          cache[id] = {status: 'ok', data: calcs[id].fn.apply(null, args)}; }
        catch (e) { console.error('Расчёт ' + id + ':', e); cache[id] = {status: 'error', data: []}; }
      }
      return cache[id];
    }
    return ready ? {status: 'error', data: []} : {status: 'loading', data: []};
  }
  window.dash = {
    colors: colors,
    data: data,
    calc: function(id, def){ calcs[id] = def; delete cache[id]; },
    onData: function(cb){ cbs.push(cb); if (ready) setTimeout(cb, 0); },
    setLink: function(id){ try { history.replaceState(null, '', '#' + id); } catch (e) {} }
  };
  function start(){
    var src = window.GG_DATA || {};
    Object.keys(src).forEach(function(k){ ds[k] = src[k]; });
    ready = true; cbs.forEach(function(cb){ try { cb(); } catch (e) { console.error(e); } });
  }
  if (document.readyState === 'complete') setTimeout(start, 0); else window.addEventListener('load', start);
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(function(){ cbs.forEach(function(cb){ cb(); }); }, 200); });
})();
