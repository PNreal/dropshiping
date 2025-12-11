import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import FooterContent from '../components/FooterContent';
import './Register.css';

const API_BASE_URL = '/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        referralCode: formData.referralCode
      });

      if (response.data.success) {
        // Lưu thông tin đăng ký và tự động đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('userId', response.data.user.id);
        
        alert('Đăng ký thành công!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <div className="register-header">
            <h1 className="register-title">ĐĂNG KÝ</h1>
          </div>
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="referralCode">Mã giới thiệu nhân viên <span className="required">*</span></label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Nhập mã giới thiệu từ nhân viên"
                required
              />
              <small className="form-hint">Liên hệ nhân viên để nhận mã giới thiệu</small>
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="register-footer">
            <p>Bạn đã có tài khoản? <Link to="/dang-nhap" className="login-link">Đăng nhập ngay</Link></p>
          </div>
        </div>
      </div>
      <FooterContent />
    </div>
  );
};

export default Register;

