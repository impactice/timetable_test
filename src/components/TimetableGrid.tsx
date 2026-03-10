import React from 'react';
import type { Course, DayOfWeek } from '../types';
import { parseTime } from '../utils/scheduler';
import './TimetableGrid.css';

interface TimetableGridProps {
    courses: Course[];
    previewCourse?: Course | null;
    onCourseClick: (course: Course) => void;
    onDeleteClick?: (course: Course) => void;
}

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const START_HOUR = 9;
const END_HOUR = 22; // Extended to 10 PM to match typical university schedules better
const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

export const TimetableGrid: React.FC<TimetableGridProps> = ({ courses, previewCourse, onCourseClick, onDeleteClick }) => {

    const getSlotStyle = (day: DayOfWeek, startTime: string, endTime: string, color: string = '#ddd') => {
        const startMin = parseTime(startTime);
        const endMin = parseTime(endTime);
        const dayIndex = DAYS.indexOf(day); // 0-4

        const baseMin = START_HOUR * 60;
        const startRow = Math.floor((startMin - baseMin) / 30) + 2;
        const durationMin = endMin - startMin;
        const span = Math.ceil(durationMin / 30);
        const endRow = startRow + span;

        const colIndex = dayIndex + 2;

        return {
            gridColumn: colIndex,
            gridRow: `${startRow} / ${endRow}`,
            backgroundColor: color,
        };
    };

    return (
        <div className="timetable-container" style={{ position: 'relative' }}>
            <div className="timetable-grid" style={{ gridTemplateColumns: '40px repeat(5, 1fr) 60px' }}>
                {/* 1. Header Row */}
                <div className="grid-header-corner"></div>
                {DAYS.map((day, i) => (
                    <div key={day} className="grid-header-day" style={{ gridColumn: i + 2 }}>
                        {day}
                    </div>
                ))}
                <div className="grid-header-corner" style={{ gridColumn: 7 }}></div>

                {/* Vertical Lines */}
                {DAYS.map((day, i) => (
                    <div key={`col-${day}`} className="grid-day-col" style={{ gridColumn: i + 2, gridRow: '2 / -1' }}></div>
                ))}
                <div className="grid-day-col" style={{ gridColumn: 7, gridRow: '2 / -1', borderLeft: '1px solid #e3e3e3' }}></div>

                {/* Rows for Time/Periods */}
                {TIME_SLOTS.map(hour => {
                    const rowStart = (hour - START_HOUR) * 2 + 2;
                    return (
                        <React.Fragment key={hour}>
                            {/* Left: Period Label (e.g. 1교시) */}
                            {/* Assumption: 9am = 1교시 */}
                            <div className="grid-period-label" style={{ gridRow: `${rowStart} / span 2` }}>
                                {hour - 8}교시
                            </div>

                            {/* Horizontal Lines */}
                            <div className="grid-line" style={{ gridRow: rowStart, gridColumn: '2 / 8' }}></div>
                            <div className="grid-line-half" style={{ gridRow: rowStart + 1, gridColumn: '2 / 8' }}></div>

                            {/* Right: Time Label (e.g. 오전 9시) */}
                            <div className="grid-time-label" style={{ gridRow: `${rowStart} / span 2`, gridColumn: 7, justifyContent: 'center' }}>
                                {hour > 12 ? `오후 ${hour - 12}시` : `오전 ${hour}시`}
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Course Blocks */}
                {courses.map(course => (
                    course.timeSlots.map((slot, idx) => (
                        DAYS.includes(slot.day) && (
                            <div
                                key={`${course.id}-${idx}`}
                                className="course-block"
                                style={getSlotStyle(slot.day, slot.startTime, slot.endTime, course.color)}
                                onClick={() => onCourseClick(course)}
                            >
                                <div className="course-name">{course.name}</div>
                                <div className="course-prof">{course.professor}</div>
                                <button
                                    className="delete-btn-x"
                                    onClick={(e) => {
                                        // Critical: Stop propagation to prevent 'onCourseClick' (Plan B)
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onDeleteClick) {
                                            onDeleteClick(course);
                                        }
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )
                    ))
                ))}
            </div>

            {/* Floating Action Buttons */}
            <div className="floating-actions" style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0'
            }}>
                <button style={{
                    background: '#c62917',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px 0 0 25px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }} onClick={() => alert("검색 기능은 준비 중입니다!")}>
                    🔍 수업 목록에서 검색
                </button>
                <button style={{
                    background: '#c62917',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '0 25px 25px 0',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }} onClick={() => alert("직접 추가 기능은 준비 중입니다!")}>
                    + 직접 추가
                </button>
            </div>
        </div>
    );
};
