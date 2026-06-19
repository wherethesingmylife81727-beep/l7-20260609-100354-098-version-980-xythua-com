(function () {
  var navButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function restartHero() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    var prev = document.querySelector('.hero-control.prev');
    var next = document.querySelector('.hero-control.next');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restartHero();
      });
    });

    restartHero();
  }

  var pageFilter = document.querySelector('.page-filter');
  if (pageFilter) {
    var filterTargets = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row, .rank-item'));
    pageFilter.addEventListener('input', function () {
      var q = pageFilter.value.trim().toLowerCase();
      filterTargets.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden', q && text.indexOf(q) === -1);
      });
    });
  }

  function preparePlayer() {
    var video = document.getElementById('moviePlayer');
    var start = document.querySelector('.player-start');

    if (!video || !start) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hls = null;

    function hideStart() {
      start.classList.add('hidden');
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function attachAndPlay() {
      if (!stream) {
        return;
      }

      hideStart();

      if (video.getAttribute('data-ready') === '1') {
        playVideo();
        return;
      }

      video.setAttribute('data-ready', '1');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
          }
        });
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          playVideo();
        }, { once: true });
        playVideo();
      }
    }

    start.addEventListener('click', attachAndPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
  }

  function runSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');

    if (!input || !results || !summary || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function resultCard(item) {
      return [
        '<article class="search-result-card">',
        '<a href="./' + item.file + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"></a>',
        '<div><h2><a href="./' + item.file + '">' + item.title + '</a></h2>',
        '<p>' + item.desc + '</p>',
        '<div class="card-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.category + '</span></div></div>',
        '<a class="rank-watch" href="./' + item.file + '">观看</a>',
        '</article>'
      ].join('');
    }

    function perform() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        summary.textContent = '输入关键词后显示匹配影片';
        return;
      }

      var words = q.split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.category, item.tags, item.desc].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 80);

      summary.textContent = matches.length ? '为你找到相关影片' : '没有找到匹配影片';
      results.innerHTML = matches.map(resultCard).join('');
    }

    input.addEventListener('input', perform);
    perform();
  }

  document.addEventListener('DOMContentLoaded', function () {
    preparePlayer();
    runSearchPage();
  });
})();
