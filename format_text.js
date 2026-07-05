const fs = require('fs');
const text = fs.readFileSync('doc_text.txt', 'utf8');

// Simple formatting: insert newline before common headings and after periods
let formatted = text
  .replace(/CHAPTER/g, '\n\nCHAPTER')
  .replace(/([a-z])([A-Z])/g, '$1\n$2') // Add newline between lowercase followed by uppercase (common in concatenated text)
  .replace(/\. /g, '.\n')
  .replace(/([0-9]\.[0-9])/g, '\n$1'); // Headings like 3.1

fs.writeFileSync('doc_formatted.txt', formatted, 'utf8');
console.log('Formatted text saved to doc_formatted.txt');
