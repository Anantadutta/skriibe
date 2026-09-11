import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const PlatformAnalytics = () => {
  const [lifetimeRevenue, setLifetimeRevenue] = useState('Loading...');
  const [liveChatRevenue, setLiveChatRevenue] = useState('Loading...');
  const [amaRevenue, setAmaRevenue] = useState('Loading...');
  const [tipsRevenue, setTipsRevenue] = useState('Loading...');
  const [totalFans, setTotalFans] = useState('Loading...');
  const [totalCreators, setTotalCreators] = useState('Loading...');
  const [totalLiveChats, setTotalLiveChats] = useState('Loading...');
  const [totalAmaSessions, setTotalAmaSessions] = useState('Loading...');
  const [totalTipsCount, setTotalTipsCount] = useState('Loading...');
  const [totalMinutes, setTotalMinutes] = useState('Loading...');
  const [avgChatDuration, setAvgChatDuration] = useState('Loading...');
  const [totalSuccessfulChats, setTotalSuccessfulChats] = useState('Loading...');
  const [totalIncompleteChats, setTotalIncompleteChats] = useState('Loading...');
  const [payingFans, setPayingFans] = useState('Loading...');
  const [newFans, setNewFans] = useState('Loading...');
  const [repeatUsers, setRepeatUsers] = useState('Loading...');
  const [onlineCreators, setOnlineCreators] = useState('Loading...');
  const [offlineCreators, setOfflineCreators] = useState('Loading...');
  const [todayRevenue, setTodayRevenue] = useState('Loading...');
  const [todayChatRevenue, setTodayChatRevenue] = useState('Loading...');
  const [todayAmaRevenue, setTodayAmaRevenue] = useState('Loading...');
  const [todayTipsRevenue, setTodayTipsRevenue] = useState('Loading...');
  const [todayNewFans, setTodayNewFans] = useState('Loading...');
  const [todayNewCreators, setTodayNewCreators] = useState('Loading...');
  const [todayChatsCompleted, setTodayChatsCompleted] = useState('Loading...');
  const [todayChatsIncomplete, setTodayChatsIncomplete] = useState('Loading...');
  const [todayChatMinutes, setTodayChatMinutes] = useState('Loading...');
  const [todayTipsCount, setTodayTipsCount] = useState('Loading...');
  const [todayTopupAmount, setTodayTopupAmount] = useState('Loading...');
  const [totalWalletTopUpsCount, setTotalWalletTopUpsCount] = useState('Loading...');
  const [totalWalletTopUpsAmount, setTotalWalletTopUpsAmount] = useState('Loading...');
  const [totalWalletSpentAmount, setTotalWalletSpentAmount] = useState('Loading...');
  const [totalPendingWalletAmount, setTotalPendingWalletAmount] = useState('Loading...');

  useEffect(() => {
    const fetchRevenues = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const [transactionsRes, tipsRes, fansRes, creatorsRes, walletTxsRes] = await Promise.all([
          axios.get(`${apiUrl}/admin/transactions`, { withCredentials: true }),
          axios.get(`${apiUrl}/admin/tips`, { withCredentials: true }),
          axios.get(`${apiUrl}/admin/fans`, { withCredentials: true }),
          axios.get(`${apiUrl}/admin/creators`, { withCredentials: true }),
          axios.get(`${apiUrl}/admin/wallet-transactions`, { withCredentials: true })
        ]);
        
        let amaTotal = 0;
        let chatTotal = 0;
        let tipsTotal = 0;
        
        let amaCount = 0;
        let chatCount = 0;
        let successfulChatCount = 0;
        let incompleteChatCount = 0;
        let totalMins = 0;
        
        let payingFanIds = new Set();
        let activeFanIds = new Set();
        let fanInteractionCounts = {};
        let fanHasChat = {};
        
        let todayTotal = 0;
        let todayChatTotal = 0;
        let todayAmaTotal = 0;
        let todayTipsTotal = 0;
        let todayChatsCompletedCount = 0;
        let todayChatsIncompleteCount = 0;
        let todayChatMins = 0;

        const isTodayIST = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          const dIST = new Date(d.getTime() + (5.5 * 3600000));
          const nIST = new Date(new Date().getTime() + (5.5 * 3600000));
          return dIST.getUTCFullYear() === nIST.getUTCFullYear() &&
                 dIST.getUTCMonth() === nIST.getUTCMonth() &&
                 dIST.getUTCDate() === nIST.getUTCDate();
        };

        if (Array.isArray(transactionsRes.data)) {
          transactionsRes.data.forEach(t => {
            if (t.fanId) {
              const fanIdStr = String(t.fanId._id || t.fanId);
              activeFanIds.add(fanIdStr);
              fanInteractionCounts[fanIdStr] = (fanInteractionCounts[fanIdStr] || 0) + 1;
              if (t.type === 'chat') {
                fanHasChat[fanIdStr] = true;
              }
            }

            if (t.type === 'ama') {
              if (t.paymentStatus === 'paid') {
                const amt = Number(t.amountPaid || t.price || 0);
                amaTotal += amt;
                if (isTodayIST(t.createdAt)) {
                  todayTotal += amt;
                  todayAmaTotal += amt;
                }
              }
              // Count parent question
              amaCount++;
              // Also count follow-up questions asked
              if (Array.isArray(t.followUps)) {
                amaCount += t.followUps.length;
              }
            } else if (t.type === 'chat') {
              if (t.totalCost > 0) {
                if (t.fanId && t.fanId._id) payingFanIds.add(String(t.fanId._id));
                else if (t.fanId) payingFanIds.add(String(t.fanId));
              }
              if (t.status === 'ended') {
                const cst = Number(t.totalCost || 0);
                chatTotal += cst;
                
                const isToday = isTodayIST(t.createdAt || t.startTime);
                if (isToday) {
                  todayTotal += cst;
                  todayChatTotal += cst;
                }
                
                chatCount++; // Only count chats that actually occurred (ended)
                if (t.cancelledByFan) {
                  incompleteChatCount++;
                  if (isToday) todayChatsIncompleteCount++;
                } else {
                  successfulChatCount++;
                  if (isToday) todayChatsCompletedCount++;
                }
              }
              totalMins += Number(t.totalMinutes || 0);
              if (isTodayIST(t.createdAt || t.startTime)) todayChatMins += Number(t.totalMinutes || 0);
            }
          });
        }

        setTodayChatsCompleted(todayChatsCompletedCount.toLocaleString('en-US'));
        setTodayChatsIncomplete(todayChatsIncompleteCount.toLocaleString('en-US'));
        setTodayChatMinutes(todayChatMins.toLocaleString('en-US'));
        
        setPayingFans(payingFanIds.size.toLocaleString('en-US'));
        
        let repeatUsersCount = 0;
        for (let fanId in fanInteractionCounts) {
          if (fanInteractionCounts[fanId] >= 2 && fanHasChat[fanId]) {
            repeatUsersCount++;
          }
        }
        setRepeatUsers(repeatUsersCount.toLocaleString('en-US'));
        
        let todayTipsCountNum = 0;
        if (Array.isArray(tipsRes.data)) {
          tipsRes.data.forEach(tip => {
            const amt = Number(tip.amount || 0);
            tipsTotal += amt;
            if (isTodayIST(tip.createdAt)) {
              todayTotal += amt;
              todayTipsTotal += amt;
              todayTipsCountNum++;
            }
          });
          setTotalTipsCount(tipsRes.data.length.toLocaleString('en-US'));
        } else {
          setTotalTipsCount('0');
        }
        setTodayTipsCount(todayTipsCountNum.toLocaleString('en-US'));

        let todayTopup = 0;
        let totalTopupsCount = 0;
        let totalTopupsAmount = 0;
        let totalSpentAmount = 0;
        if (Array.isArray(walletTxsRes.data)) {
          walletTxsRes.data.forEach(tx => {
            if (tx.type === 'debit') {
              totalSpentAmount += Number(tx.amount || 0);
            }
            if (tx.description?.toLowerCase().includes('top-up') || tx.description?.toLowerCase().includes('topup')) {
              totalTopupsCount++;
              totalTopupsAmount += Number(tx.amount || 0);
              if (isTodayIST(tx.createdAt)) {
                todayTopup += Number(tx.amount || 0);
              }
            }
          });
        }
        setTodayTopupAmount(`₹${Math.round(todayTopup).toLocaleString('en-IN')}`);
        setTotalWalletTopUpsCount(totalTopupsCount.toLocaleString('en-US'));
        setTotalWalletTopUpsAmount(`₹${Math.round(totalTopupsAmount).toLocaleString('en-IN')}`);
        setTotalWalletSpentAmount(`₹${Math.round(totalSpentAmount).toLocaleString('en-IN')}`);

        setTodayRevenue(`₹${Math.round(todayTotal).toLocaleString('en-IN')}`);
        setTodayChatRevenue(`₹${Math.round(todayChatTotal).toLocaleString('en-IN')}`);
        setTodayAmaRevenue(`₹${Math.round(todayAmaTotal).toLocaleString('en-IN')}`);
        setTodayTipsRevenue(`₹${Math.round(todayTipsTotal).toLocaleString('en-IN')}`);

        const total = amaTotal + chatTotal + tipsTotal;

        setLifetimeRevenue(`₹${total.toLocaleString('en-IN')}`);
        setAmaRevenue(`₹${amaTotal.toLocaleString('en-IN')}`);
        setLiveChatRevenue(`₹${chatTotal.toLocaleString('en-IN')}`);
        setTipsRevenue(`₹${tipsTotal.toLocaleString('en-IN')}`);
        
        setTotalLiveChats(chatCount.toLocaleString('en-US'));
        setTotalAmaSessions(amaCount.toLocaleString('en-US'));
        setTotalMinutes(Math.round(totalMins).toLocaleString('en-US'));
        setTotalSuccessfulChats(successfulChatCount.toLocaleString('en-US'));
        setTotalIncompleteChats(incompleteChatCount.toLocaleString('en-US'));
        
        if (chatCount > 0) {
          const avgMins = totalMins / chatCount;
          const mins = Math.floor(avgMins);
          const secs = Math.round((avgMins - mins) * 60);
          setAvgChatDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
        } else {
          setAvgChatDuration('0:00');
        }
        
        if (Array.isArray(fansRes.data)) {
          setTotalFans(fansRes.data.length.toLocaleString('en-US'));
          let newFansCount = 0;
          let registeredTodayCount = 0;
          let totalPendingAmount = 0;
          fansRes.data.forEach(fan => {
            totalPendingAmount += Number(fan.walletBalance || 0);
            if (!activeFanIds.has(String(fan._id))) {
              newFansCount++;
            }
            if (isTodayIST(fan.createdAt)) {
              registeredTodayCount++;
            }
          });
          setNewFans(newFansCount.toLocaleString('en-US'));
          setTodayNewFans(registeredTodayCount.toLocaleString('en-US'));
          setTotalPendingWalletAmount(`₹${Math.round(totalPendingAmount).toLocaleString('en-IN')}`);
        }
        if (Array.isArray(creatorsRes.data)) {
          let onboardedTodayCount = 0;
          creatorsRes.data.forEach(c => {
            if (isTodayIST(c.createdAt)) {
              onboardedTodayCount++;
            }
          });
          setTodayNewCreators(onboardedTodayCount.toLocaleString('en-US'));

          const activeCreators = creatorsRes.data.filter(c => 
            !c.isBanned && 
            c.handle && 
            c.name && 
            (!c.suspensionUntil || new Date(c.suspensionUntil) <= new Date())
          );
          setTotalCreators(activeCreators.length.toLocaleString('en-US'));

          const checkIfLiveNow = (timeSlots) => {
            if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) return false;
            const now = new Date();
            const istMillis = now.getTime() + (5.5 * 3600000);
            const istDate = new Date(istMillis);
            const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const currentDayStr = daysMap[istDate.getUTCDay()];
            const currentTime = istDate.getUTCHours() + (istDate.getUTCMinutes() / 60);

            for (const slot of timeSlots) {
              try {
                let timeRange = slot;
                let slotDay = null;
                if (slot.includes('|')) {
                  const parts = slot.split('|');
                  slotDay = parts[0];
                  timeRange = parts[1];
                }
                if (!slotDay || slotDay !== currentDayStr) continue;

                const [startStr, endStr] = timeRange.split('-');
                if (!startStr || !endStr) continue;

                const [startH, startM] = startStr.split(':').map(Number);
                const [endH, endM] = endStr.split(':').map(Number);

                const startTime = startH + (startM / 60);
                let endTime = endH + (endM / 60);

                if (endTime < startTime) {
                  if (currentTime >= startTime || currentTime < endTime) return true;
                } else {
                  if (currentTime >= startTime && currentTime < endTime) return true;
                }
              } catch (err) {}
            }
            return false;
          };

          let onlineCount = 0;
          activeCreators.forEach(c => {
            if (c.isLive || checkIfLiveNow(c.liveChatTimeSlots)) {
              onlineCount++;
            }
          });
          const offlineCount = Math.max(0, activeCreators.length - onlineCount);
          setOnlineCreators(onlineCount.toLocaleString('en-US'));
          setOfflineCreators(offlineCount.toLocaleString('en-US'));
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setLifetimeRevenue('Error');
        setAmaRevenue('Error');
        setLiveChatRevenue('Error');
        setTipsRevenue('Error');
        setTotalFans('Error');
        setTotalCreators('Error');
        setTotalLiveChats('Error');
        setTotalAmaSessions('Error');
        setTotalTipsCount('Error');
        setTotalMinutes('Error');
        setAvgChatDuration('Error');
        setTotalSuccessfulChats('Error');
        setTotalIncompleteChats('Error');
        setPayingFans('Error');
        setNewFans('Error');
        setRepeatUsers('Error');
        setOnlineCreators('Error');
        setOfflineCreators('Error');
        setTodayRevenue('Error');
        setTodayChatRevenue('Error');
        setTodayAmaRevenue('Error');
        setTodayTipsRevenue('Error');
        setTodayNewFans('Error');
        setTodayNewCreators('Error');
        setTodayChatsCompleted('Error');
        setTodayChatsIncomplete('Error');
        setTodayChatMinutes('Error');
        setTodayTipsCount('Error');
        setTodayTopupAmount('Error');
        setTotalWalletTopUpsCount('Error');
        setTotalWalletTopUpsAmount('Error');
        setTotalWalletSpentAmount('Error');
        setTotalPendingWalletAmount('Error');
      }
    };

    fetchRevenues();
    const interval = setInterval(fetchRevenues, 10000); // Poll every 10 seconds for real-time updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#ffffff' }}>Overview</h1>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>Everything happening on Skriibe at a glance.</div>
        </div>
      </div>
      
      {/* Top Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Total Revenue', value: lifetimeRevenue, icon: '💰', color: '#F43F5E' },
          { title: 'Live Chat Revenue', value: liveChatRevenue, icon: '💬', color: '#A855F7' },
          { title: 'AMA Revenue', value: amaRevenue, icon: '🎤', color: '#38BDF8' },
          { title: 'Tips Revenue', value: tipsRevenue, icon: '🎁', color: '#FBBF24' },
          { title: 'Total Users (Fans)', value: totalFans, icon: '👤', color: '#A855F7' },
          { title: 'Active Creators', value: totalCreators, icon: '⭐', color: '#10B981' }
        ].map((card, i) => (
          <div key={i} style={{ background: '#13131A', borderRadius: '12px', padding: '16px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ color: card.color }}>{card.icon}</span> {card.title}
            </div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        
        {/* Conversations Summary */}
        <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', border: '1px solid #1E1E2D' }}>
          <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.1rem' }}>Conversations Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { title: 'Live Chats', value: totalLiveChats, icon: '💬', color: '#F43F5E' },
              { title: 'AMA Sessions', value: totalAmaSessions, icon: '🎤', color: '#38BDF8' },
              { title: 'Tips Shared', value: totalTipsCount, icon: '🎁', color: '#FBBF24' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span> {stat.title}
                </div>
                <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', borderTop: '1px solid #1E1E2D', paddingTop: '16px' }}>
            {[
              { label: 'Total Minutes', value: totalMinutes },
              { label: 'Chats Completed (Successfully)', value: totalSuccessfulChats },
              { label: 'Incomplete Chats', value: totalIncompleteChats },
              { label: 'Avg. Chat Duration', value: avgChatDuration }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Overview */}
        <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', border: '1px solid #1E1E2D' }}>
          <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.1rem' }}>Users Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { title: 'Paying Fans', value: payingFans, change: '+23.8%', icon: '🔄', color: '#A855F7' },
              { title: 'Repeat Users', value: repeatUsers, change: '+23.8%', icon: '👥', color: '#10B981' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span> {stat.title}
                </div>
                <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', borderTop: '1px solid #1E1E2D', paddingTop: '16px' }}>
            {[
              { label: 'Online Now', value: onlineCreators, dot: '#10B981' },
              { label: 'Offline Now', value: offlineCreators, dot: '#64748B' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {stat.dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: stat.dot }}></span>}
                  {stat.label}
                </div>
                <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', border: '1px solid #1E1E2D', marginTop: '16px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.1rem' }}>Financial Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#1C1C24', borderRadius: '8px', padding: '16px', border: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ color: '#A855F7', fontSize: '1.2rem' }}>👛</span> Total wallet top ups
            </div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalWalletTopUpsCount}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{totalWalletTopUpsAmount} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>( total amount of money topped up till now )</span></div>
          </div>
          
          <div style={{ background: '#1C1C24', borderRadius: '8px', padding: '16px', border: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ color: '#F43F5E', fontSize: '1.2rem' }}>💸</span> Spent from wallet
            </div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalWalletSpentAmount}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total spent by all fans</div>
          </div>

          <div style={{ background: '#1C1C24', borderRadius: '8px', padding: '16px', border: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ color: '#38BDF8', fontSize: '1.2rem' }}>🏦</span> Pending amount in wallets of all fans
            </div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalPendingWalletAmount}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Current balance in all wallets</div>
          </div>
          
        </div>
      </div>

      {/* Today at a Glance */}
      <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', border: '1px solid #1E1E2D', marginTop: '16px' }}>
        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1rem', fontWeight: '600' }}>
          Today at a Glance <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'normal' }}>
            ({new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())})
          </span>
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { label: 'Revenue', value: todayRevenue },
            { label: 'Live Chat Revenue', value: todayChatRevenue },
            { label: 'AMA Revenue', value: todayAmaRevenue },
            { label: 'Tips Revenue', value: todayTipsRevenue },
            { label: 'New Fans', value: todayNewFans },
            { label: 'New Creators', value: todayNewCreators },
            { label: 'Chats Completed', value: todayChatsCompleted },
            { label: 'Chats Incomplete', value: todayChatsIncomplete },
            { label: 'Minutes', value: todayChatMinutes },
            { label: 'Tips', value: todayTipsCount },
            { label: 'Top-up Amount', value: todayTopupAmount }
          ].map((stat, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '6px' }}>{stat.label}</div>
                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>{stat.value}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: '1px', height: '30px', backgroundColor: '#1E1E2D', margin: '0 16px' }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PlatformAnalytics;
