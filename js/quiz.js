// =============================================
// BURNOUT QUIZ.JS - The Burnout Codex
// ENHANCED VERSION with proper data storage
// =============================================

document.addEventListener('DOMContentLoaded', function() {

  // ================================
  // GLOBAL NAVIGATION TOGGLE
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
  // BURNOUT QUIZ LOGIC
  // ================================

  const totalQuestions = 15;
  let responses = {};

  // Red Flag Questions (ID: Text)
  const redFlagQuestions = {
    'q3': 'I go through the motions, but feel emotionally flat or depleted.',
    'q4': 'I feel emotionally numb or disconnected from the people around me.',
    'q6': 'I care less and less about things I used to be passionate about.',
    'q9': "I've lost faith in my ability to turn things around."
  };

  // Listen for radio button changes
  document.addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
      const questionId = e.target.name;
      const value = parseInt(e.target.value);
      responses[questionId] = value;
      updateProgress();

      // Fire quiz_started event only once
      if (!window.quizStarted) {
        window.quizStarted = true; // Flag to prevent multiple triggers
        gtag('event', 'quiz_started', {
          event_category: 'Quiz',
          event_label: 'Burnout Assessment'
        });
      }
    }
  });

  // Progress Bar Logic
  function updateProgress() {
    const answered = Object.keys(responses).length;
    const percentage = (answered / totalQuestions) * 100;
    const progressBar = document.querySelector('.quiz-progress-bar');
    const progressText = document.querySelector('.quiz-progress-text');
    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressText) progressText.textContent = `Answered ${answered} of ${totalQuestions}`;
  }

  // Add progress bar to page
  function createProgressBar() {
    const formContainer = document.getElementById('burnout-quiz');
    if (!formContainer) return;
    if (document.querySelector('.quiz-progress-container')) return;

    const progressHTML = `
      <div class="quiz-progress-container">
        <div class="quiz-progress">
          <div class="quiz-progress-bar"></div>
        </div>
        <div class="quiz-progress-text">Answered 0 of ${totalQuestions}</div>
      </div>
    `;
    formContainer.insertAdjacentHTML('beforebegin', progressHTML);
  }

  createProgressBar();

  // =============================================
  // LEGAL MODAL POP-UP (Blocks Quiz Access)
  // =============================================

  function createLegalModal() {
    const modalHTML = `
      <div class="modal-overlay" id="legal-modal" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
        <div class="modal-content">
          <h2 class="heading--h2 margin-bottom-sm" id="modal-title">Before You Begin</h2>
          <p class="text--body margin-bottom-sm" id="modal-description">
            This self-assessment is for educational purposes only. It is not medical advice, diagnosis, or treatment. By continuing, you acknowledge that you are responsible for your own well-being and decisions.
          </p>
          <label class="text--body margin-bottom-sm">
            <input type="checkbox" id="legal-acknowledge" aria-describedby="modal-description"> I understand and agree to these terms.
          </label>
          <button class="button button--primary" id="legal-continue" disabled aria-describedby="legal-acknowledge">Continue</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Disable quiz form interaction until accepted (improved accessibility)
    const form = document.getElementById('burnout-quiz');
    if (form) {
      form.setAttribute('aria-hidden', 'true');
      form.style.pointerEvents = 'none';
      form.style.opacity = '0.5';
    }
  }

  createLegalModal();

  // Enable Continue button when checkbox is checked
  document.addEventListener('change', function(e) {
    if (e.target.id === 'legal-acknowledge') {
      const btn = document.getElementById('legal-continue');
      if (btn) btn.disabled = !e.target.checked;
    }
  });

  // Handle Continue button click
  document.addEventListener('click', function(e) {
    if (e.target.id === 'legal-continue') {
      const modal = document.getElementById('legal-modal');
      if (modal) modal.remove();
      const form = document.getElementById('burnout-quiz');
      if (form) {
        form.removeAttribute('aria-hidden');
        form.style.pointerEvents = 'auto';
        form.style.opacity = '1';
      }
    }
  });

  // Helper: Get text label for value
  function getResponseLabel(value) {
    const map = { 0: 'Never', 1: 'Rarely', 2: 'Sometimes', 3: 'Often', 4: 'Very Often' };
    return map[value];
  }

  // Form Submit Logic: Store Score + Red Flags + Individual Responses
  const form = document.getElementById('burnout-quiz');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Check all questions answered
      const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
      if (answeredQuestions < totalQuestions) {
        alert('Please answer all questions before submitting.');
        return;
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Processing...';
      submitButton.disabled = true;

      // Calculate score and collect red flags
      let totalScore = 0;
      const redFlags = [];
      const allResponses = {};

      for (let i = 1; i <= totalQuestions; i++) {
        const answer = document.querySelector(`input[name="q${i}"]:checked`);
        if (answer) {
          const value = parseInt(answer.value);
          totalScore += value;
          allResponses[`q${i}`] = value;

          // Check for red flags
          if (redFlagQuestions[`q${i}`] && value >= 2) {
            const questionText = redFlagQuestions[`q${i}`];
            const responseLabel = getResponseLabel(value);
            redFlags.push({ 
              question: questionText, 
              response: responseLabel,
              questionId: `q${i}`,
              value: value
            });
          }
        }
      }

      // Enhanced data storage for results page
      try {
        localStorage.setItem('burnoutScore', totalScore);
        localStorage.setItem('redFlags', JSON.stringify(redFlags));
        localStorage.setItem('quizResponses', JSON.stringify(allResponses));
        localStorage.setItem('quizCompletedAt', new Date().toISOString());
        
        // Store domain scores for easy access
        const domainScores = calculateDomainScores(allResponses);
        localStorage.setItem('domainScores', JSON.stringify(domainScores));

        console.log('Quiz data saved successfully', {
          score: totalScore,
          redFlags: redFlags.length,
          domains: domainScores
        });
        
        // Small delay to show processing state
        setTimeout(() => {
          console.log('Firing quiz_completed event'); // ✅ Debug confirmation
          // 🔍 New debug line here
          console.log('typeof gtag:', typeof gtag);
          // GA4 Event
          gtag('event', 'quiz_completed', {
            event_category: 'Quiz',
            event_label: 'Burnout Assessment'
          });
          // Redirect to Results Page (FIXED)
          window.location.href = '/results';
        }, 500);
        
      } catch (error) {
        console.error('Error saving quiz data:', error);
        alert('There was an issue saving your results. Please try again.');
        
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        return;
      }
    });
  }

  // Helper function to calculate domain scores
  function calculateDomainScores(responses) {
    // Domain 1: Questions 1-3 (Exhaustion)
    // Domain 2: Questions 4-6 (Disconnection)  
    // Domain 3: Questions 7-9 (Self-Efficacy Loss)
    // Domain 4: Questions 10-12 (Overcompensation)
    // Domain 5: Questions 13-15 (Systemic Pressure)
    
    const domains = {
      exhaustion: 0,      // q1-q3
      disconnection: 0,   // q4-q6
      selfEfficacy: 0,    // q7-q9
      overcompensation: 0, // q10-q12
      systemicPressure: 0  // q13-q15
    };
    
    const domainNames = Object.keys(domains);
    
    for (let i = 1; i <= 15; i++) {
      const domainIndex = Math.floor((i - 1) / 3);
      const domainName = domainNames[domainIndex];
      const value = responses[`q${i}`] || 0;
      domains[domainName] += value;
    }
    
    return domains;
  }

});
