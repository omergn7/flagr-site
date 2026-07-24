/* =========================================================
   flagr — site davranışı (vanilla JS, bağımlılık yok)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1) Dinamik yıl ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 2) SSS akordeonu (aynı anda tek açık) ---------- */
  var faq = document.querySelector('[data-faq]');
  if (faq) {
    var buttons = faq.querySelectorAll('.faq__q');
    faq.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq__q');
      if (!btn) return;
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  /* ---------- 3) Bekleme listesi formu ----------
     Aynı origin'deki Cloudflare Pages Function'a POST atar (/api/waitlist).
     O da veriyi Google E-Tablo'ya yazar. Kurulum: DEPLOY-WAITLIST.md
  --------------------------------------------------- */
  var WAITLIST_ENDPOINT = '/api/waitlist';

  document.querySelectorAll('[data-waitlist]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var input = form.querySelector('input[type="email"]');
      var honeypot = form.querySelector('input[name="company"]');
      var wrap = form.parentElement;
      var okMsg = wrap.querySelector('[data-waitlist-success]');
      var errMsg = wrap.querySelector('[data-waitlist-error]');
      var btn = form.querySelector('button[type="submit"]');
      var email = (input && input.value || '').trim();

      if (okMsg) okMsg.hidden = true;
      if (errMsg) errMsg.hidden = true;

      if (!email || !input.checkValidity()) {
        if (input) input.reportValidity();
        return;
      }

      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Gönderiliyor…'; }

      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email,
          company: honeypot ? honeypot.value : '' // honeypot → sunucu tarafında elenir
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status ' + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function (data) {
          if (data && data.ok === false) throw new Error(data.error || 'error');
          if (okMsg) okMsg.hidden = false;
          form.reset();
        })
        .catch(function () {
          if (errMsg) errMsg.hidden = false;
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  });
})();
