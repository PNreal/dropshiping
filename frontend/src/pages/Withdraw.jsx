import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faWallet } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import FooterContent from '../components/FooterContent';
import './Withdraw.css';

const API_BASE_URL = '/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [description, setDescription] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isBankLinked, setIsBankLinked] = useState(false);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userId) {
      navigate('/dang-nhap');
      return;
    }

    loadUserBalance();
    loadBankInfo();
    loadUserInfo();
  }, [navigate]);

  const loadBankInfo = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/bank`);
      
      if (response.data && response.data.isLinked) {
        setIsBankLinked(true);
        setBankName(response.data.bank_name || '');
        setBankAccount(response.data.bank_account_number || '');
        setAccountHolder(response.data.bank_account_holder || '');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin ngân hàng:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }
      
      // Lấy thông tin user từ API members để kiểm tra withdrawal_enabled
      const membersResponse = await axios.get(`${API_BASE_URL}/admin/members`);
      if (membersResponse.data && Array.isArray(membersResponse.data)) {
        const user = membersResponse.data.find(u => u.id === parseInt(userId));
        if (user) {
          setWithdrawalEnabled(user.withdrawal_enabled !== undefined ? user.withdrawal_enabled : true);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin user:', error);
      // Mặc định cho phép rút tiền nếu không lấy được thông tin
      setWithdrawalEnabled(true);
    }
  };

  const loadUserBalance = async () => {
    try {
      setBalanceLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setBalanceLoading(false);
        return;
      }
      
      // Lấy số dư trực tiếp từ API members (nguồn dữ liệu chính xác nhất)
      const membersResponse = await axios.get(`${API_BASE_URL}/admin/members`);
      if (membersResponse.data && Array.isArray(membersResponse.data)) {
        const user = membersResponse.data.find(u => u.id === parseInt(userId));
        if (user) {
          setUserBalance(parseFloat(user.balance) || 0);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải số dư:', error);
      // Nếu lỗi, thử lấy từ transactions như fallback
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${API_BASE_URL}/transactions/user/${userId}`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Tìm transaction completed mới nhất
          const completedTransactions = response.data.filter(t => t.status === 'completed');
          if (completedTransactions.length > 0) {
            const latestTransaction = completedTransactions[0];
            if (latestTransaction.balance_after !== undefined) {
              setUserBalance(parseFloat(latestTransaction.balance_after) || 0);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải số dư từ transactions:', err);
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount.trim() || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseFloat(amount) > userBalance) {
      alert('Số tiền rút không được vượt quá số dư hiện tại');
      return;
    }

    if (!bankName.trim() || !bankAccount.trim() || !accountHolder.trim()) {
      alert('Vui lòng điền đầy đủ thông tin ngân hàng');
      return;
    }

    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userId) {
      alert('Vui lòng đăng nhập để rút tiền');
      navigate('/dang-nhap');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions/withdraw`, {
        userId: parseInt(userId),
        amount: parseFloat(amount),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        accountHolder: accountHolder.trim(),
        description: description.trim()
      });

      if (response.data.success) {
        alert('Yêu cầu rút tiền đã được gửi! Vui lòng chờ admin duyệt.');
        // Reset form
        setAmount('');
        setDescription('');
        // Only reset bank info if not linked
        if (!isBankLinked) {
          setBankName('');
          setBankAccount('');
          setAccountHolder('');
        }
        // Reload balance để cập nhật số dư (nếu có thay đổi)
        loadUserBalance();
        navigate('/account/withdrawal-history');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền');
      console.error('Lỗi khi rút tiền:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-page">
      <div className="withdraw-container">
        <div className="withdraw-header">
          <button className="withdraw-back" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="withdraw-title-section">
            <div className="withdraw-icon">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <span className="withdraw-title">Rút tiền</span>
          </div>
        </div>

        <div className="withdraw-content">
          <div className="balance-info">
            <span className="balance-label">Số dư hiện tại:</span>
            <span className="balance-value">
              {balanceLoading ? 'Đang tải...' : `${userBalance.toLocaleString('vi-VN')}`}
            </span>
          </div>

          {!withdrawalEnabled && (
            <div className="withdrawal-disabled-notice" style={{
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#856404'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <strong>Chức năng rút tiền đã bị đóng</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    Tài khoản của bạn hiện không thể thực hiện rút tiền. Vui lòng liên hệ admin để được hỗ trợ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isBankLinked && (
            <div className="bank-linked-notice">
              <div className="notice-icon">✓</div>
              <div className="notice-text">
                <p>Thông tin ngân hàng đã được tự động điền từ tài khoản liên kết</p>
                <button 
                  type="button" 
                  className="link-bank-button"
                  onClick={() => navigate('/account/link-bank')}
                >
                  Cập nhật thông tin ngân hàng
                </button>
              </div>
            </div>
          )}

          {!isBankLinked && (
            <div className="bank-not-linked-notice">
              <p>Bạn chưa liên kết ngân hàng. Vui lòng điền thông tin bên dưới hoặc <button type="button" className="link-bank-link" onClick={() => navigate('/account/link-bank')}>liên kết ngân hàng</button> để tự động điền thông tin cho các lần sau.</p>
            </div>
          )}

          <form className="withdraw-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Số tiền rút *</label>
              <input
                type="number"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền muốn rút"
                min="1"
                max={userBalance}
                required
              />
              <small className="form-hint">Số tiền tối đa: {userBalance.toLocaleString('vi-VN')}</small>
            </div>

            <div className="form-group">
              <label className="form-label">Tên ngân hàng *</label>
              <input
                type="text"
                className="form-input"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="VD: Vietcombank, Techcombank..."
                required
                disabled={isBankLinked}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số tài khoản *</label>
              <input
                type="text"
                className="form-input"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng"
                required
                disabled={isBankLinked}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chủ tài khoản *</label>
              <input
                type="text"
                className="form-input"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Nhập tên chủ tài khoản"
                required
                disabled={isBankLinked}
              />
            </div>

            <div className="form-group form-group-fullwidth">
              <label className="form-label">Ghi chú (tùy chọn)</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập ghi chú nếu có"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading || !withdrawalEnabled}
              style={!withdrawalEnabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
            </button>
          </form>
        </div>
      </div>
      <FooterContent />
    </div>
  );
};

export default Withdraw;

