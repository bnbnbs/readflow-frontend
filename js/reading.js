document.addEventListener("DOMContentLoaded", () => {
  const readerContent = document.getElementById("readerContent");
  const playButton = document.getElementById("playButton");
  const playerTitle = document.getElementById("playerTitle");

  const progressBar = document.getElementById("audioProgress");
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  const volumeRange = document.getElementById("volumeRange");
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");

  const fontMinus = document.getElementById("fontMinus");
  const fontPlus = document.getElementById("fontPlus");
  const fontSizeValue = document.getElementById("fontSizeValue");

  const colorPanel = document.getElementById("colorPanel");
  const fileName = document.getElementById("fileName");

  let audio = null;
  let isPlaying = false;
  let sentencesData = [];
  let timestamps = [];

  let fontSize = 22;

  // =========================
  // 🔥 파일명 & 플레이어 제목 (한 번만!)
  // =========================
  const savedFileData = JSON.parse(localStorage.getItem("readflowUploadData"));

  if (savedFileData) {
    if (fileName) fileName.textContent = savedFileData.fileName;
    if (playerTitle) playerTitle.textContent = savedFileData.fileName;
  }

  // =========================
  // 🔥 폰트 적용
  // =========================
  function applyFontSize() {
    fontSizeValue.textContent = fontSize;
    readerContent.style.fontSize = fontSize + "px";
  }

  fontMinus.onclick = () => {
    if (fontSize > 12) {
      fontSize--;
      applyFontSize();
    }
  };

  fontPlus.onclick = () => {
    if (fontSize < 40) {
      fontSize++;
      applyFontSize();
    }
  };

  // 초기 적용
  applyFontSize();

  // =========================
  // 🎨 하이라이트 색상
  // =========================
  colorPanel.addEventListener("click", (e) => {
    if (!e.target.classList.contains("color-circle")) return;

    document.querySelectorAll(".color-circle").forEach(btn =>
      btn.classList.remove("active")
    );

    e.target.classList.add("active");

    const color = e.target.dataset.color;

    document.documentElement.style.setProperty(
      "--highlight-color",
      color + "66"
    );
  });

  // =========================
  // 📡 데이터 불러오기
  // =========================
  const resourceId = localStorage.getItem("resource_id");

  fetch(`https://readflow-backend-server-904179417673.asia-northeast3.run.app/api/resources/${resourceId}`)
    .then(res => res.json())
    .then(data => {

      sentencesData = data.sentences?.length > 1
        ? data.sentences
        : [{
            sentence_index: 0,
            sentence_text: data.extracted_text || ""
          }];

      timestamps = data.timestamps || data.tts_output?.timestamps || [];

      // =========================
      // 🧠 본문 렌더링
      // =========================
      readerContent.innerHTML = sentencesData.map(s => `
        <p class="sentence" data-sentence="${s.sentence_index}">
          ${s.sentence_text.split(" ").map((w, i) => `
            <span class="word" data-sentence="${s.sentence_index}" data-word="${i}">
              ${w}
            </span>
          `).join(" ")}
        </p>
      `).join("");

      applyFontSize();

      if (data.audio_url || data.tts_output?.audio_url) {
        audio = new Audio(data.audio_url || data.tts_output.audio_url);
        setupAudio();
        setupHighlight();
      }
    });

  // =========================
  // 🎧 오디오
  // =========================
  function setupAudio() {

    audio.addEventListener("loadedmetadata", () => {
      totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      const current = audio.currentTime;
      const duration = audio.duration;

      currentTimeEl.textContent = formatTime(current);

      const percent = (current / duration) * 100;

      progressBar.value = percent;

      progressBar.style.background = `
        linear-gradient(to right,
        #0067DB ${percent}%,
        #ECECEC ${percent}%)
      `;

      if (progressPercent) {
        progressPercent.textContent = Math.floor(percent) + "%";
      }

      if (progressFill) {
        progressFill.style.width = percent + "%";
      }
    });

    // 🔥 슬라이더 이동 → 오디오 이동
    progressBar.addEventListener("input", () => {
      const duration = audio.duration;
      audio.currentTime = (progressBar.value / 100) * duration;
    });

    // 🔥 볼륨
    volumeRange.addEventListener("input", () => {
      const v = volumeRange.value;
      audio.volume = v / 100;

      volumeRange.style.background = `
        linear-gradient(to right,
        #0067DB ${v}%,
        #ECECEC ${v}%)
      `;
    });
  }

  // =========================
  // 🎯 하이라이트
  // =========================
  function setupHighlight() {
    if (!timestamps.length) return;

    audio.addEventListener("timeupdate", () => {
      const currentTime = audio.currentTime;

      let current = timestamps.find((t, i) => {
        const next = timestamps[i + 1];
        return currentTime >= t.time_seconds &&
          (!next || currentTime < next.time_seconds);
      });

      if (!current) return;

      const [_, sIdx, wIdx] = current.mark_name.split("_");

      document.querySelectorAll(".word").forEach(el =>
        el.classList.remove("active-word")
      );

      const wordEl = document.querySelector(
        `.word[data-sentence="${sIdx}"][data-word="${wIdx}"]`
      );

      if (wordEl) {
        wordEl.classList.add("active-word");

        wordEl.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    });
  }

  // =========================
  // ▶ 재생
  // =========================
  playButton.onclick = () => {
    if (!audio) return;

    isPlaying = !isPlaying;

    if (isPlaying) {
      audio.play();
      playButton.textContent = "Ⅱ";
    } else {
      audio.pause();
      playButton.textContent = "▶";
    }
  };

  function formatTime(sec) {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
});