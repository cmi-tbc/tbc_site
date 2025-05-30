// ================================
// DOM READY CHECK
// ================================
document.addEventListener('DOMContentLoaded', function() {

    // ================================
    // GLOBAL NAVIGATION
    // ================================
    const navHTML = `
        <header class="site-header">
            <div class="header-container">
                <div class="header-logo">
                    <a href="/">
                        <span class="logo-burnout">THE BURNOUT</span>
                        <span class="logo-codex">CODEX</span>
                    </a>
                </div>
                
                <nav class="header-nav">
                    <ul class="nav-list">
                        <li><a href="/" class="nav-link">Home</a></li>
                        <li><a href="/self-assessment-overview" class="nav-link">About Assessment</a></li>
                        <li><a href="/burnout-self-assessment" class="nav-link">Take Assessment</a></li>
                        <li><a href="#resources" class="nav-link">Resources</a></li>
                    </ul>
                </nav>
                
                <button class="mobile-menu-btn" aria-label="Toggle menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
            
            <nav class="mobile-nav">
                <ul class="mobile-nav-list">
                    <li><a href="/" class="mobile-nav-link">Home</a></li>
                    <li><a href="/self-assessment-overview" class="mobile-nav-link">About Assessment</a></li>
                    <li><a href="/burnout-self-assessment" class="mobile-nav-link">Take Assessment</a></li>
                    <li><a href="#resources" class="mobile-nav-link">Resources</a></li>
                </ul>
            </nav>
        </header>
    `;
    
    // Insert navigation at the very top of the body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // ================================
    // GLOBAL FOOTER
    // ================================
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-wrapper">
                <div class="footer-disclaimer">
                    <p class="footer-text">
                        <strong>Medical Disclaimer:</strong> The information provided on this website is for educational purposes only and is not intended as medical, psychological, or professional advice. Always consult with qualified healthcare providers for mental health concerns.
                    </p>
                </div>
                
                <div class="footer-links">
                    <a href="/privacy-policy" class="footer-link">Privacy Policy</a>
                    <span class="footer-divider">|</span>
                    <a href="/terms-of-use" class="footer-link">Terms of Use</a>
                    <span class="footer-divider">|</span>
                    <a href="/disclaimer" class="footer-link">Medical Disclaimer</a>
                </div>
                
                <div class="footer-copyright">
                    <p class="footer-text">© 2025 The Burnout Codex. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
    
    // Insert footer at the very end of the body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    
    // ================================
    // NAVIGATION FUNCTIONALITY
    // ================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
        
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
            }
        });
    }

    // Set active navigation link
    function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Skip anchor links (like #resources)
        if (link.href.includes('#')) {
            return;
        }
        
        const linkPath = new URL(link.href).pathname;
        
        if (currentPath === linkPath || 
            (currentPath === '/' && linkPath === '/') ||
            (currentPath.includes('burnout-self-assessment') && linkPath.includes('burnout-self-assessment')) ||
            (currentPath.includes('self-assessment-overview') && linkPath.includes('self-assessment-overview'))) {
            link.classList.add('active');
        }
    });
}


    setActiveNavLink();

// ================================
// Burnout Quiz Logic (Local for Now)
// ================================
let responses = {}; // Stores user answers
const totalQuestions = 15;

// Red Flag Questions (Example - adjust as needed)
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
    console.log(`Answer recorded: ${questionId} = ${value}`);
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
  if (document.querySelector('.quiz-progress-container')) return;
  const progressHTML = `
    <div class="quiz-progress-container">
      <div class="quiz-progress">
        <div class="quiz-progress-bar"></div>
      </div>
      <div class="quiz-progress-text">Answered 0 of ${totalQuestions}</div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', progressHTML);
}
createProgressBar();

// Handle form submit
const form = document.getElementById('burnout-quiz');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (Object.keys(responses).length < totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    let totalScore = 0;
    const redFlags = {};

    for (const [questionId, value] of Object.entries(responses)) {
      totalScore += value;
      if (redFlagQuestions[questionId] && value >= 2) {
        redFlags[questionId] = {
          question: redFlagQuestions[questionId],
          response: getResponseLabel(value)
        };
      }
    }

    console.log('Total Score:', totalScore);
    console.log('Red Flags:', redFlags);
    alert(`Your score is ${totalScore}. Red flags: ${Object.keys(redFlags).length}`);

    // Next: Send data to Supabase + redirect to results page
  });
}

// Helper: Get text label for value
function getResponseLabel(value) {
  const map = { 0: 'Never', 1: 'Rarely', 2: 'Sometimes', 3: 'Often', 4: 'Very Often' };
  return map[value];
}
