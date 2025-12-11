import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCreditCard, faWallet, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import FooterContent from '../components/FooterContent';
import './TopUp.css';

const API_BASE_URL = '/api';

const TopUp = () => {
  const navigate = useNavigate();
  const [bankAmount, setBankAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(true);
  const [isEwalletOpen, setIsEwalletOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bank_name: 'Đang cập nhật',
    bank_account_holder: 'Đang cập nhật',
    bank_account_number: 'Đang cập nhật'
  });

  useEffect(() => {
    const loadBankInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/settings`);
        if (response.data) {
          setBankInfo({
            bank_name: response.data.bank_name || 'Đang cập nhật',
            bank_account_holder: response.data.bank_account_holder || 'Đang cập nhật',
            bank_account_number: response.data.bank_account_number || 'Đang cập nhật'
          });
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin ngân hàng:', error);
      }
    };
    loadBankInfo();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAmountChange = (e) => {
    // Lấy giá trị và loại bỏ tất cả ký tự không phải số
    let value = e.target.value.replace(/[^0-9]/g, '');
    setBankAmount(value);
  };

  const handleBankConfirm = async () => {
    const amount = parseFloat(bankAmount);
    
    if (!bankAmount.trim() || isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)');
      return;
    }

    if (amount < 10000) {
      alert('Số tiền nạp tối thiểu là 10.000');
      return;
    }

    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userId) {
      alert('Vui lòng đăng nhập để nạp tiền');
      navigate('/dang-nhap');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn nạp ${amount.toLocaleString('vi-VN')}?\n\nSau khi xác nhận, vui lòng chuyển khoản đến:\n- Ngân hàng: ${bankInfo.bank_name}\n- Chủ TK: ${bankInfo.bank_account_holder}\n- Số TK: ${bankInfo.bank_account_number}\n\nYêu cầu sẽ được gửi và chờ admin duyệt.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions/deposit`, {
        userId: parseInt(userId),
        amount: amount,
        description: `Nạp tiền qua ngân hàng ${bankInfo.bank_name} - Số tiền: ${amount.toLocaleString('vi-VN')}`
      });

      if (response.data.success) {
        alert(`Yêu cầu nạp tiền ${amount.toLocaleString('vi-VN')} đã được gửi thành công!\n\nVui lòng chờ admin duyệt yêu cầu của bạn.`);
        setBankAmount('');
        navigate('/account/deposit-history');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi tạo yêu cầu nạp tiền');
      console.error('Lỗi khi nạp tiền:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="top-up-page">
      <div className="top-up-container">
        <div className="top-up-header">
          <button className="top-up-back" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="top-up-title">Nạp điểm</h1>
        </div>

        <div className="top-up-content">
          {/* Bank Option */}
          <div className="top-up-option-wrapper">
            <div 
              className="top-up-option-header" 
              onClick={() => setIsBankOpen(!isBankOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="top-up-option-left">
                <div className="top-up-icon">
                  <FontAwesomeIcon icon={faCreditCard} />
                </div>
                <span className="top-up-option-text">Ngân hàng</span>
              </div>
              <span className="top-up-arrow">
                <FontAwesomeIcon icon={isBankOpen ? faChevronUp : faChevronDown} />
              </span>
            </div>
            
            <div className={`top-up-form ${isBankOpen ? 'open' : 'closed'}`}>
              <div className="amount-section">
                <label className="amount-label">Số tiền *</label>
                <input
                  type="text"
                  className="amount-input"
                  value={bankAmount}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền (VD: 100000)"
                  disabled={loading}
                />
                {bankAmount && (
                  <div className="amount-preview">
                    Số tiền: <strong>{parseFloat(bankAmount).toLocaleString('vi-VN')}</strong>
                  </div>
                )}
                <small className="amount-hint">Số tiền tối thiểu: 10.000</small>
              </div>

              <div className="bank-info-section">
                <p className="bank-info-notice">
                  Sau đây là thông tin tài khoản ngân hàng bạn cần chuyển khoản
                </p>
                <div className="bank-info-table">
                  <div className="bank-info-row">
                    <span className="bank-info-label">Tên ngân hàng</span>
                    <span className="bank-info-value">{bankInfo.bank_name}</span>
                  </div>
                  <div className="bank-info-row">
                    <span className="bank-info-label">Chủ tài khoản</span>
                    <span className="bank-info-value">{bankInfo.bank_account_holder}</span>
                  </div>
                  <div className="bank-info-row">
                    <span className="bank-info-label">Số tài khoản</span>
                    <span className="bank-info-value">{bankInfo.bank_account_number}</span>
                  </div>
                </div>
              </div>

              <button 
                className="confirm-button" 
                onClick={handleBankConfirm}
                disabled={loading || !bankAmount.trim()}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
              </button>
            </div>
          </div>

          {/* E-wallet Option */}
          <div className="top-up-option-wrapper">
            <div 
              className="top-up-option-header" 
              onClick={() => setIsEwalletOpen(!isEwalletOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="top-up-option-left">
                <div className="top-up-icon">
                  <FontAwesomeIcon icon={faWallet} />
                </div>
                <span className="top-up-option-text">Ví điện tử</span>
              </div>
              <span className="top-up-arrow">
                <FontAwesomeIcon icon={isEwalletOpen ? faChevronUp : faChevronDown} />
              </span>
            </div>
            
            <div className={`top-up-form ${isEwalletOpen ? 'open' : 'closed'}`}>
              <p className="contact-message">Vui lòng liên hệ CSKH</p>
            </div>
          </div>
        </div>
      </div>
      <FooterContent />
    </div>
  );
};

export default TopUp;

