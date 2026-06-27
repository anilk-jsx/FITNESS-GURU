import React, { useState, useEffect, useCallback } from "react";
import "./FitnessAssessment.css";
import tokenManager from "../utils/tokenManager";
import MemberAssessmentDashboard from "./MemberAssessmentDashboard";

// ─── Dummy assessment generator ───────────────────────────────────────────────
const generateDummyAssessment = (userId, assessmentDate) => ({
  assessment_id: userId * 100 + Math.floor(Math.random() * 99),
  user_id: userId,
  assessment_date: assessmentDate,
  height_cm: (155 + Math.random() * 40).toFixed(1),
  weight_kg: (55 + Math.random() * 50).toFixed(1),
  bmi: (18.5 + Math.random() * 12).toFixed(1),
  blood_pressure_systolic: Math.floor(110 + Math.random() * 30),
  blood_pressure_diastolic: Math.floor(70 + Math.random() * 20),
  resting_heart_rate: Math.floor(60 + Math.random() * 30),
  body_fat_percent: (12 + Math.random() * 20).toFixed(1),
  muscle_mass_kg: (30 + Math.random() * 30).toFixed(1),
  push_up_count: Math.floor(10 + Math.random() * 50),
  plank_hold_time_sec: Math.floor(20 + Math.random() * 120),
  sit_up_count: Math.floor(10 + Math.random() * 50),
  grip_strength_right_kg: (20 + Math.random() * 30).toFixed(1),
  grip_strength_left_kg: (18 + Math.random() * 28).toFixed(1),
  sit_and_reach_cm: (10 + Math.random() * 30).toFixed(1),
  shoulder_flexibility_cm: (5 + Math.random() * 25).toFixed(1),
  waist_circumference_cm: (65 + Math.random() * 30).toFixed(1),
  hip_circumference_cm: (80 + Math.random() * 30).toFixed(1),
  chest_circumference_cm: (85 + Math.random() * 25).toFixed(1),
  arm_circumference_cm: (28 + Math.random() * 12).toFixed(1),
  thigh_circumference_cm: (48 + Math.random() * 20).toFixed(1),
  shoulder_width_cm: (38 + Math.random() * 12).toFixed(1),
  endurance_score: Math.floor(40 + Math.random() * 60),
  flexibility_score: Math.floor(35 + Math.random() * 65),
  overall_fitness_score: Math.floor(45 + Math.random() * 55),
  trainer_comments:
    "Member is progressing well. Consistency in training is key. Focus on improving core strength and cardiovascular endurance in the next cycle.",
  next_assessment_date: new Date(
    new Date(assessmentDate).getTime() + 30 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0],
});

// ─── Utility helpers ───────────────────────────────────────────────────────────
const getBmiCategory = (bmi) => {
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (b < 25) return { label: "Normal", color: "#22c55e" };
  if (b < 30) return { label: "Overweight", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
};

const getFitnessGrade = (score) => {
  const s = parseInt(score);
  if (s >= 85) return { grade: "A+", color: "#22c55e" };
  if (s >= 70) return { grade: "A", color: "#16a34a" };
  if (s >= 55) return { grade: "B", color: "#f59e0b" };
  if (s >= 40) return { grade: "C", color: "#f97316" };
  return { grade: "D", color: "#ef4444" };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getAvatarColor = (name) => {
  const colors = [
    "#667eea", "#764ba2", "#f093fb", "#f5576c",
    "#4facfe", "#43e97b", "#fa709a", "#fee140",
    "#a18cd1", "#fbc2eb",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// ─── Month-year list helper ────────────────────────────────────────────────────
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    });
  }
  return options;
};

// ─── Stat row sub-component ────────────────────────────────────────────────────
const StatRow = ({ label, value, unit = "", highlight = false }) => (
  <div className={`fa-stat-row ${highlight ? "highlight" : ""}`}>
    <span className="fa-stat-label">{label}</span>
    <span className="fa-stat-value">
      {value}
      {unit && <span className="fa-stat-unit"> {unit}</span>}
    </span>
  </div>
);

