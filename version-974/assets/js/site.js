(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".js-menu-toggle");
        var nav = document.querySelector(".js-site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".js-hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".js-hero-prev");
        var next = hero.querySelector(".js-hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function(dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupGlobalSearch() {
        Array.prototype.slice.call(document.querySelectorAll(".js-global-search")).forEach(function(form) {
            form.addEventListener("submit", function(event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = form.getAttribute("action") + "?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function(panel) {
            var section = panel.closest(".section") || document;
            var input = panel.querySelector(".js-search-input");
            var chips = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-chip"));
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var urlQuery = new URLSearchParams(window.location.search).get("q");
            if (input && urlQuery) {
                input.value = urlQuery;
            }

            function activeValue() {
                var active = chips.find(function(chip) {
                    return chip.classList.contains("is-active");
                });
                return active ? active.getAttribute("data-filter") : "all";
            }

            function cardText(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var filter = activeValue();
                cards.forEach(function(card) {
                    var text = cardText(card);
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchFilter = filter === "all" || text.indexOf(filter.toLowerCase()) !== -1;
                    card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function(chip) {
                chip.addEventListener("click", function() {
                    chips.forEach(function(item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    apply();
                });
            });

            apply();
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupFilters();
    });
}());
