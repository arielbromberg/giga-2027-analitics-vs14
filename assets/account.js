/* Навигатор ИИ · учётная запись пользователя прототипа (хранится только в этом браузере) */
(function(){
  var KEY = 'nav12_user';
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var A = window.NAVACC = {
    CATS: {fed:'Федеральный орган власти', reg:'Региональный орган власти', mun:'Муниципальное образование', dev:'Разработчик ИИ-решений'},
    get: function(){ try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set: function(u){ try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {} },
    del: function(){ try { localStorage.removeItem(KEY); } catch (e) {} },
    short: function(fio){ var p = String(fio || '').split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : '') + (p[2] ? ' ' + p[2][0] + '.' : ''); },
    esc: esc,
    bar: function(el){
      if (!el) return; var u = A.get();
      el.innerHTML = u ? '<a href="index.html#/cabinet">' + esc(A.short(u.fio)) + '</a> · <a href="#" id="acc-out">Выйти</a>'
                       : '<a href="index.html#/login">Войти</a> · <a href="index.html#/register">Регистрация</a>';
      var o = document.getElementById('acc-out'); if (o) o.onclick = function(e){ e.preventDefault(); A.del(); location.href = 'index.html'; };
    }
  };
})();
