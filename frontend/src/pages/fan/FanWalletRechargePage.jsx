import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import WalletRechargeScreen from '../../components/fan/WalletRechargeScreen';
import { getCreatorProfile } from '../../services/discoveryApi';

const FanWalletRechargePage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(10);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const checkBalance = async () => {
      try {
        // Fetch creator price
        const cRes = await getCreatorProfile(handle);
        const creatorPrice = cRes?.creator?.liveChatPrice || 5;
        setRate(creatorPrice);

        // Fetch wallet balance
        const wRes = await api.get('/wallet/balance');
        const userBalance = wRes.data.balance || 0;
        setBalance(userBalance);

        if (userBalance >= creatorPrice * 5) {
          // Has enough balance for at least 5 minutes, skip recharge
          navigate(`/${handle}/live-chat`, { replace: true });
        } else {
          // Needs recharge
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking balance:', err);
        // If not logged in, redirect to login
        if (err.response?.status === 401) {
          navigate(`/fan/login?redirect=/${handle}/recharge`);
        } else {
          setLoading(false);
        }
      }
    };
    checkBalance();
  }, [handle, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #38BDF8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <WalletRechargeScreen 
        rate={rate}
        balance={balance}
        onCancel={() => navigate(`/${handle}`)}
        onRechargeSuccess={() => {
          navigate(`/${handle}/live-chat`, { replace: true });
        }}
      />
    </div>
  );
};

export default FanWalletRechargePage;
