document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ reading.js 실행");

  const fileName = document.getElementById("fileName");
  const uploadStatusText = document.getElementById("uploadStatusText");
  const readerContent = document.getElementById("readerContent");
  const tocList = document.getElementById("tocList");
  const playButton = document.getElementById("playButton");

  const progressBar = document.getElementById("audioProgress");
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  const volumeRange = document.getElementById("volumeRange");
  const progressFill = document.getElementById("progressFill");

  // 🔥 글자 크기
  const fontMinus = document.getElementById("fontMinus");
  const fontPlus = document.getElementById("fontPlus");
  const fontSizeValue = document.getElementById("fontSizeValue");

  let audio = null;
  let isPlaying = false;
  let sentencesData = [];
  let timestamps = [];

  let fontSize = 22; // 🔥 기본값

  // =========================
  // 🔥 기본 폰트 설정 (핵심)
  // =========================
  function applyFontSize() {
    fontSizeValue.textContent = fontSize;
  
    const reader = document.getElementById("readerContent");
  
    // 🔥 여기 핵심
    reader.style.fontSize = fontSize + "px";
  }

  applyFontSize(); // 최초 적용

  fontMinus?.addEventListener("click", () => {
    if (fontSize > 12) {
      fontSize--;
      applyFontSize();
    }
  });

  fontPlus?.addEventListener("click", () => {
    if (fontSize < 40) {
      fontSize++;
      applyFontSize();
    }
  });

  // =========================
  // 파일명
  // =========================
  const savedFileData = JSON.parse(localStorage.getItem("readflowUploadData"));

  if (savedFileData) {
    fileName.textContent = savedFileData.fileName;
    uploadStatusText.textContent =
      savedFileData.status === "complete" ? "업로드 완료" : "업로드 중";
  }

  // =========================
  // 데이터 불러오기
  // =========================
  const resourceId = localStorage.getItem("resource_id");

  if (!resourceId) {
    readerContent.innerHTML = "<p>데이터 없음</p>";
    return;
  }

  fetch(`https://readflow-backend-server-904179417673.asia-northeast3.run.app/api/resources/${resourceId}`)
    .then(res => res.json())
    .then(data => {
      console.log("🔥 리딩 데이터:", data);

      sentencesData = data.sentences || data.model_output?.sentences || [];
      timestamps = data.timestamps || data.tts_output?.timestamps || [];

      if (sentencesData.length === 0) {
        readerContent.innerHTML = "<p>텍스트 없음</p>";
        return;
      }

      // =========================
      // 본문 렌더링
      // =========================
      readerContent.innerHTML = sentencesData.map(s => {
        const words = s.sentence_text.split(" ");

        return `
          <p class="sentence" data-sentence="${s.sentence_index}">
            ${words.map((word, i) => `
              <span class="word"
                data-sentence="${s.sentence_index}"
                data-word="${i}">
                ${word}
              </span>
            `).join(" ")}
          </p>
        `;
      }).join("");

      generateTOC(sentencesData);

      // 오디오
      if (data.audio_url || data.tts_output?.audio_url) {
        audio = new Audio(data.audio_url || data.tts_output.audio_url);
        setupHighlight();
        setupAudioUI();
      }
    });

  // =========================
  // 목차
  // =========================
  function generateTOC(sentences) {
    if (!tocList) return;

    tocList.innerHTML = "";

    const groupSize = 3;

    for (let i = 0; i < sentences.length; i += groupSize) {
      const first = sentences[i];

      const li = document.createElement("li");
      li.className = "toc-item";
      li.setAttribute("data-sentence", first.sentence_index);

      li.innerHTML = `<span>${first.sentence_text.slice(0, 20)}...</span>`;

      li.addEventListener("click", () => {
        const targetTimestamp = timestamps.find(t =>
          t.mark_name.startsWith(`w_${first.sentence_index}_0`)
        );

        if (targetTimestamp && audio) {
          audio.currentTime = targetTimestamp.time_seconds;
        }
      });

      tocList.appendChild(li);
    }
  }

  // =========================
  // 하이라이트
  // =========================
  function setupHighlight() {
    if (!audio || timestamps.length === 0) return;

    audio.addEventListener("timeupdate", () => {
      const currentTime = audio.currentTime;

      let current = null;

      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        const next = timestamps[i + 1];

        if (
          currentTime >= t.time_seconds &&
          (!next || currentTime < next.time_seconds)
        ) {
          current = t;
          break;
        }
      }

      if (!current) return;

      const [_, sentenceIdx, wordIdx] = current.mark_name.split("_");

      document.querySelectorAll(".sentence").forEach(el =>
        el.classList.remove("active")
      );
      document.querySelectorAll(".word").forEach(el =>
        el.classList.remove("active-word")
      );

      const sentenceEl = document.querySelector(
        `.sentence[data-sentence="${sentenceIdx}"]`
      );
      if (sentenceEl) sentenceEl.classList.add("active");

      const wordEl = document.querySelector(
        `.word[data-sentence="${sentenceIdx}"][data-word="${wordIdx}"]`
      );
      if (wordEl) wordEl.classList.add("active-word");
    });
  }

  // =========================
  // 오디오 UI
  // =========================
  function setupAudioUI() {
    if (!audio) return;

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
        #0067DB 0%,
        #0067DB ${percent}%,
        #e0e0e0 ${percent}%,
        #e0e0e0 100%)
      `;

      if (progressFill) {
        progressFill.style.width = percent + "%";
      }
    });

    volumeRange.addEventListener("input", () => {
      const value = volumeRange.value;
      audio.volume = value / 100;
    });
  }

  function formatTime(sec) {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // =========================
  // 재생
  // =========================
  playButton?.addEventListener("click", () => {
    if (!audio) return;

    isPlaying = !isPlaying;

    if (isPlaying) {
      audio.play();
      playButton.textContent = "Ⅱ";
    } else {
      audio.pause();
      playButton.textContent = "▶";
    }
  });
});