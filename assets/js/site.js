(function () {
  var ready = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle(
          "is-locked",
          mobilePanel.classList.contains("is-open"),
        );
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./movies.html?q=" + encodeURIComponent(value);
        } else {
          window.location.href = "./movies.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(
        hero.querySelectorAll("[data-hero-slide]"),
      );
      var dots = Array.prototype.slice.call(
        hero.querySelectorAll("[data-hero-dot]"),
      );
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      var start = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10));
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      show(0);
      start();
    }

    var searchInput = document.getElementById("pageSearchInput");
    var list = document.querySelector("[data-filter-list]");
    var emptyState = document.querySelector("[data-empty-state]");
    var activeCategory = "";

    var normalize = function (value) {
      return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, "");
    };

    var filterCards = function () {
      if (!list) {
        return;
      }
      var query = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      list.querySelectorAll(".movie-card").forEach(function (card) {
        var keywords = normalize(card.getAttribute("data-keywords"));
        var category = card.getAttribute("data-category") || "";
        var matchText = !query || keywords.indexOf(query) !== -1;
        var matchCategory = !activeCategory || activeCategory === category;
        var showCard = matchText && matchCategory;
        card.classList.toggle("is-hidden", !showCard);
        if (showCard) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    };

    if (searchInput && list) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        searchInput.value = query;
      }
      searchInput.addEventListener("input", filterCards);
      filterCards();
    }

    document.querySelectorAll("[data-filter-chip]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-chip") || "";
        document
          .querySelectorAll("[data-filter-chip]")
          .forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
        filterCards();
      });
    });

    var allChip = document.querySelector("[data-filter-chip='']");
    if (allChip) {
      allChip.classList.add("is-active");
    }

    document.querySelectorAll("[data-reset-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        activeCategory = "";
        document
          .querySelectorAll("[data-filter-chip]")
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item.getAttribute("data-filter-chip") === "",
            );
          });
        filterCards();
      });
    });
  });
})();
