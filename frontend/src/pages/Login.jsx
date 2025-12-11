import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import FooterContent from '../components/FooterContent';
import './Login.css';

const API_BASE_URL = '/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: formData.username,
        password: formData.password
      });

      if (response.data.success) {
        // Lưu thông tin đăng nhập vào localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('userId', response.data.user.id);
        
        // Lấy đường dẫn trước đó hoặc chuyển về trang chủ
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1 className="login-title">ĐĂNG NHẬP</h1>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
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

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p>Bạn không có tài khoản? <Link to="/dang-ky" className="register-link">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
      <FooterContent />
    </div>
  );
};

export default Login;

