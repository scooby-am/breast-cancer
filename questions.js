const questions = [
  { id: "age", text: "1) What is your age range?", options: ["17–25", "25–35", "35–45", "45–55", "65–75", "75–85", "85–95", "95–100"] },
  { id: "sex", text: "2) What sex were you assigned at birth?", options: ["Female", "Male", "Prefer not to say"] },
  { id: "exercise", text: "3) Do you exercise often?", options: ["Yes", "Sometimes", "No"] },
  { id: "smoke", text: "4) Do you smoke?", options: ["Yes", "Sometimes", "No"] },
  { id: "alcohol", text: "5) Do you drink alcohol?", options: ["Yes", "Sometimes", "No"] },
  { id: "family", text: "6) Do you know if breast cancer has been or is in your family?", options: ["Yes", "Not sure", "No"] },
  { id: "overweight", text: "7) Are you overweight for your age?", options: ["Yes", "Not sure", "No"] },
  { id: "genetic", text: "8) Are there any known genetic mutations in your family? (e.g. BRCA1 or BRCA2)", options: ["Yes", "Not sure", "No"] },
  { id: "des", text: "9) Have you ever been exposed to diethylstilbestrol (DES)?", options: ["Yes", "Not sure", "No"] },
  { id: "dense", text: "10) Do you have dense breast tissue?", options: ["Yes", "No", "Not sure"] },
  { id: "radiation", text: "11) Did you have previous treatments using radiation on your breasts or chest area?", options: ["Yes", "Maybe", "No"] },
  { id: "menstruation", text: "12) At what age did you start menstruation?", options: ["Under 12", "12–14", "15 or older", "Prefer not to say"] },
  { id: "birth", text: "13) Have you ever been pregnant or given birth?", options: ["Yes", "No", "Prefer not to say"] },

  { id: "firstChild", text: "14) If yes, what age did you have your first child?", options: ["Under 30", "30 or older", "Not applicable"], showIf: (a) => a.birth === "Yes" },
  { id: "breastfed", text: "15) Have you breastfed for more than 6 months?", options: ["Yes", "No", "Not applicable"], showIf: (a) => a.birth === "Yes" },

  { id: "hormones", text: "16) Have you used hormonal contraception or hormone replacement therapy?", options: ["Yes", "No", "Not sure"] },
  { id: "menopause", text: "17) Have you gone through menopause?", options: ["Yes", "No", "Not sure"] },
  { id: "condition", text: "18) Have you ever been diagnosed with a breast condition? (e.g. benign lump, abnormal cells)", options: ["Yes", "No", "Not sure"] },
  { id: "screening", text: "19) Have you ever had a breast screening? (e.g. mammogram, ultrasound)", options: ["Yes", "No", "Not applicable (Too young)"] },
  { id: "selfCheck", text: "20) Do you regularly check your breast or chest area often?", options: ["Yes", "Sometimes", "No"] }
];

const points = {
  age: { "17–25": 0, "25–35": 0, "35–45": 1, "45–55": 2, "65–75": 3, "75–85": 3, "85–95": 3, "95–100": 3 },
  sex: { "Female": 1, "Male": 0, "Prefer not to say": 0 },
  exercise: { "Yes": 0, "Sometimes": 1, "No": 2 },
  smoke: { "No": 0, "Sometimes": 1, "Yes": 2 },
  alcohol: { "No": 0, "Sometimes": 1, "Yes": 2 },
  family: { "No": 0, "Not sure": 1, "Yes": 3 },
  overweight: { "No": 0, "Not sure": 1, "Yes": 2 },
  genetic: { "No": 0, "Not sure": 2, "Yes": 4 },
  des: { "No": 0, "Not sure": 1, "Yes": 2 },
  dense: { "No": 0, "Not sure": 1, "Yes": 2 },
  radiation: { "No": 0, "Maybe": 2, "Yes": 3 },
  menstruation: { "Prefer not to say": 0, "15 or older": 0, "12–14": 1, "Under 12": 2 },
  birth: { "Yes": 0, "No": 1, "Prefer not to say": 0 },
  firstChild: { "Under 30": 0, "30 or older": 1, "Not applicable": 0 },
  breastfed: { "Yes": 0, "No": 1, "Not applicable": 0 },
  hormones: { "No": 0, "Not sure": 1, "Yes": 2 },
  condition: { "No": 0, "Not sure": 1, "Yes": 3 }
};

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRdwDPdxgtT-XROK_rpV7WRgZv-bamkPab9Lq4TPEBGxB5BEmFYa7TW31qLVXdCDLL9g/exec";
