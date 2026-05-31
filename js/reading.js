document.addEventListener("DOMContentLoaded", () => {
  const fileInfoBox = document.getElementById("fileInfoBox");
  const fileName = document.getElementById("fileName");
  const uploadStatusText = document.getElementById("uploadStatusText");

  const reuploadButton = document.getElementById("reuploadButton");
  const fileInput = document.getElementById("fileInput");

  const fontMinus = document.getElementById("fontMinus");
  const fontPlus = document.getElementById("fontPlus");
  const fontSizeValue = document.getElementById("fontSizeValue");

  const speedMinus = document.getElementById("speedMinus");
  const speedPlus = document.getElementById("speedPlus");
  const speedValue = document.getElementById("speedValue");
  const topSpeedValue = document.getElementById("topSpeedValue");

  const readerBox = document.getElementById("readerBox");
  const colorButtons = document.querySelectorAll(".color-circle");

  const playButton = document.getElementById("playButton");
  const audioProgress = document.getElementById("audioProgress");
  const volumeRange = document.getElementById("volumeRange");
  const playerSpeedButtons = document.querySelectorAll(".player-speed-button");

  let fontSize = 22;
  let readingSpeed = 1.0;
  let isPlaying = false;

  const savedFileData = JSON.parse(localStorage.getItem("readflowUploadData"));

  if (savedFileData) {
    updateFileStatus(savedFileData.fileName, savedFileData.status);
  } else {
    updateFileStatus("우주의 모든 것.pdf", "complete");
  }

  if (reuploadButton && fileInput) {
    reuploadButton.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const selectedFile = fileInput.files[0];

      if (!selectedFile) return;

      localStorage.setItem("readflowUploadData", JSON.stringify({
        fileName: selectedFile.name,
        status: "loading"
      }));

      window.location.href = "./upload.html";
    });
  }

  if (fontMinus && fontPlus && fontSizeValue) {
    fontMinus.addEventListener("click", () => {
      if (fontSize <= 16) return;

      fontSize -= 1;
      updateFontSize();
    });

    fontPlus.addEventListener("click", () => {
      if (fontSize >= 32) return;

      fontSize += 1;
      updateFontSize();
    });
  }

  if (speedMinus && speedPlus && speedValue) {
    speedMinus.addEventListener("click", () => {
      if (readingSpeed <= 0.5) return;

      readingSpeed = Math.round((readingSpeed - 0.1) * 10) / 10;
      updateReadingSpeed();
      syncPlayerSpeedButton();
    });

    speedPlus.addEventListener("click", () => {
      if (readingSpeed >= 2.0) return;

      readingSpeed = Math.round((readingSpeed + 0.1) * 10) / 10;
      updateReadingSpeed();
      syncPlayerSpeedButton();
    });
  }

  colorButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedColor = button.dataset.color;
      const rgbaColor = hexToRgba(selectedColor, 0.25);

      colorButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");

      readerBox.style.setProperty("--highlight-color", rgbaColor);
    });
  });

  if (playButton) {
    playButton.addEventListener("click", () => {
      isPlaying = !isPlaying;

      playButton.textContent = isPlaying ? "Ⅱ" : "▶";
      playButton.setAttribute("aria-label", isPlaying ? "일시정지" : "재생");
    });
  }

  if (audioProgress) {
    audioProgress.addEventListener("input", () => {
      updateRangeBar(audioProgress);
    });

    updateRangeBar(audioProgress);
  }

  if (volumeRange) {
    volumeRange.addEventListener("input", () => {
      updateRangeBar(volumeRange);
    });

    updateRangeBar(volumeRange);
  }

  playerSpeedButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedSpeed = Number(button.dataset.speed);

      readingSpeed = selectedSpeed;
      updateReadingSpeed();

      playerSpeedButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  function updateFileStatus(name, status) {
    fileName.textContent = name;
    fileInfoBox.dataset.status = status;

    if (status === "loading") {
      uploadStatusText.textContent = "업로드 중";
    }

    if (status === "complete") {
      uploadStatusText.textContent = "업로드 완료";
    }

    if (status === "fail") {
      uploadStatusText.textContent = "업로드 실패";
    }
  }

  function updateFontSize() {
    fontSizeValue.textContent = fontSize;
    readerBox.style.setProperty("--reader-font-size", `${fontSize}px`);
  }

  function updateReadingSpeed() {
    const speedText = `${readingSpeed.toFixed(1)}x`;

    speedValue.textContent = speedText;

    if (topSpeedValue) {
      topSpeedValue.textContent = speedText;
    }
  }

  function syncPlayerSpeedButton() {
    playerSpeedButtons.forEach(button => {
      const buttonSpeed = Number(button.dataset.speed);

      if (buttonSpeed === readingSpeed) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  function updateRangeBar(rangeElement) {
    const value = rangeElement.value;

    rangeElement.style.background = `linear-gradient(
      to right,
      #0067DB 0%,
      #0067DB ${value}%,
      #ECECEC ${value}%,
      #ECECEC 100%
    )`;
  }

  function hexToRgba(hex, alpha) {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
});
