/* Newsletter signup — shared by every page carrying a [data-newsletter] form.
   Self-contained: it injects its own status styling so the ten pages using it
   need nothing beyond the form markup itself. */
(function () {
  var STYLE = [
    '.newsletter-status{',
    '  font-family:"EB Garamond","Garamond","Georgia",serif;',
    '  font-size:.95rem;line-height:1.5;margin:14px 0 0;min-height:1.2em;',
    '}',
    '.newsletter-status[data-state="error"]{color:#8c3a3a;}',
    '.newsletter-status[data-state="ok"]{color:#2E4A3E;font-style:italic;}',
    '.newsletter-form button[disabled]{opacity:.55;cursor:default;}'
  ].join('');

  function injectStyle() {
    if (document.getElementById('newsletter-style')) return;
    var el = document.createElement('style');
    el.id = 'newsletter-style';
    el.textContent = STYLE;
    document.head.appendChild(el);
  }

  function wire(form) {
    var button = form.querySelector('button');
    var input = form.querySelector('input[type="email"]');
    var label = button ? button.textContent : 'Sign Up';

    var status = document.createElement('p');
    status.className = 'newsletter-status';
    status.setAttribute('role', 'status');
    form.parentNode.insertBefore(status, form.nextSibling);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      status.removeAttribute('data-state');
      button.disabled = true;
      button.textContent = 'Sending…';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (payload) {
          if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
        });
      }).then(function () {
        form.style.display = 'none';
        status.setAttribute('data-state', 'ok');
        status.textContent = 'Thank you — check your inbox to confirm your subscription.';
      }).catch(function (err) {
        status.setAttribute('data-state', 'error');
        status.textContent = err.message;
        button.disabled = false;
        button.textContent = label;
      });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-newsletter]');
    if (!forms.length) return;
    injectStyle();
    Array.prototype.forEach.call(forms, wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
