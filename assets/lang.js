// FR | EN switch shared by every page. French shows without JavaScript.
(function () {
  "use strict";
  var root = document.documentElement;
  function setLang(lang, save) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    if (save) { try { localStorage.setItem("yh-lang", lang); } catch (e) {} }
    document.dispatchEvent(new CustomEvent("yh-lang", { detail: lang }));
  }
  var asked = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("yh-lang"); } catch (e) {}
  var browser = (navigator.language || "fr").slice(0, 2) === "fr" ? "fr" : "en";
  setLang(asked === "en" || asked === "fr" ? asked : saved || browser, false);
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang"), true); });
  });
})();
