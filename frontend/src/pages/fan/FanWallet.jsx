import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFanChatHistory } from '../../services/fanApi';
import WalletRechargeScreen from '../../components/fan/WalletRechargeScreen';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';

const FanWallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [wRes, txRes] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/wallet/transactions').catch(() => ({ data: { success: false, transactions: [] } }))
        ]);
        setBalance(wRes.data.balance || 0);
        if (txRes.data?.success) {
          setTransactions(txRes.data.transactions || []);
        }
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/fan/login?redirect=/fan/wallet');
        } else {
          setLoading(false);
        }
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #38BDF8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <WalletRechargeScreen 
          rate={10}
          balance={balance}
          transactions={transactions}
          onCancel={() => navigate('/discovery')}
          onRechargeSuccess={async () => {
            try {
              const res = await api.get('/wallet/balance');
              setBalance(res.data.balance || 0);
            } catch (err) {
              console.error('Failed to refresh balance after recharge', err);
            }
          }}
        />
      </div>
      <FanBottomNav />
    </div>
  );
};

export default FanWallet;
