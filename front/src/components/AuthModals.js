import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, UserPlus, X, AlertCircle } from 'lucide-react';

// Modal Đăng nhập
export const LoginModal = ({ onClose, onSuccess, setAuthUser, setShowLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
  setLoading(true);

  const response = await axios.post("http://127.0.0.1:5000/api/login", {
    identifier: username.trim(),   // có thể là username hoặc email
    password: password
  });

  const user = response.data.user;
  if (!user) throw new Error("Phản hồi không hợp lệ");

  // ✅ cập nhật state App
  setAuthUser(user);
  localStorage.setItem("authUser", JSON.stringify(user));

  // ✅ đóng modal
  setShowLogin(false);

  // gọi callback nếu có
  if (onSuccess) onSuccess(user);

} catch (err) {
  setError(err.response?.data?.error || "Đăng nhập thất bại");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-600">
          <h3 className="font-bold text-xl flex items-center gap-2 text-white">
            <LogIn className="w-6 h-6" /> Đăng nhập
          </h3>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal Đăng ký
export const RegisterModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/register", {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password
      });

      const userData = response.data;
      onSuccess(userData);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      const errorMsg = err?.response?.data?.error || "Không thể đăng ký. Username có thể đã được sử dụng.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-600">
          <h3 className="font-bold text-xl flex items-center gap-2 text-white">
            <UserPlus className="w-6 h-6" /> Đăng ký tài khoản
          </h3>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Nguyễn Văn A"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Tạo tài khoản"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};