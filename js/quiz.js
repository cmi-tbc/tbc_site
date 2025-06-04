// =============================================
// BURNOUT QUIZ.JS - The Burnout Codex
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
    <div class="modal-overlay" id="legal-modal">
      <div class="modal-content">
        <h2 class="heading--h2 margin-bottom-sm">Before You Begin</h2>
        <p class="text--body margin-bottom-sm">
          This self-assessment is for educational purposes only. It is not medical advice, diagnosis, or treatment. By continuing, you acknowledge that you are responsible for your own well-being and decisions.
        </p>
        <label class="text--body margin-bottom-sm">
          <input type="checkbox" id="legal-acknowledge"> I understand and agree to these terms.
        </label>
        <button class="button button--primary" id="legal-continue" disabled>Continue</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Disable quiz form interaction until accepted
  const form = document.getElementById('burnout-quiz');
  if (form) form.style.pointerEvents = 'none';
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
    if (form) form.style.pointerEvents = 'auto';
  }
});

  // Helper: Get text label for value
  function getResponseLabel(value) {
    const map = { 0: 'Never', 1: 'Rarely', 2: 'Sometimes', 3: 'Often', 4: 'Very Often' };
    return map[value];
  }

  // Form Submit Logic: Store Score + Red Flags
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

      // Calculate score and collect red flags
      let totalScore = 0;
      const redFlags = [];

      for (let i = 1; i <= totalQuestions; i++) {
        const answer = document.querySelector(`input[name="q${i}"]:checked`);
        if (answer) {
          const value = parseInt(answer.value);
          totalScore += value;

          if (redFlagQuestions[`q${i}`] && value >= 2) {
            const questionText = redFlagQuestions[`q${i}`];
            const responseLabel = getResponseLabel(value);
            redFlags.push({ question: questionText, response: responseLabel });
          }
        }
      }

      // Store in localStorage
      const quizData = {
        score: totalScore,
        redFlags: redFlags
      };

      localStorage.setItem('burnoutScore', totalScore);
      localStorage.setItem('redFlags', JSON.stringify(redFlags));

      // Redirect to Results Page
      window.location.href = 'burnout_results_page_rebuild_2025-06-03.html';
    });
  }

});
