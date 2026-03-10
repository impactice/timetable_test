import type { Course, TimeSlot, DayOfWeek } from "../types";

// Raw Text Data (imported or pasted)
import rawData from "./rawCourses.txt?raw";

const DAY_MAP: Record<string, DayOfWeek> = {
    "월": "Mon",
    "화": "Tue",
    "수": "Wed",
    "목": "Thu",
    "금": "Fri",
    "토": "Sat",
    "일": "Sun",
};

// Assuming period 1 starts at 9:00, 50 min class + 10 min break? 
// Or strict hours? 
// Standard Korean Univ: 1 Period = 09:00 - 09:50 usually.
// Or 09:00 ~ 10:00 (full hour).
// Let's go with full hour for simplicity until user corrects us.
// Period 1 = 09:00 ~ 10:00
// Period 2 = 10:00 ~ 11:00
const START_HOUR_BASE = 8; // So Period 1 (8+1 = 9)

function parsePeriod(periodStr: string): { start: string, end: string } {
    const p = parseInt(periodStr, 10);
    const startH = START_HOUR_BASE + p;
    const endH = startH + 1;

    // Formatting HH:mm
    const toTime = (h: number) => `${h.toString().padStart(2, '0')}:00`;

    return {
        start: toTime(startH),
        end: toTime(endH)
    };
}

export function parseRawData(text: string): Course[] {
    const lines = text.trim().split('\n');
    const courses: Course[] = [];

    // Skip header if it exists (check first line for "학년")
    const startIndex = lines[0].includes("학년") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Columns are separated by 2 or more spaces (or tab)
        // Regex: /\s{2,}|\t+/
        const cols = line.split(/\s{2,}|\t+/);

        // Some columns might be empty at the end?
        // Note: formatted file might not have empty gaps if we pad correctly.
        // But if a field was empty in the middle? 
        // My formatter pads the EMPTY string, so it becomes just spaces.
        // And split by 2 spaces will treat that 'pad' as delimiter?
        // Wait. If I have "Data" "    " "Data", the middle is empty.
        // If my formatter writes spaces for empty column, e.g. "   ", 
        // split(/\s{2,}/) will eat the "   " as a separator!
        // This effectively skips empty columns.
        // This is bad for "Professor" if it is empty? Or "Note"?
        // Most columns in rawCourses.txt seem populated or at least we want them relative indices.

        // Let's rely on mapped indices.
        // If "Note" is empty, does it matter?
        // The original TSV preserved empty slots.
        // My formatter pads empty strings too.
        // So "   " (3 spaces) between Col A and Col C.
        // split by 2 spaces will see ONE separator. 
        // So Col B is lost? Yes.

        // BETTER: Use fixed width parsing? No, user might edit it.
        // Let's trust that the formatter puts ENOUGH spaces.
        // Actually, if a column is empty, e.g. "    " (4 spaces), and I split by 2 spaces...
        // it parses as a delimiter.

        // Alternative: Use a specific separator like " | "??
        // User asked for "Just nicely organized".
        // Maybe I can just use tabs again, but rely on the editor to show them?
        // No, user specifically said "Make it organized so lines align".

        // Let's update the formatter to use "   |   " or something?
        // Or assume fields are never empty? "Remarks" can be empty.
        // If I skip empty remarks, index shifts. "Department" is last.
        // If "Remarks" is missing, Dept becomes Remarks.

        // Solution: Use a safer delimiter in the formatter?
        // The user just wants to SEE it clearly.
        // If I make it a markdown table? START_ROW | COL | COL ...
        // Then split by "|".
        // That looks good and is robust.

        // Let's update parser.ts assuming I will change the formatter to use Markdown style.
        // Or just pipe symbol.

        // I will change the formatter first in the next step to use "|" separator.
        // But I already wrote the formatter to use spaces.
        // I should update parser to `split(/\s{2,}/)` and handle shifting indices?
        // Or re-write formatter.
        // I'll re-write formatter to use ` | ` separator for robustness.

        if (cols.length < 7) continue;

        // Expected Columns (After removing 'Evaluation'):
        // 0: 학년 (Grade)
        // 1: 이수구분 (Type)
        // 2: 학수분반 (ID)
        // 3: 교과목명 (Name)
        // 4: 학점 (Credit)
        // 5: 강의시간 (Time)
        // 6: 담당교수 (Professor)
        // 7: 담은 인원
        // 8: 수강대상
        // 9: 비고
        // 10: 학과 (Department)

        // Department is the last column
        const department = cols[cols.length - 1]; 
        
        const grade = cols[0].trim();
        const id = cols[2].trim();
        const name = cols[3].trim();
        const credit = parseInt(cols[4], 10) || 0;
        const timeStr = cols[5].trim();
        const professor = cols[6].trim();
        
        // Type logic
        const typeRaw = cols[1].trim();
        let type: Course['type'] = "General";
        if (typeRaw.includes("전공")) type = "Major";
        if (typeRaw.includes("교양")) type = "Elective";

        // Parse Time Slots
        const timeRegex = /([월화수목금토일])(\d{2})/g;
        let match;
        const timeSlots: TimeSlot[] = [];

        while ((match = timeRegex.exec(timeStr)) !== null) {
            const dayKor = match[1];
            const periodStr = match[2];
            const day = DAY_MAP[dayKor];

            if (day) {
                const { start, end } = parsePeriod(periodStr);
                timeSlots.push({
                    day,
                    startTime: start,
                    endTime: end
                });
            }
        }

        // Everytime-ish Pastel Palette
        const colors = [
            "#F2E8E8", // Light Pinkish
            "#FFF4E6", // Light Orange
            "#FFF9DB", // Light Yellow
            "#E6FCF5", // Mint
            "#E3FAFC", // Light Cyan
            "#E7F5FF", // Light Blue
            "#F3F0FF", // Light Lavender
            "#F8F0FC", // Light Purple
            "#FFEC99", // Vivid Yellow
            "#FFC9C9", // Vivid Pink
        ];
        const color = colors[courses.length % colors.length];

        courses.push({
            id,
            name,
            professor,
            department,
            credit,
            type,
            timeSlots,
            color,
            grade
        });
    }

    return courses;
}

export const REAL_COURSES = parseRawData(rawData);
