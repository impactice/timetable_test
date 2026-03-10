import type { Course, TimeSlot } from "../types";

export function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

export function isOverlapping(slot1: TimeSlot, slot2: TimeSlot): boolean {
    if (slot1.day !== slot2.day) return false;

    const start1 = parseTime(slot1.startTime);
    const end1 = parseTime(slot1.endTime);
    const start2 = parseTime(slot2.startTime);
    const end2 = parseTime(slot2.endTime);

    // Overlap if (Start1 < End2) AND (Start2 < End1)
    return start1 < end2 && start2 < end1;
}

export function checkConflict(course1: Course, course2: Course): boolean {
    for (const slot1 of course1.timeSlots) {
        for (const slot2 of course2.timeSlots) {
            if (isOverlapping(slot1, slot2)) {
                return true;
            }
        }
    }
    return false;
}

export function hasScheduleConflict(existingCourses: Course[], newCourse: Course): boolean {
    // 1. Check for duplicate Course Name (e.g. unique logical subject)
    if (existingCourses.some(c => c.name === newCourse.name)) {
        return true;
    }
    // 2. Check for Time Conflict
    return existingCourses.some((course) => checkConflict(course, newCourse));
}

// Find all courses from candidates that fit into the current schedule
export function getAvailableCourses(currentSchedule: Course[], candidates: Course[]): Course[] {
    return candidates.filter(candidate => !hasScheduleConflict(currentSchedule, candidate));
}

// Recommend courses based on type (General, Major, Elective)
// Returns top N courses that fit the schedule, prioritizing higher credits or other simple heuristics
export function getRecommendedCourses(
    currentSchedule: Course[],
    candidates: Course[],
    typeFilter: Course['type'] | 'All' = 'All',
    limit: number = 5
): Course[] {
    let available = getAvailableCourses(currentSchedule, candidates);

    // Filter duplicates (some courses might have same ID if data is dirty, but parser handles unique IDs usually)
    // Filter by type
    if (typeFilter !== 'All') {
        available = available.filter(c => c.type === typeFilter);
    }

    // Sort by some heuristic?? For now, just maybe random shuffle or just take first N?
    // Let's sort by Credits descending (fill big rocks first)
    available.sort((a, b) => b.credit - a.credit);

    return available.slice(0, limit);
}

// Plan B: Find alternatives for a specific "target" course that might be missed.
// Returns a list of alternative courses that:
// 1. Have the same type (Major/Elective)
// 2. Do NOT conflict with the *rest* of the schedule (excluding the target course)
// 3. Are NOT the target course itself
export function generatePlanB(
    currentSchedule: Course[],
    targetCourse: Course,
    allCourses: Course[]
): Course[] {
    // 1. The schedule WITHOUT the target course
    const baseSchedule = currentSchedule.filter(c => c.id !== targetCourse.id);

    // 2. Candidates are all courses except the target
    const candidates = allCourses.filter(c => c.id !== targetCourse.id && !currentSchedule.find(sel => sel.id === c.id));

    // 3. Filter candidates that match the type of the target (e.g. if I miss a Major, I want another Major)
    //    And ensure they don't conflict with the base schedule
    const alternatives = candidates.filter(c =>
        c.type === targetCourse.type &&
        !hasScheduleConflict(baseSchedule, c)
    );

    return alternatives;
}
