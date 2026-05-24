document.addEventListener("DOMContentLoaded", () => {
    const uploadData = JSON.parse(localStorage.getItem("readflowUploadData"));
  
    if (!uploadData) {
      window.location.href = "./upload.html";
      return;
    }
  
    // 처음에는 업로드 중
    uploadData.status = "loading";
    localStorage.setItem("readflowUploadData", JSON.stringify(uploadData));
  
    // 지금은 프론트 목업이라 2초 뒤 성공 처리
    // 나중에 백엔드랑 연결시 setTimeout 대신 실제 API 결과에 따라 처리하기
    setTimeout(() => {
      uploadData.status = "complete";
      localStorage.setItem("readflowUploadData", JSON.stringify(uploadData));
  
      window.location.href = "./reading.html";
    }, 2000);
  });