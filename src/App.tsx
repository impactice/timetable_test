import { useState, useMemo } from 'react'
import { TimetableGrid } from './components/TimetableGrid'
import { REAL_COURSES } from './data/parser'
import type { Course } from './types'
import { hasScheduleConflict, getRecommendedCourses, generatePlanB } from './utils/scheduler'
import './App.css'

function App() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'recommend' | 'planB'>('list');
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);
  const [userGrade, setUserGrade] = useState<string>('1');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set(REAL_COURSES.map(c => c.department));
    return Array.from(depts).filter(d => d && d !== "Unknown");
  }, []);

  // Available courses
  const availableCourses = useMemo(() => {
    // Basic filter: not already selected
    let candidates = REAL_COURSES.filter(c => !selectedCourses.find(sel => sel.id === c.id));

    // Department Filter
    if (selectedDept !== 'All') {
      candidates = candidates.filter(c => c.department === selectedDept);
    }
    return candidates;
  }, [selectedCourses, selectedDept]);

  // Recommendations
  const recommendedCourses = useMemo(() => {
    if (activeTab === 'recommend') {
      return getRecommendedCourses(selectedCourses, REAL_COURSES, 'All', 10, userGrade);
    }
    return [];
  }, [selectedCourses, activeTab, userGrade]);

  // Plan B Alternatives
  const planBAlternatives = useMemo(() => {
    if (activeTab === 'planB' && targetCourse) {
      return generatePlanB(selectedCourses, targetCourse, REAL_COURSES);
    }
    return [];
  }, [selectedCourses, targetCourse, activeTab]);

  // ... (handlers same as before) ...
  const handleCourseClick = (course: Course) => {
    setTargetCourse(course);
    setActiveTab('planB');
  };

  const handleRemoveCourse = (course: Course) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
    if (targetCourse?.id === course.id) {
      setTargetCourse(null);
      setActiveTab('list');
    }
  };

  const handleDeleteFromPanel = () => {
    if (targetCourse) {
      handleRemoveCourse(targetCourse);
    }
  };

  const handleSwapCourse = (newCourse: Course) => {
    if (!targetCourse) return;

    // Remove target and add new
    setSelectedCourses(prev => {
      const kept = prev.filter(c => c.id !== targetCourse.id);
      return [...kept, newCourse];
    });

    setTargetCourse(null);
    setActiveTab('list');
    alert(`'${targetCourse.name}' 대신 '${newCourse.name}'으로 변경했습니다!`);
  };

  const handleAddCourse = (course: Course) => {
    // 1. Name Check
    if (selectedCourses.some(c => c.name === course.name)) {
      alert("이미 담은 강의입니다! (학수번호가 달라도 같은 수업은 중복해서 들을 수 없습니다.)");
      return;
    }
    // 2. Time Check
    if (hasScheduleConflict(selectedCourses, course)) {
      alert("시간표가 겹쳐서 담을 수 없습니다!");
      return;
    }
    setSelectedCourses(prev => [...prev, course]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><span>Everytime</span> Clone</h1>
        <p>2026년 1학기 시간표</p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="control-group">
            <span>내 학년:</span>
            <select value={userGrade} onChange={(e) => setUserGrade(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
            </select>
          </div>
          <div className="control-group">
            <span>학과:</span>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="All">전체 보기</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ... main & timetable section identical ... */}
      <main className="main-content">
        <section className="timetable-section">
          <h2>내 시간표</h2>
          <TimetableGrid
            courses={selectedCourses}
            onCourseClick={handleCourseClick}
            onDeleteClick={handleRemoveCourse}
          />
          <p className="hint">시간표의 수업을 클릭하면 대안을 확인하고, <strong>X 버튼</strong>으로 삭제할 수 있습니다.</p>
        </section>

        <aside className="controls-section">
          {/* Tabs */}
          <div className="tab-header">
            <button
              className={activeTab === 'list' ? 'active' : ''}
              onClick={() => setActiveTab('list')}
            >
              강의 목록
            </button>
            <button
              className={activeTab === 'recommend' ? 'active' : ''}
              onClick={() => setActiveTab('recommend')}
            >
              AI 추천 🪄
            </button>
            {/* Hidden Logically, shows when clicked */}
            <button
              className={activeTab === 'planB' ? 'active' : ''}
              style={{ display: activeTab === 'planB' ? 'block' : 'none' }}
            >
              대안 찾기 🔄
            </button>
          </div>

          {/* Tab Content: Course List */}
          {activeTab === 'list' && (
            <div className="course-list">
              {availableCourses.length === 0 ? (
                <p className="empty-msg">해당 학과/조건의 강의가 없습니다.</p>
              ) : (
                availableCourses.map(course => {
                  const isConflict = hasScheduleConflict(selectedCourses, course);
                  const isDupName = selectedCourses.some(c => c.name === course.name);
                  return (
                    <div key={course.id} className={`course-item ${isConflict ? 'conflict' : ''}`}>
                      <div className="course-info">
                        <strong>{course.name}</strong>
                        <span>{course.department} | {course.professor} | {course.credit}학점</span>
                      </div>
                      <button
                        className="add-btn"
                        disabled={isConflict}
                        onClick={() => handleAddCourse(course)}
                      >
                        {isDupName ? '담았음' : (isConflict ? '겹침' : '담기')}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Tab Content: Recommendation */}
          {activeTab === 'recommend' && (
            <div className="recommend-section">
              <div className="filter-controls">
                <label>추천 기준:</label>
                <span>
                  <strong>{userGrade}학년</strong> 맞춤 추천 중
                </span>
              </div>
              <div className="course-list">
                {recommendedCourses.length === 0 ? (
                  <p className="empty-msg">추천할 강의가 없거나 시간표가 꽉 찼습니다!</p>
                ) : (
                  recommendedCourses.map(course => (
                    <div key={course.id} className="course-item recommend-item">
                      <div className="course-info">
                        <strong>{course.name}</strong>
                        <span className="badge">{course.type}</span>
                        <span className="badge" style={{ background: '#e3f2fd' }}>{course.grade === 'A' ? '전체' : `${course.grade}학년`}</span>
                        <span>{course.professor} | {course.credit}학점</span>
                      </div>
                      <button
                        className="add-btn"
                        onClick={() => handleAddCourse(course)}
                      >
                        담기
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Plan B */}
          {activeTab === 'planB' && targetCourse && (
            <div className="recommend-section">
              <div className="plan-b-header">
                <div className="target-course-info">
                  <strong>{targetCourse.name}</strong>
                  <span>이 수업을 놓치셨나요?</span>
                </div>
                <button className="delete-btn" onClick={handleDeleteFromPanel}>
                  그냥 삭제하기 🗑️
                </button>
              </div>

              <div className="plan-b-list-header">
                대안 강의 목록 ({planBAlternatives.length})
              </div>

              <div className="course-list">
                {planBAlternatives.length === 0 ? (
                  <p className="empty-msg">
                    조건에 맞는 대안 강의가 없습니다.<br />
                    (시간이 겹치거나 같은 종류의 수업이 없음)
                  </p>
                ) : (
                  planBAlternatives.map(course => (
                    <div key={course.id} className="course-item plan-b-item">
                      <div className="course-info">
                        <strong>{course.name}</strong>
                        <span>{course.professor} | {course.credit}학점</span>
                      </div>
                      <button
                        className="add-btn swap-btn"
                        onClick={() => handleSwapCourse(course)}
                      >
                        교체하기
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
export default App
