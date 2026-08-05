/* Base template interactions — plain, dependency-free, console-clean.
   Shared across every page (stamped identically by the build assembler). */
(function () {
  "use strict";
  var doc = document;

  // FIRST act: stamp the js gate. base.css only hides `.reveal` sections under
  // `html.js`, so script-stripped contexts (portal tree render, crawlers) show
  // every section at rest instead of permanently invisible.
  doc.documentElement.classList.add("js");

  // — sticky header state —
  var hdr = doc.getElementById("hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("stuck", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var palette = doc.getElementById("palette-dlg");
  var subscribe = doc.getElementById("subscribe-modal");
  var inlineSubscribe = doc.getElementById("subscribe");
  var mnav = doc.getElementById("mnav");
  var toggle = doc.querySelector(".menu-toggle");

  function openDialog(dlg) {
    if (!dlg) return;
    try { if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute("open", ""); } }
    catch (e) { dlg.setAttribute("open", ""); }
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    try { if (dlg.open && typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
    catch (e) { dlg.removeAttribute("open"); }
  }

  function setMnav(open) {
    if (!mnav) return;
    mnav.classList.toggle("open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  // — openers / closers (event delegation) —
  doc.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open]");
    if (opener) {
      var what = opener.getAttribute("data-open");
      if (what === "palette") { e.preventDefault(); openDialog(palette); return; }
      if (what === "subscribe") {
        // When this page already carries the wired form, take the reader to it
        // instead of interrupting them with a duplicate modal.
        if (inlineSubscribe) {
          e.preventDefault();
          var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          inlineSubscribe.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          var firstField = inlineSubscribe.querySelector("input, select, textarea");
          if (firstField) {
            setTimeout(function () {
              try { firstField.focus({ preventScroll: true }); }
              catch (err) { firstField.focus(); }
            }, reduceMotion ? 0 : 320);
          }
          return;
        }
        e.preventDefault(); openDialog(subscribe); return;
      }
      if (what === "mnav") { e.preventDefault(); setMnav(!mnav || !mnav.classList.contains("open")); return; }
    }
    var closer = e.target.closest("[data-close]");
    if (closer) { closeDialog(closer.closest("dialog")); return; }

    var accBtn = e.target.closest(".acc__btn");
    if (accBtn) {
      var item = accBtn.closest(".acc__item");
      if (item) { var op = item.classList.toggle("open"); accBtn.setAttribute("aria-expanded", String(op)); }
    }
  });

  // — backdrop click closes a native dialog —
  [palette, subscribe].forEach(function (d) {
    if (!d) return;
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });
  });

  // — keyboard: Esc closes the mobile sheet; ⌘K / Ctrl+K toggles the palette —
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mnav && mnav.classList.contains("open")) { setMnav(false); }
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (palette && palette.open) closeDialog(palette); else openDialog(palette);
    }
  });

  // — close the sheet after tapping a link inside it —
  if (mnav) mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMnav(false); });

  // — value-native subscription forms —
  doc.querySelectorAll("form[data-diolog-subscribe]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute("action");
      var status = form.querySelector("[data-subscribe-status]");
      var button = form.querySelector("button[type=submit]");
      var email = form.querySelector('[name="email"]');
      var name = form.querySelector('[name="name"]');
      var consent = form.querySelector('[name="privacyConsent"]');
      var honeypot = form.querySelector('[name="honeypot"]');
      if (!endpoint || !email || !email.value.trim() || !consent || !consent.checked) {
        if (status) status.textContent = "Add a valid email address and confirm consent.";
        return;
      }
      if (button) button.disabled = true;
      if (status) status.textContent = "Sending…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          name: name ? name.value.trim() : "",
          privacyConsent: true,
          source: "generated-site",
          honeypot: honeypot ? honeypot.value : ""
        })
      }).then(function (response) {
        if (!response.ok) throw new Error("subscription failed");
        form.reset();
        if (status) status.textContent = "Subscribed. Updates will arrive after market release.";
      }).catch(function () {
        if (status) status.textContent = "That did not send. Please contact the company directly.";
      }).then(function () { if (button) button.disabled = false; });
    });
  });

  // — reveal-on-scroll (respects reduced motion via the CSS gate) —
  var reveals = doc.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // — first-visit subscribe prompt (non-blocking; dismissal persisted) —
  try {
    if (subscribe && !inlineSubscribe && !localStorage.getItem("tmpl_sub_dismissed")) {
      setTimeout(function () {
        var anyOpen = doc.querySelector("dialog[open]");
        var sheetOpen = mnav && mnav.classList.contains("open");
        if (!anyOpen && !sheetOpen) openDialog(subscribe);
      }, 8000);
      subscribe.addEventListener("close", function () {
        try { localStorage.setItem("tmpl_sub_dismissed", "1"); } catch (e) {}
      });
    }
  } catch (e) { /* storage unavailable — skip the prompt, never throw */ }
})();
