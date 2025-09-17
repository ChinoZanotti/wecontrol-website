//Sticky Header
(function initStickyHeader() {
  const header = document.getElementById("mainHeader");
  if (!header) return;

  let stickyStart = 0;

  function computeStickyStart() {
    const rect = header.getBoundingClientRect();
    stickyStart = rect.top + window.scrollY;
  }

  function onScroll() {
    if (window.scrollY > stickyStart) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }

  // Inicialización
  computeStickyStart();
  onScroll();

  // Listeners
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    computeStickyStart();
    onScroll();
  }, { passive: true });
})();

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

//Accordion
let acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    let panel = this.nextElementSibling;
    panel.classList.toggle("active");
  });
}

// --- Active Nav Item ---
function getHeaderOffset() {
  const header = document.getElementById("mainHeader");
  if (!header) return 0;
  const styles = getComputedStyle(header);
  return header.offsetHeight
    + parseFloat(styles.marginTop)
    + parseFloat(styles.marginBottom);
}

const nav = document.getElementById("topMainNavbar");
if (nav) {
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));

  const sectionMap = navLinks
    .map(a => {
      const id = a.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      return section ? { id, link: a, section } : null;
    })
    .filter(Boolean);

  function setActiveSection(idToActivate) {
    navLinks.forEach(a => {
      const isActive = a.getAttribute('href') === `#${idToActivate}`;
      a.classList.toggle('active', isActive);
      if (isActive) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  (function initActiveNav() {
    // Fallback si no hay IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      window.addEventListener('scroll', legacyScrollHandler, { passive: true });
      legacyScrollHandler();
      return;
    }

    const headerOffset = getHeaderOffset();

    const observer = new IntersectionObserver(handleIntersections, {
      root: null,
      rootMargin: `-${headerOffset + 1}px 0px -50% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    sectionMap.forEach(({ section }) => observer.observe(section));

    function handleIntersections(entries) {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length) {
        const best = visible[0].target.id;
        setActiveSection(best);
        // Evita scroll jump: actualiza el hash sin mover la página
        history.replaceState(null, '', `#${best}`);
      } else {
        const nearest = getNearestSectionToViewportTop();
        if (nearest) {
          setActiveSection(nearest.id);
          history.replaceState(null, '', `#${nearest.id}`);
        }
      }
    }

    function getNearestSectionToViewportTop() {
      let winner = null;
      let minDistance = Infinity;
      sectionMap.forEach(({ id, section }) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - headerOffset);
        if (distance < minDistance) {
          minDistance = distance;
          winner = { id, section };
        }
      });
      return winner;
    }
  })();

  // Fallback legacy
  function legacyScrollHandler() {
    const headerOffset = getHeaderOffset();
    let currentId = sectionMap[0]?.id;

    for (const { id, section } of sectionMap) {
      const top = section.getBoundingClientRect().top - headerOffset;
      if (top <= 0) currentId = id;
      else break;
    }
    if (currentId) setActiveSection(currentId);
  }
}
