
import fs from 'fs';
import path from 'path';

const inputPath = path.resolve(process.cwd(), 'src/data/rawCourses.txt');
const content = fs.readFileSync(inputPath, 'utf-8');

const lines = content.trim().split('\n');

// Parse TSV
const data = lines.map(line => line.split('\t'));

// Check columns length
const headers = data[0];
const colCount = headers.length;

// Helper for visual length (Korean = 2, others = 1)
function getVisualLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        // Hangul ranges
        if ((code >= 0x1100 && code <= 0x11FF) ||
            (code >= 0x3130 && code <= 0x318F) ||
            (code >= 0xAC00 && code <= 0xD7A3)) {
            len += 2;
        } else {
            len += 1;
        }
    }
    return len;
}

function padString(str, width) {
    const visualLen = getVisualLength(str);
    const padLen = width - visualLen;
    return str + ' '.repeat(Math.max(0, padLen));
}

// Calculate max widths
const widths = new Array(colCount).fill(0);

data.forEach(row => {
    row.forEach((col, i) => {
        const len = getVisualLength(col || '');
        if (len > widths[i]) widths[i] = len;
    });
});

// Add some padding (min 4 spaces gap)
const GAP = 4;
const PADDED_WIDTHS = widths.map(w => w + GAP);

// Reformat
const formattedLines = data.map(row => {
    return row.map((col, i) => {
        // Last column doesn't need padding? Well, keeps it clean.
        return padString(col || '', PADDED_WIDTHS[i]);
    }).join('').trimEnd(); // Join with empty because padding includes the gap
});

fs.writeFileSync(inputPath, formattedLines.join('\n'));
console.log("Formatted " + lines.length + " lines.");
