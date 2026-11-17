/* OneW — site interactions. No data leaves the visitor's browser. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- Occupation clock (since Michigan statehood, 26 Jan 1837) ---------- */
  const OCCUPATION_START = Date.UTC(1837, 0, 26);
  const daysOccupied = Math.floor((Date.now() - OCCUPATION_START) / 86400000);
  const yearsOccupied = Math.floor((Date.now() - OCCUPATION_START) / (365.2425 * 86400000));
  $$('[data-occupation-days]').forEach(el => { el.textContent = fmt(daysOccupied); });
  $$('[data-occupation-years]').forEach(el => { el.textContent = yearsOccupied; });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile nav ---------- */
  const navToggle = $('.nav-toggle');
  const nav = $('#main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.focus(); }
    });
  }

  /* ---------- Alert banner ---------- */
  const alertBanner = $('.alert-banner');
  if (alertBanner) {
    if (store.sget('onew-alert-dismissed') === '1') alertBanner.hidden = true;
    const close = $('.alert-banner__close', alertBanner);
    if (close) close.addEventListener('click', () => { alertBanner.hidden = true; store.sset('onew-alert-dismissed', '1'); });
  }

  /* ---------- Maps ---------- */
  if (window.ONEW_MAPS) {
    $$('[data-onew-map]').forEach(el => { el.innerHTML = window.ONEW_MAPS.region; });
  }
  $$('[data-map-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-map-state]');
      if (!card) return;
      card.setAttribute('data-map-state', btn.dataset.mapToggle);
      $$('[data-map-toggle]', card).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      const live = $('[data-map-caption]', card);
      if (live) live.textContent = btn.dataset.mapToggle === 'free'
        ? 'As it should be: One Wisconsin, from the Mississippi to the St. Marys River.'
        : 'As it is: the Upper Peninsula, administered from Lansing since 1837.';
    });
  });

  /* ---------- Count-up numbers ---------- */
  const countUp = el => {
    const target = parseFloat(el.dataset.countTo);
    const dur = 1400; const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal on scroll ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('[data-count-to]', entry.target).forEach(countUp);
        if (entry.target.matches('[data-count-to]')) countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
    $$('[data-count-to]').forEach(el => { el.textContent = fmt(parseFloat(el.dataset.countTo)); });
  }

  /* ---------- Petition ---------- */
  const PETITION_GOAL = 190000; // one signature for every… well, it's 190 years.
  // Deterministic "public" tally so every visitor sees a consistent, slowly growing number.
  const baseCount = 118436 + Math.max(0, Math.floor((Date.now() - Date.UTC(2026, 0, 26)) / 86400000)) * 37;
  const mySignature = () => store.get('onew-signature');
  const totalSignatures = () => baseCount + (mySignature() ? 1 : 0);

  function renderPetitionCounts() {
    const total = totalSignatures();
    $$('[data-petition-count]').forEach(el => { el.textContent = fmt(total); });
    $$('[data-petition-goal]').forEach(el => { el.textContent = fmt(PETITION_GOAL); });
    $$('[data-petition-remaining]').forEach(el => { el.textContent = fmt(Math.max(0, PETITION_GOAL - total)); });
    $$('[data-petition-bar]').forEach(el => {
      requestAnimationFrame(() => { el.style.width = Math.min(100, (total / PETITION_GOAL) * 100).toFixed(1) + '%'; });
    });
  }
  renderPetitionCounts();

  const seedSigners = [
    ['Marjorie K.', 'Ishpeming', '2 min ago'], ['Dale V.', 'Green Bay', '4 min ago'], ['Pastor Ruth H.', 'Escanaba', '7 min ago'],
    ['Tony & Linda S.', 'Iron Mountain', '9 min ago'], ['Kyle B.', 'Eau Claire', '12 min ago'], ['Arvid L.', 'Houghton', '15 min ago'],
    ['Deb P.', 'Marinette', '21 min ago']
  ];
  const signerList = $('[data-signers]');
  function renderSigners() {
    if (!signerList) return;
    const sig = mySignature();
    const rows = (sig ? [[sig.first + ' ' + sig.last.charAt(0) + '.', sig.town || 'Greater Wisconsin', 'just now', true]] : []).concat(seedSigners).slice(0, 7);
    signerList.innerHTML = '';
    rows.forEach(([name, town, when, mine]) => {
      const li = document.createElement('li');
      if (mine) li.className = 'is-new';
      const a = document.createElement('span'); a.textContent = name + ', ' + town;
      const b = document.createElement('span'); b.textContent = mine ? 'You, ' + when : when;
      li.append(a, b); signerList.appendChild(li);
    });
  }
  renderSigners();

  const petitionForm = $('[data-petition-form]');
  const petitionThanks = $('[data-petition-thanks]');
  function showThanks() {
    if (!petitionForm || !petitionThanks) return;
    const sig = mySignature();
    petitionForm.hidden = true; petitionThanks.hidden = false;
    const n = $('[data-signer-name]', petitionThanks); if (n && sig) n.textContent = sig.first;
    const d = $('[data-signer-date]', petitionThanks);
    if (d && sig) d.textContent = new Date(sig.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (petitionForm) {
    if (mySignature()) showThanks();
    petitionForm.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      const req = [['first', 'Please enter your first name.'], ['last', 'Please enter your last name.'], ['zip', 'Please enter a 5-digit ZIP code.']];
      req.forEach(([name, msg]) => {
        const input = petitionForm.elements[name];
        const err = $('[data-error-for="' + name + '"]', petitionForm);
        const valid = name === 'zip' ? /^\d{5}$/.test(input.value.trim()) : input.value.trim().length > 0;
        input.setAttribute('aria-invalid', String(!valid));
        if (err) err.textContent = valid ? '' : msg;
        if (!valid && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      store.set('onew-signature', {
        first: petitionForm.elements.first.value.trim(),
        last: petitionForm.elements.last.value.trim(),
        town: (petitionForm.elements.town && petitionForm.elements.town.value.trim()) || '',
        at: Date.now()
      });
      renderPetitionCounts(); renderSigners(); showThanks();
      const h = $('h3', petitionThanks); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    });
  }
  const unsign = $('[data-unsign]');
  if (unsign) unsign.addEventListener('click', () => {
    try { localStorage.removeItem('onew-signature'); } catch (e) { /* ignore */ }
    petitionThanks.hidden = true; petitionForm.hidden = false; petitionForm.reset();
    renderPetitionCounts(); renderSigners();
  });

  /* ---------- Copy buttons ---------- */
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const src = btn.dataset.copy === 'url' ? location.href.split('#')[0] : ($(btn.dataset.copy) || {}).innerText;
      const label = btn.textContent;
      try { await navigator.clipboard.writeText(src); btn.textContent = 'Copied'; }
      catch (e) { btn.textContent = 'Press Ctrl+C'; }
      setTimeout(() => { btn.textContent = label; }, 1800);
    });
  });

  /* ---------- Donate (mock: no payment is ever collected) ---------- */
  const donate = $('[data-donate]');
  if (donate) {
    const impacts = {
      '18.36': '<b>$18.36</b> files one Michigan Freedom of Information Act request, which will be denied within the statutory five business days.',
      '50': '<b>$50</b> prints 200 corrective stickers reading “Welcome to Occupied Northeast Wisconsin” for unofficial placement on official signage.',
      '100': '<b>$100</b> outfits one volunteer for the Walk of Return across the Interstate Bridge at Marinette–Menominee, including reflective vest and pasty.',
      '190': '<b>$190</b> commemorates one year of the Occupation. For 190 years, that’s $36,100. We are not saying you should. We are not saying you shouldn’t.',
      '500': '<b>$500</b> funds one week of archival research into what Lansing calls “routine statehood records.”',
      '1837': '<b>$1,837</b> places your name on the Wall of Restitution at our future headquarters in Ironwood, Greater Wisconsin.'
    };
    let freq = 'once';
    let amount = '50';
    const note = $('[data-impact]', donate);
    const other = $('[data-other-amount]', donate);
    const submit = $('[data-donate-submit]', donate);
    const update = () => {
      const val = parseFloat(amount) || 0;
      if (note) note.innerHTML = impacts[amount] || (val > 0 ? '<b>$' + val.toFixed(2).replace(/\.00$/, '') + '</b> brings Greater Wisconsin one step closer to Reunification. Every dollar is a declaration.' : 'Choose an amount to see your impact.');
      if (submit) submit.textContent = val > 0 ? 'Donate $' + val.toFixed(2).replace(/\.00$/, '') + (freq === 'monthly' ? ' monthly' : '') : 'Donate';
    };
    $$('[data-freq]', donate).forEach(b => b.addEventListener('click', () => {
      freq = b.dataset.freq;
      $$('[data-freq]', donate).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      update();
    }));
    $$('[data-amount]', donate).forEach(b => b.addEventListener('click', () => {
      amount = b.dataset.amount; if (other) other.value = '';
      $$('[data-amount]', donate).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      update();
    }));
    if (other) other.addEventListener('input', () => {
      amount = other.value.replace(/[^0-9.]/g, '');
      $$('[data-amount]', donate).forEach(x => x.setAttribute('aria-pressed', 'false'));
      update();
    });
    update();
    const modal = $('#donate-modal');
    if (submit && modal) submit.addEventListener('click', e => {
      e.preventDefault();
      const val = parseFloat(amount) || 0;
      const label = val > 0 ? '$' + val.toFixed(2).replace(/\.00$/, '') : 'your gift';
      $$('[data-modal-amount]', modal).forEach(el => { el.textContent = label; });
      if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    });
  }
  $$('dialog.modal').forEach(d => {
    $$('[data-close-modal]', d).forEach(b => b.addEventListener('click', () => d.close ? d.close() : d.removeAttribute('open')));
    d.addEventListener('click', e => { if (e.target === d && d.close) d.close(); });
  });

  /* ---------- Newsletter (mock: nothing is stored or sent) ---------- */
  $$('[data-newsletter]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = $('[data-newsletter-msg]', form.parentElement);
      const input = $('input[type="email"]', form);
      if (!input.value || !input.checkValidity()) { if (msg) msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
      form.reset();
      if (msg) msg.textContent = 'Thank you. Due to ongoing interference with mail routed through Lansing, updates are posted here on our Newsroom instead.';
    });
  });

  /* ---------- Generic expanders (timeline items, press releases) ---------- */
  $$('[data-expander]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (btn.dataset.openLabel) btn.textContent = open ? btn.dataset.closedLabel : btn.dataset.openLabel;
    });
  });

  // Arriving via a link like news.html#foia-14 opens that item.
  function openFromHash() {
    if (!location.hash) return;
    let target = null;
    try { target = document.querySelector(location.hash); } catch (e) { return; }
    if (!target || !target.matches("[data-cat]")) return;
    const btn = target.querySelector('[data-expander][aria-expanded="false"]');
    if (btn) btn.click();
    if (target.closest("[hidden]")) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Filter chips (timeline eras, news categories) ---------- */
  $$('[data-filter-group]').forEach(group => {
    const target = $(group.dataset.filterGroup);
    if (!target) return;
    const chips = $$('[data-filter]', group);
    chips.forEach(chip => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      $$('[data-cat]', target).forEach(item => { item.hidden = !(f === 'all' || item.dataset.cat.split(' ').includes(f)); });
      updateTimelineProgress();
    }));
  });

  // Expand / collapse all timeline entries
  const expandAll = $('[data-expand-all]');
  if (expandAll) expandAll.addEventListener('click', () => {
    const open = expandAll.getAttribute('aria-pressed') !== 'true';
    expandAll.setAttribute('aria-pressed', String(open));
    expandAll.textContent = open ? 'Collapse all' : 'Expand all';
    $$('.tl-toggle').forEach(b => { b.setAttribute('aria-expanded', String(open)); const p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.hidden = !open; });
    updateTimelineProgress();
  });

  /* ---------- Timeline scroll progress ---------- */
  const timeline = $('.timeline');
  const progress = $('.timeline__progress');
  function updateTimelineProgress() {
    if (!timeline || !progress) return;
    const r = timeline.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const h = Math.max(0, Math.min(r.height - 16, mid - r.top));
    progress.style.height = h + 'px';
  }
  if (timeline) {
    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress();
  }
})();
