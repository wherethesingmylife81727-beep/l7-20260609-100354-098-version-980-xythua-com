(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function (form) {
        var scope = form.closest('main') || document;
        var list = scope.querySelector('[data-filter-list]');
        var input = form.querySelector('[data-filter-input]');
        var year = form.querySelector('[data-year-filter]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (!list) {
            return;
        }

        var items = Array.prototype.slice.call(list.children);

        if (input && initial) {
            input.value = initial;
        }

        function normalize(text) {
            return String(text || '').toLowerCase().replace(/\s+/g, '');
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var selectedYear = year ? year.value : '';

            items.forEach(function (item) {
                var content = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-genre'),
                    item.getAttribute('data-tags'),
                    item.textContent
                ].join(' '));
                var itemYear = item.getAttribute('data-year') || '';
                var matchedQuery = !query || content.indexOf(query) !== -1;
                var matchedYear = !selectedYear || itemYear === selectedYear;

                item.classList.toggle('is-filtered-out', !(matchedQuery && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (year) {
            year.addEventListener('change', applyFilter);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        applyFilter();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play-button]');
        var url = frame.getAttribute('data-play-url');
        var hlsInstance = null;
        var ready = false;

        function attach() {
            if (!video || !url || ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();

            if (button) {
                button.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
