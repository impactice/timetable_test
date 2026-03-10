
import fs from 'fs';
import path from 'path';

// 1. Read the current formatted file
const inputPath = path.resolve(process.cwd(), 'src/data/rawCourses.txt');
const content = fs.readFileSync(inputPath, 'utf-8');

const lines = content.trim().split('\n');

// 2. Split by 2+ spaces (since we just formatted it)
const data = lines.map(line => line.split(/\s{2,}|\t+/));

// 3. Remove column index 7 (Evaluation/강의평)
// Header check
const headers = data[0];
console.log("Old Columns:", headers);
if (headers[7] && headers[7].includes("강의평")) {
    console.log("Removing column 7: ", headers[7]);
}

const newData = data.map(row => {
    // Filter out index 7
    return row.filter((_, index) => index !== 7);
});

// 4. Re-run formatter logic (paddings) to align nicely again
const colCount = newData[0].length;
function getVisualLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
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

const widths = new Array(colCount).fill(0);
newData.forEach(row => {
    row.forEach((col, i) => {
        const len = getVisualLength(col || '');
        if (len > widths[i]) widths[i] = len;
    });
});

const GAP = 4;
const PADDED_WIDTHS = widths.map(w => w + GAP);

const formattedLines = newData.map(row => {
    return row.map((col, i) => {
        return padString(col || '', PADDED_WIDTHS[i]);
    }).join('').trimEnd();
});

fs.writeFileSync(inputPath, formattedLines.join('\n'));
console.log("Removed column and reformatted " + lines.length + " lines.");
