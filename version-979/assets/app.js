(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMenu() {
        var button = one(".menu-toggle");
        var panel = one(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            } else {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function initHero() {
        var slides = all(".hero-slide");
        var dots = all(".hero-dot");
        if (!slides.length) {
            return;
        }
        var prev = one(".hero-prev");
        var next = one(".hero-next");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("active", pos === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, pos) {
            dot.addEventListener("click", function () {
                show(pos);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var panel = one("[data-search-scope]");
        var grid = one("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var queryInput = one(".catalog-query", panel);
        var yearSelect = one(".catalog-year", panel);
        var typeSelect = one(".catalog-type", panel);
        var genreSelect = one(".catalog-genre", panel);
        var sortSelect = one(".catalog-sort", panel);
        var result = one(".catalog-result", panel);
        var empty = one(".no-results", panel);
        var cards = all(".movie-card", grid);
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || params.get("search") || "";
        if (q && queryInput) {
            queryInput.value = q;
        }

        function text(card) {
            return [
                card.dataset.title || "",
                card.dataset.year || "",
                card.dataset.type || "",
                card.dataset.genre || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var match = true;
                if (query && text(card).indexOf(query) === -1) {
                    match = false;
                }
                if (year && card.dataset.year !== year) {
                    match = false;
                }
                if (type && card.dataset.type !== type) {
                    match = false;
                }
                if (genre && (card.dataset.genre || "").indexOf(genre) === -1) {
                    match = false;
                }
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            var mode = sortSelect ? sortSelect.value : "latest";
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-CN");
                }
                if (mode === "rank") {
                    return Number(b.dataset.rank || 0) - Number(a.dataset.rank || 0);
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });

            if (result) {
                result.textContent = visible ? "影片已更新，可继续筛选" : "当前没有匹配影片";
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, yearSelect, typeSelect, genreSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initBackTop() {
        var button = one(".back-top");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("show", window.scrollY > 360);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    window.initMoviePlayer = function (source) {
        var shell = one(".player-shell");
        var video = one(".movie-video", shell);
        var overlay = one(".video-overlay", shell);
        var message = one(".player-message", shell);
        var hlsInstance = null;
        var ready = false;

        if (!shell || !video || !overlay) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && message) {
                        message.textContent = "播放暂时不可用，请稍后重试";
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            shell.classList.add("is-playing");
            video.controls = true;
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    if (message) {
                        message.textContent = "点击视频区域继续播放";
                    }
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initBackTop();
    });
})();
