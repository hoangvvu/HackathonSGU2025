// src/admin/AdminLayout.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  LayoutGrid, MapPin, Star, Shield, Compass, BarChart3,
  Users, Menu, Search, Camera, Ticket, Building, Utensils, Navigation, X
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

/* ========== Các card thống kê nhỏ ========== */
const AdminStatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="p-6 rounded-xl border-2 bg-white hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-2">{sub}</div>}
  </div>
);

/* ========== Dashboard ========== */
const AdminDashboard = () => {
  const [aiTrends, setAiTrends] = useState(null);
  const [loading, setLoading] = useState(false);

  const stats = [
    { title: "Tổng người dùng", value: "2,847", sub: "+12.5% tháng này", icon: Users, color: "blue" },
    { title: "Địa điểm", value: "156", sub: "8 mới tuần này", icon: MapPin, color: "green" },
    { title: "Đánh giá", value: "4,521", sub: "Trung bình 4.2⭐", icon: Star, color: "yellow" },
    { title: "Lượt tìm kiếm", value: "18.2K", sub: "+8.3% so tuần trước", icon: BarChart3, color: "purple" },
  ];

  const fetchAITrends = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/chat",
        new URLSearchParams({
          message:
            'Phân tích xu hướng du lịch Việt Nam mùa cao điểm 2025. Trả về JSON: {"trends": ["xu hướng 1"], "hotDestinations": [{"name": "tên", "reason": "lý do"}], "avgCost": "chi phí TB"}. Chỉ JSON.',
        })
      );
      const jsonMatch = response.data.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) setAiTrends(JSON.parse(jsonMatch[0]));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <AdminStatCard key={i} {...s} />
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🤖 AI Dự đoán xu hướng cao điểm
        </h2>
        <button
          onClick={fetchAITrends}
          disabled={loading}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition disabled:opacity-50 mb-4"
        >
          {loading ? "🔄 AI đang phân tích..." : "📊 Phân tích ngay"}
        </button>

        {aiTrends && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80 mb-2">Xu hướng nổi bật</p>
              <ul className="space-y-1 text-sm">
                {aiTrends.trends?.map((t, i) => <li key={i}>✨ {t}</li>)}
              </ul>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80 mb-2">Điểm đến HOT</p>
              {aiTrends.hotDestinations?.map((d, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold">🔥 {d.name}</p>
                  <p className="text-xs opacity-90">{d.reason}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80 mb-2">Chi phí TB</p>
              <p className="text-3xl font-bold">{aiTrends.avgCost}</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" />
          Địa điểm được tìm kiếm nhiều nhất
        </div>
        <div className="p-4 space-y-3">
          {[
            { name: "Phú Quốc", searches: 8420, trend: "+15%" },
            { name: "Đà Lạt", searches: 7230, trend: "+8%" },
            { name: "Hạ Long", searches: 6180, trend: "+12%" },
            { name: "Nha Trang", searches: 5940, trend: "+5%" },
            { name: "Đà Nẵng", searches: 5710, trend: "+10%" },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.searches.toLocaleString()} lượt</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold text-sm">{d.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========== Locations ========== */
const AdminLocations = () => {
  const [locations, setLocations] = useState([
    { id: 1, name: "Vịnh Hạ Long", category: "Thiên nhiên", rating: 4.8, reviews: 1240, status: "active" },
    { id: 2, name: "Phố cổ Hội An", category: "Văn hóa", rating: 4.9, reviews: 2130, status: "active" },
    { id: 3, name: "Đảo Phú Quốc", category: "Nghỉ dưỡng", rating: 4.7, reviews: 980, status: "active" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editLocation, setEditLocation] = useState(null);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Quản lý Địa điểm
        </h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition">
          ➕ Thêm địa điểm
        </button>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Tên địa điểm</th>
              <th className="text-left px-4 py-3">Danh mục</th>
              <th className="text-center px-4 py-3">Đánh giá</th>
              <th className="text-center px-4 py-3">Reviews</th>
              <th className="text-center px-4 py-3">Trạng thái</th>
              <th className="text-center px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{loc.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{loc.category}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{loc.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{loc.reviews}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Hoạt động</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setEditLocation(loc); setShowModal(true); }} className="px-3 py-1 text-xs rounded border hover:bg-gray-100 mr-2">
                    Sửa
                  </button>
                  <button className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editLocation ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}</h3>
              <button onClick={() => { setShowModal(false); setEditLocation(null); }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tên địa điểm</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue={editLocation?.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Danh mục</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option>Thiên nhiên</option>
                    <option>Văn hóa</option>
                    <option>Nghỉ dưỡng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tọa độ (Lat, Lng)</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="10.8231, 106.6297" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setEditLocation(null); }} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                  Hủy
                </button>
                <button type="button" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========== Reviews ========== */
const AdminReviews = () => {
  const reviews = [
    { id: 1, user: "Nguyễn Văn A", location: "Phú Quốc", rating: 5, comment: "Cực kỳ tuyệt vời!", date: "2025-01-05", status: "approved" },
    { id: 2, user: "Trần Thị B", location: "Đà Lạt", rating: 4, comment: "Đẹp nhưng hơi đông", date: "2025-01-04", status: "pending" },
    { id: 3, user: "Lê Văn C", location: "Hạ Long", rating: 3, comment: "Tàu hơi cũ", date: "2025-01-03", status: "pending" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Star className="w-6 h-6" />
        Quản lý Đánh giá
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Tổng đánh giá</p>
          <p className="text-3xl font-bold">4,521</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Trung bình</p>
          <p className="text-3xl font-bold">4.2 ⭐</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Chờ duyệt</p>
          <p className="text-3xl font-bold text-orange-500">23</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold">{r.user}</p>
                <p className="text-sm text-gray-500">{r.location} • {r.date}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-3">{r.comment}</p>
            <div className="flex gap-2">
              {r.status === 'pending' ? (
                <>
                  <button className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600">✅ Duyệt</button>
                  <button className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">❌ Từ chối</button>
                </>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">Đã duyệt</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========== Users ========== */
const AdminUsers = () => {
  const [users] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", role: "admin", status: "active", joined: "2024-01-15" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com", role: "user", status: "active", joined: "2024-03-20" },
    { id: 3, name: "Lê Văn C", email: "c@gmail.com", role: "moderator", status: "suspended", joined: "2024-06-10" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Quản lý Người dùng
        </h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
          ➕ Thêm user
        </button>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">Vai trò</th>
              <th className="text-center px-4 py-3">Trạng thái</th>
              <th className="text-center px-4 py-3">Ngày tham gia</th>
              <th className="text-center px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'admin' ? 'bg-red-100 text-red-700' :
                    u.role === 'moderator' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role === 'admin' ? '👑 Admin' : u.role === 'moderator' ? '🛡️ Moderator' : '👤 User'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{u.joined}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setEditUser(u); setShowModal(true); }} className="px-3 py-1 text-xs rounded border hover:bg-gray-100 mr-2">
                    Sửa
                  </button>
                  <button className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">Khóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Phân quyền người dùng</h3>
              <button onClick={() => { setShowModal(false); setEditUser(null); }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Họ tên</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue={editUser?.name} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input type="email" className="w-full border rounded-lg px-3 py-2" defaultValue={editUser?.email} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Vai trò</label>
                <select className="w-full border rounded-lg px-3 py-2" defaultValue={editUser?.role}>
                  <option value="user">👤 User</option>
                  <option value="moderator">🛡️ Moderator</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Trạng thái</label>
                <select className="w-full border rounded-lg px-3 py-2" defaultValue={editUser?.status}>
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Bị khóa</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setEditUser(null); }} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                  Hủy
                </button>
                <button type="button" className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========== Routes ========== */
const AdminRoutes = () => {
  const [routes] = useState([
    { id: 1, from: "Hà Nội", to: "Hạ Long", distance: "165km", time: "2.5h", status: "verified" },
    { id: 2, from: "TP.HCM", to: "Đà Lạt", distance: "308km", time: "6h", status: "pending" },
    { id: 3, from: "Đà Nẵng", to: "Hội An", distance: "30km", time: "40m", status: "verified" },
  ]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Compass className="w-6 h-6" />
        Quản lý Vị trí & Đường đi
      </h1>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-2">🗺️ Cập nhật dữ liệu đường đi</h3>
        <p className="text-sm opacity-90 mb-4">Tích hợp Google Maps API / OpenStreetMap để tính toán khoảng cách và thời gian</p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50">
          🔄 Đồng bộ dữ liệu
        </button>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Điểm đi</th>
              <th className="text-left px-4 py-3">Điểm đến</th>
              <th className="text-center px-4 py-3">Khoảng cách</th>
              <th className="text-center px-4 py-3">Thời gian</th>
              <th className="text-center px-4 py-3">Trạng thái</th>
              <th className="text-center px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{r.from}</td>
                <td className="px-4 py-3 font-semibold">{r.to}</td>
                <td className="px-4 py-3 text-center">{r.distance}</td>
                <td className="px-4 py-3 text-center">{r.time}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${r.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {r.status === 'verified' ? '✅ Đã xác thực' : '⏳ Chờ kiểm tra'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="px-3 py-1 text-xs rounded border hover:bg-gray-100">Cập nhật</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ========== Statistics ========== */
const AdminStatistics = () => {
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAIStats = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/chat",
        new URLSearchParams({
          message:
            'Phân tích chi phí du lịch trung bình Việt Nam 2025 theo vùng miền. Trả về JSON: {"north": {"avg": 0, "popular": ["địa điểm"]}, "central": {...}, "south": {...}, "insights": ["nhận xét"]}. Chỉ JSON.',
        })
      );
      const jsonMatch = response.data.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) setAiStats(JSON.parse(jsonMatch[0]));
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => (n != null ? n.toLocaleString() + "đ" : "-");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Thống kê & Chi phí TB
      </h1>

      <button
        onClick={fetchAIStats}
        disabled={loading}
        className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
      >
        {loading ? "🤖 AI đang phân tích..." : "📊 Phân tích chi phí AI"}
      </button>

      {aiStats && (
        <div className="grid md:grid-cols-3 gap-6">
          {["north", "central", "south"].map((region) => {
            const data = aiStats[region];
            const regionName =
              region === "north" ? "Miền Bắc" : region === "central" ? "Miền Trung" : "Miền Nam";
            return (
              <div key={region} className="bg-white border-2 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-3">{regionName}</h3>
                <p className="text-3xl font-bold text-green-600 mb-3">{fmt(data?.avg)}</p>
                <p className="text-sm text-gray-500 mb-2">Địa điểm phổ biến:</p>
                <ul className="space-y-1">
                  {data?.popular?.map((p, i) => (
                    <li key={i} className="text-sm">✨ {p}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {aiStats?.insights && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-3">💡 Nhận xét từ AI</h3>
          <ul className="space-y-2">
            {aiStats.insights.map((insight, i) => (
              <li key={i} className="text-sm">📌 {insight}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold mb-4">📈 Xu hướng chi phí theo tháng</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {[65, 78, 85, 92, 88, 95, 102, 98, 105, 110, 115, 108].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t" style={{ height: `${h}%` }}></div>
              <span className="text-xs text-gray-500 mt-2">T{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========== Layout chính của Admin ========== */
const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white border rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">⛔ Không có quyền truy cập</h2>
            <p className="text-gray-600 mb-6">Vui lòng đăng nhập với tài khoản admin để vào trang này.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "dashboard", label: "📊 Tổng quan", icon: LayoutGrid },
    { key: "locations", label: "📍 Địa điểm", icon: MapPin },
    { key: "reviews", label: "⭐ Đánh giá", icon: Star },
    { key: "users", label: "👥 Người dùng", icon: Shield },
    { key: "routes", label: "🗺️ Đường đi", icon: Compass },
    { key: "statistics", label: "💰 Thống kê", icon: BarChart3 },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className={`fixed z-40 top-16 left-0 bottom-0 w-72 bg-white border-r transition-transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 font-bold text-lg border-b bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          🎯 Admin Panel
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  tab === t.key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b px-4 h-14 flex items-center gap-3 md:pl-76">
        <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-gray-100 md:hidden">
          <Menu size={20} />
        </button>
        <div className="font-semibold text-lg">{tabs.find((x) => x.key === tab)?.label}</div>
      </div>

      <div className="md:pl-72">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "locations" && <AdminLocations />}
        {tab === "reviews" && <AdminReviews />}
        {tab === "users" && <AdminUsers />}
        {tab === "routes" && <AdminRoutes />}
        {tab === "statistics" && <AdminStatistics />}
      </div>
    </div>
  );
};

export default AdminLayout;
