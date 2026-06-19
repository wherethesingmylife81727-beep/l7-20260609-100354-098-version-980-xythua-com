(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function createCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-link" href="movie/movie-' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '<span class="quality-badge">高清</span>',
            '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
            '<span class="play-chip">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h2><a href="movie/movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h2>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '<div class="card-actions"><a href="play/movie-' + movie.id + '.html">立即播放</a><span>' + movie.views.toLocaleString() + ' 次观看</span></div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.getElementById('searchInput');
        var summary = document.getElementById('searchSummary');
        var results = document.getElementById('searchResults');
        var query = getQuery();
        var movies = window.__MOVIE_INDEX__ || [];

        if (input) {
            input.value = query;
        }

        if (!query) {
            return;
        }

        var tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = movies.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                movie.tags.join(' ')
            ].join(' ').toLowerCase();
            return tokens.every(function (token) {
                return haystack.indexOf(token) !== -1;
            });
        }).slice(0, 80);

        if (summary) {
            summary.textContent = '“' + query + '” 找到 ' + matched.length + ' 条相关影片';
        }

        if (results) {
            results.innerHTML = '';
            matched.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
        }
    });
}());
