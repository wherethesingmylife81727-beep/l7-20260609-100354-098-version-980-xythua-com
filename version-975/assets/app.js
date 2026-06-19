(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function initMobileMenu() {
        var button = qs(".mobile-toggle");
        var panel = qs(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = !panel.hasAttribute("hidden");
            if (isOpen) {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            } else {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            }
        });
    }

    function initSearchForms() {
        qsa(".site-search, .big-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function initHeroSlider() {
        var slider = qs(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initCategoryFilters() {
        var form = qs(".category-filter-form");
        var grid = qs(".category-movie-grid");
        if (!form || !grid) {
            return;
        }
        var cards = qsa(".movie-card", grid);
        var empty = qs(".empty-state");
        function apply() {
            var keyword = (form.keyword.value || "").trim().toLowerCase();
            var region = form.region.value;
            var type = form.type.value;
            var year = form.year.value;
            var shown = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute("data-region") !== region) {
                    ok = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }
        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        form.addEventListener("reset", function () {
            window.setTimeout(apply, 0);
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card compact\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.page) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-chip\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h2><a href=\"" + escapeHtml(movie.page) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.oneLine || movie.genre || "") + "</p>" +
            "<div class=\"tag-list\">" + tags + "</div>" +
            "<div class=\"movie-card-foot\"><span>" + escapeHtml(movie.viewsText || "") + "热度</span><a href=\"" + escapeHtml(movie.page) + "\">立即观看</a></div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var resultBox = qs(".search-results");
        if (!resultBox || !window.MOVIE_INDEX) {
            return;
        }
        var title = qs(".search-title");
        var empty = qs(".search-empty");
        var query = getQuery("q").trim().toLowerCase();
        var input = qs(".big-search input[name='q']");
        if (input && query) {
            input.value = getQuery("q").trim();
        }
        if (!query) {
            return;
        }
        var results = window.MOVIE_INDEX.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" ").toLowerCase();
            return text.indexOf(query) !== -1;
        }).slice(0, 120);
        if (title) {
            title.textContent = "搜索结果：" + getQuery("q").trim();
        }
        resultBox.innerHTML = results.map(movieCard).join("");
        if (empty) {
            empty.hidden = results.length !== 0;
        }
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !source) {
            return;
        }
        var hlsInstance = null;
        function attachSource() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        button.classList.remove("is-hidden");
                        button.innerHTML = "<span class=\"player-icon\">▶</span><strong>稍后重试</strong>";
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                button.innerHTML = "<span class=\"player-icon\">▶</span><strong>稍后重试</strong>";
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            attachSource();
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.then === "function") {
                promise.then(function () {
                    button.classList.add("is-hidden");
                }).catch(function () {
                    button.classList.remove("is-hidden");
                });
            } else {
                button.classList.add("is-hidden");
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initSearchForms();
        initHeroSlider();
        initCategoryFilters();
        initSearchPage();
    });
})();
