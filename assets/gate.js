/* Навигатор ИИ · доступ по паролю. Содержимое страниц и данные зашифрованы; расшифровка — в браузере, без сервера и без Web Crypto. */
(function(){
var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
var W = new Int32Array(64);
function sha256(m){ // m: Uint8Array → Uint8Array(32)
  var l = m.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n); b.set(m); b[l] = 0x80;
  var bits = l * 8; b[n - 4] = bits >>> 24; b[n - 3] = bits >>> 16; b[n - 2] = bits >>> 8; b[n - 1] = bits; b[n - 5] = Math.floor(bits / 4294967296);
  var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (var o = 0; o < n; o += 64) {
    for (var i = 0; i < 16; i++) W[i] = (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3];
    for (i = 16; i < 64; i++) { var x = W[i - 15], y = W[i - 2];
      W[i] = (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10)) + W[i - 16] | 0; }
    var a = h0, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7, bb = h1;
    for (i = 0; i < 64; i++) {
      var t1 = h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[i] + W[i] | 0;
      var t2 = (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & bb) ^ (a & c) ^ (bb & c)) | 0;
      h = g; g = f; f = e; e = d + t1 | 0; d = c; c = bb; bb = a; a = t1 + t2 | 0; }
    h0 = h0 + a | 0; h1 = h1 + bb | 0; h2 = h2 + c | 0; h3 = h3 + d | 0; h4 = h4 + e | 0; h5 = h5 + f | 0; h6 = h6 + g | 0; h7 = h7 + h | 0;
  }
  var r = new Uint8Array(32), hs = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (i = 0; i < 8; i++) { r[4 * i] = hs[i] >>> 24; r[4 * i + 1] = hs[i] >>> 16; r[4 * i + 2] = hs[i] >>> 8; r[4 * i + 3] = hs[i]; }
  return r;
}
function utf8(s){ return new TextEncoder().encode(s); }
function hex(u){ var s = ''; for (var i = 0; i < u.length; i++) s += (u[i] < 16 ? '0' : '') + u[i].toString(16); return s; }
function unhex(s){ var u = new Uint8Array(s.length / 2); for (var i = 0; i < u.length; i++) u[i] = parseInt(s.substr(2 * i, 2), 16); return u; }
function cat(a, b){ var r = new Uint8Array(a.length + b.length); r.set(a); r.set(b, a.length); return r; }
function derive(pw){ var k = sha256(utf8(SALT + ':' + pw)); for (var i = 0; i < 20000; i++) k = sha256(k); return k; }
function check(k){ return hex(sha256(cat(k, utf8('nav-check')))); }
function decrypt(k, blob){ // blob: "nonceHex:base64"
  var p = blob.split(':'), nonce = unhex(p[0]), bin = atob(p[1]), n = bin.length, out = new Uint8Array(n);
  var buf = new Uint8Array(52); buf.set(k); buf.set(nonce, 32);
  for (var blk = 0, o = 0; o < n; blk++, o += 32) {
    buf[48] = blk >>> 24; buf[49] = blk >>> 16; buf[50] = blk >>> 8; buf[51] = blk;
    var ks = sha256(buf); for (var j = 0; j < 32 && o + j < n; j++) out[o + j] = bin.charCodeAt(o + j) ^ ks[j];
  }
  return new TextDecoder().decode(out);
}
var SALT = 'navigator-ai', CHECK = window.NAV_CHECK, KEY = 'nav_access';
function stored(){ var v = null; try { v = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch (e) {} if (v && check(unhex(v)) === CHECK) return unhex(v); return null; }
function save(k, remember){ try { sessionStorage.setItem(KEY, hex(k)); if (remember) localStorage.setItem(KEY, hex(k)); else localStorage.removeItem(KEY); } catch (e) {} }
var key = null;
function open(k){ key = k; var html = decrypt(k, window.NAV_ENC.page); document.open(); document.write(html); document.close(); }
function form(){
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  document.body.innerHTML = '<div class="gate"><div class="st-orb"></div><div class="st-orb b"></div><form class="gate-box" id="gate-f" autocomplete="off">' +
    '<span class="st-badge">' + esc(window.NAV_VER || 'прототип') + '</span><h1>Навигатор ИИ</h1><p class="st-sub" style="margin:0 0 16px">Доступ к прототипу — по паролю.</p>' +
    '<div class="st-field"><label for="gate-p">Пароль</label><input class="st-input" id="gate-p" type="password" autocomplete="current-password" required autofocus></div>' +
    '<label class="st-check"><input type="checkbox" id="gate-r" checked> Запомнить на этом устройстве</label>' +
    '<button class="st-btn main" type="submit" id="gate-b">Войти</button><p class="gate-err" id="gate-e" role="alert"></p></form></div>';
  var f = document.getElementById('gate-f'), p = document.getElementById('gate-p'), e = document.getElementById('gate-e'), b = document.getElementById('gate-b');
  p.focus();
  f.onsubmit = function(ev){ ev.preventDefault(); e.textContent = ''; b.disabled = true; b.textContent = 'Проверяем…';
    setTimeout(function(){ var k = derive(p.value.trim()); if (check(k) !== CHECK) { b.disabled = false; b.textContent = 'Войти'; e.textContent = 'Неверный пароль. Проверьте раскладку и Caps Lock.'; p.select(); return; }
      save(k, document.getElementById('gate-r').checked); open(k); }, 30); };
}
window.NAVGATE = {
  page: function(){ var k = stored(); if (k) open(k); else form(); },
  load: function(name){ (0, eval)(decrypt(key, window.NAV_ENC[name])); },
  lock: function(){ try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
};
})();
