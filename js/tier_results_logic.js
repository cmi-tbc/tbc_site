// ===============================
// 🔧 Tier Display Logic for Results Page
// ===============================
document.addEventListener('DOMContentLoaded', function () {
  // Example: Get score from localStorage (replace with your actual logic)
  const score = parseInt(localStorage.getItem('burnoutScore'), 10);

  // Guard clause for missing score
  if (isNaN(score)) {
    console.warn("No burnout score found in localStorage.");
    return;
  }

  // Determine tier
  let tierClass = '';
  if (score >= 0 && score <= 14) {
    tierClass = 'stable';
  } else if (score >= 15 && score <= 29) {
    tierClass = 'early';
  } else if (score >= 30 && score <= 44) {
    tierClass = 'burnout';
  } else if (score >= 45 && score <= 60) {
    tierClass = 'critical';
  }

  // Show correct tier interpretation block
  const interpretationBlock = document.querySelector('.tier-feedback.tier--' + tierClass);
  if (interpretationBlock) {
    interpretationBlock.classList.add('active');
  }

  // Show correct CTA block
  const ctaBlock = document.querySelector('.cta-block.cta--' + tierClass);
  if (ctaBlock) {
    ctaBlock.classList.add('active');
  }

  // Optionally show the red flag block (your own logic to trigger this)
  const redFlags = JSON.parse(localStorage.getItem('redFlags') || '[]');
  if (redFlags.length > 0) {
    const redFlagBlock = document.querySelector('.red-flag-warning');
    if (redFlagBlock) {
      redFlagBlock.style.display = 'block';
    }

    // Optionally populate red flag list dynamically
    const redFlagList = document.querySelector('.red-flag-list');
    if (redFlagList && redFlags.length) {
      redFlagList.innerHTML = '';
      redFlags.forEach(flag => {
        const li = document.createElement('li');
        li.textContent = flag;
        redFlagList.appendChild(li);
      });
    }
  }
});