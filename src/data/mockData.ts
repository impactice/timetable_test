import type { Course } from "../types";

export const MOCK_COURSES: Course[] = [
    {
        id: "c1",
        name: "Data Structures",
        professor: "Dr. Kim",
        department: "Computer Science",
        credit: 3,
        type: "Major",
        timeSlots: [
            { day: "Mon", startTime: "10:30", endTime: "12:00" },
            { day: "Wed", startTime: "10:30", endTime: "12:00" },
        ],
        color: "#FFD700",
    },
    {
        id: "c2",
        name: "Database Systems",
        professor: "Dr. Lee",
        department: "Computer Science",
        credit: 3,
        type: "Major",
        timeSlots: [
            { day: "Tue", startTime: "13:00", endTime: "14:30" },
            { day: "Thu", startTime: "13:00", endTime: "14:30" },
        ],
        color: "#ADD8E6",
    },
    {
        id: "c3",
        name: "Artificial Intelligence",
        professor: "Dr. Park",
        department: "Computer Science",
        credit: 3,
        type: "Major",
        timeSlots: [
            { day: "Mon", startTime: "13:00", endTime: "14:30" },
            { day: "Wed", startTime: "13:00", endTime: "14:30" },
        ],
        color: "#90EE90",
    },
    {
        id: "c4",
        name: "Web Programming",
        professor: "Prof. Choi",
        department: "Computer Science",
        credit: 3,
        type: "Major",
        timeSlots: [
            { day: "Fri", startTime: "09:00", endTime: "12:00" }
        ],
        color: "#FFB6C1",
    },
    {
        id: "e1",
        name: "Intro to Psychology",
        professor: "Dr. Jung",
        department: "Psychology",
        credit: 2,
        type: "General",
        timeSlots: [
            { day: "Tue", startTime: "10:00", endTime: "12:00" },
        ],
        color: "#E0FFFF",
    },
    {
        id: "e2",
        name: "Basic Spanish",
        professor: "Prof. Garcia",
        department: "Languages",
        credit: 2,
        type: "General",
        timeSlots: [
            { day: "Thu", startTime: "15:00", endTime: "17:00" },
        ],
        color: "#F0E68C",
    },
    {
        id: "e3",
        name: "Digital Art",
        professor: "Prof. Art",
        department: "Arts",
        credit: 2,
        type: "General",
        timeSlots: [
            { day: "Mon", startTime: "15:00", endTime: "17:00" }
        ],
        color: "#D8BFD8"
    }
];
