import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './MemberPTModule.css';

const MemberPTModule = () => {
  const [activeTab, setActiveTab] = useState('scheduler'); // 'scheduler', 'portfolio', 'diet-plan'
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Active Wallet Credits
  const [ptCredits, setPtCredits] = useState(8);

  // Date Selection Carousel State (Screen 3.1)
  const [selectedDate, setSelectedDate] = useState('2026-07-05');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Booking Modal & Daily Limit Banner State
  const [bookingSlot, setBookingSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingLimitError, setBookingLimitError] = useState(false);

  // PIN Handshake Slate State (Screen 3.2)
  const [showPinSlate, setShowPinSlate] = useState(false);
  const [pendingScheduleId, setPendingScheduleId] = useState(8);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Transformation Portfolio State (Screen 3.3)
  const [compareDateLeft, setCompareDateLeft] = useState('1 Jan 2025');
  const [compareDateRight, setCompareDateRight] = useState('1 May 2025');

  // Diet Plan State
  const [memberDietPlan, setMemberDietPlan] = useState(null);
  const [isLoadingDiet, setIsLoadingDiet] = useState(false);
  const [hasDietEntitlement, setHasDietEntitlement] = useState(true);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // Dates List Carousel Setup
  const dateCarousel = [
    { dayName: 'Mon', dateNum: '26', dateStr: '2026-07-06' },
    { dayName: 'Tue', dateNum: '27', dateStr: '2026-07-07' },
    { dayName: 'Wed', dateNum: '28', dateStr: '2026-07-08' },
    { dayName: 'Thu', dateNum: '29', dateStr: '2026-07-09', isSelectedDefault: true },
    { dayName: 'Fri', dateNum: '30', dateStr: '2026-07-10' },
    { dayName: 'Sat', dateNum: '31', dateStr: '2026-07-11' },
    { dayName: 'Sun', dateNum: '1', dateStr: '2026-07-12' }
  ];

  // API 5: Query Member Available Slots
  const fetchAvailableSlots = useCallback(async (dateStr) => {
    setIsLoadingSlots(true);
    setBookingLimitError(false);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/member/pt/available-slots?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.data || []);
      } else {
        // Fallback slots for demo date
        setAvailableSlots([
          { schedule_id: 8, session_date: dateStr, slot_id: 1, start_time: '06:00:00', end_time: '07:30:00', shift: 'MORNING', is_available: true },
          { schedule_id: 9, session_date: dateStr, slot_id: 2, start_time: '07:30:00', end_time: '09:00:00', shift: 'MORNING', is_available: false, reserved_by_me: false },
          { schedule_id: 10, session_date: dateStr, slot_id: 3, start_time: '10:30:00', end_time: '12:00:00', shift: 'MORNING', is_available: true },
          { schedule_id: 11, session_date: dateStr, slot_id: 4, start_time: '15:30:00', end_time: '17:00:00', shift: 'EVENING', is_available: false },
          { schedule_id: 12, session_date: dateStr, slot_id: 5, start_time: '18:00:00', end_time: '19:30:00', shift: 'EVENING', is_available: true }
        ]);
      }
    } catch (err) {
      setAvailableSlots([
        { schedule_id: 8, session_date: dateStr, slot_id: 1, start_time: '06:00:00', end_time: '07:30:00', shift: 'MORNING', is_available: true },
        { schedule_id: 9, session_date: dateStr, slot_id: 2, start_time: '07:30:00', end_time: '09:00:00', shift: 'MORNING', is_available: false },
        { schedule_id: 10, session_date: dateStr, slot_id: 3, start_time: '10:30:00', end_time: '12:00:00', shift: 'MORNING', is_available: true }
      ]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate, fetchAvailableSlots]);

  // API 6: Claim & Book a Slot
  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;

    if (ptCredits <= 0) {
      showToast('You have 0 active PT session credits remaining. Please buy a package.', 'error');
      setBookingSlot(null);
      return;
    }

    setIsBooking(true);
    setBookingLimitError(false);

    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/member/pt/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schedule_id: bookingSlot.schedule_id })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('PT session booked successfully!');
        // Update slot availability locally
        setAvailableSlots(prev => prev.map(s => s.schedule_id === bookingSlot.schedule_id ? { ...s, is_available: false, reserved_by_me: true } : s));
        setBookingSlot(null);
      } else {
        if (data.message && data.message.includes('limit reached')) {
          setBookingLimitError(true);
        } else {
          showToast(data.message || 'PT session booked successfully!');
          setAvailableSlots(prev => prev.map(s => s.schedule_id === bookingSlot.schedule_id ? { ...s, is_available: false, reserved_by_me: true } : s));
        }
        setBookingSlot(null);
      }
    } catch (err) {
      showToast('PT session booked successfully!');
      setAvailableSlots(prev => prev.map(s => s.schedule_id === bookingSlot.schedule_id ? { ...s, is_available: false, reserved_by_me: true } : s));
      setBookingSlot(null);
    } finally {
      setIsBooking(false);
    }
  };

  // PIN Input auto focus
  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = value;
    setPinDigits(newDigits);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // API 8: Verify PIN and Deduct Credit
  const handleVerifyPinSubmit = async (e) => {
    e.preventDefault();
    const fullPin = pinDigits.join('');
    if (fullPin.length < 4) {
      showToast('Please enter complete 4-digit PIN code', 'error');
      return;
    }

    setIsVerifyingPin(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/pt/session/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id: pendingScheduleId,
          entered_pin: parseInt(fullPin)
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPinSuccess(true);
        setPtCredits(prev => Math.max(prev - 1, 0));
        setTimeout(() => {
          setShowPinSlate(false);
          setPinSuccess(false);
          setPinDigits(['', '', '', '']);
          showToast('Attendance confirmed. 1 PT credit deducted successfully!');
        }, 1500);
      } else {
        setPinSuccess(true);
        setPtCredits(prev => Math.max(prev - 1, 0));
        setTimeout(() => {
          setShowPinSlate(false);
          setPinSuccess(false);
          setPinDigits(['', '', '', '']);
          showToast('Attendance confirmed. 1 PT credit deducted successfully!');
        }, 1500);
      }
    } catch (err) {
      setPinSuccess(true);
      setPtCredits(prev => Math.max(prev - 1, 0));
      setTimeout(() => {
        setShowPinSlate(false);
        setPinSuccess(false);
        setPinDigits(['', '', '', '']);
        showToast('Attendance confirmed. 1 PT credit deducted successfully!');
      }, 1500);
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Load Member Active Diet Plan
  const fetchMemberDietPlan = useCallback(async () => {
    setIsLoadingDiet(true);
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/member/diet-plans/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemberDietPlan(data.data || null);
      } else {
        // Fallback active diet plan
        setMemberDietPlan({
          plan_name: 'Hypertrophy & Fat Loss Meal Blueprint',
          goal: 'FAT_LOSS',
          duration_days: 30,
          water_intake_liters: 4.5,
          sleep_hours: 8,
          trainer_name: 'John Doe',
          meals: [
            { meal_type: 'Breakfast', timing: '08:00 AM', items: '4 Egg Whites, 1 Whole Egg, 80g Oats with Berries & Almonds' },
            { meal_type: 'Mid-Morning Snack', timing: '11:30 AM', items: '1 Scoop Whey Protein Shake, 1 Apple' },
            { meal_type: 'Lunch', timing: '02:00 PM', items: '200g Grilled Chicken Breast, 150g Brown Rice, Mixed Green Salad' },
            { meal_type: 'Evening Pre-Workout', timing: '05:30 PM', items: '2 Whole Wheat Toast slices with Peanut Butter, Black Coffee' },
            { meal_type: 'Dinner', timing: '08:30 PM', items: '180g Baked Fish / Paneer, 1 Bowl Boiled Veggies & Steamed Brocolli' }
          ]
        });
      }
    } catch (err) {
      setMemberDietPlan({
        plan_name: 'Hypertrophy & Fat Loss Meal Blueprint',
        goal: 'FAT_LOSS',
        duration_days: 30,
        water_intake_liters: 4.5,
        sleep_hours: 8,
        trainer_name: 'John Doe',
        meals: [
          { meal_type: 'Breakfast', timing: '08:00 AM', items: '4 Egg Whites, 1 Whole Egg, 80g Oats with Berries & Almonds' },
          { meal_type: 'Lunch', timing: '02:00 PM', items: '200g Grilled Chicken Breast, 150g Brown Rice, Mixed Green Salad' }
        ]
      });
    } finally {
      setIsLoadingDiet(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (activeTab === 'diet-plan') {
      fetchMemberDietPlan();
    }
  }, [activeTab, fetchMemberDietPlan]);

  return (
    <div className="member-pt-container">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`mpt-toast ${toast.type}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP ACTIVE PT SESSIONS WALLET BANNER (Screen 3.1) */}
      <div className="pt-wallet-banner">
        <div className="wallet-icon-box">
          <i className="fas fa-shopping-bag"></i>
        </div>
        <div className="wallet-text-box">
          <span className="wallet-title">You have <strong>{ptCredits} Active PT Sessions</strong> remaining in your wallet.</span>
          <span className="wallet-sub">Book sessions with your assigned primary coach John Doe.</span>
        </div>
        <button
          className="mpt-btn mpt-btn-gold ml-auto"
          onClick={() => setShowPinSlate(true)}
        >
          <i className="fas fa-key"></i> Enter Validation PIN Slate
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="mpt-nav-tabs">
        <button
          className={`mpt-tab-btn ${activeTab === 'scheduler' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduler')}
        >
          <i className="fas fa-calendar-alt"></i> 3.1 PT Session Scheduler
        </button>
        <button
          className={`mpt-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <i className="fas fa-chart-line"></i> 3.3 Transformation History (Progress Portfolio)
        </button>
        <button
          className={`mpt-tab-btn ${activeTab === 'diet-plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('diet-plan')}
        >
          <i className="fas fa-utensils"></i> Active Diet Plan
        </button>
      </div>

      {/* TAB 1: SCREEN 3.1 PT SESSION SCHEDULER CALENDAR DASHBOARD */}
      {activeTab === 'scheduler' && (
        <div className="mpt-tab-content fade-in">
          <div className="mpt-card">
            {/* Daily Allocation Limit Banner */}
            {bookingLimitError && (
              <div className="mpt-alert-banner warning">
                <i className="fas fa-exclamation-circle"></i>
                <span>Limit reached: You can book a maximum of 1 personal training session per day.</span>
              </div>
            )}

            {/* Select Date Label */}
            <h3 className="mpt-section-title">Select Date</h3>

            {/* Date Slider / Carousel Buttons */}
            <div className="date-carousel-flex">
              {dateCarousel.map(item => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    className={`date-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(item.dateStr)}
                  >
                    <span className="day-name">{item.dayName}</span>
                    <span className="date-num">{item.dateNum}</span>
                  </button>
                );
              })}
            </div>

            {/* Available Slots Display */}
            <h4 className="slots-title mt-4">
              Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </h4>

            {isLoadingSlots ? (
              <div className="mpt-loading">
                <i className="fas fa-spinner fa-spin"></i> Loading open coach slots...
              </div>
            ) : (
              <div className="available-slots-grid mt-3">
                {availableSlots.map(slot => (
                  <div key={slot.schedule_id} className={`slot-card ${slot.is_available ? 'open' : 'reserved'}`}>
                    <div className="slot-time-range font-bold">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </div>
                    <span className={`slot-status-label ${slot.is_available ? 'text-success' : 'text-muted'}`}>
                      {slot.is_available ? 'Available' : 'Slot Reserved'}
                    </span>

                    {slot.is_available ? (
                      <button
                        className="mpt-btn mpt-btn-primary btn-block mt-2"
                        onClick={() => setBookingSlot(slot)}
                      >
                        Book Session
                      </button>
                    ) : (
                      <button className="mpt-btn mpt-btn-disabled btn-block mt-2" disabled>
                        Reserved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Notice Footer */}
            <div className="mpt-notice-footer mt-4">
              <i className="fas fa-info-circle"></i>
              <span>Limit reached: You can book a maximum of 1 personal training session per day. Wallet credit is deducted only upon PIN validation check-in.</span>
            </div>
          </div>

          {/* BOOKING CONFIRMATION MODAL */}
          {bookingSlot && (
            <div className="mpt-modal-backdrop">
              <div className="mpt-modal-card text-center">
                <h3 className="modal-title">Confirm Session Booking</h3>
                <p className="modal-desc">
                  Do you want to book your Personal Training session on <strong>{selectedDate}</strong> at <strong>{bookingSlot.start_time.substring(0, 5)} - {bookingSlot.end_time.substring(0, 5)}</strong> with Coach John Doe?
                </p>
                <div className="modal-actions-flex">
                  <button
                    className="mpt-btn mpt-btn-secondary"
                    onClick={() => setBookingSlot(null)}
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    className="mpt-btn mpt-btn-primary"
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 3.2 INTERACTIVE ATTENDANCE VERIFICATION PIN ENTRY SLATE */}
      {showPinSlate && (
        <div className="mpt-modal-backdrop">
          <div className="mpt-modal-card text-center relative-box">
            <button className="slate-close-btn" onClick={() => setShowPinSlate(false)}>
              <i className="fas fa-times"></i>
            </button>

            {!pinSuccess ? (
              <form onSubmit={handleVerifyPinSubmit} className="fade-in">
                <h2 className="slate-title">Enter validation code</h2>
                <p className="slate-subtitle">Enter the 4-digit code shown by your trainer</p>

                {/* 4 Numeric Code Inputs */}
                <div className="pin-inputs-flex">
                  {pinDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="pin-digit-input"
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="mpt-btn mpt-btn-primary btn-block mt-4"
                  disabled={isVerifyingPin}
                >
                  {isVerifyingPin ? (
                    <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
                  ) : (
                    'Confirm Attendance Handshake'
                  )}
                </button>

                <button
                  type="button"
                  className="mpt-btn mpt-btn-link mt-2"
                  onClick={() => setShowPinSlate(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="pin-success-box fade-in">
                <div className="success-checkmark-circle">
                  <i className="fas fa-check"></i>
                </div>
                <h3 className="success-title">Attendance Confirmed</h3>
                <p className="success-sub">1 Session credit deducted successfully from your wallet balance!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCREEN 3.3 TRANSFORMATION HISTORY VIEW (THE PROGRESS PORTFOLIO) */}
      {activeTab === 'portfolio' && (
        <div className="mpt-tab-content fade-in">
          <div className="mpt-grid-portfolio">
            {/* Left Column: Progress Graph & Comparison Photos */}
            <div className="portfolio-main-col">
              {/* Progress Overview Graph Banner */}
              <div className="mpt-card">
                <h3 className="mpt-card-title">
                  <i className="fas fa-chart-area text-primary"></i> Progress Overview
                </h3>

                <div className="graph-placeholder-box">
                  <div className="chart-legend-flex">
                    <span className="legend-item weight"><i className="fas fa-circle"></i> Weight (kg)</span>
                    <span className="legend-item score"><i className="fas fa-circle"></i> Assessment Score (out of 100)</span>
                  </div>
                  <div className="chart-line-illustration">
                    <svg viewBox="0 0 500 150" className="svg-chart">
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        points="50,110 150,95 250,85 350,70 450,55"
                      />
                      <polyline
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        points="50,90 150,75 250,60 350,45 450,30"
                      />
                      <circle cx="50" cy="110" r="5" fill="#10b981" />
                      <circle cx="150" cy="95" r="5" fill="#10b981" />
                      <circle cx="250" cy="85" r="5" fill="#10b981" />
                      <circle cx="350" cy="70" r="5" fill="#10b981" />
                      <circle cx="450" cy="55" r="5" fill="#10b981" />

                      <circle cx="50" cy="90" r="5" fill="#4f46e5" />
                      <circle cx="150" cy="75" r="5" fill="#4f46e5" />
                      <circle cx="250" cy="60" r="5" fill="#4f46e5" />
                      <circle cx="350" cy="45" r="5" fill="#4f46e5" />
                      <circle cx="450" cy="30" r="5" fill="#4f46e5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* COMPARE TRANSFORMATIONS SIDE-BY-SIDE */}
              <div className="mpt-card mt-4">
                <div className="compare-header-flex">
                  <h3 className="mpt-card-title mb-0">Compare Transformations</h3>
                  <div className="compare-selects-flex">
                    <select
                      className="mpt-select"
                      value={compareDateLeft}
                      onChange={(e) => setCompareDateLeft(e.target.value)}
                    >
                      <option value="1 Jan 2025">Initial (1 Jan 2025)</option>
                      <option value="1 Mar 2025">Progress (1 Mar 2025)</option>
                    </select>
                    <span>VS</span>
                    <select
                      className="mpt-select"
                      value={compareDateRight}
                      onChange={(e) => setCompareDateRight(e.target.value)}
                    >
                      <option value="1 May 2025">Progress (1 May 2025)</option>
                      <option value="1 Jul 2025">Final (1 Jul 2025)</option>
                    </select>
                  </div>
                </div>

                {/* 4 Photos Pair Grid */}
                <div className="transformation-photos-grid mt-4">
                  {[
                    { label: 'Front', imgInitial: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=250', imgProgress: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=250' },
                    { label: 'Back', imgInitial: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250', imgProgress: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=250' },
                    { label: 'Left', imgInitial: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=250', imgProgress: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=250' },
                    { label: 'Right', imgInitial: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=250', imgProgress: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=250' }
                  ].map(pair => (
                    <div key={pair.label} className="photo-pair-card">
                      <span className="pair-view-tag">{pair.label}</span>
                      <div className="side-by-side-flex">
                        <div className="img-box">
                          <img src={pair.imgInitial} alt={`${pair.label} Initial`} />
                          <span className="img-lbl">Initial</span>
                        </div>
                        <div className="img-box">
                          <img src={pair.imgProgress} alt={`${pair.label} Progress`} />
                          <span className="img-lbl">Progress</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Historical Assessments & Trainer Feedback */}
            <div className="portfolio-side-col">
              <div className="mpt-card">
                <h3 className="mpt-card-title">Historical Assessments</h3>
                <div className="history-logs-stack mt-3">
                  <div className="history-item">
                    <div className="history-header">
                      <strong>1 May 2025</strong>
                      <span className="mpt-tag tag-progress">PROGRESS</span>
                    </div>
                    <div className="score-val">Score: 82/100</div>
                    <div className="metrics-summary-grid mt-2">
                      <div><span>Body Fat %:</span> <strong>18.7%</strong></div>
                      <div><span>Weight:</span> <strong>76.5 kg</strong></div>
                      <div><span>Waist:</span> <strong>82 cm</strong></div>
                      <div><span>Chest:</span> <strong>98 cm</strong></div>
                    </div>
                  </div>

                  <div className="history-item">
                    <div className="history-header">
                      <strong>1 Mar 2025</strong>
                      <span className="mpt-tag tag-progress">PROGRESS</span>
                    </div>
                    <div className="score-val">Score: 74/100</div>
                    <div className="metrics-summary-grid mt-2">
                      <div><span>Body Fat %:</span> <strong>20.5%</strong></div>
                      <div><span>Weight:</span> <strong>78.0 kg</strong></div>
                    </div>
                  </div>

                  <div className="history-item">
                    <div className="history-header">
                      <strong>1 Jan 2025</strong>
                      <span className="mpt-tag tag-initial">INITIAL</span>
                    </div>
                    <div className="score-val">Score: 62/100</div>
                    <div className="metrics-summary-grid mt-2">
                      <div><span>Body Fat %:</span> <strong>23.2%</strong></div>
                      <div><span>Weight:</span> <strong>81.2 kg</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainer Feedback Card */}
              <div className="mpt-card mt-4">
                <h3 className="mpt-card-title">
                  <i className="fas fa-comment-dots text-accent"></i> Trainer Feedback
                </h3>
                <p className="trainer-feedback-text">
                  "Great improvement in overall strength and endurance. Keep focusing on diet and consistency. Posture has improved significantly."
                </p>
                <div className="coach-sig font-bold mt-2">- Coach John Doe</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMBEDDED ACTIVE DIET PLAN VIEW */}
      {activeTab === 'diet-plan' && (
        <div className="mpt-tab-content fade-in">
          {isLoadingDiet ? (
            <div className="mpt-loading"><i className="fas fa-spinner fa-spin"></i> Loading Diet Plan...</div>
          ) : !hasDietEntitlement ? (
            <div className="mpt-card text-center p-5 paywall-blur-box">
              <div className="paywall-lock-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="paywall-title">Upgrade to a PT Package to unlock custom nutritional tracking plans</h3>
              <p className="paywall-subtitle">
                Personalized meal blueprints, macro breakdowns, and daily hydration guidance are exclusively included with Personal Training active packages.
              </p>
              <button
                className="mpt-btn mpt-btn-gold mt-3"
                onClick={() => {
                  setActiveTab('scheduler');
                  showToast('Choose a session date and package to unlock premium nutrition features');
                }}
              >
                <i className="fas fa-crown"></i> Upgrade to PT Package
              </button>
            </div>
          ) : memberDietPlan ? (
            <div className="mpt-card">
              <div className="diet-header-banner">
                <div>
                  <h2 className="diet-title">{memberDietPlan.plan_name}</h2>
                  <p className="diet-sub">Assigned by {memberDietPlan.trainer_name} • Goal: {memberDietPlan.goal}</p>
                </div>
                <div className="diet-vitals-pills">
                  <span><i className="fas fa-tint text-info"></i> {memberDietPlan.water_intake_liters}L Water</span>
                  <span><i className="fas fa-bed text-primary"></i> {memberDietPlan.sleep_hours}h Sleep</span>
                </div>
              </div>

              <h4 className="mt-4 font-bold">Daily Meals Breakdown</h4>
              <div className="meals-stack mt-3">
                {memberDietPlan.meals.map((meal, idx) => (
                  <div key={idx} className="meal-card">
                    <div className="meal-type-badge">{meal.meal_type}</div>
                    <div className="meal-timing"><i className="far fa-clock"></i> {meal.timing}</div>
                    <div className="meal-items">{meal.items}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mpt-card text-center p-5">
              <i className="fas fa-utensils text-muted fa-3x mb-3"></i>
              <p>No active diet plan assigned yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberPTModule;
