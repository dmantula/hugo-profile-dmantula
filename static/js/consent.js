(function () {
  var KEY = "consent-v1";
  var raw = localStorage.getItem(KEY);
  var state = null;
  try {
    state = raw ? JSON.parse(raw) : null;
  } catch (e) {
    state = null;
  }

  function persist(prefs) {
    var next = Object.assign({ _ts: Date.now() }, prefs);
    state = next;
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("consent:changed", { detail: next }));
  }

  window.consent = {
    has: function (category) {
      return !!(state && state[category] === true);
    },
    state: function () {
      return state;
    },
    set: persist,
    open: function () {
      var b = document.getElementById("consent-banner");
      if (b) b.classList.add("open");
    },
    close: function () {
      var b = document.getElementById("consent-banner");
      if (b) b.classList.remove("open");
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    var banner = document.getElementById("consent-banner");
    if (!banner) return;

    if (!state) banner.classList.add("open");

    var aCheckbox = banner.querySelector('[data-consent-cat="analytics"]');
    var cCheckbox = banner.querySelector('[data-consent-cat="comments"]');
    if (state) {
      if (aCheckbox) aCheckbox.checked = state.analytics === true;
      if (cCheckbox) cCheckbox.checked = state.comments === true;
    }

    var accept = banner.querySelector("[data-consent-accept]");
    if (accept) accept.addEventListener("click", function () {
      persist({ analytics: true, comments: true });
      window.consent.close();
      location.reload();
    });

    var reject = banner.querySelector("[data-consent-reject]");
    if (reject) reject.addEventListener("click", function () {
      persist({ analytics: false, comments: false });
      window.consent.close();
    });

    var customize = banner.querySelector("[data-consent-customize]");
    if (customize) customize.addEventListener("click", function () {
      banner.classList.toggle("detailed");
    });

    var save = banner.querySelector("[data-consent-save]");
    if (save) save.addEventListener("click", function () {
      persist({
        analytics: aCheckbox && aCheckbox.checked,
        comments: cCheckbox && cCheckbox.checked,
      });
      window.consent.close();
      location.reload();
    });

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-consent-open]"),
      function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          window.consent.open();
        });
      }
    );
  });
})();
