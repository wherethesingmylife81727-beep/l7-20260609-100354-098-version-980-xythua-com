
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
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

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initHeaderSearchLinks() {
        var forms = document.querySelectorAll("form.header-search, .mobile-panel form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    window.setupPlayer = function (video, button, cover, source) {
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function attachSource() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            attachSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }

        if (cover) {
            cover.addEventListener("click", function () {
                play();
            });
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    window.initSearchPage = function () {
        var form = document.querySelector("[data-search-form]");
        var box = document.querySelector("[data-search-results]");
        if (!form || !box || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var qInput = form.querySelector("input[name='q']");
        if (qInput) {
            qInput.value = q;
        }

        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card\">",
                "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"duration\">" + escapeHtml(movie.duration || "") + "</span>",
                "<span class=\"play-dot\">▶</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p class=\"card-line\">" + escapeHtml(movie.oneLine || "") + "</p>",
                "<div class=\"meta-row\"><span>" + escapeHtml(movie.region || "") + "</span><span>" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.type || "") + "</span></div>",
                "<div class=\"tag-row\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function render() {
            var keyword = (form.q.value || "").trim().toLowerCase();
            var category = form.category.value;
            var type = form.type.value;
            var result = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (category && movie.category !== category) {
                    return false;
                }
                if (type && movie.type !== type && movie.genre.indexOf(type) === -1) {
                    return false;
                }
                return true;
            }).slice(0, 96);

            box.innerHTML = result.map(createCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var next = new URLSearchParams();
            if (form.q.value.trim()) {
                next.set("q", form.q.value.trim());
            }
            if (form.category.value) {
                next.set("category", form.category.value);
            }
            if (form.type.value) {
                next.set("type", form.type.value);
            }
            var target = window.location.pathname + (next.toString() ? "?" + next.toString() : "");
            window.history.replaceState(null, "", target);
            render();
        });

        ["category", "type"].forEach(function (name) {
            var field = form.elements[name];
            if (field) {
                var value = params.get(name);
                if (value) {
                    field.value = value;
                }
                field.addEventListener("change", render);
            }
        });

        if (qInput) {
            qInput.addEventListener("input", render);
        }
        render();
    };

    ready(function () {
        initMenu();
        initHero();
        initHeaderSearchLinks();
    });
})();
