(function () {
  var ready = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var source = video ? video.getAttribute("data-stream") : "";
      var hls = null;
      var prepared = false;

      var message = function (text) {
        var node = box.querySelector(".player-message");
        if (!node) {
          node = document.createElement("div");
          node.className = "player-message";
          box.appendChild(node);
        }
        node.textContent = text;
      };

      var prepare = function () {
        if (!video || !source || prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };

      var play = function () {
        prepare();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            message("播放暂时不可用，请稍后再试。");
          });
        }
      };

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
      }
    });
  });
})();
