document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ upload.js 실행됨");

  const fileInfoBox = document.getElementById("fileInfoBox");
  const fileName = document.getElementById("fileName");
  const uploadStatusText = document.getElementById("uploadStatusText");
  const reuploadButton = document.getElementById("reuploadButton");
  const fileInput = document.getElementById("fileInput");

  if (reuploadButton && fileInput) {
    reuploadButton.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const selectedFile = fileInput.files[0];
      if (!selectedFile) return;

      updateFileStatus(selectedFile.name, "loading");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", "test_user");

      try {
        const res = await fetch(
          "https://readflow-backend-server-904179417673.asia-northeast3.run.app/api/resources",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error(`서버 오류: ${res.status}`);
        }

        const data = await res.json();
        console.log("🔥 API 결과:", data);

        // ✅ 핵심: resource_id만 저장
        localStorage.setItem("resource_id", data.resource_id);

        localStorage.setItem(
          "readflowUploadData",
          JSON.stringify({
            fileName: selectedFile.name,
            status: "complete",
          })
        );

        updateFileStatus(selectedFile.name, "complete");

        setTimeout(() => {
          window.location.href = "./reading.html";
        }, 500);

      } catch (err) {
        console.error("❌ 업로드 실패:", err);
        updateFileStatus(selectedFile.name, "fail");
      }
    });
  }

  function updateFileStatus(name, status) {
    if (!fileName || !fileInfoBox || !uploadStatusText) return;

    fileName.textContent = name;
    fileInfoBox.dataset.status = status;

    uploadStatusText.textContent =
      status === "loading" ? "업로드 중" :
      status === "complete" ? "업로드 완료" :
      "업로드 실패";
  }
});