document.addEventListener("DOMContentLoaded", () => {
    const recordGrid = document.getElementById("recordGrid");
    const sortSelect = document.getElementById("sortSelect");
  
    const defaultThumbnail = "./assets/icons/logo-full.svg";
  
    let records = [
      {
        fileName: "우주의 모든 것.pdf",
        progress: 85,
        thumbnail: defaultThumbnail,
        isDefaultThumbnail: true     
        },
      {
        fileName: "베스트 중국어.pdf",
        progress: 65,
        thumbnail: defaultThumbnail,
        isDefaultThumbnail: true     
        },
      {
        fileName: "GIVER.pdf",
        progress: 50,
        thumbnail: defaultThumbnail,
        isDefaultThumbnail: true     
      },
      {
        fileName: "MATILDA.pdf",
        progress: 25,
        thumbnail: defaultThumbnail,
        isDefaultThumbnail: true     
      },
      {
        fileName: "Walk Two Moons.pdf",
        progress: 10,
        thumbnail: defaultThumbnail,
        isDefaultThumbnail: true     
      }
    ];
  
    /*
      나중에 업로드 파일과 연동할 때:
      localStorage에 저장된 readflowUploadData가 있으면 학습기록에 추가하는 예시
    */
    const uploadedFile = JSON.parse(localStorage.getItem("readflowUploadData"));
  
    if (uploadedFile && uploadedFile.fileName) {
      const alreadyExists = records.some(record => record.fileName === uploadedFile.fileName);
  
      if (!alreadyExists) {
        records.unshift({
          fileName: uploadedFile.fileName,
          progress: 35,
          thumbnail: defaultThumbnail,
          isDefaultThumbnail: true
        });
      }
    }
  
    renderRecords(records);
  
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        const selectedValue = sortSelect.value;
  
        let sortedRecords = [...records];
  
        if (selectedValue === "progress") {
          sortedRecords.sort((a, b) => b.progress - a.progress);
        }
  
        if (selectedValue === "name") {
          sortedRecords.sort((a, b) => a.fileName.localeCompare(b.fileName, "ko"));
        }
  
        renderRecords(sortedRecords);
      });
    }
  
    function renderRecords(recordList) {
      recordGrid.innerHTML = "";
  
      recordList.forEach(record => {
        const card = document.createElement("article");
        card.className = "record-card";
  
        const thumbnailClass = record.isDefaultThumbnail ? "record-thumbnail default-thumbnail" : "record-thumbnail";
        const thumbnailSrc = record.thumbnail || defaultThumbnail;
  
        card.innerHTML = `
          <div class="${thumbnailClass}">
            <img src="${thumbnailSrc}" alt="${record.fileName} 썸네일" />
          </div>
  
          <h2 class="record-title">${record.fileName}</h2>
  
          <div class="record-progress-row">
            <span class="record-progress-label">전체 진행률</span>
            <span class="record-progress-percent">${record.progress}%</span>
          </div>
  
          <div class="record-progress-bar">
            <div class="record-progress-fill" style="width: ${record.progress}%;"></div>
          </div>
        `;
  
        card.addEventListener("click", () => {
          localStorage.setItem("readflowUploadData", JSON.stringify({
            fileName: record.fileName,
            status: "complete"
          }));
  
          window.location.href = "./reading.html";
        });
  
        recordGrid.appendChild(card);
      });
    }
  });