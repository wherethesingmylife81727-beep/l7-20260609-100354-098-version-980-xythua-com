(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        startTimer();
    }

    var searchInput = document.getElementById('search-input');
    var regionFilter = document.getElementById('region-filter');
    var typeFilter = document.getElementById('type-filter');
    var yearFilter = document.getElementById('year-filter');
    var resetFilter = document.getElementById('reset-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applySearch() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var region = normalize(regionFilter ? regionFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var keywords = normalize(card.dataset.keywords + ' ' + card.dataset.title);
            var matched = true;

            if (query && keywords.indexOf(query) === -1) {
                matched = false;
            }
            if (region && normalize(card.dataset.region) !== region) {
                matched = false;
            }
            if (type && normalize(card.dataset.type) !== type) {
                matched = false;
            }
            if (year && normalize(card.dataset.year) !== year) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput) {
        searchInput.value = getQueryParam('q');
        searchInput.addEventListener('input', applySearch);
    }

    [regionFilter, typeFilter, yearFilter].forEach(function (filter) {
        if (filter) {
            filter.addEventListener('change', applySearch);
        }
    });

    if (resetFilter) {
        resetFilter.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
            }
            [regionFilter, typeFilter, yearFilter].forEach(function (filter) {
                if (filter) {
                    filter.value = '';
                }
            });
            applySearch();
        });
    }

    applySearch();
}());
