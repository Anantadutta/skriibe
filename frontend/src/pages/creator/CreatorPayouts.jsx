import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import api from '../../services/api';
import { io } from 'socket.io-client';

const TABS = ['Available', 'Protected', 'Under Review', 'Refunded', 'History'];

const escrowReleases = [
  { date: '17 Jun 2025', amount: '₹316.80', questions: 4 },
  { date: '18 Jun 2025', amount: '₹396.00', questions: 5 },
  { date: '19 Jun 2025', amount: '₹237.60', questions: 3 },
  { date: '20 Jun 2025', amount: '₹316.80', questions: 4 },
  { date: '21 Jun 2025', amount: '₹237.60', questions: 3 },
];

const underReviewQuestions = [
  { id: 'SKR111', status: 'Fan Review', amount: '₹79.20', raisedOn: 'Raised on 10 Jun' },
  { id: 'SKR112', status: 'Support Investigation', amount: '₹79.20', raisedOn: 'Raised on 11 Jun' },
  { id: 'SKR113', status: 'Awaiting Evidence', amount: '₹79.20', raisedOn: 'Raised on 11 Jun' },
  { id: 'SKR114', status: 'Fan Review', amount: '₹79.20', raisedOn: 'Raised on 12 Jun' },
];

// Removed mock refundedItems array



