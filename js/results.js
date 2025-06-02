// =============================================
// RESULTS PAGE LOGIC
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  const quizDataRaw = localStorage.getItem('burnoutQuizData');
  if (!quizDataRaw) {
    alert("No quiz data found. Please complete the assessment first.");
    window.location.href = '/quiz';
    return;
  }

  const quizData = JSON.parse(quizDataRaw);
  const { score, redFlags } = quizData;

  // 1️⃣ Inject Score into Hero
  const scoreElement = document.getElementById('user-score');
  if (scoreElement) {
    scoreElement.textContent = score;
  }

  // 2️⃣ Highlight Score Range Card
  const ranges = [
    { id: 'score-range-0-14', min: 0, max: 14 },
    { id: 'score-range-15-29', min: 15, max: 29 },
    { id: 'score-range-30-44', min: 30, max: 44 },
    { id: 'score-range-45-60', min: 45, max: 60 },
  ];

  ranges.forEach(range => {
    const card = document.getElementById(range.id);
    if (card) {
      if (score >= range.min && score <= range.max) {
        card.classList.add('highlight');
      } else {
        card.classList.remove('highlight');
      }
    }
  });

  // 3️⃣ Populate Red Flags List
  const redFlagList = document.getElementById('red-flag-list');
  if (redFlagList) {
    if (redFlags.length > 0) {
      redFlagList.innerHTML = ''; // Clear placeholder text if any
      redFlags.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.question} → ${item.response}`;
        redFlagList.appendChild(li);
      });
    } else {
      redFlagList.innerHTML = '<li>No critical burnout indicators triggered.</li>';
    }
  }

  // 4️⃣ Show Only the Correct Focused Action Card
  const actionCards = document.querySelectorAll('[id^="action-card-"]');
  actionCards.forEach(card => {
    card.style.display = 'none';
  });

  let actionCardId = '';
  if (score <= 14) actionCardId = 'action-card-0-14';
  else if (score <= 29) actionCardId = 'action-card-15-29';
  else if (score <= 44) actionCardId = 'action-card-30-44';
  else actionCardId = 'action-card-45-60';

  const actionCard = document.getElementById(actionCardId);
  if (actionCard) actionCard.style.display = 'block';
});
