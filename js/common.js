const navbar = document.getElementById("navbar");
const footer = document.getElementById("footer");

if (navbar) {
  fetch("components/nav.html")
    .then(response => response.text())
    .then(data => {
      navbar.innerHTML = data;
      setActiveNavLink();
    });
}

if (footer) {
  fetch("components/footer.html")
    .then(response => response.text())
    .then(data => {
      footer.innerHTML = data;
    });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const linkPage = link.dataset.page;

    if (linkPage === currentPage) {
      link.classList.add("active");

      const starIcon = document.createElement("img");
      starIcon.src = "assets/icons/star.svg";
      starIcon.alt = "";
      starIcon.className = "nav-star";

      link.prepend(starIcon);
    } else {
      link.classList.remove("active");
    }
  });
}