// ─── Score bar sub-component ───────────────────────────────────────────────────
const ScoreBar = ({ label, score, color }) => (
  <div className="fa-score-bar-wrap">
    <div className="fa-score-bar-header">
      <span>{label}</span>
      <span className="fa-score-num" style={{ color }}>
        {score}/100
      </span>
    </div>
    <div className="fa-score-bar-track">
      <div
        className="fa-score-bar-fill"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  </div>
);

// ─── Assessment detail modal ───────────────────────────────────────────────────
const AssessmentModal = ({ member, assessment, onClose }) => {
  if (!member || !assessment) return null;

  const bmiCat = getBmiCategory(assessment.bmi);
  const grade = getFitnessGrade(assessment.overall_fitness_score);
  const avatarColor = getAvatarColor(member.name);
  const initials = (member.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fa-modal-overlay" onClick={onClose}>
      <div
        className="fa-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Fitness Assessment for ${member.name}`}
      >
        {/* Modal header */}
        <div className="fa-modal-header">
          <div className="fa-modal-header-left">
            <div
              className="fa-modal-avatar"
              style={{ background: avatarColor }}
            >
              {member.profile_picture ? (
                <img src={member.profile_picture} alt={member.name} />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="fa-modal-name">{member.name}</h2>
              <p className="fa-modal-meta">
                <i className="fas fa-envelope" /> {member.email}
                {member.phone && (
                  <>
                    &nbsp;&nbsp;
                    <i className="fas fa-phone" /> {member.phone}
                  </>
                )}
              </p>
              <p className="fa-modal-date">
                <i className="fas fa-calendar-alt" /> Assessment:{" "}
                {formatDate(assessment.assessment_date)}
              </p>
            </div>
          </div>
          <button
            className="fa-modal-close"
            onClick={onClose}
            id="fa-modal-close-btn"
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="fa-modal-body">
          {/* Score bars */}
          <div className="fa-section">
            <h3 className="fa-section-title">
              <i className="fas fa-chart-bar" /> Performance Scores
            </h3>
            <div className="fa-scores-grid">
              <ScoreBar
                label="Overall Fitness"
                score={assessment.overall_fitness_score}
                color={grade.color}
              />
              <ScoreBar
                label="Endurance"
                score={assessment.endurance_score}
                color="#4facfe"
              />
              <ScoreBar
                label="Flexibility"
                score={assessment.flexibility_score}
                color="#f093fb"
              />
            </div>
          </div>

          {/* Body Metrics */}
          <div className="fa-section">
            <h3 className="fa-section-title">
              <i className="fas fa-weight" /> Body Metrics
            </h3>
            <div className="fa-stats-grid">
              <StatRow label="Height" value={assessment.height_cm} unit="cm" />
              <StatRow label="Weight" value={assessment.weight_kg} unit="kg" />
              <StatRow
                label="BMI"
                value={
                  <span style={{ color: bmiCat.color, fontWeight: 700 }}>
                    {assessment.bmi} — {bmiCat.label}
                  </span>
                }
                highlight
              />
              <StatRow
                label="Body Fat"
                value={assessment.body_fat_percent}
                unit="%"
              />
              <StatRow
                label="Muscle Mass"
                value={assessment.muscle_mass_kg}
                unit="kg"
              />
              <StatRow
                label="Resting HR"
                value={assessment.resting_heart_rate}
                unit="bpm"
              />
              <StatRow
                label="Blood Pressure"
                value={`${assessment.blood_pressure_systolic}/${assessment.blood_pressure_diastolic}`}
                unit="mmHg"
              />
            </div>
          </div>

          {/* Strength & Endurance */}
          <div className="fa-section">
            <h3 className="fa-section-title">
              <i className="fas fa-dumbbell" /> Strength &amp; Endurance
            </h3>
            <div className="fa-stats-grid">
              <StatRow
                label="Push-ups"
                value={assessment.push_up_count}
                unit="reps"
              />
              <StatRow
                label="Sit-ups"
                value={assessment.sit_up_count}
                unit="reps"
              />
              <StatRow
                label="Plank Hold"
                value={assessment.plank_hold_time_sec}
                unit="sec"
              />
              <StatRow
                label="Grip Strength (R)"
                value={assessment.grip_strength_right_kg}
                unit="kg"
              />
              <StatRow
                label="Grip Strength (L)"
                value={assessment.grip_strength_left_kg}
                unit="kg"
              />
            </div>
          </div>

          {/* Flexibility */}
          <div className="fa-section">
            <h3 className="fa-section-title">
              <i className="fas fa-running" /> Flexibility
            </h3>
            <div className="fa-stats-grid">
              <StatRow
                label="Sit & Reach"
                value={assessment.sit_and_reach_cm}
                unit="cm"
              />
              <StatRow
                label="Shoulder Flexibility"
                value={assessment.shoulder_flexibility_cm}
                unit="cm"
              />
            </div>
          </div>

          {/* Body Circumferences */}
          <div className="fa-section">
            <h3 className="fa-section-title">
              <i className="fas fa-ruler-combined" /> Body Circumferences
            </h3>
            <div className="fa-stats-grid">
              <StatRow
                label="Waist"
                value={assessment.waist_circumference_cm}
                unit="cm"
              />
              <StatRow
                label="Hip"
                value={assessment.hip_circumference_cm}
                unit="cm"
              />
              <StatRow
                label="Chest"
                value={assessment.chest_circumference_cm}
                unit="cm"
              />
              <StatRow
                label="Arm"
                value={assessment.arm_circumference_cm}
                unit="cm"
              />
              <StatRow
                label="Thigh"
                value={assessment.thigh_circumference_cm}
                unit="cm"
              />
              <StatRow
                label="Shoulder Width"
                value={assessment.shoulder_width_cm}
                unit="cm"
              />
            </div>
          </div>

          {/* Trainer Comments */}
          <div className="fa-section fa-trainer-section">
            <h3 className="fa-section-title">
              <i className="fas fa-comment-dots" /> Trainer Comments
            </h3>
            <p className="fa-trainer-comments">{assessment.trainer_comments}</p>
            <div className="fa-next-assessment">
              <i className="fas fa-calendar-check" />
              <span>
                Next Assessment:{" "}
                <strong>{formatDate(assessment.next_assessment_date)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Member card sub-component ─────────────────────────────────────────────────
const MemberCard = ({ member, assessment, onClick }) => {
  const avatarColor = getAvatarColor(member.name);
  const initials = (member.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const grade = getFitnessGrade(assessment.overall_fitness_score);

  // grade only used for score-bar color reference in overlay — not displayed as text
  return (
    <div
      className="fa-member-card"
      onClick={onClick}
      id={`fa-card-${member.user_id}`}
      tabIndex={0}
      role="button"
      aria-label={`View fitness assessment for ${member.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Full-bleed image / avatar area */}
      <div
        className="fa-card-image"
        style={{
          background: `linear-gradient(145deg, ${avatarColor}ff 0%, ${avatarColor}88 100%)`,
        }}
      >
        {member.profile_picture ? (
          <img
            src={member.profile_picture}
            alt={member.name}
            className="fa-card-img-tag"
          />
        ) : (
          <span className="fa-card-initials">{initials}</span>
        )}


        {/* Hover hint */}
        <div className="fa-card-hover-hint">
          <i className="fas fa-eye" /> View Report
        </div>
      </div>

      {/* Minimal bottom info */}
      <div className="fa-card-overlay">
        <h3 className="fa-card-name">{member.name}</h3>

        <div className="fa-card-score-row">
          <span className="fa-card-score-label">Fitness Score</span>
          <span className="fa-card-score-num">
            {assessment.overall_fitness_score}/100
          </span>
        </div>
        <div className="fa-card-score-track">
          <div
            className="fa-card-score-fill"
            style={{
              width: `${assessment.overall_fitness_score}%`,
              background: `linear-gradient(90deg, #667eea99, #667eea)`,
            }}
          />
        </div>

        <p className="fa-card-date">
          <i className="fas fa-calendar-alt" />{" "}
          {formatDate(assessment.assessment_date)}
        </p>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const FitnessAssessment = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.fitnessguru.org.in";

  const buildApiUrl = (endpoint) => {
    const isLocalhost = API_BASE_URL.includes("localhost");
    const basePath = isLocalhost ? "/fitness-guru/api" : "/api";
    return `${API_BASE_URL}${basePath}/${endpoint}`;
  };

  const monthOptions = generateMonthOptions();

  // ── State ──────────────────────────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  // assessments: { [userId]: assessmentObj }
  const [assessments, setAssessments] = useState({});
  const [selectedPair, setSelectedPair] = useState(null); // { member, assessment }

  // ── Fetch members (real API) ───────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        role: "MEMBER",
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await tokenManager.apiCall(
        buildApiUrl(`users/list?${queryParams}`),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === "success") {
        const memberList = data.users || data.data || [];
        setMembers(memberList);
        setPagination((prev) => ({
          ...prev,
          total: data.meta?.total || data.total || memberList.length,
        }));

        // Generate dummy assessments for each member with selected month
        const [year, month] = selectedMonth.split("-");
        const assessmentDate = `${year}-${month}-15`;
        const dummyMap = {};
        memberList.forEach((m) => {
          dummyMap[m.user_id] = generateDummyAssessment(m.user_id, assessmentDate);
        });
        setAssessments(dummyMap);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMembers();
  }, [selectedMonth]);

  // When month changes, regenerate dummy assessments for existing members
  useEffect(() => {
    if (members.length > 0) {
      const [year, month] = selectedMonth.split("-");
      const assessmentDate = `${year}-${month}-15`;
      const dummyMap = {};
      members.forEach((m) => {
        dummyMap[m.user_id] = generateDummyAssessment(m.user_id, assessmentDate);
      });
      setAssessments(dummyMap);
    }
  }, [selectedMonth]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(searchQuery)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  if (selectedPair) {
    return (
      <MemberAssessmentDashboard 
        member={selectedPair.member} 
        onBack={() => setSelectedPair(null)}
        isAdmin={true}
      />
    );
  }

  return (
    <div className="fa-container">
      {/* Page header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-heartbeat" /> Fitness Assessments
        </h1>
        <p className="admin-page-subtitle">
          Monthly fitness assessment overview for all members
        </p>
      </div>

      {/* Controls bar */}
      <div className="fa-controls-bar">
        {/* Month picker */}
        <div className="fa-filter-group">
          <label htmlFor="fa-month-filter" className="fa-filter-label">
            <i className="fas fa-calendar-alt" /> Assessment Month
          </label>
          <select
            id="fa-month-filter"
            className="fa-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="fa-search-group">
          <i className="fas fa-search fa-search-icon" />
          <input
            id="fa-search-input"
            type="text"
            className="fa-search-input"
            placeholder="Search members by name, email or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="fa-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* Count badge */}
        <div className="fa-count-badge">
          <i className="fas fa-users" />
          <span>
            <strong>{filteredMembers.length}</strong> members
          </span>
        </div>
      </div>

      {/* Note: API not ready banner */}
      <div className="fa-dummy-notice">
        <i className="fas fa-info-circle" />
        <span>
          Assessment data is currently showing <strong>demo values</strong>. The
          Fitness Assessment API will be integrated once available.
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fa-loading">
          <div className="fa-spinner" />
          <p>Loading members…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="fa-error">
          <i className="fas fa-exclamation-triangle" />
          <p>{error}</p>
          <button className="fa-retry-btn" onClick={fetchMembers}>
            <i className="fas fa-redo" /> Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredMembers.length === 0 && (
        <div className="fa-empty">
          <i className="fas fa-clipboard-list" />
          <h3>No members found</h3>
          <p>
            {searchQuery
              ? "No members match your search. Try a different query."
              : "No members are available for the selected month."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filteredMembers.length > 0 && (
        <div className="fa-grid" id="fa-members-grid">
          {filteredMembers.map((member) => {
            const assessment = assessments[member.user_id];
            if (!assessment) return null;
            return (
              <MemberCard
                key={member.user_id}
                member={member}
                assessment={assessment}
                onClick={() => setSelectedPair({ member, assessment })}
              />
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedPair && (
        <AssessmentModal
          member={selectedPair.member}
          assessment={selectedPair.assessment}
          onClose={() => setSelectedPair(null)}
        />
      )}
    </div>
  );
};

export default FitnessAssessment;
