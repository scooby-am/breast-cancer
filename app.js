let currentIndex = 0;
const answers = {};

const titlePage = document.getElementById("titlePage");
const quizPage = document.getElementById("quizPage");
const finishPage = document.getElementById("finishPage");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const questionText = document.getElementById("questionText");
const optionsBox = document.getElementById("optionsBox");
const errorBox = document.getElementById("errorBox");

const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const summaryBox = document.getElementById("summaryBox");
const riskBox = document.getElementById("riskBox");

function visibleQuestions() {
  return questions.filter(q => !q.showIf || q.showIf(answers));
}

function startQuiz() {
  titlePage.classList.add("hidden");
  finishPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  currentIndex = 0;
  renderQuestion();
}

function renderQuestion() {
  errorBox.style.display = "none";

  const vis = visibleQuestions();
  const q = vis[currentIndex];

  progressText.textContent = `Question ${currentIndex + 1} of ${vis.length}`;
  progressBar.style.width = Math.round(((currentIndex + 1) / vis.length) * 100) + "%";

  questionText.textContent = q.text;
  optionsBox.innerHTML = "";

  const saved = answers[q.id];
  q.options.forEach(opt => {
    const label = document.createElement("label");
    label.className = "opt";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "currentQuestion";
    input.value = opt;
    if (saved === opt) input.checked = true;

    const span = document.createElement("span");
    span.textContent = opt;

    label.appendChild(input);
    label.appendChild(span);
    optionsBox.appendChild(label);
  });

  backBtn.disabled = (currentIndex === 0);

  if (currentIndex === vis.length - 1) {
    nextBtn.textContent = "Finish";
  } else {
    nextBtn.textContent = "Next";
  }
}

function getSelectedOption() {
  const selected = document.querySelector('input[name="currentQuestion"]:checked');
  return selected ? selected.value : null;
}

function goNext() {
  const vis = visibleQuestions();
  const q = vis[currentIndex];
  const chosen = getSelectedOption();

  if (!chosen) {
    errorBox.style.display = "block";
    return;
  }

  answers[q.id] = chosen;

  if (q.id === "birth" && chosen !== "Yes") {
    delete answers.firstChild;
    delete answers.breastfed;
  }

  const newVis = visibleQuestions();
  const isLast = (currentIndex === newVis.length - 1);

  if (!isLast) {
    currentIndex++;
    renderQuestion();
  } else {
    showFinish();
  }
}

function goBack() {
  const vis = visibleQuestions();
  const q = vis[currentIndex];
  const chosen = getSelectedOption();
  if (chosen) answers[q.id] = chosen;

  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function calculateScore() {
  let score = 0;

  for (const q of questions) {
    if (q.showIf && !q.showIf(answers)) continue;
    const ans = answers[q.id];
    if (!ans) continue;

    const map = points[q.id];
    if (map && typeof map[ans] === "number") score += map[ans];
  }
  return score;
}

function riskLevel(score) {
  if (score <= 6) return { label: "Low risk (educational)", cls: "low" };
  if (score <= 13) return { label: "Medium risk (educational)", cls: "med" };
  return { label: "High risk (educational)", cls: "high" };
}

async function submitResults(score, riskLabel, answersObj) {
  const payload = {
    timestamp: new Date().toISOString(),
    score: score,
    riskLabel: riskLabel,
    answers: answersObj
  };

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to submit results:", err);
  }
}

function showFinish() {
  quizPage.classList.add("hidden");
  finishPage.classList.remove("hidden");

  const score = calculateScore();
  const r = riskLevel(score);

  submitResults(score, r.label, { ...answers });

  riskBox.innerHTML = `
    <div class="badge ${r.cls}">${r.label}</div>
    <div><strong>Your score:</strong> ${score}</div>
    <p class="small">
      This result is a <strong>school-project scoring system</strong>, not a medical diagnosis.
      If you are worried, please talk to a GP or use the NZ links on this page.
    </p>
  `;

  let html = "<strong>Your answers:</strong><ul>";
  for (const q of questions) {
    const visible = (!q.showIf || q.showIf(answers));
    if (!visible) continue;
    const a = answers[q.id] ?? "(No answer)";
    html += `<li><strong>${q.text}</strong><br>${a}</li>`;
  }
  html += "</ul>";
  summaryBox.innerHTML = html;
}

function restart() {
  for (const key in answers) delete answers[key];
  finishPage.classList.add("hidden");
  quizPage.classList.add("hidden");
  titlePage.classList.remove("hidden");
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", goNext);
backBtn.addEventListener("click", goBack);
restartBtn.addEventListener("click", restart);
