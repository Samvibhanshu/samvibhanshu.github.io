/* Shared behaviour. Everything works without JavaScript; this only adds the theme switch and the project filter. */
(function () {
  var root = document.documentElement;

  /* Theme toggle: dark by default; the choice is remembered when storage is available. */
  var btn = document.getElementById('theme');
  if (btn) {
    var label = function () {
      var dark = root.dataset.theme !== 'light';
      btn.textContent = dark ? 'Light' : 'Dark';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    label();
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      label();
    });
  }

  /* Project filter and search (projects page only). */
  var bar = document.querySelector('.toolbar');
  if (!bar) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.ledger > li'));
  var buttons = Array.prototype.slice.call(bar.querySelectorAll('.filters button'));
  var search = bar.querySelector('.search');
  var count = bar.querySelector('.count');
  var empty = document.querySelector('.empty');
  var current = 'all';

  var params = new URLSearchParams(location.search);
  var wanted = params.get('type');
  if (wanted && buttons.some(function (b) { return b.dataset.filter === wanted; })) current = wanted;

  function apply() {
    var q = (search.value || '').trim().toLowerCase();
    var shown = 0;
    items.forEach(function (li) {
      var okCat = current === 'all' || li.dataset.cat === current;
      var okText = !q || li.dataset.text.indexOf(q) !== -1;
      li.hidden = !(okCat && okText);
      if (!li.hidden) shown++;
    });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === current ? 'true' : 'false'); });
    count.textContent = shown === items.length ? items.length + ' projects' : shown + ' of ' + items.length + ' projects';
    empty.hidden = shown !== 0;
  }

  bar.hidden = false;
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    current = b.dataset.filter;
    var url = new URL(location.href);
    if (current === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', current);
    try { history.replaceState(null, '', url); } catch (err) {}
    apply();
  });
  search.addEventListener('input', apply);
  apply();
})();
