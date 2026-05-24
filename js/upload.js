document.addEventListener("DOMContentLoaded", () => {
    const fileInfoBox = document.getElementById("fileInfoBox");
    const fileName = document.getElementById("fileName");
    const uploadStatusText = document.getElementById("uploadStatusText");
    const reuploadButton = document.getElementById("reuploadButton");
    const fileInput = document.getElementById("fileInput");
  
    const savedFileData = JSON.parse(localStorage.getItem("readflowUploadData"));
  
    if (savedFileData && savedFileData.fileName) {
      updateFileStatus(savedFileData.fileName, "loading");
  
      // 프론트 목업용 분석 시간
      setTimeout(() => {
        completeUpload(savedFileData.fileName);
      }, 3500);
    } else {
      updateFileStatus("파일을 선택해 주세요", "loading");
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
  
        updateFileStatus(selectedFile.name, "loading");
  
        setTimeout(() => {
          completeUpload(selectedFile.name);
        }, 3500);
  
        fileInput.value = "";
      });
    }
  
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
  
    function completeUpload(name) {
      localStorage.setItem("readflowUploadData", JSON.stringify({
        fileName: name,
        status: "complete"
      }));
  
      updateFileStatus(name, "complete");
  
      window.location.href = "./reading.html";
    }
  });