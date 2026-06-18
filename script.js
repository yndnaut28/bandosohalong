document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const allCards = document.querySelectorAll(".card-container .card");
  
  let currentSearchTerm = "";

  function normalizeText(text) {
    return text.toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")
               .replace(/đ/g, "d");
  }

  function filterCards() {
    const normalizedSearchTerm = normalizeText(currentSearchTerm);
    allCards.forEach(card => {
      const cardTitle = card.querySelector(".card-text h3").textContent;
      const cardAddress = card.querySelector(".card-text p").textContent;
      const cardKeywords = card.dataset.keywords || "";

      const searchableText = cardTitle + " " + cardAddress + " " + cardKeywords;
      const normalizedCardText = normalizeText(searchableText);
      const searchMatch = normalizedCardText.includes(normalizedSearchTerm);

      card.style.display = searchMatch ? "flex" : "none";
    });
  }

  if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentSearchTerm = searchInput.value;
        filterCards();
      });
  }

  const cardImagesContainers = document.querySelectorAll('.card-img');
  cardImagesContainers.forEach(container => {
      const images = container.querySelectorAll('img');
      if (images.length <= 1) return;

      // Ép ảnh đầu tiên hiển thị
      images[0].classList.add('active');

      // Tạo dots
      const dotsDiv = document.createElement('div');
      dotsDiv.className = 'dot-indicator';
      images.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = 'dot' + (i === 0 ? ' active' : '');
          dotsDiv.appendChild(dot);
      });
      container.appendChild(dotsDiv);

      let currentIdx = 0;
      const dots = dotsDiv.querySelectorAll('.dot');
      
      setInterval(() => {
          images[currentIdx].classList.remove('active');
          dots[currentIdx].classList.remove('active');
          currentIdx = (currentIdx + 1) % images.length;
          images[currentIdx].classList.add('active');
          dots[currentIdx].classList.add('active');
      }, 3000); 
  });

  // === Modal Logic & Keyboard Support ===
  let currentImgList = [];
  let currentIdx = 0;
  let currentTitle = "";
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imgFull");
  const captionText = document.getElementById("caption");

  function updateModal() {
      if(!modalImg) return;
      modalImg.src = currentImgList[currentIdx];
      captionText.innerText = currentTitle + " (" + (currentIdx + 1) + "/" + currentImgList.length + ")";
  }

  document.querySelectorAll(".view-img-btn:not(.toggle-text-btn)").forEach(btn => {
      btn.addEventListener("click", function() {
          const card = this.closest(".card");
          currentTitle = card.querySelector("h3").textContent;
          const allImgs = card.querySelectorAll(".card-img img");
          currentImgList = Array.from(allImgs).map(img => img.src);
          currentIdx = 0;
          modal.style.display = "flex";
          updateModal();
      });
  });

  if (document.querySelector(".modal-next")) {
      document.querySelector(".modal-next").onclick = () => {
          currentIdx = (currentIdx + 1) % currentImgList.length;
          updateModal();
      };
  }

  if (document.querySelector(".modal-prev")) {
      document.querySelector(".modal-prev").onclick = () => {
          currentIdx = (currentIdx - 1 + currentImgList.length) % currentImgList.length;
          updateModal();
      };
  }

  const closeModal = () => { if(modal) modal.style.display = "none"; }
  if (document.querySelector(".close-modal")) {
      document.querySelector(".close-modal").onclick = closeModal;
  }

  if (modal) {
      modal.addEventListener("click", (e) => {
          if (e.target === modal) closeModal();
      });
  }

  document.addEventListener("keydown", (e) => {
      if (modal && modal.style.display === "flex") {
          if (e.key === "ArrowRight") document.querySelector(".modal-next").click();
          if (e.key === "ArrowLeft") document.querySelector(".modal-prev").click();
          if (e.key === "Escape") closeModal();
      }
  });

  filterCards();
});

document.querySelectorAll(".toggle-text-btn").forEach(btn => {
      btn.addEventListener("click", function() {
          const currentCard = this.closest(".card");
          const shortInfo = currentCard.querySelector(".short-info");
          const fullInfo = currentCard.querySelector(".full-info");
          
          const isOpening = fullInfo.style.display === "none";

          if (isOpening) {
              document.querySelectorAll(".card").forEach(otherCard => {
                  if (otherCard !== currentCard) {
                      const otherFull = otherCard.querySelector(".full-info");
                      const otherShort = otherCard.querySelector(".short-info");
                      const otherBtn = otherCard.querySelector(".toggle-text-btn");

                      if (otherFull && otherFull.style.display === "block") {
                          otherFull.style.display = "none";
                          if (otherShort) otherShort.style.display = "block";
                          if (otherBtn) {
                              otherBtn.textContent = "Xem thông tin";
                              // SỬA Ở ĐÂY: Xóa style dán cứng để trả lại tính năng Hover cho CSS
                              otherBtn.style.background = "";
                              otherBtn.style.color = "";
                          }
                      }
                  }
              });
          }

          if (isOpening) {
              fullInfo.style.display = "block";
              if (shortInfo) shortInfo.style.display = "none";
              this.textContent = "Thu gọn";
              this.style.background = "#1931A7"; 
              this.style.color = "#fff";
          } else {
              fullInfo.style.display = "none";
              if (shortInfo) shortInfo.style.display = "block";
              this.textContent = "Xem thông tin";
              // SỬA Ở ĐÂY: Xóa style dán cứng để trả lại tính năng Hover cho CSS
              this.style.background = "";
              this.style.color = "";
          }
      });
  });

let ytPlayer;
window.addEventListener('load', () => {
    const muteBtn = document.getElementById('custom-mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const ytIframe = document.getElementById('yt-video');
    
    let isMuted = true; 

    if(muteBtn && ytIframe) {
        muteBtn.addEventListener('click', () => {
            if (isMuted) {
                ytIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                ytIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                muteIcon.textContent = '🔊';
                isMuted = false;
            } else {
                ytIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                muteIcon.textContent = '🔇';
                isMuted = true;
            }
        });
    }
});