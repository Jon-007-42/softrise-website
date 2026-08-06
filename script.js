/* =================================================================
   SOFTRISE — script.js
   To simple, uafhængige funktioner:
   1) Blid fade-in-på-scroll via IntersectionObserver
   2) Klik-for-at-kopiere på telefonnummer og e-mail (ingen mailto:)
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initScrollReveal();
  initCopyToClipboard();
});

/* -----------------------------------------------------------------
   Sætter aktuelt årstal i footeren automatisk (© <year>)
   ----------------------------------------------------------------- */
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* -----------------------------------------------------------------
   Fade-in-på-scroll: lægger .is-visible på elementer med klassen
   .fade-in, når de kommer ind i viewport. Kører kun én gang pr.
   element (unobserve efter reveal), så det føles roligt og bevidst.
   ----------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.fade-in');

  // Hvis browseren ikke understøtter IntersectionObserver, vis blot alt med det samme
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,        // element skal være ca. 15% synligt
      rootMargin: '0px 0px -8% 0px', // udløs en anelse før bunden af viewport
    }
  );

  // Lille, trinvis forsinkelse pr. element inden for samme sektion,
  // så kort/citater ikke "popper" samtidig — giver en dyrere følelse.
  targets.forEach((el, index) => {
    const staggerMs = (index % 3) * 90;
    el.style.transitionDelay = `${staggerMs}ms`;
    observer.observe(el);
  });
}

/* -----------------------------------------------------------------
   Klik-for-at-kopiere: bruges på telefon- og e-mail-knapperne i
   footeren. Ingen mailto:-links, ingen formular — blot ren tekst,
   der er let at kopiere og indsætte i egen mailklient eller telefon.
   ----------------------------------------------------------------- */
function initCopyToClipboard() {
  const buttons = document.querySelectorAll('.copy-item[data-copy]');
  const announcer = document.getElementById('copy-announcer');

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy');
      const hintEl = button.querySelector('.copy-item__hint');
      const originalHint = hintEl ? hintEl.textContent : '';

      const success = await copyText(value);

      if (hintEl) {
        hintEl.textContent = success ? 'Kopieret ✓' : 'Kunne ikke kopiere';
      }
      button.classList.toggle('is-copied', success);

      if (announcer) {
        announcer.textContent = success
          ? `${value} er kopieret til udklipsholder`
          : 'Kopiering mislykkedes';
      }

      // Nulstil knappens tekst efter et par sekunder
      window.clearTimeout(button._copyResetTimer);
      button._copyResetTimer = window.setTimeout(() => {
        if (hintEl) hintEl.textContent = originalHint;
        button.classList.remove('is-copied');
      }, 2200);
    });
  });
}

/* Robust kopiering: forsøger moderne Clipboard API, falder tilbage
   til en skjult textarea + execCommand for ældre/begrænsede miljøer. */
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Falder igennem til fallback nedenfor
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    return false;
  }
}
