//Sticky Header
window.onscroll = function() {stickyHeader()};

function stickyHeader() {
    let header = document.getElementById("mainHeader");
    let sticky = header.offsetTop;
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}

//Mobile Menu
function openMobileMenu() {
  let nav = document.getElementById("topMainNavbar");
  if (nav.className === "mainNavbar") {
    nav.className += " menuOpen";
  } else {
    nav.className = "mainNavbar";
  }
}

//Infinite Slider
(function(){
    const SPEED_PX_PER_S = 60;
    const track = document.getElementById('conoce-track');

    const slides = Array.from(track.children);
    slides.forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      const img = clone.querySelector('img');
      if (img) img.loading = 'lazy';
      track.appendChild(clone);
    });

    function setDuration() {
      const firstSetWidth = slides.reduce((acc, li) => acc + li.offsetWidth, 0)
        + (getGap() * (slides.length - 1));
      const duration = firstSetWidth / SPEED_PX_PER_S;
      track.style.setProperty('--scroll-end', `-${firstSetWidth}px`);
      track.style.animationDuration = `${duration}s`;
    }

    function getGap(){
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || 0);
      return isNaN(gap) ? 0 : gap;
    }

    window.addEventListener('resize', () => {
      const prevState = track.style.animationPlayState;
      track.style.animationPlayState = 'paused';
      setDuration();
      void track.offsetWidth;
      track.style.animationPlayState = prevState || 'running';
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      track.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });

    setDuration();
  })();