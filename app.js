let currentIndex = 0;
const answers = {};
let hasConsent = false;
let latestResult = null;

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
const printLetterBtn = document.getElementById("printLetterBtn");
const downloadTextLetterBtn = document.getElementById("downloadTextLetterBtn");

const consentYesBtn = document.getElementById("consentYesBtn");
const consentNoBtn = document.getElementById("consentNoBtn");
const consentMessage = document.getElementById("consentMessage");

const summaryBox = document.getElementById("summaryBox");
const riskBox = document.getElementById("riskBox");

function visibleQuestions() {
  return questions.filter(q => !q.showIf || q.showIf(answers));
}

function setConsent(value) {
  hasConsent = value;

  startBtn.disabled = !value;
  consentMessage.classList.toggle("hidden", value);

  consentYesBtn.classList.toggle("selectedConsent", value === true);
  consentNoBtn.classList.toggle("selectedConsent", value === false);
}

function startQuiz() {
  if (!hasConsent) {
    consentMessage.classList.remove("hidden");
    return;
  }

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

  if (chosen) {
    answers[q.id] = chosen;
  }

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
    if (map && typeof map[ans] === "number") {
      score += map[ans];
    }
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
      body: JSON.stringify(payload)
    });

    console.log("Submitted to Google Sheet (request sent).");
  } catch (err) {
    console.error("Failed to submit results:", err);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNzDate(date) {
  return date.toLocaleDateString("en-NZ", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getRiskMessage(riskLabel) {
  if (riskLabel.includes("High")) {
    return "The questionnaire result was HIGH RISK using an educational scoring system. Please review the answers and advise whether further assessment, examination, imaging, screening advice, or referral is needed.";
  }

  if (riskLabel.includes("Medium")) {
    return "The questionnaire result was MEDIUM RISK using an educational scoring system. Please discuss breast health awareness, screening eligibility, family history, symptoms, and any next steps.";
  }

  return "The questionnaire result was LOW RISK using an educational scoring system. Please still discuss any symptoms, concerns, or screening eligibility where relevant.";
}

function visibleQuestionsForResult() {
  if (!latestResult) return [];
  return questions.filter(q => !q.showIf || q.showIf(latestResult.answers));
}

function buildLetterHtml() {
  if (!latestResult) return "";

  const date = formatNzDate(latestResult.completedAt);
  const riskMessage = getRiskMessage(latestResult.riskLabel);

  const answerRows = visibleQuestionsForResult()
    .map(q => {
      const answer = latestResult.answers[q.id] || "Not answered";
      return `
        <tr>
          <th>${escapeHtml(q.text)}</th>
          <td>${escapeHtml(answer)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Breast Health Questionnaire Summary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #111827;
          line-height: 1.5;
          padding: 32px;
          max-width: 850px;
          margin: auto;
        }
        h1 {
          color: #c2185b;
          margin-bottom: 4px;
        }
        h2 {
          margin-top: 24px;
        }
        .notice {
          background: #fff1f5;
          border: 1px solid #f8b4c4;
          border-radius: 10px;
          padding: 14px;
          margin: 16px 0;
        }
        .risk {
          font-size: 18px;
          font-weight: bold;
          margin: 16px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 14px;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          vertical-align: top;
          text-align: left;
        }
        th {
          width: 45%;
          background: #f8fafc;
        }
        .small {
          font-size: 13px;
          color: #475569;
        }
      </style>
    </head>
    <body>
      <h1>Breast Health Questionnaire Summary</h1>
      <p class="small">Generated on ${escapeHtml(date)}</p>

      <div class="notice">
        <strong>Important:</strong>
        This summary is from a school-project educational questionnaire. It is not a diagnosis and does not replace medical advice.
      </div>

      <p>Dear healthcare professional,</p>

      <p>
        This person has completed a breast health risk questionnaire and may wish to discuss their result with a GP, nurse,
        or other qualified healthcare provider.
      </p>

      <p class="risk">Questionnaire result: ${escapeHtml(latestResult.riskLabel)}</p>
      <p><strong>Score:</strong> ${escapeHtml(latestResult.score)}</p>

      <p>${escapeHtml(riskMessage)}</p>

      <h2>Support needs</h2>
      <p>
        The patient may benefit from plain-language explanation, interpreter support, help understanding screening options,
        or advice about low-cost healthcare support if cost is a barrier.
      </p>

      <h2>Answers provided</h2>
      <table>
        ${answerRows}
      </table>

      <h2>Suggested discussion points</h2>
      <ul>
        <li>Any breast or chest symptoms, including new changes.</li>
        <li>Family history or known genetic risk.</li>
        <li>Screening eligibility and whether a mammogram or other assessment is appropriate.</li>
        <li>Any barriers to accessing care, including cost, language, transport, or confidence speaking to a doctor.</li>
      </ul>

      <p class="small">
        This letter is intended to support communication only. Please use clinical judgement and current New Zealand health guidance.
      </p>
    </body>
    </html>
  `;
}

function printLetter() {
  const letterHtml = buildLetterHtml();
  if (!letterHtml) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups so the letter can open for printing or saving as PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(letterHtml);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}

function downloadTextLetter() {
  if (!latestResult) return;

  const date = formatNzDate(latestResult.completedAt);
  const riskMessage = getRiskMessage(latestResult.riskLabel);

  const answersText = visibleQuestionsForResult()
    .map(q => {
      const answer = latestResult.answers[q.id] || "Not answered";
      return `${q.text}\nAnswer: ${answer}`;
    })
    .join("\n\n");

  const text = `
Breast Health Questionnaire Summary
Generated on: ${date}

Important:
This summary is from a school-project educational questionnaire. It is not a diagnosis and does not replace medical advice.

Dear healthcare professional,

This person has completed a breast health risk questionnaire and may wish to discuss their result with a GP, nurse, or other qualified healthcare provider.

Questionnaire result: ${latestResult.riskLabel}
Score: ${latestResult.score}

${riskMessage}

Support needs:
The patient may benefit from plain-language explanation, interpreter support, help understanding screening options, or advice about low-cost healthcare support if cost is a barrier.

Answers provided:

${answersText}

Suggested discussion points:
- Any breast or chest symptoms, including new changes.
- Family history or known genetic risk.
- Screening eligibility and whether a mammogram or other assessment is appropriate.
- Any barriers to accessing care, including cost, language, transport, or confidence speaking to a doctor.

This letter is intended to support communication only. Please use clinical judgement and current New Zealand health guidance.
`.trim();

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "breast-health-questionnaire-summary.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function showFinish() {
  quizPage.classList.add("hidden");
  finishPage.classList.remove("hidden");

  const score = calculateScore();
  const r = riskLevel(score);

  latestResult = {
    score,
    riskLabel: r.label,
    riskClass: r.cls,
    answers: { ...answers },
    completedAt: new Date()
  };

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
    html += `<li><strong>${escapeHtml(q.text)}</strong><br>${escapeHtml(a)}</li>`;
  }
  html += "</ul>";
  summaryBox.innerHTML = html;
}

function restart() {
  for (const key in answers) {
    delete answers[key];
  }

  finishPage.classList.add("hidden");
  quizPage.classList.add("hidden");
  titlePage.classList.remove("hidden");

  currentIndex = 0;
  latestResult = null;
  setConsent(false);
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", goNext);
backBtn.addEventListener("click", goBack);
restartBtn.addEventListener("click", restart);
printLetterBtn.addEventListener("click", printLetter);
downloadTextLetterBtn.addEventListener("click", downloadTextLetter);

consentYesBtn.addEventListener("click", () => setConsent(true));
consentNoBtn.addEventListener("click", () => setConsent(false));

setConsent(false);
