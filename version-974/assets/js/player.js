(function() {
    var hlsLoading = false;
    var hlsCallbacks = [];

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsLoading) {
            return;
        }
        hlsLoading = true;
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.js";
        script.onload = function() {
            hlsLoading = false;
            hlsCallbacks.splice(0).forEach(function(item) {
                item();
            });
        };
        script.onerror = function() {
            hlsLoading = false;
            hlsCallbacks.splice(0).forEach(function(item) {
                item();
            });
        };
        document.head.appendChild(script);
    }

    window.initPlayer = function(source) {
        var video = document.querySelector(".js-player-video");
        var cover = document.querySelector(".js-player-cover");
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setVisible() {
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function attach(callback) {
            if (attached) {
                callback();
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                callback();
                return;
            }
            loadHls(function() {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, callback);
                } else {
                    video.src = source;
                    callback();
                }
            });
        }

        function start() {
            setVisible();
            attach(function() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function() {});
                }
            });
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
}());
