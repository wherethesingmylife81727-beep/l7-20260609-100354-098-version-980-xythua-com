import { H as Hls } from './video-vendor.js';

function setupPlayer(player) {
    var video = player.querySelector('video[data-src]');
    var button = player.querySelector('.play-overlay');
    var status = player.querySelector('.player-status');
    var source = video ? video.getAttribute('data-src') : '';
    var initialized = false;
    var hls = null;

    function setStatus(text) {
        if (status) {
            status.textContent = text;
        }
    }

    function init() {
        if (!video || !source || initialized) {
            return;
        }
        initialized = true;

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('高清播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('视频加载失败，请刷新页面重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('高清播放源已就绪');
            });
        } else {
            setStatus('当前浏览器不支持 HLS 播放');
        }
    }

    if (!video) {
        return;
    }

    init();

    if (button) {
        button.addEventListener('click', function () {
            init();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('点击视频控件即可开始播放');
                });
            }
        });
    }

    video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
    });

    video.addEventListener('error', function () {
        setStatus('视频加载失败，请刷新页面重试');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
