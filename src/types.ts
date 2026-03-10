export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface TimeSlot {
  day: DayOfWeek;
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "10:15"
}

export interface Course {
  id: string;
  name: string;
  professor: string;
  department: string;
  credit: number;
  type: "Major" | "Elective" | "General"; // 전공, 교양, 일반
  timeSlots: TimeSlot[];
  color?: string; // Hex code for UI
  grade?: string; // e.g. "1", "2", "A"
}

export interface Schedule {
  id: string;
  courses: Course[];
}
