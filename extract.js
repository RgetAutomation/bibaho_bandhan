const fs = require('fs');
const lines = fs.readFileSync('C:/Users/PC/.gemini/antigravity-ide/brain/bf79ec09-c4f5-4c9b-a751-32ef4127ec44/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
let content = '';
for (const line of lines) {
  if (line.includes('bbb-team-main/bbb-team-main/src/app/dashboard/%28admin%29/request/help/helpClient.tsx') && line.includes('Total Lines: 356')) {
    const obj = JSON.parse(line);
    content += `\n\n--- STEP ${obj.step_index} ---\n` + obj.content;
  }
}
fs.writeFileSync('team_helpclient_history.txt', content);
