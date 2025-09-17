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
// --- Altura real del header (compensa sticky, márgenes, etc.)
function getHeaderOffset() {
  const header = document.getElementById("mainHeader");
  if (!header) return 0;
  const styles = getComputedStyle(header);
  return header.offsetHeight
    + parseFloat(styles.marginTop)
    + parseFloat(styles.marginBottom);
}

(function initActiveNavStable() {
  const nav = document.getElementById("topMainNavbar");
  if (!nav) return;

  // Links del navbar que apuntan a anclas
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));

  const rawMap = navLinks
    .map(a => {
      let id = a.getAttribute('href').slice(1);
      let section = document.getElementById(id);
      if (section && section.tagName === 'BODY') {
        const hero = document.getElementById('hero');
        if (hero) { id = 'hero'; section = hero; } else { return null; }
      }
      return section ? { id, link: a, section } : null;
    })
    .filter(Boolean);

  const byId = new Map();
  rawMap.forEach(item => { if (!byId.has(item.id)) byId.set(item.id, item); });
  const sections = Array.from(byId.values());

  function setActiveSection(idToActivate) {
    navLinks.forEach(a => {
      const isActive = a.getAttribute('href') === `#${idToActivate}`;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    history.replaceState(null, '', `#${idToActivate}`);
  }

  let ticking = false;
  let lastActiveId = null;
  let lastSwitchY = 0;        
  const bufferPx = 14;       
  function computeActiveFromCenterline() {
    const headerOffset = getHeaderOffset();

    const probeY = headerOffset + Math.min(320, window.innerHeight * 0.33);

    let current = null;
    for (const item of sections) {
      const rect = item.section.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        current = item;
        break;
      }
    }

    if (!current) {
      let minDist = Infinity;
      for (const item of sections) {
        const rect = item.section.getBoundingClientRect();
        const dist = Math.min(
          Math.abs(rect.top - probeY),
          Math.abs(rect.bottom - probeY)
        );
        if (dist < minDist) {
          minDist = dist;
          current = item;
        }
      }
    }

    if (!current) return;

    const currentTop = current.section.getBoundingClientRect().top;
    const switchedEnough = Math.abs(currentTop - lastSwitchY) > bufferPx;

    if (current.id !== lastActiveId && switchedEnough) {
      lastActiveId = current.id;
      lastSwitchY = currentTop;
      setActiveSection(current.id);
    }

    document.documentElement
      .style.setProperty('--header-h', `${headerOffset}px`);
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        computeActiveFromCenterline();
        ticking = false;
      });
    }
  }

  // Init + listeners
  computeActiveFromCenterline();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
})();
