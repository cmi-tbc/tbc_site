// ===============================
// 🔧 Enhanced Tier Display Logic for Results Page
// The Burnout Codex - Complete Results System
// ===============================

document.addEventListener('DOMContentLoaded', function () {
  
  // ================================
  // MOBILE NAVIGATION (shared functionality)
  // ================================
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  
  if (navToggle && navList) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navList.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navList.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ================================
  // RESULTS PAGE LOGIC
  // ================================

  // Get quiz data from localStorage
  const totalScore = parseInt(localStorage.getItem('burnoutScore'), 10);
  const redFlags = JSON.parse(localStorage.getItem('redFlags') || '[]');
  const quizResponses = JSON.parse(localStorage.getItem('quizResponses') || '{}');

  // Redirect if no quiz data found
  if (isNaN(totalScore)) {
    console.warn("No burnout score found. Redirecting to quiz.");
    // Add a small delay to show the page briefly (better UX)
    setTimeout(() => {
      window.location.href = '/quiz';
    }, 1500);
    
    // Show a message while redirecting
    const scoreValue = document.getElementById('total-score');
    if (scoreValue) {
      scoreValue.textContent = 'Redirecting to quiz...';
    }
    return;
  }

  console.log('Quiz data loaded:', { totalScore, redFlagsCount: redFlags.length });

  // Calculate domain scores
  const domainScores = calculateDomainScores(quizResponses);

  // Determine tier
  const tierInfo = determineTier(totalScore);

  // Fire GA4 burnout_score_tier event
  gtag('event', 'burnout_score_tier', {
    event_category: 'Quiz',
    event_label: tierInfo.name,
    value: totalScore
  });

  // Populate all score data
  populateScoreData(totalScore, redFlags, tierInfo, domainScores);

  // Show tier-specific content
  showTierContent(tierInfo.class);

  // Handle red flags display
  handleRedFlags(redFlags);

  // Fire GA4 red_flags_triggered event (only if 1+ flags)
  if (redFlags.length >= 1) {
    gtag('event', 'red_flags_triggered', {
      event_category: 'Quiz',
      event_label: 'High Risk',
      value: redFlags.length
    });
  }

  // Add visual score indicator
  addScoreIndicator(totalScore);

  // ================================
  // HELPER FUNCTIONS
  // ================================

  function determineTier(score) {
    if (score >= 0 && score <= 14) {
      return { class: 'stable', name: 'Stable', color: 'var(--secondary-color)' };
    } else if (score >= 15 && score <= 29) {
      return { class: 'early', name: 'Early Signs', color: '#C9CBA3' };
    } else if (score >= 30 && score <= 44) {
      return { class: 'burnout', name: 'Burnout', color: 'var(--primary-color)' };
    } else if (score >= 45 && score <= 60) {
      return { class: 'critical', name: 'Critical', color: 'var(--accent-color)' };
    }
    return { class: 'unknown', name: 'Unknown', color: '#666' };
  }

  function populateScoreData(score, redFlags, tierInfo, domainScores) {
    // Main score display
    const totalScoreEl = document.getElementById('total-score');
    if (totalScoreEl) {
      totalScoreEl.textContent = `${score} / 60`;
    }

    // Meta information
    const redFlagCountEl = document.getElementById('red-flag-count');
    if (redFlagCountEl) {
      redFlagCountEl.textContent = redFlags.length;
    }

    const burnoutTierEl = document.getElementById('burnout-tier');
    if (burnoutTierEl) {
      burnoutTierEl.textContent = tierInfo.name;
      burnoutTierEl.style.color = tierInfo.color;
      burnoutTierEl.style.fontWeight = 'bold';
    }

    // Domain scores
    const domainNames = ['exhaustion', 'disconnection', 'selfEfficacy', 'overcompensation', 'systemicPressure'];
    domainNames.forEach((domain, index) => {
      const domainEl = document.getElementById(`domain-${index + 1}-score`);
      if (domainEl) {
        const score = domainScores[domain] || 0;
        domainEl.textContent = `${score} / 12`;
        
        // Add color coding based on score severity
        if (score >= 9) {
          domainEl.style.color = '#7C1C1F'; // deep burgundy
        } else if (score >= 6) {
          domainEl.style.color = '#D45A00'; // strong orange
        } else if (score >= 3) {
          domainEl.style.color = '#6B6740'; // olive but readable
        } else {
          domainEl.style.color = '#3D6353'; // slate green
        }
          domainEl.style.fontWeight = '600';
      }
    });
  }

  function calculateDomainScores(responses) {
    // Domain mapping:
    // Domain 1 (Exhaustion): Questions 1-3
    // Domain 2 (Disconnection): Questions 4-6  
    // Domain 3 (Self-Efficacy Loss): Questions 7-9
    // Domain 4 (Overcompensation): Questions 10-12
    // Domain 5 (Systemic Pressure): Questions 13-15
    
    const domains = {
      exhaustion: 0,
      disconnection: 0,
      selfEfficacy: 0,
      overcompensation: 0,
      systemicPressure: 0
    };
    
    const domainNames = Object.keys(domains);
    
    if (Object.keys(responses).length > 0) {
      // Calculate from actual responses
      for (let i = 1; i <= 15; i++) {
        const domainIndex = Math.floor((i - 1) / 3);
        const domainName = domainNames[domainIndex];
        const value = responses[`q${i}`] || 0;
        domains[domainName] += value;
      }
    } else {
      // Fallback: estimate from total score
      const avgDomainScore = Math.round(totalScore / 5);
      domainNames.forEach(domain => {
        domains[domain] = Math.min(avgDomainScore, 12); // Cap at 12
      });
    }
    
    return domains;
  }

  function showTierContent(tierClass) {
    // Hide all tier feedback blocks first
    const allTierBlocks = document.querySelectorAll('.tier-feedback');
    allTierBlocks.forEach(block => {
      block.classList.remove('active');
    });

    // Show the correct tier interpretation block
    const interpretationBlock = document.querySelector(`.tier-feedback.tier--${tierClass}`);
    if (interpretationBlock) {
      interpretationBlock.classList.add('active');
    }

    // Hide all CTA blocks first
    const allCtaBlocks = document.querySelectorAll('.cta-block');
    allCtaBlocks.forEach(block => {
      block.classList.remove('active');
    });

    // Show the correct CTA block
    const ctaBlock = document.querySelector(`.cta-block.cta--${tierClass}`);
    if (ctaBlock) {
      ctaBlock.classList.add('active');
    }
  }

  function handleRedFlags(redFlags) {
    const redFlagSection = document.getElementById('red-flag-section');
    const redFlagList = document.getElementById('red-flag-list');
    
    if (redFlags.length > 0 && redFlagSection && redFlagList) {
      redFlagSection.style.display = 'block';
      
      // Clear existing content
      redFlagList.innerHTML = '';
      
      // Populate red flags
      redFlags.forEach(flag => {
        const li = document.createElement('li');
        if (typeof flag === 'object' && flag.question && flag.response) {
          li.innerHTML = `<strong>${flag.question}</strong> → ${flag.response}`;
        } else {
          li.textContent = flag.toString();
        }
        redFlagList.appendChild(li);
      });
      
      console.log(`Displayed ${redFlags.length} red flags`);
    } else {
      // Hide red flag section if no flags
      if (redFlagSection) {
        redFlagSection.style.display = 'none';
      }
    }
  }

  function addScoreIndicator(score) {
    const scoreBar = document.querySelector('.score-bar');
      if (!scoreBar) return;

      const percentage = Math.min((score / 60) * 100, 100);

      const indicator = document.createElement('div');
      indicator.className = 'score-position-indicator';
      indicator.style.left = `${percentage}%`;

      scoreBar.style.position = 'relative';
      scoreBar.appendChild(indicator);
    }

  // ================================
  // ERROR HANDLING & DEBUGGING
  // ================================
  
  // Log completion for debugging
  console.log('Results page initialized successfully', {
    tier: tierInfo.name,
    score: totalScore,
    redFlags: redFlags.length,
    domainScores: domainScores
  });

  // ================================
  // EMAIL SUBMISSION TRACKING (FormKit modal forms)
  // ================================

  const observeKitFormSubmissions = () => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (
              node.nodeType === 1 &&
              node.innerText.includes('Success!') // Modify if your success text is different
            ) {
              gtag('event', 'email_submitted', {
                event_category: 'Lead Capture',
                event_label: 'Toolkit Opt-in'
              });
              console.log('📩 email_submitted event fired to GA4');
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  observeKitFormSubmissions();

});