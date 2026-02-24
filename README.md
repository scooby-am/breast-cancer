# Breast Cancer Risk Questionnaire

An educational, anonymous questionnaire to help raise awareness of breast cancer risk factors. **Not medical advice.**

## Project Structure

```
breast-cancer/
├── index.html      # Main HTML structure
├── style.css       # All styles and responsive design
├── questions.js    # Question data, scoring points, Google Apps Script URL
├── app.js          # Application logic, navigation, and submitResults()
└── README.md       # This file
```

## Running Locally

1. Clone or download this repository
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
3. No server required - runs entirely client-side

Alternatively, use a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Deployment via GitHub Pages

1. **Create a GitHub repository**
   - Go to https://github.com/new
   - Name it `breast-cancer-questionnaire` (or any name)
   - Make it Public or Private
   - Click "Create repository"

2. **Upload your files**
   - Click "uploading an existing file"
   - Drag and drop all 5 files (`index.html`, `style.css`, `questions.js`, `app.js`, `README.md`)
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Go to Settings → Pages (in the left sidebar)
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click "Save"
   - Wait 1-2 minutes for deployment

4. **Your site is live**
   - The URL will be: `https://YOUR_USERNAME.github.io/breast-cancer-questionnaire/`
   - Find the exact URL in Settings → Pages

## Setting up Google Sheets Data Collection

To collect anonymous results (timestamp, score, risk label, answers):

### 1. Create the Google Sheet
- Go to https://sheets.new
- Name it "Breast Cancer Questionnaire Results"
- Add headers in row 1: `Timestamp | Score | Risk Label | Answers (JSON)`

### 2. Create the Apps Script
- Click Extensions → Apps Script
- Replace the default code with:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp,
    data.score,
    data.riskLabel,
    JSON.stringify(data.answers)
  ]);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy the Script
- Click Deploy → New deployment
- Type: Web app
- Execute as: Me
- Who has access: Anyone
- Click Deploy
- Copy the Web App URL

### 4. Update Your Code
- Open `questions.js`
- Replace `YOUR_DEPLOYMENT_ID` in the `GOOGLE_APPS_SCRIPT_URL` constant with your actual deployment URL

## Data Privacy

This questionnaire collects:
- Timestamp
- Total score
- Risk level label
- Anonymous answer selections

**Does NOT collect:** name, email, IP address, or any personally identifiable information.

## License

School project - Educational use only.