const StatusIcon = ({ status }) => {
  if (status === 'Paid') return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
  );
  if (status === 'Pending') return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </div>
  );
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Paid: { bg: 'rgba(34,197,94,0.18)', color: '#22C55E' },
    Pending: { bg: 'rgba(251,146,60,0.18)', color: '#FB923C' },
    'Protected': { bg: 'rgba(59,130,246,0.18)', color: '#60A5FA' },
  };
  const c = map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#A8A8A0' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', backgroundColor: c.bg, color: c.color, fontSize: '11px', fontWeight: '600' }}>
      {status}
    </span>
  );
};

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const InfoIcon = ({ color = 'currentColor' }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CalendarIcon = ({ color = '#686860' }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Card = ({ children, style = {} }) => (
  <div style={{ backgroundColor: '#0f0f1c', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', ...style }}>
    {children}
  </div>
);

const CreatorPayouts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Available');
  const [refundSubTab, setRefundSubTab] = useState('All');
  const tabsRef = useRef(null);
  const [payoutStats, setPayoutStats] = useState({ lifetimePaid: 0, thisMonth: 0, inEscrow: 0, available: 0, nextPayoutDate: null, availableQuestions: 0, availableGross: 0, availableFee: 0, inEscrowQuestions: 0, pendingList: [], underReviewAmount: 0, underReviewQuestionsCount: 0, underReviewList: [] });

  const fetchPayouts = () => {
    api.get('/creator/payouts')
      .then(res => { if (res.data.success) setPayoutStats(res.data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPayouts();

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('new-question', () => {
      fetchPayouts();
    });

    socket.on('question-status-changed', () => {
      fetchPayouts();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const getNextTuesday = () => {
    const now = new Date();
    const daysForward = ((2 - now.getDay() + 7) % 7) || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysForward);
    return next.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const scrollTabs = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tab, e) => {
    setActiveTab(tab);
    const container = tabsRef.current;
    const button = e.currentTarget;
    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const scrollTo = container.scrollLeft + buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2;
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box'
    }} className="creator-theme">
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PhoneFrame>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: '100vh',
          backgroundColor: '#07070E',
          color: '#FAFAF8',
          overflow: 'hidden',
        }}>

          {/* ── Header ── */}
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 'bold', fontSize: '20px', letterSpacing: '-0.5px', color: '#3DD9FF' }}>
              skriibe
            </div>
            <div style={{ width: '38px' }} />
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px', scrollbarWidth: 'none' }}>

            {/* Page title */}
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 3px 0' }}>Payouts</h1>
              <p style={{ fontSize: '13px', color: '#686860', margin: 0 }}>Your earnings overview</p>
            </div>

            {/* ── Overview card ── */}
            <div style={{
              background: 'linear-gradient(145deg, #0d1f2d 0%, #0a0a1e 60%, #07070E 100%)',
              borderRadius: '20px',
              padding: '22px',
              marginBottom: '18px',
              border: '1px solid rgba(61,217,255,0.14)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3DD9FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span style={{ color: '#3DD9FF', fontSize: '11px', fontWeight: '700', letterSpacing: '1.2px' }}>LIFETIME PAID</span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '5px' }}>{fmt(payoutStats.lifetimePaid)}</div>
              <div style={{ fontSize: '12px', color: '#686860', marginBottom: '20px' }}>Total amount credited to your account</div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#686860', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '7px' }}>THIS MONTH</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3DD9FF' }}>{fmt(payoutStats.thisMonth)}</div>
                </div>
              </div>
            </div>            {/* ── Tab row (horizontally scrollable) ── */}
            <div style={{ marginBottom: '6px', position: 'relative' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '4px',
              }}
              ref={tabsRef}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={(e) => handleTabClick(tab, e)}
                    style={{
                      flexShrink: 0,
                      padding: '10px 16px',
                      borderRadius: '50px',
                      border: activeTab === tab ? '2px solid #FAFAF8' : '1.5px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: activeTab === tab ? '700' : '500',
                      backgroundColor: activeTab === tab ? '#FAFAF8' : 'transparent',
                      color: activeTab === tab ? '#07070E' : '#A8A8A0',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div
              onClick={scrollTabs}
              style={{ fontSize: '11px', color: '#444', textAlign: 'right', marginBottom: '18px', cursor: 'pointer', userSelect: 'none' }}
            >
              ← swipe to see all tabs
            </div>

            {/* ── AVAILABLE ── */}
            {activeTab === 'Available' && (
              <>
                <Card style={{ padding: '22px', marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#686860', fontSize: '12px', marginBottom: '8px' }}>
                    Available for Payout 
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '14px' }}>{fmt(payoutStats.available)}</div>
                  <div style={{ color: '#686860', fontSize: '12px', marginBottom: '3px' }}>Next Payout</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#3DD9FF', fontSize: '13px', fontWeight: '600', marginBottom: '18px' }}>
                    <CalendarIcon color="#3DD9FF" /> {getNextTuesday()}
                  </div>
                  <div style={{ backgroundColor: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ color: '#22C55E', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div style={{ fontSize: '12px', color: '#A8A8A0', lineHeight: '1.55' }}>
                      <span style={{ color: '#fff', fontWeight: '600' }}>These earnings are ready to be paid out.</span>{' '}
                      Earnings from answered questions after 7-day holding period with no disputes.
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: '18px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#686860', letterSpacing: '1px', marginBottom: '14px' }}>OVERVIEW</div>
                  {[
                    ['Eligible Questions', payoutStats.availableQuestions ? payoutStats.availableQuestions.toString() : '0'],
                    ['Total Revenue', fmt(payoutStats.availableGross || 0)],
                    ['Your Earnings (80%)', fmt(payoutStats.available || 0)],
            
                  ].map(([label, value], i, arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: i < arr.length - 1 ? '12px' : 0, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', marginBottom: i < arr.length - 1 ? '12px' : 0 }}>
                      <span style={{ color: '#686860' }}>{label}</span>
                      <span style={{ fontWeight: '600' }}>{value}</span>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {/* ── PROTECTED ── */}
            {activeTab === 'Protected' && (
              <>
                <Card style={{ padding: '22px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#686860', fontSize: '12px', marginBottom: '8px' }}>
                    Protected Amount
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '4px' }}>{fmt(payoutStats.inEscrow)}</div>
                  <div style={{ color: '#686860', fontSize: '12px', marginBottom: '12px' }}>{payoutStats.inEscrowQuestions || 0} Questions</div>
                  <div style={{ backgroundColor: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ color: '#60A5FA', flexShrink: 0, marginTop: '2px' }}><InfoIcon color="#60A5FA" /></div>
                    <div style={{ fontSize: '12px', color: '#A8A8A0', lineHeight: '1.6' }}>
                      These are potential earnings from questions you haven't answered yet.<br />
                      Answer them before they expire to move the funds to Available for Payout.
                    </div>
                  </div>
                </Card>

                <div style={{ fontSize: '10px', fontWeight: '700', color: '#686860', letterSpacing: '1px', marginBottom: '10px' }}>PENDING QUESTIONS</div>
                <Card style={{ overflow: 'hidden', marginBottom: '14px' }}>
                  {payoutStats.pendingList && payoutStats.pendingList.length > 0 ? payoutStats.pendingList.map((item, i) => (
                    <div key={item.id} onClick={() => navigate('/creator/inbox')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < payoutStats.pendingList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CalendarIcon />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#FAFAF8' }}>{item.buyerName}</div>
                          <div style={{ fontSize: '11px', color: '#686860', marginTop: '3px' }}>{item.date}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FAFAF8' }}>{fmt(item.amount)}</div>
                          <div style={{ fontSize: '11px', color: '#686860', marginTop: '3px' }}>Unanswered</div>
                        </div>
                        <ChevronRight />
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#686860', fontSize: '12px' }}>No pending questions right now.</div>
                  )}
                </Card>

              </>
            )}

            {/* ── UNDER REVIEW ── */}
            {activeTab === 'Under Review' && (
              <>
                {payoutStats.underReviewQuestionsCount > 0 ? (
                  <>
                    <Card style={{ padding: '20px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ backgroundColor: 'rgba(251,146,60,0.13)', color: '#FB923C', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '700' }}>
                          Under Review 
                        </div>
                      </div>
                      <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '4px' }}>{fmt(payoutStats.underReviewAmount)}</div>
                      <div style={{ color: '#686860', fontSize: '12px', marginBottom: '16px' }}>{payoutStats.underReviewQuestionsCount || 0} Questions</div>
                      <div style={{ backgroundColor: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px' }}>
                        <div style={{ color: '#FB923C', flexShrink: 0, marginTop: '1px' }}><InfoIcon color="#FB923C" /></div>
                        <div style={{ fontSize: '12px', color: '#A8A8A0', lineHeight: '1.6' }}>
                          A fan has raised a dispute for these questions. Our team is reviewing it. You will be notified once it's resolved.
                        </div>
                      </div>
                    </Card>

                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#686860', letterSpacing: '1px', marginBottom: '10px' }}>QUESTIONS UNDER REVIEW</div>
                    <Card style={{ overflow: 'hidden' }}>
                      {payoutStats.underReviewList && payoutStats.underReviewList.map((item, i) => (
                        <div key={item.id} onClick={() => navigate('/creator/inbox')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < (payoutStats.underReviewList?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>{item.buyerName}</div>
                            <div style={{ fontSize: '11px', color: item.adminMessage ? '#8b5cf6' : '#FB923C', fontWeight: '600' }}>{item.status}</div>
                            {item.adminMessage && (
                              <div style={{ fontSize: '11px', color: '#A8A8A0', marginTop: '4px', maxWidth: '200px', lineHeight: '1.4' }}>{item.adminMessage}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: '700' }}>{fmt(item.amount)}</div>
                              <div style={{ fontSize: '11px', color: '#686860' }}>{item.date}</div>
                            </div>
                            <ChevronRight />
                          </div>
                        </div>
                      ))}
                    </Card>
                  </>
                ) : (
                  <Card style={{ padding: '20px', textAlign: 'center', color: '#686860', fontSize: '14px' }}>
                    No disputes to review.
                  </Card>
                )}
              </>
            )}

            {/* ── REFUNDED ── */}
            {activeTab === 'Refunded' && (
              <>
                <Card style={{ padding: '20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(239,68,68,0.13)', color: '#EF4444', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarIcon color="#EF4444" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '700' }}>
                      Refunded 
                    </div>
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', color: '#EF4444', marginBottom: '4px' }}>-₹{(payoutStats.refundedAmount || 0).toFixed(2)}</div>
                  <div style={{ color: '#686860', fontSize: '12px', marginBottom: '16px' }}>{payoutStats.refundedQuestionsCount || 0} Questions</div>
                  <div style={{ backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px' }}>
                    <div style={{ color: '#EF4444', flexShrink: 0, marginTop: '1px' }}><InfoIcon color="#EF4444" /></div>
                    <div style={{ fontSize: '12px', color: '#EF4444', lineHeight: '1.6' }}>
                      These amounts were refunded to fans.<br />Creator share is not paid out.
                    </div>
                  </div>
                </Card>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', backgroundColor: '#0f0f1c', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {['All', 'Auto Refunds', 'Approved Refunds'].map(sub => (
                    <button key={sub} onClick={() => setRefundSubTab(sub)} style={{ flex: 1, padding: '8px 4px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: refundSubTab === sub ? '700' : '400', backgroundColor: refundSubTab === sub ? '#FAFAF8' : 'transparent', color: refundSubTab === sub ? '#07070E' : '#686860', transition: 'all 0.18s' }}>
                      {sub}
                    </button>
                  ))}
                </div>

                <Card style={{ overflow: 'hidden' }}>
                  {(payoutStats.refundedList || [])
                    .filter(item => refundSubTab === 'All' || (refundSubTab === 'Auto Refunds' && item.type === 'Auto Refund') || (refundSubTab === 'Approved Refunds' && item.type === 'Approved Refund'))
                    .map((item, i, arr) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#686860', marginBottom: '3px' }}>{item.date}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.buyerName}</span>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: item.type === 'Auto Refund' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)', color: item.type === 'Auto Refund' ? '#60A5FA' : '#C084FC' }}>{item.type}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#686860' }}>{item.reason}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444' }}>{item.amount}</span>
                          <ChevronRight />
                        </div>
                      </div>
                    ))}
                </Card>
              </>
            )}

            {/* ── HISTORY ── */}
            {activeTab === 'History' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Payout History</h3>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#A8A8A0', fontSize: '12px', padding: '7px 12px', cursor: 'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                      <line x1="11" y1="18" x2="13" y2="18"></line>
                    </svg>
                    Filter
                  </button>
                </div>

                {payoutStats.payoutHistoryGrouped && payoutStats.payoutHistoryGrouped.length > 0 ? (
                  payoutStats.payoutHistoryGrouped.map(group => (
                    <div key={group.month} style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#686860', letterSpacing: '1.2px', marginBottom: '10px' }}>{group.month}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {group.items.map(item => (
                          <div key={item.id} style={{ backgroundColor: '#0f0f1c', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                            <StatusIcon status={item.status} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>{item.date}</div>
                              <div style={{ fontSize: '11px', color: '#686860' }}>{item.bank}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '5px' }}>{fmt(item.amount)}</div>
                              <StatusBadge status={item.status} />
                            </div>
                            <ChevronRight />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#686860', fontSize: '14px' }}>
                    No payout history yet.
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </PhoneFrame>
      </div>
    </div>
  );
};

export default CreatorPayouts;
