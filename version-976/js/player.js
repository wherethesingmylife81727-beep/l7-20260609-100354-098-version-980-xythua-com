var MoviePlayer = (function () {
    function create(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var streamUrl = options.streamUrl;
        var hlsInstance = null;
        var started = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function begin() {
            if (started) {
                video.play();
                return;
            }

            started = true;
            button.classList.add('is-hidden');
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = streamUrl;
            video.play();
        }

        button.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                begin();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    return {
        create: create
    };
}());
