import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BettingHistory from './BettingHistory';
import EditLotteryResults from './EditLotteryResults';
import './AdminDashboard.css';
import './BettingHistory.css';
import './EditLotteryResults.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = '/api';

// Configure axios to send admin/staff ID in headers
axios.interceptors.request.use((config) => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
  const isStaffLoggedIn = localStorage.getItem('isStaffLoggedIn');
  
  if (isAdminLoggedIn) {
    const adminId = localStorage.getItem('adminId');
    if (adminId) {
      config.headers['admin-id'] = adminId;
    }
  } else if (isStaffLoggedIn) {
    const staffId = localStorage.getItem('staffId');
    if (staffId) {
      config.headers['staff-id'] = staffId;
    }
  }
  
  return config;
});

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('members');
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteStaffConfirm, setDeleteStaffConfirm] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    referralCode: '',
    balance: 0,
    creditScore: 100,
    minWithdrawal: 0,
    maxWithdrawal: 0,
    vipLevel: 0,
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: ''
  });
  const [staffFormData, setStaffFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    position: 'Nhân viên',
    referralCode: '',
    status: 'active'
  });
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    subordinate: '',
    ip: '',
    status: '',
    withdrawal_enabled: '',
    startDate: '',
    endDate: ''
  });
  const [staffSearchFilters, setStaffSearchFilters] = useState({
    name: '',
    position: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransactionConfirm, setDeleteTransactionConfirm] = useState(null);
  const [transactionFormData, setTransactionFormData] = useState({
    userId: '',
    username: '',
    transactionType: 'deposit',
    amount: 0,
    description: '',
    status: 'completed',
    adminNote: ''
  });
  const [transactionSearchFilters, setTransactionSearchFilters] = useState({
    username: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState(null);
  const [trackingList, setTrackingList] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'tracking'
  const [moneyTab, setMoneyTab] = useState('all'); // 'all', 'pending_deposits', 'pending_withdrawals'
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [deleteProductConfirm, setDeleteProductConfirm] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'active'
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [productSearchFilters, setProductSearchFilters] = useState({
    name: '',
    category: '',
    status: ''
  });
  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsFormData, setSettingsFormData] = useState({
    company_description: '',
    address_australia: '',
    address_korea: '',
    address_vietnam: '',
    telegram_link: '',
    fanpage_link: '',
    support_phone: '',
    fanpage_name: '',
    fanpage_followers: '',
    bank_name: '',
    bank_account_holder: '',
    bank_account_number: ''
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [statistics, setStatistics] = useState([]);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  // Poll Management States
  const [pollCategories, setPollCategories] = useState([]);
  const [pollCategoriesLoading, setPollCategoriesLoading] = useState(true);
  const [pollsList, setPollsList] = useState([]);
  const [pollsListLoading, setPollsListLoading] = useState(true);
  const [pollsListCurrentPage, setPollsListCurrentPage] = useState(1);
  const [pollsListItemsPerPage, setPollsListItemsPerPage] = useState(10);
  const [votingHistory, setVotingHistory] = useState([]);
  const [votingHistoryLoading, setVotingHistoryLoading] = useState(true);
  const [resultHistory, setResultHistory] = useState([]);
  const [resultHistoryLoading, setResultHistoryLoading] = useState(true);
  const [pollTab, setPollTab] = useState('categories'); // 'categories', 'list', 'result-history', 'voting-history', 'edit-results'
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [showEditPollModal, setShowEditPollModal] = useState(false);
  const [showEditRewardRateModal, setShowEditRewardRateModal] = useState(false);
  const [editingRewardRatePoll, setEditingRewardRatePoll] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPoll, setEditingPoll] = useState(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null);
  const [deletePollConfirm, setDeletePollConfirm] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    image: '',
    status: 'active'
  });
  const [pollFormData, setPollFormData] = useState({
    title: '',
    categoryId: '',
    rewardCoefficients: { A: 1.0, B: 1.2, C: 1.5, D: 2.0 }, // Hệ số cho A, B, C, D
    image: '',
    content: '',
    balanceRequired: 0,
    itemKey: '',
    game: '120',
    status: 'active'
  });
  const [pollImageFile, setPollImageFile] = useState(null);
  const [pollCategorySearchFilters, setPollCategorySearchFilters] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pollListSearchFilters, setPollListSearchFilters] = useState({
    title: '',
    status: '',
    category: ''
  });
  const [resultHistorySearchFilters, setResultHistorySearchFilters] = useState({
    periodNumber: '',
    votingTypeName: '',
    startDate: '',
    endDate: ''
  });
  const [votingHistorySearchFilters, setVotingHistorySearchFilters] = useState({
    type: '',
    username: '',
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra đăng nhập admin hoặc staff
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const isStaffLoggedIn = localStorage.getItem('isStaffLoggedIn');
    
    if (!isAdminLoggedIn && !isStaffLoggedIn) {
      navigate('/admin/login');
      return;
    }
    
    // Xác định role
    if (isAdminLoggedIn) {
      setIsAdmin(true);
      setCurrentUsername(localStorage.getItem('adminUsername') || 'Admin');
    } else if (isStaffLoggedIn) {
      setIsAdmin(false);
      setCurrentUsername(localStorage.getItem('staffUsername') || 'Nhân viên');
    }

    // Load danh sách thành viên
    loadMembers();
    // Load danh sách nhân viên (chỉ admin)
    if (isAdminLoggedIn) {
      loadStaff();
      loadAdmins();
    }
    // Load danh sách giao dịch
    loadTransactions();
    // Load danh sách orders và tracking
    loadOrders();
    loadTracking();
    // Load danh sách sản phẩm
    loadProducts();
    // Load settings (chỉ admin)
    if (isAdminLoggedIn) {
      loadSettings();
      loadStatistics();
    }
    // Poll management data will be loaded when user accesses the menu
    
    // Nếu staff cố truy cập menu bị hạn chế, chuyển về members
    if (!isAdminLoggedIn && isStaffLoggedIn && (activeMenu === 'settings' || activeMenu === 'statistics' || activeMenu === 'staff')) {
      setActiveMenu('members');
    }
  }, [navigate]);

  // Load poll data when poll-management menu is active
  useEffect(() => {
    if (activeMenu === 'poll-management') {
      if (pollTab === 'categories') {
        loadPollCategories();
      } else if (pollTab === 'list') {
        loadPollsList();
        loadPollCategories(); // Also load categories for dropdown
      } else if (pollTab === 'result-history') {
        loadResultHistory();
        loadPollCategories(); // Also load categories for dropdown
      } else if (pollTab === 'voting-history') {
        loadVotingHistory();
        loadPollCategories(); // Also load categories for dropdown
      } else if (pollTab === 'edit-results') {
        loadResultHistory();
      }
    }
  }, [activeMenu, pollTab]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPollsListCurrentPage(1);
  }, [pollListSearchFilters.title, pollListSearchFilters.status, pollListSearchFilters.category]);

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/admins`);
      if (response.data && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách admin:', error);
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('Đang tải danh sách thành viên...');
      const response = await axios.get(`${API_BASE_URL}/admin/members`);
      console.log('Dữ liệu nhận được:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setMembers(response.data);
        console.log(`Đã tải ${response.data.length} thành viên`);
      } else {
        console.warn('Dữ liệu không hợp lệ:', response.data);
        setMembers([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thành viên:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isAdminLoggedIn) {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminId');
      navigate('/admin/login');
    } else {
      localStorage.removeItem('isStaffLoggedIn');
      localStorage.removeItem('staffUsername');
      localStorage.removeItem('staffId');
      localStorage.removeItem('staffReferralCode');
      // Gửi event để Header component cập nhật
      window.dispatchEvent(new Event('staffLogout'));
      navigate('/staff/login');
    }
  };

  // Helper function to calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage = 10) => {
    if (totalItems === 0) return 0;
    return Math.ceil(totalItems / itemsPerPage);
  };

  const getFilteredMembers = () => {
    if (!members || !Array.isArray(members)) {
      return [];
    }
    
    let filtered = [...members];
    
    if (searchFilters.name) {
      filtered = filtered.filter(m => 
        (m.username && m.username.toLowerCase().includes(searchFilters.name.toLowerCase())) ||
        (m.full_name && m.full_name.toLowerCase().includes(searchFilters.name.toLowerCase()))
      );
    }
    
    if (searchFilters.ip) {
      filtered = filtered.filter(m => 
        (m.ip_address && m.ip_address.includes(searchFilters.ip)) ||
        (m.last_ip && m.last_ip.includes(searchFilters.ip))
      );
    }
    
    if (searchFilters.status) {
      filtered = filtered.filter(m => m.status === searchFilters.status);
    }
    
    if (searchFilters.withdrawal_enabled !== '') {
      const enabledValue = searchFilters.withdrawal_enabled === 'true' || searchFilters.withdrawal_enabled === true;
      filtered = filtered.filter(m => {
        const memberEnabled = m.withdrawal_enabled === true || m.withdrawal_enabled === 1;
        return memberEnabled === enabledValue;
      });
    }
    
    if (searchFilters.startDate) {
      filtered = filtered.filter(m => {
        if (!m.created_at) return false;
        return m.created_at.split(' ')[0] >= searchFilters.startDate;
      });
    }
    
    if (searchFilters.endDate) {
      filtered = filtered.filter(m => {
        if (!m.created_at) return false;
        return m.created_at.split(' ')[0] <= searchFilters.endDate;
      });
    }
    
    return filtered;
  };

  const handleSearch = () => {
    // Filtering is done in getFilteredMembers, just trigger re-render
    loadMembers();
  };

  const handleReset = () => {
    setSearchFilters({
      name: '',
      subordinate: '',
      ip: '',
      status: '',
      withdrawal_enabled: '',
      startDate: '',
      endDate: ''
    });
    loadMembers();
  };

  const handleAddClick = () => {
    setFormData({
      username: '',
      password: '',
      referralCode: '',
      balance: 0,
      creditScore: 100
    });
    setShowAddModal(true);
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({
      username: member.username,
      password: '', // Không hiển thị password cũ
      referralCode: member.referral_code || '',
      balance: member.balance || 0,
      creditScore: member.credit_score || 100,
      minWithdrawal: member.min_withdrawal || 0,
      maxWithdrawal: member.max_withdrawal || 0,
      vipLevel: member.vip_level || member.vip || 0,
      bankName: member.bank_name || '',
      bankAccountNumber: member.bank_account_number || '',
      bankAccountHolder: member.bank_account_holder || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (member) => {
    setDeleteConfirm(member);
  };

  const handleFreezeToggle = async (member, newStatus) => {
    const action = newStatus === 'frozen' ? 'đóng băng' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${member.username}?`)) {
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/admin/members/${member.id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Reload danh sách members để hiển thị dữ liệu mới nhất
        await loadMembers();
      }
    } catch (error) {
      alert(error.response?.data?.error || `Có lỗi xảy ra khi ${action} tài khoản`);
      console.error(`Lỗi khi ${action} tài khoản:`, error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/members`, {
        ...formData,
        min_withdrawal: formData.minWithdrawal,
        max_withdrawal: formData.maxWithdrawal,
        vip_level: formData.vipLevel
      });
      if (response.data.success) {
        // Reload danh sách members để hiển thị dữ liệu mới nhất
        await loadMembers();
        setShowAddModal(false);
        setFormData({
          username: '',
          password: '',
          referralCode: '',
          balance: 0,
          creditScore: 100,
          minWithdrawal: 0,
          maxWithdrawal: 0,
          vipLevel: 0,
          bankName: '',
          bankAccountNumber: '',
          bankAccountHolder: ''
        });
      } else {
        // Nếu response có members, cập nhật luôn
        if (response.data.members) {
          setMembers(response.data.members);
        }
        setShowAddModal(false);
        setFormData({
          username: '',
          password: '',
          referralCode: '',
          balance: 0,
          creditScore: 100,
          minWithdrawal: 0,
          maxWithdrawal: 0,
          vipLevel: 0,
          bankName: '',
          bankAccountNumber: '',
          bankAccountHolder: ''
        });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm thành viên');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/members/${editingMember.id}`, {
        ...formData,
        min_withdrawal: formData.minWithdrawal,
        max_withdrawal: formData.maxWithdrawal,
        vip_level: formData.vipLevel,
        bank_name: formData.bankName,
        bank_account_number: formData.bankAccountNumber,
        bank_account_holder: formData.bankAccountHolder
      });
      if (response.data.success) {
        // Reload danh sách members để hiển thị dữ liệu mới nhất
        await loadMembers();
        setShowEditModal(false);
        setEditingMember(null);
      } else {
        // Nếu response có members, cập nhật luôn
        if (response.data.members) {
          setMembers(response.data.members);
        }
        setShowEditModal(false);
        setEditingMember(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật thành viên');
      console.error('Lỗi khi cập nhật thành viên:', error);
    }
  };

  const handleToggleWithdrawal = async (memberId, currentValue) => {
    try {
      // Xử lý giá trị boolean: có thể là true/false hoặc 1/0
      const isEnabled = currentValue === true || currentValue === 1;
      const newValue = !isEnabled;
      
      const response = await axios.put(`${API_BASE_URL}/admin/members/${memberId}/withdrawal`, {
        withdrawal_enabled: newValue
      });
      
      if (response.data.success) {
        // Cập nhật state ngay lập tức để UI phản hồi nhanh
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.id === memberId 
              ? { ...member, withdrawal_enabled: newValue }
              : member
          )
        );
        // Reload để đảm bảo dữ liệu đồng bộ với server
        loadMembers();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái rút tiền:', error);
      // Reload members để khôi phục trạng thái cũ
      loadMembers();
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      const response = await axios.delete(`${API_BASE_URL}/admin/members/${deleteConfirm.id}`, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      if (response.data.success) {
        // Reload danh sách members để hiển thị dữ liệu mới nhất
        await loadMembers();
        setDeleteConfirm(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa thành viên');
      console.error('Lỗi khi xóa thành viên:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'balance' || name === 'creditScore' || name === 'minWithdrawal' || name === 'maxWithdrawal' || name === 'vipLevel' ? parseFloat(value) || 0 : value
    });
  };

  const loadStaff = async () => {
    try {
      setStaffLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/staff`);
      if (response.data && Array.isArray(response.data)) {
        setStaff(response.data);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error);
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAddStaffClick = () => {
    setStaffFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      position: 'Nhân viên',
      referralCode: '',
      status: 'active'
    });
    setShowAddStaffModal(true);
  };

  const handleEditStaffClick = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffFormData({
      username: staffMember.username,
      password: '',
      fullName: staffMember.full_name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      position: staffMember.position || 'Nhân viên',
      referralCode: staffMember.referral_code || '',
      status: staffMember.status || 'active'
    });
    setShowEditStaffModal(true);
  };

  const handleDeleteStaffClick = (staffMember) => {
    setDeleteStaffConfirm(staffMember);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/staff`, staffFormData);
      if (response.data.success) {
        setStaff(response.data.staff);
        setShowAddStaffModal(false);
        setStaffFormData({
          username: '',
          password: '',
          fullName: '',
          email: '',
          phone: '',
          position: 'Nhân viên',
          referralCode: '',
          status: 'active'
        });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm nhân viên');
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/staff/${editingStaff.id}`, staffFormData);
      if (response.data.success) {
        setStaff(response.data.staff);
        setShowEditStaffModal(false);
        setEditingStaff(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật nhân viên');
    }
  };

  const handleToggleStaffStatus = async (staffId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await axios.put(`${API_BASE_URL}/admin/staff/${staffId}`, {
        status: newStatus
      });
      if (response.data.success) {
        setStaff(response.data.staff);
        alert(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'ngừng'} nhân viên`);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật trạng thái nhân viên');
    }
  };

  const handleDeleteStaffConfirm = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/staff/${deleteStaffConfirm.id}`);
      if (response.data.success) {
        setStaff(response.data.staff);
        setDeleteStaffConfirm(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa nhân viên');
    }
  };

  const handleStaffFormChange = (e) => {
    const { name, value } = e.target;
    setStaffFormData({
      ...staffFormData,
      [name]: value
    });
  };

  const handleStaffSearch = () => {
    // Filter staff based on search criteria
    loadStaff();
  };

  const handleStaffReset = () => {
    setStaffSearchFilters({
      name: '',
      position: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    loadStaff();
  };

  const getFilteredStaff = () => {
    if (!staff || !Array.isArray(staff)) {
      return [];
    }
    
    let filtered = [...staff];
    
    if (staffSearchFilters.name) {
      filtered = filtered.filter(s => 
        (s.username && s.username.toLowerCase().includes(staffSearchFilters.name.toLowerCase())) ||
        (s.full_name && s.full_name.toLowerCase().includes(staffSearchFilters.name.toLowerCase()))
      );
    }
    
    if (staffSearchFilters.position) {
      filtered = filtered.filter(s => 
        s.position && s.position.toLowerCase().includes(staffSearchFilters.position.toLowerCase())
      );
    }
    
    if (staffSearchFilters.status) {
      filtered = filtered.filter(s => s.status === staffSearchFilters.status);
    }
    
    if (staffSearchFilters.startDate) {
      filtered = filtered.filter(s => {
        if (!s.created_at) return false;
        return s.created_at.split(' ')[0] >= staffSearchFilters.startDate;
      });
    }
    
    if (staffSearchFilters.endDate) {
      filtered = filtered.filter(s => {
        if (!s.created_at) return false;
        return s.created_at.split(' ')[0] <= staffSearchFilters.endDate;
      });
    }
    
    return filtered;
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/transactions`);
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
      } else if (response.data && response.data.transactions && Array.isArray(response.data.transactions)) {
        setTransactions(response.data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách giao dịch:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleTransactionSearch = () => {
    // Filter transactions based on search criteria
    loadTransactions();
  };

  const handleTransactionReset = () => {
    setTransactionSearchFilters({
      username: '',
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    loadTransactions();
  };

  const handleAddTransactionClick = () => {
    setTransactionFormData({
      userId: '',
      username: '',
      transactionType: 'deposit',
      amount: 0,
      description: '',
      status: 'completed',
      adminNote: ''
    });
    setShowAddTransactionModal(true);
  };

  const handleEditTransactionClick = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      userId: transaction.user_id || '',
      username: transaction.username || transaction.user_username || '',
      transactionType: transaction.transaction_type || 'deposit',
      amount: transaction.amount || 0,
      description: transaction.description || '',
      status: transaction.status || 'completed',
      adminNote: transaction.admin_note || ''
    });
    setShowEditTransactionModal(true);
  };

  const handleDeleteTransactionClick = (transaction) => {
    setDeleteTransactionConfirm(transaction);
  };

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/transactions`, transactionFormData);
      if (response.data.success) {
        setTransactions(response.data.transactions || response.data);
        setShowAddTransactionModal(false);
        setTransactionFormData({
          userId: '',
          username: '',
          transactionType: 'deposit',
          amount: 0,
          description: '',
          status: 'completed',
          adminNote: ''
        });
        loadTransactions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm giao dịch');
    }
  };

  const handleEditTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/transactions/${editingTransaction.id}`, {
        status: transactionFormData.status,
        adminNote: transactionFormData.adminNote
      });
      if (response.data.success) {
        setTransactions(response.data.transactions || response.data);
        setShowEditTransactionModal(false);
        setEditingTransaction(null);
        loadTransactions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật giao dịch');
    }
  };

  const handleDeleteTransactionConfirm = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/transactions/${deleteTransactionConfirm.id}`);
      if (response.data.success) {
        setTransactions(response.data.transactions || response.data);
        setDeleteTransactionConfirm(null);
        loadTransactions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa giao dịch');
    }
  };

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData({
      ...transactionFormData,
      [name]: name === 'amount' || name === 'userId' ? (parseFloat(value) || 0) : value
    });
  };

  // Approve/Reject transaction functions
  const handleApproveTransaction = async (transactionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt giao dịch này?')) {
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/admin/transactions/${transactionId}`, {
        status: 'completed',
        adminNote: 'Đã duyệt bởi admin'
      });
      
      if (response.data.success) {
        loadTransactions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi duyệt giao dịch');
      console.error('Lỗi khi duyệt giao dịch:', error);
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    const reason = window.prompt('Nhập lý do từ chối (tùy chọn):');
    if (reason === null) {
      return; // User cancelled
    }

    if (!window.confirm('Bạn có chắc chắn muốn từ chối giao dịch này?')) {
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/admin/transactions/${transactionId}`, {
        status: 'cancelled',
        adminNote: reason || 'Từ chối bởi admin'
      });
      
      if (response.data.success) {
        alert('Giao dịch đã bị từ chối!');
        loadTransactions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi từ chối giao dịch');
      console.error('Lỗi khi từ chối giao dịch:', error);
    }
  };

  const getFilteredTransactions = () => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    
    let filtered = [...transactions];
    
    if (transactionSearchFilters.username) {
      filtered = filtered.filter(t => 
        (t.username && t.username.toLowerCase().includes(transactionSearchFilters.username.toLowerCase())) ||
        (t.user_username && t.user_username.toLowerCase().includes(transactionSearchFilters.username.toLowerCase()))
      );
    }
    
    if (transactionSearchFilters.type) {
      filtered = filtered.filter(t => t.transaction_type === transactionSearchFilters.type);
    }
    
    if (transactionSearchFilters.status) {
      filtered = filtered.filter(t => t.status === transactionSearchFilters.status);
    }
    
    if (transactionSearchFilters.startDate) {
      filtered = filtered.filter(t => {
        if (!t.created_at) return false;
        return t.created_at.split(' ')[0] >= transactionSearchFilters.startDate;
      });
    }
    
    if (transactionSearchFilters.endDate) {
      filtered = filtered.filter(t => {
        if (!t.created_at) return false;
        return t.created_at.split(' ')[0] <= transactionSearchFilters.endDate;
      });
    }
    
    return filtered;
  };

  // Get filtered transactions by tab
  const getFilteredTransactionsByTab = () => {
    const filtered = getFilteredTransactions();
    
    if (moneyTab === 'pending_deposits') {
      return filtered.filter(t => 
        t.status === 'pending' && (t.transaction_type === 'deposit' || t.transaction_type === 'add')
      );
    }
    
    if (moneyTab === 'pending_withdrawals') {
      return filtered.filter(t => 
        t.status === 'pending' && (t.transaction_type === 'withdraw' || t.transaction_type === 'subtract')
      );
    }
    
    return filtered;
  };

  // Count pending transactions
  const getPendingDepositsCount = () => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions.filter(t => 
      t.status === 'pending' && (t.transaction_type === 'deposit' || t.transaction_type === 'add')
    ).length;
  };

  const getPendingWithdrawalsCount = () => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions.filter(t => 
      t.status === 'pending' && (t.transaction_type === 'withdraw' || t.transaction_type === 'subtract')
    ).length;
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/orders`);
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt đơn hàng này?')) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/orders/${orderId}/approve`);
      if (response.data.success) {
        loadOrders();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi duyệt đơn hàng');
      console.error('Lỗi khi duyệt đơn hàng:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt('Nhập lý do từ chối đơn hàng (tùy chọn):');
    if (reason === null) {
      return; // User cancelled
    }

    if (!window.confirm('Bạn có chắc chắn muốn từ chối đơn hàng này?')) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/orders/${orderId}/reject`, { reason });
      if (response.data.success) {
        loadOrders();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi từ chối đơn hàng');
      console.error('Lỗi khi từ chối đơn hàng:', error);
    }
  };

  const handleDeleteOrderClick = (order) => {
    setDeleteOrderConfirm(order);
  };

  const handleDeleteOrderConfirm = async () => {
    if (!deleteOrderConfirm) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/orders/${deleteOrderConfirm.id}`);
      if (response.data.success) {
        setDeleteOrderConfirm(null);
        loadOrders();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa đơn hàng');
      console.error('Lỗi khi xóa đơn hàng:', error);
    }
  };

  const loadTracking = async () => {
    try {
      setTrackingLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/tracking`);
      if (response.data && Array.isArray(response.data)) {
        setTrackingList(response.data);
      } else {
        setTrackingList([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tracking:', error);
      setTrackingList([]);
    } finally {
      setTrackingLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/products`);
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setProductFormData({
      name: '',
      description: '',
      image: '',
      price: 0,
      category: '',
      stock: 0,
      status: 'active'
    });
    setShowAddProductModal(true);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      image: product.image || '',
      price: product.price || 0,
      category: product.category || '',
      stock: product.stock || 0,
      status: product.status || 'active'
    });
    setProductImageFile(null);
    setProductImagePreview(product.image || null);
    setShowEditProductModal(true);
  };

  const handleDeleteProductClick = (product) => {
    setDeleteProductConfirm(product);
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description || '');
      formData.append('price', productFormData.price);
      formData.append('category', productFormData.category || '');
      formData.append('stock', productFormData.stock);
      formData.append('status', productFormData.status);
      
      // Nếu có upload file mới, gửi file, nếu không gửi URL từ image field
      if (productImageFile) {
        formData.append('productImage', productImageFile);
      } else if (productFormData.image) {
        formData.append('image', productFormData.image);
      }
      
      const response = await axios.post(`${API_BASE_URL}/admin/products`, formData);
      if (response.data.success) {
        setProducts(response.data.products);
        setShowAddProductModal(false);
        setProductFormData({
          name: '',
          description: '',
          image: '',
          price: 0,
          category: '',
          stock: 0,
          status: 'active'
        });
        setProductImageFile(null);
        setProductImagePreview(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm sản phẩm');
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description || '');
      formData.append('price', productFormData.price);
      formData.append('category', productFormData.category || '');
      formData.append('stock', productFormData.stock);
      formData.append('status', productFormData.status);
      
      // Nếu có upload file mới, gửi file, nếu không gửi URL từ image field
      if (productImageFile) {
        formData.append('productImage', productImageFile);
      } else if (productFormData.image) {
        formData.append('image', productFormData.image);
      }
      
      const response = await axios.put(`${API_BASE_URL}/admin/products/${editingProduct.id}`, formData);
      
      if (response.data.success) {
        setProducts(response.data.products);
        setShowEditProductModal(false);
        setEditingProduct(null);
        setProductImageFile(null);
        setProductImagePreview(null);
        // Force reload to ensure images are updated
        setTimeout(() => {
          loadProducts();
        }, 100);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật sản phẩm');
    }
  };

  const handleDeleteProductConfirm = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/${deleteProductConfirm.id}`);
      if (response.data.success) {
        setProducts(response.data.products);
        setDeleteProductConfirm(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    
    // Xử lý file upload
    if (name === 'productImage' && files && files[0]) {
      const file = files[0];
      setProductImageFile(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    setProductFormData({
      ...productFormData,
      [name]: name === 'price' || name === 'stock' ? (parseFloat(value) || 0) : value
    });
  };

  const handleProductSearch = () => {
    // Filter products based on search criteria
    loadProducts();
  };

  const handleProductReset = () => {
    setProductSearchFilters({
      name: '',
      category: '',
      status: ''
    });
    loadProducts();
  };

  // Poll Management Functions
  const loadPollCategories = async () => {
    try {
      setPollCategoriesLoading(true);
      // Sử dụng bảng categories dùng chung cho xuất hàng
      const response = await axios.get(`${API_BASE_URL}/categories`);
      if (response.data && Array.isArray(response.data)) {
        setPollCategories(response.data);
      } else {
        setPollCategories([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phân loại bình chọn:', error);
      // If API endpoint doesn't exist, set empty array (feature not implemented yet)
      if (error.response?.status === 404) {
        console.log('API endpoint chưa được triển khai, sử dụng dữ liệu mẫu');
      }
      setPollCategories([]);
    } finally {
      setPollCategoriesLoading(false);
    }
  };

  const loadPollsList = async () => {
    try {
      setPollsListLoading(true);
      const params = new URLSearchParams();
      if (pollListSearchFilters.category) params.append('categoryId', pollListSearchFilters.category);
      const response = await axios.get(`${API_BASE_URL}/category-items${params.toString() ? `?${params.toString()}` : ''}`);
      if (response.data && Array.isArray(response.data)) {
        setPollsList(response.data);
      } else {
        setPollsList([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách bình chọn:', error);
      setPollsList([]);
    } finally {
      setPollsListLoading(false);
    }
  };

  const loadVotingHistory = async () => {
    try {
      setVotingHistoryLoading(true);
      const adminId = localStorage.getItem('adminId');
      console.log('📊 Loading voting history...');
      const response = await axios.get(`${API_BASE_URL}/admin/poll-history`, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      console.log('📊 Voting history response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Loaded ${response.data.length} voting history records`);
        setVotingHistory(response.data);
      } else {
        console.log('⚠️ No voting history data or invalid format');
        setVotingHistory([]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải lịch sử bình chọn:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      setVotingHistory([]);
    } finally {
      setVotingHistoryLoading(false);
    }
  };

  const loadResultHistory = async () => {
    try {
      setResultHistoryLoading(true);
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (resultHistorySearchFilters.periodNumber) {
        params.append('periodNumber', resultHistorySearchFilters.periodNumber);
      }
      if (resultHistorySearchFilters.votingTypeName) {
        params.append('votingTypeName', resultHistorySearchFilters.votingTypeName);
      }
      if (resultHistorySearchFilters.startDate) {
        params.append('startDate', resultHistorySearchFilters.startDate);
      }
      if (resultHistorySearchFilters.endDate) {
        params.append('endDate', resultHistorySearchFilters.endDate);
      }
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/admin/poll-results${queryString ? `?${queryString}` : ''}`;
      console.log('Loading result history from:', url);
      const adminId = localStorage.getItem('adminId');
      const response = await axios.get(url, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      console.log('Result history response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} result history records`);
        setResultHistory(response.data);
      } else {
        console.log('No result history data or invalid format');
        setResultHistory([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử kết quả:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      // If API endpoint doesn't exist, set empty array (feature not implemented yet)
      if (error.response?.status === 404) {
        console.log('API endpoint chưa được triển khai, sử dụng dữ liệu mẫu');
      }
      setResultHistory([]);
    } finally {
      setResultHistoryLoading(false);
    }
  };

  const handleResultHistoryReset = async () => {
    const confirmed = window.confirm(
      '⚠️ Bạn có chắc chắn muốn xóa TẤT CẢ lịch sử kết quả? Hành động này không thể hoàn tác.'
    );
    if (!confirmed) return;

    try {
      setResultHistoryLoading(true);
      const adminId = localStorage.getItem('adminId');
      const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
      const response = await axios.delete(`${API_BASE_URL}/admin/poll-results`, {
        headers: {
          'admin-id': adminId || '',
          'admin-username': adminUsername
        }
      });

      if (response.data?.success) {
        // Xóa thành công, không hiển thị alert
      }

      setResultHistory([]);
      setResultHistorySearchFilters({ periodNumber: '', votingTypeName: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('❌ Lỗi khi xóa lịch sử kết quả:', error);
      alert(error.response?.data?.error || 'Lỗi khi xóa lịch sử kết quả');
    } finally {
      setResultHistoryLoading(false);
    }
  };

  const handleAddCategoryClick = () => {
    setCategoryFormData({
      name: '',
      description: '',
      quantity: 0,
      image: '',
      status: 'active'
    });
    setShowAddCategoryModal(true);
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
      quantity: category.quantity ?? 0,
      image: category.image || '',
      status: category.status || 'active'
    });
    setShowEditCategoryModal(true);
  };

  const handleDeleteCategoryClick = (category) => {
    setDeleteCategoryConfirm(category);
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem('adminId');
      const payload = {
        name: categoryFormData.name,
        quantity: Number.isFinite(Number(categoryFormData.quantity))
          ? parseInt(categoryFormData.quantity, 10)
          : 0,
        status: categoryFormData.status
      };
      await axios.post(`${API_BASE_URL}/categories`, payload, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setShowAddCategoryModal(false);
      loadPollCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm phân loại');
    }
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingCategory) return;
      const adminId = localStorage.getItem('adminId');
      const payload = {
        name: categoryFormData.name,
        quantity: Number.isFinite(Number(categoryFormData.quantity))
          ? parseInt(categoryFormData.quantity, 10)
          : editingCategory.quantity ?? 0,
        status: categoryFormData.status
      };
      await axios.put(`${API_BASE_URL}/categories/${editingCategory.id}`, payload, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      loadPollCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật phân loại');
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    try {
      if (!deleteCategoryConfirm) return;
      const adminId = localStorage.getItem('adminId');
      await axios.delete(`${API_BASE_URL}/categories/${deleteCategoryConfirm.id}`, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setDeleteCategoryConfirm(null);
      loadPollCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa phân loại');
    }
  };

  // Helper function to parse reward_rate from JSON string or return default
  const parseRewardCoefficients = (rewardRate) => {
    if (!rewardRate) {
      return { A: 1.0, B: 1.2, C: 1.5, D: 2.0 };
    }
    
    // If it's already an object, return it
    if (typeof rewardRate === 'object' && rewardRate !== null) {
      return {
        A: rewardRate.A || 1.0,
        B: rewardRate.B || 1.2,
        C: rewardRate.C || 1.5,
        D: rewardRate.D || 2.0
      };
    }
    
    // If it's a JSON string, parse it
    if (typeof rewardRate === 'string') {
      try {
        const parsed = JSON.parse(rewardRate);
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            A: parsed.A || 1.0,
            B: parsed.B || 1.2,
            C: parsed.C || 1.5,
            D: parsed.D || 2.0
          };
        }
      } catch (e) {
        // Not a JSON string, use default
      }
    }
    
    // Default fallback
    return { A: 1.0, B: 1.2, C: 1.5, D: 2.0 };
  };

  const handleAddPollClick = () => {
    setPollFormData({
      title: '',
      categoryId: '',
      rewardCoefficients: { A: 1.0, B: 1.2, C: 1.5, D: 2.0 },
      image: '',
      content: '',
      balanceRequired: 0,
      itemKey: '',
      game: '120',
      status: 'active'
    });
    setPollImageFile(null);
    setShowAddPollModal(true);
  };

  const handleEditPollClick = (poll) => {
    setEditingPoll(poll);
    setPollFormData({
      title: poll.title || '',
      categoryId: poll.category_id || '',
      rewardCoefficients: parseRewardCoefficients(poll.reward_rate),
      image: poll.image || '',
      content: poll.content || poll.category_name || '',
      balanceRequired: poll.balance_required || 0,
      itemKey: poll.item_key || poll.id || '',
      game: poll.game || '120',
      status: poll.status || 'active'
    });
    setPollImageFile(null);
    setShowEditPollModal(true);
  };

  const handleDeletePollClick = (poll) => {
    setDeletePollConfirm(poll);
  };

  const handleAddPollSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem('adminId');
      const categoryIdInt = parseInt(pollFormData.categoryId, 10);
      const titleTrimmed = (pollFormData.title || '').trim();
      if (!titleTrimmed || !categoryIdInt) {
        alert('Vui lòng nhập Tiêu đề và chọn Danh mục.');
        return;
      }

      const categoryName = pollCategories.find(c => c.id === categoryIdInt)?.name || '';
      const category = pollCategories.find(c => c.id === categoryIdInt);

      // Validate số lượng tối đa theo phân loại
      const existingInCategory = pollsList.filter(
        (item) => parseInt(item.category_id, 10) === categoryIdInt
      );
      if (category?.quantity && existingInCategory.length >= category.quantity) {
        alert('Số lượng mục trong danh mục đã đạt tối đa theo Số lượng của phân loại.');
        return;
      }

      // Tự động đánh KEY tăng dần trong danh mục
      const maxKey = existingInCategory.reduce((max, item) => {
        const k = parseInt(item.item_key || item.id || 0) || 0;
        return k > max ? k : max;
      }, 0);
      const nextKey = maxKey + 1;
      const itemKeyToUse = pollFormData.itemKey || nextKey.toString();

      const formData = new FormData();
      formData.append('category_id', categoryIdInt.toString());
      formData.append('title', titleTrimmed);
      formData.append('reward_rate', JSON.stringify(pollFormData.rewardCoefficients));
      formData.append('content', pollFormData.content || categoryName);
      formData.append('balance_required', (Number(pollFormData.balanceRequired) || 0).toString());
      formData.append('item_key', itemKeyToUse);
      formData.append('game', pollFormData.game || '120');
      formData.append('status', pollFormData.status);
      
      // Nếu có upload file mới, gửi file, nếu không gửi URL từ image field
      if (pollImageFile) {
        formData.append('pollImage', pollImageFile);
      } else if (pollFormData.image && !pollFormData.image.startsWith('data:')) {
        // Chỉ gửi image nếu không phải base64 (tức là URL)
        formData.append('image', pollFormData.image);
      }
      
      await axios.post(`${API_BASE_URL}/category-items`, formData, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setShowAddPollModal(false);
      setPollImageFile(null);
      loadPollsList();
    } catch (error) {
      const serverMsg = error.response?.data?.error;
      const message = serverMsg || error.message || 'Lỗi khi thêm mục';
      console.error('Lỗi khi thêm mục:', error.response?.data || error);
      alert(message);
    }
  };

  const handleEditPollSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingPoll) return;
      const adminId = localStorage.getItem('adminId');
      const categoryName = pollCategories.find(c => c.id === parseInt(pollFormData.categoryId))?.name || '';
      const formData = new FormData();
      formData.append('category_id', pollFormData.categoryId.toString());
      formData.append('title', pollFormData.title);
      formData.append('reward_rate', JSON.stringify(pollFormData.rewardCoefficients));
      formData.append('content', pollFormData.content || categoryName);
      formData.append('balance_required', (Number(pollFormData.balanceRequired) || 0).toString());
      formData.append('item_key', pollFormData.itemKey || '');
      formData.append('game', pollFormData.game || '120');
      formData.append('status', pollFormData.status);
      
      // Nếu có upload file mới, gửi file, nếu không gửi URL từ image field
      if (pollImageFile) {
        formData.append('pollImage', pollImageFile);
      } else if (pollFormData.image && !pollFormData.image.startsWith('data:')) {
        // Chỉ gửi image nếu không phải base64 (tức là URL)
        formData.append('image', pollFormData.image);
      }
      
      await axios.put(`${API_BASE_URL}/category-items/${editingPoll.id}`, formData, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setShowEditPollModal(false);
      setEditingPoll(null);
      setPollImageFile(null);
      loadPollsList();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật mục');
    }
  };

  const handleDeletePollConfirm = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      await axios.delete(`${API_BASE_URL}/category-items/${deletePollConfirm.id}`, {
        headers: adminId ? { 'admin-id': adminId } : {}
      });
      setDeletePollConfirm(null);
      loadPollsList();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa mục');
    }
  };

  const handleEditResultClick = (result) => {
    // Handle edit result functionality
    alert('Chức năng chỉnh kết quả đang được phát triển');
  };

  const getFilteredProducts = () => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    let filtered = [...products];
    
    if (productSearchFilters.name) {
      filtered = filtered.filter(p => 
        p.name && p.name.toLowerCase().includes(productSearchFilters.name.toLowerCase())
      );
    }
    
    if (productSearchFilters.category) {
      filtered = filtered.filter(p => 
        p.category && p.category.toLowerCase().includes(productSearchFilters.category.toLowerCase())
      );
    }
    
    if (productSearchFilters.status) {
      filtered = filtered.filter(p => p.status === productSearchFilters.status);
    }
    
    return filtered;
  };

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/settings`);
      if (response.data) {
        setSettings(response.data);
        setSettingsFormData({
          company_description: response.data.company_description || '',
          address_australia: response.data.address_australia || '',
          address_korea: response.data.address_korea || '',
          address_vietnam: response.data.address_vietnam || '',
          telegram_link: response.data.telegram_link || '',
          fanpage_link: response.data.fanpage_link || '',
          support_phone: response.data.support_phone || '',
          fanpage_name: response.data.fanpage_name || '',
          fanpage_followers: response.data.fanpage_followers || '',
          bank_name: response.data.bank_name || '',
          bank_account_holder: response.data.bank_account_holder || '',
          bank_account_number: response.data.bank_account_number || ''
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải cài đặt:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsFormData({
      ...settingsFormData,
      [name]: value
    });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const response = await axios.put(`${API_BASE_URL}/admin/settings`, settingsFormData);
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật cài đặt');
    } finally {
      setSettingsSaving(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/statistics`, {
        params: { year: selectedYear }
      });
      if (response.data && Array.isArray(response.data)) {
        setStatistics(response.data);
      } else {
        setStatistics([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      setStatistics([]);
    } finally {
      setStatisticsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      loadStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const getChartData = () => {
    if (!statistics || statistics.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    const labels = statistics.map(s => s.monthName || s.month || '');
    const depositData = statistics.map(s => parseFloat(s.total_deposit) || 0);
    const withdrawData = statistics.map(s => parseFloat(s.total_withdraw) || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Tiền gửi',
          data: depositData,
          backgroundColor: 'rgba(39, 174, 96, 0.8)',
          borderColor: 'rgba(39, 174, 96, 1)',
          borderWidth: 1,
        },
        {
          label: 'Tiền rút',
          data: withdrawData,
          backgroundColor: 'rgba(231, 76, 60, 0.8)',
          borderColor: 'rgba(231, 76, 60, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Thống kê giao dịch năm ${selectedYear}`,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            if (typeof value === 'number' && !isNaN(value)) {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(value);
            } else {
              label += value;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number' && !isNaN(value)) {
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
                maximumFractionDigits: 0
              }).format(value);
            }
            return value;
          }
        }
      }
    }
  };

  const getTotalDeposit = () => {
    if (!statistics || statistics.length === 0) return 0;
    return statistics.reduce((sum, s) => sum + (parseFloat(s.total_deposit) || 0), 0);
  };

  const getTotalWithdraw = () => {
    if (!statistics || statistics.length === 0) return 0;
    return statistics.reduce((sum, s) => sum + (parseFloat(s.total_withdraw) || 0), 0);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="admin-title">ADMIN PANEL</h1>
        </div>
        <div className="admin-header-right">
          <select className="language-select">
            <option>Chọn Ngôn ngữ</option>
            <option>Tiếng Việt</option>
            <option>English</option>
          </select>
          <div className="admin-user-info">
            <span className="user-icon">👤</span>
            <span className="admin-username">{currentUsername} [{isAdmin ? 'Quản trị viên' : 'Nhân viên'}]</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="admin-content-wrapper">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="admin-nav">
            <div 
              className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveMenu('dashboard')}
            >
              Bảng điều khiển
            </div>
            {isAdmin && (
              <div 
                className={`nav-item ${activeMenu === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveMenu('statistics')}
              >
                Thống Kê
              </div>
            )}
            <div 
              className={`nav-item ${activeMenu === 'money' ? 'active' : ''}`}
              onClick={() => setActiveMenu('money')}
            >
              Quản Lý Tiền
            </div>
            {isAdmin && (
              <div 
                className={`nav-item ${activeMenu === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveMenu('staff')}
              >
                Quản Lý Nhân Viên
              </div>
            )}
            <div 
              className={`nav-item ${activeMenu === 'members' ? 'active' : ''}`}
              onClick={() => setActiveMenu('members')}
            >
              Quản Lý Thành Viên
            </div>
            <div 
              className={`nav-item ${activeMenu === 'polls' ? 'active' : ''}`}
              onClick={() => setActiveMenu('polls')}
            >
              Quản Lý Đơn Hàng
            </div>
            <div 
              className={`nav-item ${activeMenu === 'poll-management' ? 'active' : ''}`}
              onClick={() => setActiveMenu('poll-management')}
            >
              Quản Lý Bình Chọn
            </div>
            <div 
              className={`nav-item ${activeMenu === 'products' ? 'active' : ''}`}
              onClick={() => setActiveMenu('products')}
            >
              Quản Lý Sản Phẩm
            </div>
            {isAdmin && (
              <div 
                className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveMenu('settings')}
              >
                Cài Đặt Hệ Thống
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main-content">
          {activeMenu === 'members' && (
            <div className="member-management">
              <h2 className="page-title">Quản Lý Thành Viên</h2>
              
              {/* Search and Filter Section */}
              <div className="search-filter-section">
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Tên thành viên</label>
                    <input
                      type="text"
                      placeholder="Nhập từ khóa tìm kiếm"
                      value={searchFilters.name}
                      onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Thuộc cấp dưới</label>
                    <select
                      value={searchFilters.subordinate}
                      onChange={(e) => setSearchFilters({...searchFilters, subordinate: e.target.value})}
                    >
                      <option value="">Vui lòng chọn</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>IP</label>
                    <input
                      type="text"
                      placeholder="Vui lòng nhập IP"
                      value={searchFilters.ip}
                      onChange={(e) => setSearchFilters({...searchFilters, ip: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Trạng thái</label>
                    <select
                      value={searchFilters.status}
                      onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                    >
                      <option value="">Vui lòng chọn</option>
                      <option value="active">Hoạt động</option>
                      <option value="frozen">Đóng băng</option>
                      <option value="inactive">Vô hiệu</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Rút tiền</label>
                    <select
                      value={searchFilters.withdrawal_enabled}
                      onChange={(e) => setSearchFilters({...searchFilters, withdrawal_enabled: e.target.value})}
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Đã mở</option>
                      <option value="false">Đã đóng</option>
                    </select>
                  </div>
                </div>
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={searchFilters.startDate}
                      onChange={(e) => setSearchFilters({...searchFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Ngày kết thúc</label>
                    <input
                      type="date"
                      value={searchFilters.endDate}
                      onChange={(e) => setSearchFilters({...searchFilters, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="filter-actions">
                  <button className="btn-search" onClick={handleSearch}>Tìm kiếm</button>
                  <button className="btn-reset" onClick={handleReset}>Reset</button>
                </div>
              </div>

              {/* Member List Table */}
              <div className="table-section">
                <div className="table-header">
                  <button className="btn-add" onClick={handleAddClick}>+ Thêm</button>
                </div>
                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên đăng nhập</th>
                          <th>Giới thiệu bởi</th>
                          <th>Tên</th>
                          <th>VIP</th>
                          <th>Rút</th>
                          <th>Trạng thái</th>
                          <th>Số dư</th>
                          <th>Điểm tín nhiệm</th>
                          <th>Thông tin ngân hàng</th>
                          <th>IP</th>
                          <th>Lần cuối đã...</th>
                          <th>Thời gian đăng nhập</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filteredMembers = getFilteredMembers();
                          return filteredMembers.length === 0 ? (
                            <tr>
                              <td colSpan="14" className="empty-state">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            filteredMembers.map((member) => (
                            <tr key={member.id}>
                              <td>{member.id}</td>
                              <td>{member.username}</td>
                              <td>{member.referral_code || '-'}</td>
                              <td>{member.full_name || '-'}</td>
                              <td>{member.vip || 0}</td>
                              <td>
                                <div 
                                  className="toggle-switch" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const isEnabled = member.withdrawal_enabled === true || member.withdrawal_enabled === 1;
                                    handleToggleWithdrawal(member.id, isEnabled);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                  title={(member.withdrawal_enabled === true || member.withdrawal_enabled === 1) ? 'Nhấn để đóng chức năng rút tiền' : 'Nhấn để mở chức năng rút tiền'}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={member.withdrawal_enabled === true || member.withdrawal_enabled === 1} 
                                    readOnly 
                                    onChange={() => {}} 
                                  />
                                  <span className={`slider ${(member.withdrawal_enabled === true || member.withdrawal_enabled === 1) ? 'enabled' : 'disabled'}`}>
                                    {(member.withdrawal_enabled === true || member.withdrawal_enabled === 1) ? 'Mở' : 'Đóng'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className={`status-badge status-${member.status || 'active'}`}>
                                  {member.status === 'active' ? 'Hoạt động' : 
                                   member.status === 'frozen' ? 'Đóng băng' : 
                                   member.status === 'inactive' ? 'Vô hiệu' : 'Hoạt động'}
                                </span>
                              </td>
                              <td>{member.balance?.toFixed(2) || '0.00'}</td>
                              <td>{member.credit_score || 100}</td>
                              <td>
                                {member.bank_name && member.bank_account_number ? (
                                  <div className="bank-info">
                                    <div><strong>{member.bank_name}</strong></div>
                                    <div>{member.bank_account_number}</div>
                                    <div className="text-muted">{member.bank_account_holder || '-'}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted">Chưa liên kết</span>
                                )}
                              </td>
                              <td>
                                <span className="ip-address">{member.ip_address || member.last_ip || '-'}</span>
                              </td>
                              <td>{member.last_login_date || '-'}</td>
                              <td>{member.login_time || '-'}</td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-edit" onClick={() => handleEditClick(member)}>Sửa</button>
                                  {member.status === 'frozen' || member.status === 'inactive' ? (
                                    <button className="btn-activate" onClick={() => handleFreezeToggle(member, 'active')}>Kích hoạt</button>
                                  ) : (
                                    <button className="btn-freeze" onClick={() => handleFreezeToggle(member, 'frozen')}>Đóng băng</button>
                                  )}
                                  <button className="btn-delete" onClick={() => handleDeleteClick(member)}>Xóa</button>
                                </div>
                              </td>
                            </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
                {calculateTotalPages(getFilteredMembers().length, 10) > 1 && (
                  <div className="table-pagination">
                    <span>1 2 &gt;</span>
                    <span>Xem trang 1</span>
                    <button onClick={loadMembers}>Làm mới</button>
                    <span>Tổng cộng {getFilteredMembers().length} mục</span>
                    <span>10 mục/trang</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <div className="dashboard-content">
              <h2 className="page-title">Bảng điều khiển</h2>
              
              {/* Statistics Cards */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-value">{admins.length}</div>
                    <div className="stat-label">Tổng số tài khoản Admin</div>
                  </div>
                </div>
                <div className="stat-card stat-active">
                  <div className="stat-info">
                    <div className="stat-value">{admins.filter(a => a.status === 'active').length}</div>
                    <div className="stat-label">Đang hoạt động</div>
                  </div>
                </div>
                <div className="stat-card stat-inactive">
                  <div className="stat-info">
                    <div className="stat-value">{admins.filter(a => a.status === 'inactive' || a.status !== 'active').length}</div>
                    <div className="stat-label">Ngừng hoạt động</div>
                  </div>
                </div>
              </div>

              {/* Admin Accounts Table */}
              <div className="dashboard-table-section">
                <h3 className="dashboard-section-title">Danh sách tài khoản Admin</h3>
                {adminsLoading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="empty-state">
                              Không có dữ liệu
                            </td>
                          </tr>
                        ) : (
                          admins.map((admin) => (
                            <tr key={admin.id}>
                              <td>{admin.id}</td>
                              <td>{admin.username}</td>
                              <td>{admin.full_name || '-'}</td>
                              <td>{admin.email || '-'}</td>
                              <td>{admin.phone || '-'}</td>
                              <td>
                                <span className={`status-badge status-${admin.status || 'active'}`}>
                                  {admin.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                                </span>
                              </td>
                              <td>{admin.created_at ? admin.created_at.split(' ')[0] : '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {calculateTotalPages(admins.length, 10) > 1 && (
                  <div className="table-pagination">
                    <button onClick={loadAdmins}>Làm mới</button>
                    <span>Tổng cộng {admins.length} tài khoản</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'staff' && isAdmin && (
            <div className="staff-management">
              <h2 className="page-title">Quản Lý Nhân Viên</h2>
              
              {/* Search and Filter Section */}
              <div className="search-filter-section">
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Tên nhân viên</label>
                    <input
                      type="text"
                      placeholder="Nhập tên đăng nhập hoặc họ tên"
                      value={staffSearchFilters.name}
                      onChange={(e) => setStaffSearchFilters({...staffSearchFilters, name: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Chức vụ</label>
                    <input
                      type="text"
                      placeholder="Nhập chức vụ"
                      value={staffSearchFilters.position}
                      onChange={(e) => setStaffSearchFilters({...staffSearchFilters, position: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Trạng thái</label>
                    <select
                      value={staffSearchFilters.status}
                      onChange={(e) => setStaffSearchFilters({...staffSearchFilters, status: e.target.value})}
                    >
                      <option value="">Tất cả</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngừng</option>
                    </select>
                  </div>
                </div>
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={staffSearchFilters.startDate}
                      onChange={(e) => setStaffSearchFilters({...staffSearchFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Ngày kết thúc</label>
                    <input
                      type="date"
                      value={staffSearchFilters.endDate}
                      onChange={(e) => setStaffSearchFilters({...staffSearchFilters, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="filter-actions">
                  <button className="btn-search" onClick={handleStaffSearch}>Tìm kiếm</button>
                  <button className="btn-reset" onClick={handleStaffReset}>Reset</button>
                </div>
              </div>

              {/* Staff List Table */}
              <div className="table-section">
                <div className="table-header">
                  <button className="btn-add" onClick={handleAddStaffClick}>+ Thêm</button>
                </div>
                {staffLoading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Chức vụ</th>
                          <th>Mã giới thiệu</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filteredStaff = getFilteredStaff();
                          return filteredStaff.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="empty-state">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            filteredStaff.map((staffMember) => (
                              <tr key={staffMember.id}>
                                <td>{staffMember.id}</td>
                                <td>{staffMember.username}</td>
                                <td>{staffMember.full_name || '-'}</td>
                                <td>{staffMember.email || '-'}</td>
                                <td>{staffMember.phone || '-'}</td>
                                <td>{staffMember.position || 'Nhân viên'}</td>
                                <td>
                                  <span className="referral-code">{staffMember.referral_code || '-'}</span>
                                </td>
                                <td>
                                  <label className="toggle-switch" onClick={() => handleToggleStaffStatus(staffMember.id, staffMember.status)}>
                                    <input type="checkbox" checked={staffMember.status === 'active'} readOnly />
                                    <span className="slider">{staffMember.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span>
                                  </label>
                                </td>
                                <td>{staffMember.created_at ? staffMember.created_at.split(' ')[0] : '-'}</td>
                                <td>
                                  <button className="btn-edit" onClick={() => handleEditStaffClick(staffMember)}>Sửa</button>
                                  <button className="btn-delete" onClick={() => handleDeleteStaffClick(staffMember)}>Xóa</button>
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
                {calculateTotalPages(getFilteredStaff().length, 10) > 1 && (
                  <div className="table-pagination">
                    <span>1 2 &gt;</span>
                    <span>Xem trang 1</span>
                    <button onClick={loadStaff}>Làm mới</button>
                    <span>Tổng cộng {getFilteredStaff().length} mục</span>
                    <span>10 mục/trang</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'money' && (
            <div className="money-management">
              <h2 className="page-title">Quản Lý Tiền</h2>
              
              {/* Tabs */}
              <div className="tabs-container">
                <button 
                  className={`tab-button ${moneyTab === 'all' ? 'active' : ''}`}
                  onClick={() => setMoneyTab('all')}
                >
                  Tất Cả ({getFilteredTransactions().length})
                </button>
                <button 
                  className={`tab-button ${moneyTab === 'pending_deposits' ? 'active' : ''}`}
                  onClick={() => setMoneyTab('pending_deposits')}
                >
                  Nạp Tiền Chờ Duyệt ({getPendingDepositsCount()})
                </button>
                <button 
                  className={`tab-button ${moneyTab === 'pending_withdrawals' ? 'active' : ''}`}
                  onClick={() => setMoneyTab('pending_withdrawals')}
                >
                  Rút Tiền Chờ Duyệt ({getPendingWithdrawalsCount()})
                </button>
              </div>

              {/* Search and Filter Section */}
              <div className="search-filter-section">
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Tên người dùng</label>
                    <input
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={transactionSearchFilters.username}
                      onChange={(e) => setTransactionSearchFilters({...transactionSearchFilters, username: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Loại giao dịch</label>
                    <select
                      value={transactionSearchFilters.type}
                      onChange={(e) => setTransactionSearchFilters({...transactionSearchFilters, type: e.target.value})}
                    >
                      <option value="">Tất cả</option>
                      <option value="deposit">Nạp tiền</option>
                      <option value="withdraw">Rút tiền</option>
                      <option value="add">Thêm tiền</option>
                      <option value="subtract">Trừ tiền</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Trạng thái</label>
                    <select
                      value={transactionSearchFilters.status}
                      onChange={(e) => setTransactionSearchFilters({...transactionSearchFilters, status: e.target.value})}
                    >
                      <option value="">Tất cả</option>
                      <option value="pending">Chờ xử lý</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={transactionSearchFilters.startDate}
                      onChange={(e) => setTransactionSearchFilters({...transactionSearchFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Ngày kết thúc</label>
                    <input
                      type="date"
                      value={transactionSearchFilters.endDate}
                      onChange={(e) => setTransactionSearchFilters({...transactionSearchFilters, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="filter-actions">
                  <button className="btn-search" onClick={handleTransactionSearch}>Tìm kiếm</button>
                  <button className="btn-reset" onClick={handleTransactionReset}>Reset</button>
                </div>
              </div>

              {/* Transactions List Table */}
              <div className="table-section">
                <div className="table-header">
                  <button className="btn-add" onClick={handleAddTransactionClick}>+ Thêm Giao Dịch</button>
                </div>
                {transactionsLoading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Người dùng</th>
                          <th>Loại</th>
                          <th>Số tiền</th>
                          <th>Số dư trước</th>
                          <th>Số dư sau</th>
                          <th>Mô tả</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filteredTransactions = getFilteredTransactionsByTab();
                          return filteredTransactions.length === 0 ? (
                            <tr>
                              <td colSpan="11" className="empty-state">
                                {moneyTab === 'pending_deposits' ? 'Không có yêu cầu nạp tiền nào đang chờ duyệt' :
                                 moneyTab === 'pending_withdrawals' ? 'Không có yêu cầu rút tiền nào đang chờ duyệt' :
                                 'Không có dữ liệu'}
                              </td>
                            </tr>
                          ) : (
                            filteredTransactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td>{transaction.id}</td>
                                <td>{transaction.username || transaction.user_username || '-'}</td>
                                <td>
                                  <span className={`transaction-type ${transaction.transaction_type}`}>
                                    {transaction.transaction_type === 'deposit' ? 'Nạp tiền' : 
                                     transaction.transaction_type === 'withdraw' ? 'Rút tiền' :
                                     transaction.transaction_type === 'add' ? 'Thêm tiền' :
                                     transaction.transaction_type === 'subtract' ? 'Trừ tiền' : 
                                     transaction.transaction_type || '-'}
                                  </span>
                                </td>
                                <td className={transaction.transaction_type === 'deposit' || transaction.transaction_type === 'add' ? 'amount-positive' : 'amount-negative'}>
                                  {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'add' ? '+' : '-'}{(parseFloat(transaction.amount) || 0).toLocaleString('vi-VN')}
                                </td>
                                <td>{(parseFloat(transaction.balance_before) || 0).toLocaleString('vi-VN')}</td>
                                <td>{(parseFloat(transaction.balance_after) || 0).toLocaleString('vi-VN')}</td>
                                <td>{transaction.description || '-'}</td>
                                <td>
                                  <span className={`status-badge status-${transaction.status}`}>
                                    {transaction.status === 'pending' ? 'Chờ xử lý' : transaction.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                  </span>
                                </td>
                                <td>{transaction.admin_note || '-'}</td>
                                <td>{transaction.created_at ? transaction.created_at.split(' ')[0] : '-'}</td>
                                <td>
                                  {transaction.status === 'pending' ? (
                                    <div className="order-actions">
                                      {isAdmin ? (
                                        <>
                                          <button className="btn-approve" onClick={() => handleApproveTransaction(transaction.id)}>Duyệt</button>
                                          <button className="btn-reject" onClick={() => handleRejectTransaction(transaction.id)}>Từ chối</button>
                                        </>
                                      ) : (
                                        <span className="text-muted">Chờ admin duyệt</span>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      {isAdmin && (
                                        <>
                                          <button className="btn-edit" onClick={() => handleEditTransactionClick(transaction)}>Sửa</button>
                                          <button className="btn-delete" onClick={() => handleDeleteTransactionClick(transaction)}>Xóa</button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
                {calculateTotalPages(getFilteredTransactionsByTab().length, 10) > 1 && (
                  <div className="table-pagination">
                    <span>1 2 &gt;</span>
                    <span>Xem trang 1</span>
                    <button onClick={loadTransactions}>Làm mới</button>
                    <span>Tổng cộng {getFilteredTransactionsByTab().length} mục</span>
                    <span>10 mục/trang</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'polls' && (
            <div className="polls-management">
              <h2 className="page-title">Quản Lý Đơn Hàng</h2>
              
              {/* Tabs */}
              <div className="tabs-container">
                <button 
                  className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Đơn Hàng Order ({orders.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tracking')}
                >
                  Tracking ({trackingList.length})
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="table-section">
                  <div className="table-header">
                    <button className="btn-refresh" onClick={loadOrders}>Làm mới</button>
                  </div>
                  {ordersLoading ? (
                    <div className="loading">Đang tải...</div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="members-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Mã đơn hàng</th>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Link sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Ghi chú</th>
                            <th>Số dư</th>
                            <th>Dịch vụ</th>
                            <th>Mã tracking</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th>Ngày tạo</th>
                            <th>Xuất Hàng</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan="16" className="empty-state">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            orders.map((order) => {
                              const userBalance = parseFloat(order.user_balance) || 0;
                              const orderAmount = parseFloat(order.total_amount) || 0;
                              const hasEnoughBalance = userBalance >= orderAmount;
                              const canApprove = order.status === 'pending';
                              
                              return (
                                <tr key={order.id}>
                                  <td>{order.id}</td>
                                  <td>{order.order_number || '-'}</td>
                                  <td>{order.customer_name || '-'}</td>
                                  <td>{order.customer_email || '-'}</td>
                                  <td>{order.customer_phone || '-'}</td>
                                  <td>
                                    {order.product_link ? (
                                      <a 
                                        href={order.product_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="product-link"
                                        title={order.product_link}
                                      >
                                        {order.product_link.length > 30 
                                          ? order.product_link.substring(0, 30) + '...' 
                                          : order.product_link}
                                      </a>
                                    ) : '-'}
                                  </td>
                                  <td>{order.quantity || 0}</td>
                                  <td>
                                    {order.notes ? (
                                      <span title={order.notes}>
                                        {order.notes.length > 30 
                                          ? order.notes.substring(0, 30) + '...' 
                                          : order.notes}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td>
                                    {order.user_id ? (
                                      <span className={hasEnoughBalance ? 'balance-sufficient' : 'balance-insufficient'}>
                                        {userBalance.toLocaleString('vi-VN')}
                                      </span>
                                    ) : (
                                      <span className="balance-na">N/A</span>
                                    )}
                                  </td>
                                  <td>{order.service_name || '-'}</td>
                                  <td>{order.tracking_number || '-'}</td>
                                  <td>
                                    <span className={`status-badge status-${order.status || 'pending'}`}>
                                      {order.status === 'pending' ? 'Chờ xử lý' : 
                                       order.status === 'processing' ? 'Đang xử lý' :
                                       order.status === 'completed' ? 'Hoàn thành' :
                                       order.status === 'cancelled' ? 'Đã hủy' : 
                                       order.status || 'Chờ xử lý'}
                                    </span>
                                  </td>
                                  <td>{orderAmount.toLocaleString('vi-VN')}</td>
                                  <td>{order.created_at ? order.created_at.split(' ')[0] : '-'}</td>
                                  <td>-</td>
                                  <td>
                                    <div className="order-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      {canApprove && (
                                        <>
                                          <button
                                            className={`btn-approve ${hasEnoughBalance ? '' : 'disabled'}`}
                                            onClick={() => handleApproveOrder(order.id)}
                                            disabled={!hasEnoughBalance}
                                            title={hasEnoughBalance ? 'Duyệt đơn hàng' : 'Số dư không đủ'}
                                          >
                                            Duyệt
                                          </button>
                                          <button
                                            className="btn-reject"
                                            onClick={() => handleRejectOrder(order.id)}
                                          >
                                            Từ chối
                                          </button>
                                        </>
                                      )}
                                      <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteOrderClick(order)}
                                        style={{ 
                                          background: '#dc3545', 
                                          color: 'white', 
                                          border: 'none', 
                                          padding: '6px 12px', 
                                          borderRadius: '4px', 
                                          cursor: 'pointer',
                                          fontSize: '14px'
                                        }}
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {calculateTotalPages(orders.length, 10) > 1 && (
                    <div className="table-pagination">
                      <span>Tổng cộng {orders.length} mục</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tracking Tab */}
              {activeTab === 'tracking' && (
                <div className="table-section">
                  <div className="table-header">
                    <button className="btn-refresh" onClick={loadTracking}>Làm mới</button>
                  </div>
                  {trackingLoading ? (
                    <div className="loading">Đang tải...</div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="members-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Mã tracking</th>
                            <th>Trạng thái</th>
                            <th>Vị trí</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Ngày cập nhật</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trackingList.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="empty-state">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            trackingList.map((track) => (
                              <tr key={track.id}>
                                <td>{track.id}</td>
                                <td>{track.tracking_number || '-'}</td>
                                <td>
                                  <span className={`status-badge status-${track.status || 'pending'}`}>
                                    {track.status === 'pending' ? 'Chờ xử lý' : 
                                     track.status === 'processing' ? 'Đang xử lý' :
                                     track.status === 'in_transit' ? 'Đang vận chuyển' :
                                     track.status === 'delivered' ? 'Đã giao hàng' :
                                     track.status === 'cancelled' ? 'Đã hủy' : 
                                     track.status || '-'}
                                  </span>
                                </td>
                                <td>{track.location || '-'}</td>
                                <td>{track.description || '-'}</td>
                                <td>{track.created_at ? track.created_at.split(' ')[0] : '-'}</td>
                                <td>{track.updated_at ? track.updated_at.split(' ')[0] : '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {calculateTotalPages(trackingList.length, 10) > 1 && (
                    <div className="table-pagination">
                      <span>Tổng cộng {trackingList.length} mục</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'poll-management' && (
            <div className="poll-management">
              <h2 className="page-title">Quản Lý Bình Chọn</h2>
              
              {/* Tabs */}
              <div className="tabs-container">
                <button 
                  className={`tab-button ${pollTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setPollTab('categories')}
                >
                  Phân Loại
                </button>
                <button 
                  className={`tab-button ${pollTab === 'list' ? 'active' : ''}`}
                  onClick={() => setPollTab('list')}
                >
                  Danh sách
                </button>
                <button 
                  className={`tab-button ${pollTab === 'result-history' ? 'active' : ''}`}
                  onClick={() => setPollTab('result-history')}
                >
                  Lịch Sử Kết Quả
                </button>
                <button 
                  className={`tab-button ${pollTab === 'voting-history' ? 'active' : ''}`}
                  onClick={() => setPollTab('voting-history')}
                >
                  Lịch Sử Bình Chọn
                </button>
                <button 
                  className={`tab-button ${pollTab === 'edit-results' ? 'active' : ''}`}
                  onClick={() => setPollTab('edit-results')}
                >
                  Chỉnh Kết Quả
                </button>
              </div>

              {/* Categories Tab */}
              {pollTab === 'categories' && (
                <>
                  {/* Search and Filter Section */}
                  <div className="search-filter-section">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Phân Loại Bình Chọn</h3>
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Tên loại bình chọn</label>
                        <input
                          type="text"
                          placeholder="Nhập từ khóa tìm kiếm"
                          value={pollCategorySearchFilters.name}
                          onChange={(e) => setPollCategorySearchFilters({...pollCategorySearchFilters, name: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Trạng thái</label>
                        <select
                          value={pollCategorySearchFilters.status}
                          onChange={(e) => setPollCategorySearchFilters({...pollCategorySearchFilters, status: e.target.value})}
                        >
                          <option value="">Vui lòng chọn</option>
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Tạm dừng</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          value={pollCategorySearchFilters.startDate}
                          onChange={(e) => setPollCategorySearchFilters({...pollCategorySearchFilters, startDate: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          value={pollCategorySearchFilters.endDate}
                          onChange={(e) => setPollCategorySearchFilters({...pollCategorySearchFilters, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button className="btn-search" onClick={loadPollCategories}>Tìm kiếm</button>
                      <button className="btn-reset" onClick={() => {
                        setPollCategorySearchFilters({ name: '', status: '', startDate: '', endDate: '' });
                        loadPollCategories();
                      }}>Reset</button>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="table-section">
                    <div className="table-header">
                      <button className="btn-add" onClick={handleAddCategoryClick}>
                        <span style={{ marginRight: '8px' }}>+</span>
                        Thêm
                      </button>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn-icon" title="Grid view" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>⊞</button>
                        <button className="btn-icon" title="Export" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>⬇</button>
                        <button className="btn-icon" title="Print" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🖨</button>
                      </div>
                    </div>
                    {pollCategoriesLoading ? (
                      <div className="loading">Đang tải...</div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>
                                ID
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Tên
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Số lượng
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>Trạng thái</th>
                              <th>Thời gian tạo</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pollCategories.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="empty-state">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              pollCategories.map((category) => (
                                <tr key={category.id}>
                                  <td>{category.id}</td>
                                  <td>{category.name || '-'}</td>
                                  <td>{category.quantity ?? 0}</td>
                                  <td>
                                    <label className="toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={category.status === 'active'}
                                        onChange={() => {
                                          const newStatus = category.status === 'active' ? 'inactive' : 'active';
                                          // Cập nhật nhanh trạng thái
                                          setPollCategories(prev =>
                                            prev.map(c =>
                                              c.id === category.id ? { ...c, status: newStatus } : c
                                            )
                                          );
                                          axios
                                            .put(
                                              `${API_BASE_URL}/categories/${category.id}`,
                                              {
                                                name: category.name,
                                                quantity: category.quantity ?? 0,
                                                status: newStatus
                                              },
                                              {
                                                headers: localStorage.getItem('adminId')
                                                  ? { 'admin-id': localStorage.getItem('adminId') }
                                                  : {}
                                              }
                                            )
                                            .then(() => {
                                              // reload to sync thời gian tạo / dữ liệu khác nếu cần
                                              loadPollCategories();
                                            })
                                            .catch((error) => {
                                              console.error('Lỗi cập nhật trạng thái phân loại:', error);
                                              alert(error.response?.data?.error || 'Lỗi cập nhật trạng thái');
                                              loadPollCategories();
                                            });
                                        }}
                                      />
                                      <span className="slider">{category.status === 'active' ? 'Mở' : 'Đóng'}</span>
                                    </label>
                                  </td>
                                  <td>{category.created_at || '-'}</td>
                                  <td>
                                    <button className="btn-edit" onClick={() => handleEditCategoryClick(category)}>Sửa</button>
                                    <button className="btn-delete" onClick={() => handleDeleteCategoryClick(category)}>Xóa</button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {calculateTotalPages(pollCategories.length, 10) > 1 && (
                      <div className="table-pagination">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>‹</button>
                          <button style={{ padding: '5px 10px', background: '#DC3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>1</button>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>›</button>
                          <span style={{ marginLeft: '10px' }}>Xem trang 1</span>
                          <button className="btn-refresh" onClick={loadPollCategories} style={{ marginLeft: '10px' }}>Làm mới</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>Tổng cộng {pollCategories.length} mục</span>
                          <select style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <option>10 mục/trang</option>
                            <option>20 mục/trang</option>
                            <option>50 mục/trang</option>
                            <option>100 mục/trang</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* List Tab */}
              {pollTab === 'list' && (
                <>
                  {/* Search and Filter Section */}
                  <div className="search-filter-section">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Danh sách cá cược</h3>
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Tên loại xổ số</label>
                        <input
                          type="text"
                          placeholder="Nhập từ khóa tìm kiếm"
                          value={pollListSearchFilters.lotteryTypeName}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, lotteryTypeName: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Trạng thái</label>
                        <select
                          value={pollListSearchFilters.status}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, status: e.target.value})}
                        >
                          <option value="">Vui lòng chọn</option>
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Tạm dừng</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label>Danh mục</label>
                        <select
                          value={pollListSearchFilters.category}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, category: e.target.value})}
                        >
                          <option value="">Vui lòng chọn</option>
                          {pollCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Từ khóa</label>
                        <input
                          type="text"
                          placeholder="Nhập từ khóa tìm kiếm"
                          value={pollListSearchFilters.keyword}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, keyword: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          placeholder="Ngày bắt đầu"
                          value={pollListSearchFilters.startDate}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, startDate: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          placeholder="Ngày kết thúc"
                          value={pollListSearchFilters.endDate}
                          onChange={(e) => setPollListSearchFilters({...pollListSearchFilters, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button className="btn-search" onClick={loadPollsList}>Tìm kiếm</button>
                      <button className="btn-reset" onClick={() => {
                        setPollListSearchFilters({ lotteryTypeName: '', status: '', category: '', keyword: '', startDate: '', endDate: '' });
                        loadPollsList();
                      }}>Reset</button>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="table-section">
                    <div className="table-header">
                      <button className="btn-add" onClick={handleAddPollClick}>
                        <span style={{ marginRight: '8px' }}>+</span>
                        Thêm
                      </button>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn-icon" title="Grid view" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊞</button>
                        <button className="btn-icon" title="Export" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬇</button>
                        <button className="btn-icon" title="Print" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖨</button>
                      </div>
                    </div>
                    {pollsListLoading ? (
                      <div className="loading">Đang tải...</div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Tên loại bình chọn</th>
                              <th>Danh mục</th>
                              <th>Tỷ lệ thưởng</th>
                              <th>Ảnh</th>
                              <th>Nội dung</th>
                              <th>Yêu cầu số dư</th>
                              <th>Key</th>
                              <th>Trò chơi</th>
                              <th>Trạng thái</th>
                              <th>Thời gian tạo</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pollsList.length === 0 ? (
                              <tr>
                                <td colSpan="12" className="empty-state">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (() => {
                              const filteredPolls = pollsList.filter(p => {
                                if (pollListSearchFilters.title && !String(p.title || '').toLowerCase().includes(pollListSearchFilters.title.toLowerCase())) return false;
                                if (pollListSearchFilters.status && p.status !== pollListSearchFilters.status) return false;
                                return true;
                              });
                              const totalPages = calculateTotalPages(filteredPolls.length, pollsListItemsPerPage);
                              const startIndex = (pollsListCurrentPage - 1) * pollsListItemsPerPage;
                              const endIndex = startIndex + pollsListItemsPerPage;
                              const paginatedPolls = filteredPolls.slice(startIndex, endIndex);
                              
                              return paginatedPolls.map((poll) => (
                                  <tr key={poll.id}>
                                    <td>{poll.id}</td>
                                    <td>{poll.title || '-'}</td>
                                    <td>{poll.category_name || '-'}</td>
                                    <td>
                                      <button 
                                        className="btn-edit" 
                                        onClick={() => {
                                          setEditingRewardRatePoll(poll);
                                          setPollFormData({
                                            ...pollFormData,
                                            rewardCoefficients: parseRewardCoefficients(poll.reward_rate)
                                          });
                                          setShowEditRewardRateModal(true);
                                        }}
                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                      >
                                        Sửa tỷ lệ
                                      </button>
                                    </td>
                                    <td>
                                      {poll.image ? (
                                        <img
                                          src={poll.image}
                                          alt="item"
                                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {poll.content || poll.category_name || '-'}
                                    </td>
                                    <td>{poll.balance_required ?? 0}</td>
                                    <td>{poll.item_key || poll.id}</td>
                                    <td>
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={poll.game || ''}
                                        onChange={async (e) => {
                                          const adminId = localStorage.getItem('adminId');
                                          const newGame = e.target.value;
                                          try {
                                            await axios.put(`${API_BASE_URL}/category-items/${poll.id}`, {
                                              category_id: poll.category_id,
                                              title: poll.title,
                                              reward_rate: poll.reward_rate,
                                              image: poll.image,
                                              content: poll.content,
                                              balance_required: poll.balance_required,
                                              item_key: poll.item_key,
                                              game: newGame,
                                              status: poll.status
                                            }, {
                                              headers: adminId ? { 'admin-id': adminId } : {}
                                            });
                                            loadPollsList();
                                          } catch (err) {
                                            alert(err.response?.data?.error || 'Lỗi cập nhật trò chơi');
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                      />
                                    </td>
                                    <td>
                                      <label className="toggle-switch">
                                        <input
                                          type="checkbox"
                                          checked={poll.status === 'active'}
                                          onChange={async () => {
                                            const adminId = localStorage.getItem('adminId');
                                            const newStatus = poll.status === 'active' ? 'inactive' : 'active';
                                            try {
                                              await axios.put(`${API_BASE_URL}/category-items/${poll.id}`, {
                                                category_id: poll.category_id,
                                                title: poll.title,
                                                reward_rate: poll.reward_rate,
                                                image: poll.image,
                                                content: poll.content,
                                                balance_required: poll.balance_required,
                                                item_key: poll.item_key,
                                                game: poll.game,
                                                status: newStatus
                                              }, {
                                                headers: adminId ? { 'admin-id': adminId } : {}
                                              });
                                              loadPollsList();
                                            } catch (err) {
                                              alert(err.response?.data?.error || 'Lỗi cập nhật trạng thái');
                                              loadPollsList();
                                            }
                                          }}
                                        />
                                        <span className="slider">{poll.status === 'active' ? 'Mở' : 'Đóng'}</span>
                                      </label>
                                    </td>
                                    <td>{poll.created_at || '-'}</td>
                                    <td>
                                      <button className="btn-edit" onClick={() => handleEditPollClick(poll)}>Sửa</button>
                                      <button className="btn-delete" onClick={() => handleDeletePollClick(poll)}>Xóa</button>
                                    </td>
                                  </tr>
                                ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {(() => {
                      const filteredPolls = pollsList.filter(p => {
                        if (pollListSearchFilters.title && !String(p.title || '').toLowerCase().includes(pollListSearchFilters.title.toLowerCase())) return false;
                        if (pollListSearchFilters.status && p.status !== pollListSearchFilters.status) return false;
                        return true;
                      });
                      const totalPages = calculateTotalPages(filteredPolls.length, pollsListItemsPerPage);
                      
                      if (totalPages <= 1) return null;
                      
                      return (
                        <div className="table-pagination">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button 
                              onClick={() => setPollsListCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={pollsListCurrentPage === 1}
                              style={{ 
                                padding: '5px 10px', 
                                background: pollsListCurrentPage === 1 ? '#e0e0e0' : '#f0f0f0', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                cursor: pollsListCurrentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: pollsListCurrentPage === 1 ? 0.5 : 1
                              }}
                            >
                              ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button 
                                key={page}
                                onClick={() => setPollsListCurrentPage(page)}
                                style={{ 
                                  padding: '5px 10px', 
                                  background: pollsListCurrentPage === page ? '#DC3545' : '#f0f0f0', 
                                  color: pollsListCurrentPage === page ? '#fff' : '#000',
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  cursor: 'pointer' 
                                }}
                              >
                                {page}
                              </button>
                            ))}
                            <button 
                              onClick={() => setPollsListCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={pollsListCurrentPage === totalPages}
                              style={{ 
                                padding: '5px 10px', 
                                background: pollsListCurrentPage === totalPages ? '#e0e0e0' : '#f0f0f0', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                cursor: pollsListCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                                opacity: pollsListCurrentPage === totalPages ? 0.5 : 1
                              }}
                            >
                              ›
                            </button>
                            <span style={{ marginLeft: '10px' }}>Xem trang {pollsListCurrentPage}</span>
                            <button className="btn-refresh" onClick={loadPollsList} style={{ marginLeft: '10px' }}>Làm mới</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Tổng cộng {filteredPolls.length} mục</span>
                            <select 
                              value={pollsListItemsPerPage}
                              onChange={(e) => {
                                setPollsListItemsPerPage(Number(e.target.value));
                                setPollsListCurrentPage(1);
                              }}
                              style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            >
                              <option value={10}>10 mục/trang</option>
                              <option value={20}>20 mục/trang</option>
                              <option value={50}>50 mục/trang</option>
                              <option value={100}>100 mục/trang</option>
                            </select>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}

              {/* Result History Tab */}
              {pollTab === 'result-history' && (
                <>
                  {/* Search and Filter Section */}
                  <div className="search-filter-section">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Lịch Sử Kết Quả Xổ Số</h3>
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Kỳ số</label>
                        <input
                          type="text"
                          placeholder="Nhập từ khóa tìm kiếm"
                          value={resultHistorySearchFilters.periodNumber}
                          onChange={(e) => setResultHistorySearchFilters({...resultHistorySearchFilters, periodNumber: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Tên loại bình chọn</label>
                        <select
                          value={resultHistorySearchFilters.votingTypeName}
                          onChange={(e) => setResultHistorySearchFilters({...resultHistorySearchFilters, votingTypeName: e.target.value})}
                        >
                          <option value="">Vui lòng chọn</option>
                          {pollCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="filter-item">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          placeholder="Ngày bắt đầu"
                          value={resultHistorySearchFilters.startDate}
                          onChange={(e) => setResultHistorySearchFilters({...resultHistorySearchFilters, startDate: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          placeholder="Ngày kết thúc"
                          value={resultHistorySearchFilters.endDate}
                          onChange={(e) => setResultHistorySearchFilters({...resultHistorySearchFilters, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button className="btn-search" onClick={loadResultHistory}>Tìm kiếm</button>
                      <button className="btn-reset" onClick={handleResultHistoryReset}>Reset</button>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="table-section">
                    <div className="table-header">
                      <button className="btn-refresh" onClick={loadResultHistory}>
                        <span style={{ marginRight: '8px' }}>↻</span>
                        Làm mới
                      </button>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn-icon" title="Grid view" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊞</button>
                        <button className="btn-icon" title="Export" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬇</button>
                        <button className="btn-icon" title="Print" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖨</button>
                      </div>
                    </div>
                    {resultHistoryLoading ? (
                      <div className="loading">Đang tải...</div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>
                                ID
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Tên loại xổ số
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Key
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Loại
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Kỳ số
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Kết quả
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Trò chơi
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Cài đặt
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Thời gian mở thưởng
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Thời gian mở thưởng tiếp
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultHistory.length === 0 ? (
                              <tr>
                                <td colSpan="10" className="empty-state">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              resultHistory.map((result) => (
                                <tr key={result.id}>
                                  <td>{result.id}</td>
                                  <td>{result.lottery_type_name || result.poll_title || '-'}</td>
                                  <td>{result.key || result.id || '-'}</td>
                                  <td>{result.category_name || result.type || 'TMDT'}</td>
                                  <td>{result.period_number || result.period || '-'}</td>
                                  <td>
                                    {(() => {
                                      // Format hiển thị 2 đáp án
                                      const resultValue = result.result || result.option_name || '';
                                      // Nếu có format "A, B" hoặc chỉ "A"
                                      if (resultValue.includes(',')) {
                                        const parts = resultValue.split(',').map(s => s.trim());
                                        return (
                                          <span>
                                            <span style={{ 
                                              display: 'inline-block', 
                                              padding: '4px 8px', 
                                              margin: '2px',
                                              backgroundColor: '#e3f2fd', 
                                              borderRadius: '4px',
                                              fontWeight: '600',
                                              color: '#1976d2'
                                            }}>{parts[0]}</span>
                                            {parts[1] && (
                                              <span style={{ 
                                                display: 'inline-block', 
                                                padding: '4px 8px', 
                                                margin: '2px',
                                                backgroundColor: '#e8f5e9', 
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                color: '#388e3c'
                                              }}>{parts[1]}</span>
                                            )}
                                          </span>
                                        );
                                      } else if (resultValue) {
                                        return (
                                          <span style={{ 
                                            display: 'inline-block', 
                                            padding: '4px 8px', 
                                            backgroundColor: '#e3f2fd', 
                                            borderRadius: '4px',
                                            fontWeight: '600',
                                            color: '#1976d2'
                                          }}>{resultValue}</span>
                                        );
                                      }
                                      return '-';
                                    })()}
                                  </td>
                                  <td>{result.game || result.game_duration || '2 phút 1 kỳ'}</td>
                                  <td>{result.settings || 'Tự động mở thưởng'}</td>
                                  <td>{result.prize_opening_time || result.created_at ? new Date(result.prize_opening_time || result.created_at).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</td>
                                  <td>{result.next_prize_opening_time ? new Date(result.next_prize_opening_time).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {calculateTotalPages(resultHistory.length, 10) > 1 && (
                      <div className="table-pagination">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>‹</button>
                          <button style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>1</button>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>2</button>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>3</button>
                          <span style={{ marginLeft: '5px', marginRight: '5px' }}>...</span>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>124504</button>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>›</button>
                          <input 
                            type="number" 
                            placeholder="1" 
                            defaultValue="1"
                            style={{ marginLeft: '10px', padding: '5px 10px', width: '60px', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <span style={{ marginLeft: '5px' }}>Xem trang</span>
                          <button className="btn-refresh" onClick={loadResultHistory} style={{ marginLeft: '10px' }}>Làm mới</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>Tổng cộng {resultHistory.length} mục</span>
                          <select style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <option>10 mục/trang</option>
                            <option>20 mục/trang</option>
                            <option>50 mục/trang</option>
                            <option>100 mục/trang</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Voting History Tab */}
              {pollTab === 'voting-history' && (
                <>
                  <div className="search-filter-section">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Lịch Sử Bình Chọn</h3>
                  </div>

                  <div className="table-section">
                    {votingHistoryLoading ? (
                      <div className="loading">Đang tải...</div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Tên loại sổ số</th>
                              <th>Key</th>
                              <th>Kì số</th>
                              <th>Số tiền</th>
                              <th>Người dùng</th>
                              <th>Sản phẩm đã chọn</th>
                              <th>Trạng thái</th>
                              <th>Thời gian tạo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {votingHistory.length === 0 ? (
                              <tr>
                                <td colSpan="9" className="empty-state">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              votingHistory.map((history) => (
                                <tr key={history.id}>
                                  <td>{history.id || '—'}</td>
                                  <td>{history.item_title || '—'}</td>
                                  <td>{history.item_key || '—'}</td>
                                  <td>{history.period_number || '—'}</td>
                                  <td>{parseFloat(history.amount || 0).toLocaleString('vi-VN')}</td>
                                  <td>{history.user_username || history.username || '—'}</td>
                                  <td>
                                    {Array.isArray(history.selected_rates) && history.selected_rates.length > 0
                                      ? history.selected_rates.map((rate, idx) => {
                                          return rate;
                                        }).join(', ')
                                      : '—'}
                                  </td>
                                  <td>
                                    <span style={{
                                      color: history.status === '+' ? '#28a745' : history.status === '-' ? '#dc3545' : '#6c757d',
                                      fontWeight: 'bold',
                                      fontSize: '14px'
                                    }}>
                                      {history.statusText || history.status || '—'}
                                    </span>
                                    {history.statusText && history.statusText !== '—' && (
                                      <span style={{
                                        color: history.status === '+' ? '#28a745' : history.status === '-' ? '#dc3545' : '#6c757d',
                                        fontSize: '12px',
                                        marginLeft: '4px'
                                      }}>
                                        
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {history.created_at 
                                      ? new Date(history.created_at).toLocaleString('vi-VN', { 
                                          year: 'numeric', 
                                          month: '2-digit', 
                                          day: '2-digit', 
                                          hour: '2-digit', 
                                          minute: '2-digit', 
                                          second: '2-digit' 
                                        })
                                      : '—'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Old Voting History Tab - Removed, using BettingHistory component instead */}
              {false && pollTab === 'voting-history-old' && (
                <>
                  {/* Search and Filter Section */}
                  <div className="search-filter-section">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Ghi Chú Đặt Cược</h3>
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Loại hình</label>
                        <select
                          value={votingHistorySearchFilters.type}
                          onChange={(e) => setVotingHistorySearchFilters({...votingHistorySearchFilters, type: e.target.value})}
                        >
                          <option value="">Vui lòng chọn</option>
                          {pollCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="filter-item">
                        <label>Tên đăng nhập người chơi</label>
                        <input
                          type="text"
                          placeholder="Vui lòng nhập tên đăng nhập"
                          value={votingHistorySearchFilters.username}
                          onChange={(e) => setVotingHistorySearchFilters({...votingHistorySearchFilters, username: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          placeholder="Ngày bắt đầu"
                          value={votingHistorySearchFilters.startDate}
                          onChange={(e) => setVotingHistorySearchFilters({...votingHistorySearchFilters, startDate: e.target.value})}
                        />
                      </div>
                      <div className="filter-item">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          placeholder="Ngày kết thúc"
                          value={votingHistorySearchFilters.endDate}
                          onChange={(e) => setVotingHistorySearchFilters({...votingHistorySearchFilters, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button className="btn-search" onClick={loadVotingHistory}>Tìm kiếm</button>
                      <button className="btn-reset" onClick={() => {
                        setVotingHistorySearchFilters({ type: '', username: '', startDate: '', endDate: '' });
                        loadVotingHistory();
                      }}>Reset</button>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="table-section">
                    <div className="table-header">
                      <button className="btn-refresh" onClick={loadVotingHistory}>
                        <span style={{ marginRight: '8px' }}>↻</span>
                        Làm mới
                      </button>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn-icon" title="Grid view" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊞</button>
                        <button className="btn-icon" title="Export" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬇</button>
                        <button className="btn-icon" title="Print" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖨</button>
                      </div>
                    </div>
                    {votingHistoryLoading ? (
                      <div className="loading">Đang tải...</div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>
                                ID
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Người ...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Loại hì...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Kỳ số
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Chọn
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Số tiền
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Tỷ lệ t...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Kết qu...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Số tiền...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Số tiền...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Trạng t...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Thời gi...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                              <th>
                                Thời gia...
                                <span style={{ marginLeft: '5px', fontSize: '12px' }}>⇅</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {votingHistory.length === 0 ? (
                              <tr>
                                <td colSpan="13" className="empty-state">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              votingHistory.map((vote) => {
                                // Calculate result amount (bet_amount * rate - bet_amount)
                                const betAmount = parseFloat(vote.bet_amount || vote.amount || 0);
                                const rate = parseFloat(vote.rate || 1.2);
                                const resultAmount = betAmount * rate - betAmount;
                                const totalAmount = betAmount * rate;
                                const profitAmount = resultAmount;
                                
                                return (
                                  <tr key={vote.id}>
                                    <td>{vote.id}</td>
                                    <td>{vote.username || vote.user_name || '-'}</td>
                                    <td>{vote.poll_title || vote.type_name || '-'}</td>
                                    <td>{vote.period_number || vote.period || '-'}</td>
                                    <td>{vote.option_name || vote.selection || '-'}</td>
                                    <td>{betAmount.toFixed(2)}</td>
                                    <td>{rate.toFixed(2)}</td>
                                    <td style={{ color: resultAmount >= 0 ? '#28a745' : '#dc3545' }}>
                                      {resultAmount >= 0 ? '+' : ''}{resultAmount.toFixed(2)}
                                    </td>
                                    <td>{totalAmount.toFixed(2)}</td>
                                    <td>{profitAmount.toFixed(2)}</td>
                                    <td>{vote.status === 'resolved' || vote.status === 'completed' ? 'Đã giải quyết' : vote.status || 'Đang chờ'}</td>
                                    <td>{vote.created_at ? vote.created_at.split(' ')[0] : '-'}</td>
                                    <td>{vote.created_at ? vote.created_at.replace('T', ' ').substring(0, 16) : '-'}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {calculateTotalPages(votingHistory.length, 10) > 1 && (
                      <div className="table-pagination">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>‹</button>
                          <button style={{ padding: '5px 10px', background: '#DC3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>1</button>
                          <button style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>›</button>
                          <span style={{ marginLeft: '10px' }}>Xem trang 1</span>
                          <button className="btn-refresh" onClick={loadVotingHistory} style={{ marginLeft: '10px' }}>Làm mới</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>Tổng cộng {votingHistory.length} mục</span>
                          <select style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <option>10 mục/trang</option>
                            <option>20 mục/trang</option>
                            <option>50 mục/trang</option>
                            <option>100 mục/trang</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Edit Results Tab */}
              {pollTab === 'edit-results' && (
                <EditLotteryResults embedded={true} />
              )}
            </div>
          )}

          {activeMenu === 'products' && (
            <div className="products-management">
              <h2 className="page-title">Quản Lý Sản Phẩm</h2>
              
              {/* Search and Filter Section */}
              <div className="search-filter-section">
                <div className="filter-row">
                  <div className="filter-item">
                    <label>Tên sản phẩm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      value={productSearchFilters.name}
                      onChange={(e) => setProductSearchFilters({...productSearchFilters, name: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Danh mục</label>
                    <input
                      type="text"
                      placeholder="Nhập danh mục"
                      value={productSearchFilters.category}
                      onChange={(e) => setProductSearchFilters({...productSearchFilters, category: e.target.value})}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Trạng thái</label>
                    <select
                      value={productSearchFilters.status}
                      onChange={(e) => setProductSearchFilters({...productSearchFilters, status: e.target.value})}
                    >
                      <option value="">Tất cả</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngừng bán</option>
                    </select>
                  </div>
                </div>
                <div className="filter-actions">
                  <button className="btn-search" onClick={handleProductSearch}>Tìm kiếm</button>
                  <button className="btn-reset" onClick={handleProductReset}>Reset</button>
                </div>
              </div>

              {/* Products List Table */}
              <div className="table-section">
                <div className="table-header">
                  <button className="btn-add" onClick={handleAddProductClick}>+ Thêm sản phẩm</button>
                </div>
                {productsLoading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Hình ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Mô tả</th>
                          <th>Giá</th>
                          <th>Danh mục</th>
                          <th>Tồn kho</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filteredProducts = getFilteredProducts();
                          return filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="empty-state">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="product-image" />
                                  ) : (
                                    <span className="no-image">-</span>
                                  )}
                                </td>
                                <td>{product.name || '-'}</td>
                                <td className="description-cell">{product.description || '-'}</td>
                                <td>{product.price ? product.price.toFixed(2) : '0.00'}</td>
                                <td>{product.category || '-'}</td>
                                <td>{product.stock || 0}</td>
                                <td>
                                  <span className={`status-badge status-${product.status || 'active'}`}>
                                    {product.status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
                                  </span>
                                </td>
                                <td>{product.created_at ? product.created_at.split(' ')[0] : '-'}</td>
                                <td>
                                  <button className="btn-edit" onClick={() => handleEditProductClick(product)}>Sửa</button>
                                  <button className="btn-delete" onClick={() => handleDeleteProductClick(product)}>Xóa</button>
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
                {calculateTotalPages(getFilteredProducts().length, 10) > 1 && (
                  <div className="table-pagination">
                    <span>Tổng cộng {getFilteredProducts().length} mục</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'settings' && isAdmin && (
            <div className="settings-management">
              <h2 className="page-title">Cài Đặt Hệ Thống</h2>
              
              {settingsLoading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <form className="settings-form" onSubmit={handleSettingsSubmit}>
                  <div className="settings-section">
                    <h3 className="settings-section-title">Thông Tin Công Ty</h3>
                    <div className="form-group">
                      <label>Mô tả công ty</label>
                      <textarea
                        name="company_description"
                        value={settingsFormData.company_description}
                        onChange={handleSettingsChange}
                        rows="5"
                        placeholder="Nhập mô tả công ty"
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Địa Chỉ Liên Hệ</h3>
                    <div className="form-group">
                      <label>Địa chỉ Australia</label>
                      <input
                        type="text"
                        name="address_australia"
                        value={settingsFormData.address_australia}
                        onChange={handleSettingsChange}
                        placeholder="Nhập địa chỉ Australia"
                      />
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ Hàn Quốc</label>
                      <input
                        type="text"
                        name="address_korea"
                        value={settingsFormData.address_korea}
                        onChange={handleSettingsChange}
                        placeholder="Nhập địa chỉ Hàn Quốc"
                      />
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ Việt Nam</label>
                      <input
                        type="text"
                        name="address_vietnam"
                        value={settingsFormData.address_vietnam}
                        onChange={handleSettingsChange}
                        placeholder="Nhập địa chỉ Việt Nam"
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Liên Kết Mạng Xã Hội</h3>
                    <div className="form-group">
                      <label>Link Telegram</label>
                      <input
                        type="url"
                        name="telegram_link"
                        value={settingsFormData.telegram_link}
                        onChange={handleSettingsChange}
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Link Fanpage Facebook</label>
                      <input
                        type="url"
                        name="fanpage_link"
                        value={settingsFormData.fanpage_link}
                        onChange={handleSettingsChange}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Tên Fanpage</label>
                      <input
                        type="text"
                        name="fanpage_name"
                        value={settingsFormData.fanpage_name}
                        onChange={handleSettingsChange}
                        placeholder="Nhập tên fanpage"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số người theo dõi</label>
                      <input
                        type="text"
                        name="fanpage_followers"
                        value={settingsFormData.fanpage_followers}
                        onChange={handleSettingsChange}
                        placeholder="Ví dụ: 3.676 người theo dõi"
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Thông Tin Hỗ Trợ</h3>
                    <div className="form-group">
                      <label>Số điện thoại hỗ trợ</label>
                      <input
                        type="text"
                        name="support_phone"
                        value={settingsFormData.support_phone}
                        onChange={handleSettingsChange}
                        placeholder="Ví dụ: 1900-xxxx"
                      />
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Thông Tin Tài Khoản Ngân Hàng</h3>
                    <div className="form-group">
                      <label>Tên ngân hàng</label>
                      <input
                        type="text"
                        name="bank_name"
                        value={settingsFormData.bank_name}
                        onChange={handleSettingsChange}
                        placeholder="Ví dụ: Vietcombank, Techcombank..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Chủ tài khoản</label>
                      <input
                        type="text"
                        name="bank_account_holder"
                        value={settingsFormData.bank_account_holder}
                        onChange={handleSettingsChange}
                        placeholder="Nhập tên chủ tài khoản"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số tài khoản</label>
                      <input
                        type="text"
                        name="bank_account_number"
                        value={settingsFormData.bank_account_number}
                        onChange={handleSettingsChange}
                        placeholder="Nhập số tài khoản"
                      />
                    </div>
                  </div>

                  <div className="settings-actions">
                    <button type="submit" className="btn-submit" disabled={settingsSaving}>
                      {settingsSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={loadSettings}>
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeMenu === 'statistics' && isAdmin && (
            <div className="statistics-content">
              <h2 className="page-title">Thống Kê</h2>
              
              {/* Year Selector */}
              <div className="statistics-controls">
                <label htmlFor="year-select">Chọn năm:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="year-select"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <button className="btn-refresh" onClick={loadStatistics}>Làm mới</button>
              </div>

              {/* Summary Cards */}
              <div className="statistics-summary">
                <div className="summary-card summary-deposit">
                  <div className="summary-info">
                    <div className="summary-label">Tổng tiền gửi</div>
                    <div className="summary-value">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(getTotalDeposit())}
                    </div>
                  </div>
                </div>
                <div className="summary-card summary-withdraw">
                  <div className="summary-info">
                    <div className="summary-label">Tổng tiền rút</div>
                    <div className="summary-value">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(getTotalWithdraw())}
                    </div>
                  </div>
                </div>
                <div className="summary-card summary-net">
                  <div className="summary-info">
                    <div className="summary-label">Chênh lệch</div>
                    <div className={`summary-value ${getTotalDeposit() - getTotalWithdraw() >= 0 ? 'positive' : 'negative'}`}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(getTotalDeposit() - getTotalWithdraw())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="statistics-chart-container">
                {statisticsLoading ? (
                  <div className="loading">Đang tải dữ liệu...</div>
                ) : statistics && statistics.length > 0 ? (
                  <div className="chart-wrapper">
                    <Bar data={getChartData()} options={chartOptions} />
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Không có dữ liệu thống kê cho năm {selectedYear}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu !== 'members' && activeMenu !== 'dashboard' && activeMenu !== 'staff' && activeMenu !== 'money' && activeMenu !== 'polls' && activeMenu !== 'poll-management' && activeMenu !== 'products' && activeMenu !== 'settings' && activeMenu !== 'statistics' && (
            <div className="coming-soon">
              <h2 className="page-title">Nội dung</h2>
              <p>Nội dung sẽ được thêm sau...</p>
            </div>
          )}
        </main>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Thành Viên Mới</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã giới thiệu</label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Số dư</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Điểm tín nhiệm</label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  placeholder="Nhập điểm tín nhiệm (0-100)"
                />
              </div>
              <div className="form-group">
                <label>Số tiền tối thiểu có thể rút</label>
                <input
                  type="number"
                  name="minWithdrawal"
                  value={formData.minWithdrawal}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Số tiền tối đa có thể rút</label>
                <input
                  type="number"
                  name="maxWithdrawal"
                  value={formData.maxWithdrawal}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>VIP</label>
                <input
                  type="number"
                  name="vipLevel"
                  value={formData.vipLevel}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Thành Viên</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="form-group">
                <label>Mã giới thiệu</label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Số dư</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Điểm tín nhiệm</label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  placeholder="Nhập điểm tín nhiệm (0-100)"
                />
              </div>
              <div className="form-group">
                <label>Số tiền tối thiểu có thể rút</label>
                <input
                  type="number"
                  name="minWithdrawal"
                  value={formData.minWithdrawal}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Số tiền tối đa có thể rút</label>
                <input
                  type="number"
                  name="maxWithdrawal"
                  value={formData.maxWithdrawal}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>VIP</label>
                <input
                  type="number"
                  name="vipLevel"
                  value={formData.vipLevel}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Tên ngân hàng</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleFormChange}
                  placeholder="VD: Vietcombank, Techcombank..."
                />
              </div>
              <div className="form-group">
                <label>Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleFormChange}
                  placeholder="Nhập số tài khoản"
                />
              </div>
              <div className="form-group">
                <label>Chủ tài khoản</label>
                <input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleFormChange}
                  placeholder="Nhập tên chủ tài khoản"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa thành viên <strong>{deleteConfirm.username}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="modal-overlay" onClick={() => setShowAddStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Nhân Viên Mới</h3>
              <button className="modal-close" onClick={() => setShowAddStaffModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddStaffSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={staffFormData.username}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  value={staffFormData.password}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={staffFormData.fullName}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={staffFormData.email}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={staffFormData.phone}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Chức vụ</label>
                <input
                  type="text"
                  name="position"
                  value={staffFormData.position}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Mã giới thiệu (tùy chọn)</label>
                <input
                  type="text"
                  name="referralCode"
                  value={staffFormData.referralCode}
                  onChange={handleStaffFormChange}
                  placeholder="Để trống để hệ thống tự động tạo"
                />
                <small className="form-hint">Nếu không nhập, hệ thống sẽ tự động tạo mã giới thiệu duy nhất</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddStaffModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && editingStaff && (
        <div className="modal-overlay" onClick={() => setShowEditStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Nhân Viên</h3>
              <button className="modal-close" onClick={() => setShowEditStaffModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditStaffSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={staffFormData.username}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  name="password"
                  value={staffFormData.password}
                  onChange={handleStaffFormChange}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={staffFormData.fullName}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={staffFormData.email}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={staffFormData.phone}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Chức vụ</label>
                <input
                  type="text"
                  name="position"
                  value={staffFormData.position}
                  onChange={handleStaffFormChange}
                />
              </div>
              <div className="form-group">
                <label>Mã giới thiệu</label>
                <input
                  type="text"
                  name="referralCode"
                  value={staffFormData.referralCode}
                  onChange={handleStaffFormChange}
                  placeholder="Nhập mã giới thiệu mới"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={staffFormData.status}
                  onChange={handleStaffFormChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditStaffModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deleteStaffConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteStaffConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteStaffConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{deleteStaffConfirm.username}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteStaffConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteStaffConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <div className="modal-overlay" onClick={() => setShowAddTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Giao Dịch Mới</h3>
              <button className="modal-close" onClick={() => setShowAddTransactionModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddTransactionSubmit}>
              <div className="form-group">
                <label>ID Người dùng *</label>
                <input
                  type="number"
                  name="userId"
                  value={transactionFormData.userId}
                  onChange={handleTransactionFormChange}
                  required
                  placeholder="Nhập ID người dùng"
                />
              </div>
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  name="username"
                  value={transactionFormData.username}
                  onChange={handleTransactionFormChange}
                  required
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="form-group">
                <label>Loại giao dịch *</label>
                <select
                  name="transactionType"
                  value={transactionFormData.transactionType}
                  onChange={handleTransactionFormChange}
                  required
                >
                  <option value="deposit">Nạp tiền</option>
                  <option value="withdraw">Rút tiền</option>
                  <option value="add">Thêm tiền</option>
                  <option value="subtract">Trừ tiền</option>
                </select>
              </div>
              <div className="form-group">
                <label>Số tiền *</label>
                <input
                  type="number"
                  name="amount"
                  value={transactionFormData.amount}
                  onChange={handleTransactionFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Nhập số tiền"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  name="description"
                  value={transactionFormData.description}
                  onChange={handleTransactionFormChange}
                  placeholder="Nhập mô tả"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={transactionFormData.status}
                  onChange={handleTransactionFormChange}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="adminNote"
                  value={transactionFormData.adminNote}
                  onChange={handleTransactionFormChange}
                  rows="3"
                  placeholder="Nhập ghi chú"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddTransactionModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransactionModal && editingTransaction && (
        <div className="modal-overlay" onClick={() => setShowEditTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Giao Dịch</h3>
              <button className="modal-close" onClick={() => setShowEditTransactionModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditTransactionSubmit}>
              <div className="form-group">
                <label>Trạng thái *</label>
                <select
                  name="status"
                  value={transactionFormData.status}
                  onChange={handleTransactionFormChange}
                  required
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="adminNote"
                  value={transactionFormData.adminNote}
                  onChange={handleTransactionFormChange}
                  rows="3"
                  placeholder="Nhập ghi chú"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditTransactionModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {deleteTransactionConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteTransactionConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteTransactionConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa giao dịch <strong>#{deleteTransactionConfirm.id}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteTransactionConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteTransactionConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Sản Phẩm Mới</h3>
              <button className="modal-close" onClick={() => setShowAddProductModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddProductSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={productFormData.name}
                  onChange={handleProductFormChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductFormChange}
                  rows="3"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Link hình ảnh</label>
                <input
                  type="url"
                  name="image"
                  value={productFormData.image}
                  onChange={handleProductFormChange}
                  placeholder="Nhập URL hình ảnh"
                />
              </div>
              <div className="form-group">
                <label>Giá *</label>
                <input
                  type="number"
                  name="price"
                  value={productFormData.price}
                  onChange={handleProductFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Nhập giá sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <input
                  type="text"
                  name="category"
                  value={productFormData.category}
                  onChange={handleProductFormChange}
                  placeholder="Nhập danh mục"
                />
              </div>
              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input
                  type="number"
                  name="stock"
                  value={productFormData.stock}
                  onChange={handleProductFormChange}
                  min="0"
                  placeholder="Nhập số lượng"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={productFormData.status}
                  onChange={handleProductFormChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddProductModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div className="modal-overlay" onClick={() => setShowEditProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Sản Phẩm</h3>
              <button className="modal-close" onClick={() => setShowEditProductModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditProductSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={productFormData.name}
                  onChange={handleProductFormChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductFormChange}
                  rows="3"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Hình ảnh sản phẩm</label>
                <input
                  type="file"
                  name="productImage"
                  accept="image/*"
                  onChange={handleProductFormChange}
                />
                {productImagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={productImagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                    />
                  </div>
                )}
                <input
                  type="url"
                  name="image"
                  value={productFormData.image}
                  onChange={handleProductFormChange}
                  placeholder="Hoặc nhập URL hình ảnh"
                  style={{ marginTop: '10px' }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Chọn file để upload hoặc nhập URL hình ảnh
                </small>
              </div>
              <div className="form-group">
                <label>Giá *</label>
                <input
                  type="number"
                  name="price"
                  value={productFormData.price}
                  onChange={handleProductFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Nhập giá sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <input
                  type="text"
                  name="category"
                  value={productFormData.category}
                  onChange={handleProductFormChange}
                  placeholder="Nhập danh mục"
                />
              </div>
              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input
                  type="number"
                  name="stock"
                  value={productFormData.stock}
                  onChange={handleProductFormChange}
                  min="0"
                  placeholder="Nhập số lượng"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={productFormData.status}
                  onChange={handleProductFormChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditProductModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteProductConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteProductConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteProductConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteProductConfirm.name}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteProductConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteProductConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Phân Loại Mới</h3>
              <button className="modal-close" onClick={() => setShowAddCategoryModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddCategorySubmit}>
              <div className="form-group">
                <label>Tên phân loại *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  required
                  placeholder="Nhập tên phân loại"
                />
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={categoryFormData.quantity}
                  onChange={(e) => setCategoryFormData({...categoryFormData, quantity: e.target.value})}
                  placeholder="Nhập số lượng (tùy chọn)"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={categoryFormData.status}
                  onChange={(e) => setCategoryFormData({...categoryFormData, status: e.target.value})}
                >
                  <option value="active">Mở</option>
                  <option value="inactive">Đóng</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddCategoryModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="modal-overlay" onClick={() => setShowEditCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Phân Loại</h3>
              <button className="modal-close" onClick={() => setShowEditCategoryModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditCategorySubmit}>
              <div className="form-group">
                <label>Tên phân loại *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  required
                  placeholder="Nhập tên phân loại"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  rows="3"
                  placeholder="Nhập mô tả phân loại"
                />
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={categoryFormData.quantity}
                  onChange={(e) => setCategoryFormData({...categoryFormData, quantity: e.target.value})}
                  placeholder="Nhập số lượng (tùy chọn)"
                />
              </div>
              <div className="form-group">
                <label>Ảnh (URL)</label>
                <input
                  type="text"
                  name="image"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({...categoryFormData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={categoryFormData.status}
                  onChange={(e) => setCategoryFormData({...categoryFormData, status: e.target.value})}
                >
                  <option value="active">Mở</option>
                  <option value="inactive">Đóng</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditCategoryModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteCategoryConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteCategoryConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa phân loại <strong>{deleteCategoryConfirm.name}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteCategoryConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteCategoryConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Poll Modal */}
      {showAddPollModal && (
        <div className="modal-overlay" onClick={() => setShowAddPollModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Bình Chọn Mới</h3>
              <button className="modal-close" onClick={() => setShowAddPollModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleAddPollSubmit}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={pollFormData.title}
                  onChange={(e) => setPollFormData({...pollFormData, title: e.target.value})}
                  required
                  placeholder="Nhập tiêu đề bình chọn"
                />
              </div>
              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  name="categoryId"
                  value={pollFormData.categoryId}
                  onChange={(e) => setPollFormData({...pollFormData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Chọn phân loại</option>
                  {pollCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tỷ lệ thưởng - Hệ số</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số A:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.A}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            A: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số B:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.B}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            B: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số C:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.C}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            C: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số D:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.D}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            D: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Ảnh (upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) {
                      setPollImageFile(null);
                      return;
                    }
                    setPollImageFile(file);
                    // Tạo preview
                    const reader = new FileReader();
                    reader.onload = () => {
                      setPollFormData({...pollFormData, image: reader.result || ''});
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {pollFormData.image && (
                  <img
                    src={pollFormData.image}
                    alt="preview"
                    style={{ marginTop: '8px', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Nội dung</label>
                <input
                  type="text"
                  value={pollFormData.content}
                  onChange={(e) => setPollFormData({...pollFormData, content: e.target.value})}
                  placeholder="Tự động lấy theo danh mục nếu để trống"
                />
              </div>
              <div className="form-group">
                <label>Yêu cầu số dư</label>
                <input
                  type="number"
                  value={pollFormData.balanceRequired}
                  onChange={(e) => setPollFormData({...pollFormData, balanceRequired: e.target.value})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Key</label>
                <input
                  type="text"
                  value={pollFormData.itemKey}
                  onChange={(e) => setPollFormData({...pollFormData, itemKey: e.target.value})}
                  placeholder="Tự tăng nếu để trống"
                />
              </div>
              <div className="form-group">
                <label>Trò chơi (thời gian - giây)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pollFormData.game}
                  onChange={(e) => setPollFormData({...pollFormData, game: e.target.value})}
                  placeholder="Ví dụ: 120 (giây)"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={pollFormData.status}
                  onChange={(e) => setPollFormData({...pollFormData, status: e.target.value})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddPollModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Poll Modal */}
      {showEditPollModal && editingPoll && (
        <div className="modal-overlay" onClick={() => setShowEditPollModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Bình Chọn</h3>
              <button className="modal-close" onClick={() => setShowEditPollModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleEditPollSubmit}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={pollFormData.title}
                  onChange={(e) => setPollFormData({...pollFormData, title: e.target.value})}
                  required
                  placeholder="Nhập tiêu đề bình chọn"
                />
              </div>
              <div className="form-group">
                <label>Phân loại *</label>
                <select
                  name="categoryId"
                  value={pollFormData.categoryId}
                  onChange={(e) => setPollFormData({...pollFormData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Chọn phân loại</option>
                  {pollCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tỷ lệ thưởng - Hệ số</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số A:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.A}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            A: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số B:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.B}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            B: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số C:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.C}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            C: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số D:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.D}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            D: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Ảnh (upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) {
                      setPollImageFile(null);
                      return;
                    }
                    setPollImageFile(file);
                    // Tạo preview
                    const reader = new FileReader();
                    reader.onload = () => {
                      setPollFormData({...pollFormData, image: reader.result || ''});
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {pollFormData.image && (
                  <img
                    src={pollFormData.image}
                    alt="preview"
                    style={{ marginTop: '8px', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Nội dung</label>
                <input
                  type="text"
                  value={pollFormData.content}
                  onChange={(e) => setPollFormData({...pollFormData, content: e.target.value})}
                  placeholder="Tự động lấy theo danh mục nếu để trống"
                />
              </div>
              <div className="form-group">
                <label>Yêu cầu số dư</label>
                <input
                  type="number"
                  value={pollFormData.balanceRequired}
                  onChange={(e) => setPollFormData({...pollFormData, balanceRequired: e.target.value})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Key</label>
                <input
                  type="text"
                  value={pollFormData.itemKey}
                  onChange={(e) => setPollFormData({...pollFormData, itemKey: e.target.value})}
                  placeholder="Tự tăng nếu để trống"
                />
              </div>
              <div className="form-group">
                <label>Trò chơi (thời gian - giây)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pollFormData.game}
                  onChange={(e) => setPollFormData({...pollFormData, game: e.target.value})}
                  placeholder="Ví dụ: 120 (giây)"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={pollFormData.status}
                  onChange={(e) => setPollFormData({...pollFormData, status: e.target.value})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditPollModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Poll Confirmation Modal */}
      {deletePollConfirm && (
        <div className="modal-overlay" onClick={() => setDeletePollConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeletePollConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa bình chọn <strong>{deletePollConfirm.title}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeletePollConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeletePollConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reward Rate Modal */}
      {showEditRewardRateModal && editingRewardRatePoll && (
        <div className="modal-overlay" onClick={() => setShowEditRewardRateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sửa Tỷ Lệ Thưởng</h3>
              <button className="modal-close" onClick={() => setShowEditRewardRateModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const adminId = localStorage.getItem('adminId');
                await axios.put(`${API_BASE_URL}/category-items/${editingRewardRatePoll.id}`, {
                  category_id: editingRewardRatePoll.category_id,
                  title: editingRewardRatePoll.title,
                  reward_rate: JSON.stringify(pollFormData.rewardCoefficients),
                  image: editingRewardRatePoll.image,
                  content: editingRewardRatePoll.content,
                  balance_required: editingRewardRatePoll.balance_required,
                  item_key: editingRewardRatePoll.item_key,
                  game: editingRewardRatePoll.game,
                  status: editingRewardRatePoll.status
                }, {
                  headers: adminId ? { 'admin-id': adminId } : {}
                });
                setShowEditRewardRateModal(false);
                setEditingRewardRatePoll(null);
                loadPollsList();
              } catch (error) {
                alert(error.response?.data?.error || 'Lỗi khi cập nhật tỷ lệ thưởng');
              }
            }}>
              <div className="form-group">
                <label>Tỷ lệ thưởng - Hệ số</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số A:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.A}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            A: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số B:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.B}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            B: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số C:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.C}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            C: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Hệ số D:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pollFormData.rewardCoefficients.D}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setPollFormData({
                          ...pollFormData,
                          rewardCoefficients: {
                            ...pollFormData.rewardCoefficients,
                            D: isNaN(val) ? '' : val
                          }
                        });
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditRewardRateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Order Confirmation Modal */}
      {deleteOrderConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteOrderConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa đơn hàng</h3>
              <button className="modal-close" onClick={() => setDeleteOrderConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa đơn hàng <strong>#{deleteOrderConfirm.order_number || deleteOrderConfirm.id}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteOrderConfirm(null)}>Hủy</button>
              <button type="button" className="btn-delete-confirm" onClick={handleDeleteOrderConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

