import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  MapPin, Search, Globe, Camera, Star, Menu, X, Play, Navigation, MessageSquare, Paperclip,
  DollarSign, Cloud, Languages, Map, Compass, Sun, MapPinned, Users, ChevronsLeft, Building,
  Utensils, Ticket, LogIn, UserPlus, LogOut, User, Lock,
  // ✅ thêm icon mới cho Admin
  LayoutGrid, Shield, TrendingUp, BarChart3
} from 'lucide-react';
import 'aframe';

// *** Import Leaflet và CSS ***
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// *** CẬP NHẬT: Import file ExplorePage mới ***
import ExplorePage from '../src/components/ExplorePage'; 
// *******************************************
import { LoginModal, RegisterModal } from '../src/components/AuthModals';

// *** Sửa lỗi icon marker mặc định của Leaflet ***
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import ProfileModal from "./components/ProfileModal";

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
    shadowSize: [41, 41] 
});

L.Marker.prototype.options.icon = DefaultIcon;

L.Marker.prototype.options.icon = DefaultIcon;
// ************************************************


// Navigation
// *** CẬP NHẬT: Thêm 'setSelectedPlaceId' để reset khi về home ***
const NavBar = ({ setCurrentPage, setMobileMenuOpen, mobileMenuOpen, setSelectedPlaceId, authUser, onOpenLogin, onOpenRegister, onLogout }) => {
  const goHome = () => { setCurrentPage('home'); setSelectedPlaceId(null); };

  const navigate = (page) => {
    setCurrentPage(page);
    setSelectedPlaceId(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
            <Globe className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">TRAVINAI</span>
          </div>

          {/* Center: Links (desktop) */}
          <div className="hidden md:flex gap-6">
            <button onClick={goHome} className="hover:text-yellow-200 transition">Trang chủ</button>
            <button onClick={() => navigate('explore')} className="hover:text-yellow-200 transition">Khám phá</button>
            <button onClick={() => navigate('tools')} className="hover:text-yellow-200 transition">Công cụ</button>
            <button onClick={() => navigate('map')} className="hover:text-yellow-200 transition">Bản đồ</button>
            {authUser && authUser.role === 'admin' && (
          <button
            onClick={() => setCurrentPage('admin')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            title="Trang Admin"
          >
            🧭 Admin
          </button>
)}
          </div>

          {/* Right: Auth buttons (desktop) */}
          {/* Right: Auth buttons (desktop) */}
          
<div className="hidden md:flex items-center gap-3">
  {!authUser ? (
    <>
      <button
        onClick={onOpenLogin}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <LogIn className="w-4 h-4" /> Đăng nhập
      </button>
      <button
        onClick={onOpenRegister}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition"
      >
        <UserPlus className="w-4 h-4" /> Đăng ký
      </button>
    </>
  ) : (
    <>
      <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-full">
        <div className="bg-white text-cyan-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {(authUser?.name?.[0] ||
            authUser?.username?.[0] ||
            authUser?.email?.[0] ||
            'U'
          ).toUpperCase()}
        </div>
        <div className="text-sm leading-tight">
          <div className="font-semibold leading-4">
            {authUser?.name || authUser?.username || 'Người dùng'}
          </div>
          <div className="text-white/80 text-xs leading-4">{authUser?.email}</div>
        </div>
      </div>
          
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        title="Đăng xuất"
      >
        <LogOut className="w-4 h-4" /> Đăng xuất
      </button>
    </>
  )}
</div>


          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <button onClick={() => { setCurrentPage('home'); setSelectedPlaceId(null); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Trang chủ</button>
            <button onClick={() => navigate('explore')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Khám phá</button>
            <button onClick={() => navigate('tools')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Công cụ</button>
            <button onClick={() => navigate('map')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Bản đồ</button>
            {authUser?.role === 'admin' && (
              <button
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded"
              >
                🧭 Admin
              </button>
            )}


            {!authUser ? (
  <div className="pt-2 flex gap-2">
    <button
      onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
      className="flex-1 bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2"
    >
      <LogIn className="w-4 h-4" /> Đăng nhập
    </button>
    <button
      onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
      className="flex-1 bg-yellow-400 text-gray-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
    >
      <UserPlus className="w-4 h-4" /> Đăng ký
    </button>
  </div>
) : (
  <div className="space-y-2 pt-2">
    <button
      onClick={() => { setMobileMenuOpen(false); setShowProfile(true); }}
      className="w-full bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition"
    >
      <User className="w-4 h-4" /> Hồ sơ
    </button>
    <button
      onClick={() => { setMobileMenuOpen(false); setShowChangePw(true); }}
      className="w-full bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition"
    >
      <Lock className="w-4 h-4" /> Đổi mật khẩu
    </button>
    <button
      onClick={() => { setMobileMenuOpen(false); onLogout(); }}
      className="w-full bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition"
    >
      <LogOut className="w-4 h-4" /> Đăng xuất
    </button>
  </div>
)}
          </div>
        )}
      </div>
    </nav>
  );
};


// Home Page
// *** CẬP NHẬT: GỌI API /api/ai-search ***
const HomePage = ({ setCurrentPage, setSelectedPlaceId }) => {
  /* ---------- SEARCH STATES ---------- */
  const [searchInput, setSearchInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- HÀM TÌM KIẾM DB ---------- */
  const handleSmartSearch = useCallback(async () => {
    const q = searchInput.trim();
    if (!q) { setRecommendations([]); return; }
    setLoading(true);
    setRecommendations([]);

    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/search-places', { params: { q } });
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tìm kiếm địa điểm:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [searchInput]);

  /* ---------- WEATHER STATES ---------- */
  const [weather, setWeather] = useState(null);
  const [isDay, setIsDay] = useState(true);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83';

  // Fetch thời tiết theo toạ độ
  const fetchWeatherByCoords = async (lat, lon) => {
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: WEATHER_API_KEY, units: 'metric', lang: 'vi' }
    });
    const d = res.data;
    const now = d.dt;
    const sr = d.sys?.sunrise;
    const ss = d.sys?.sunset;
    const dayNow = sr && ss ? (now >= sr && now < ss) : true;

    setWeather({
      temp: Math.round(d.main.temp),
      description: d.weather?.[0]?.description || '',
      icon: d.weather?.[0]?.icon || '01d',
      city: d.name
    });
    setIsDay(dayNow);
    setSunrise(sr ? new Date(sr * 1000) : null);
    setSunset(ss ? new Date(ss * 1000) : null);
    setLastUpdated(new Date());
  };

  // Lấy vị trí + auto refresh 5 phút + refresh khi tab active trở lại
  useEffect(() => {
    let timerId;
    let coordsCache = null;

    const load = () => {
      if (!coordsCache) return;
      fetchWeatherByCoords(coordsCache.lat, coordsCache.lon).catch(() => {
        // Fallback HCM nếu lỗi
        setWeather({ temp: 28, description: 'nắng đẹp', icon: '01d', city: 'Hồ Chí Minh' });
        setIsDay(true);
        setSunrise(null);
        setSunset(null);
        setLastUpdated(new Date());
      });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coordsCache = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        load();
        timerId = setInterval(load, 5 * 60 * 1000);
      },
      () => {
        coordsCache = { lat: 10.8231, lon: 106.6297 }; // HCM fallback
        load();
        timerId = setInterval(load, 5 * 60 * 1000);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );

    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);


  // Hàm xử lý khi click vào thẻ kết quả
  const handleRecommendationClick = (placeId) => {
    setSelectedPlaceId(placeId);
    setCurrentPage('details'); // Chuyển sang trang chi tiết
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Overlay đổi theo ngày/đêm */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            isDay ? 'from-cyan-500/90 to-blue-600/90' : 'from-indigo-900/90 to-slate-900/90'
          } z-10`}
        />
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1600"
          alt="Vietnam"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">TRAVINAI</h1>
          <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
            Smart travel with AI
          </p>

          {/* Card thời tiết */}
          {weather && (
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
              <div className="flex items-center justify-center gap-4">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="weather"
                  className="w-16 h-16"
                />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{weather.temp}°C</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDay ? 'bg-yellow-300 text-yellow-900' : 'bg-indigo-300 text-indigo-900'}`}>
                      {isDay ? 'Ban ngày' : 'Ban đêm'}
                    </span>
                  </div>
                  <p className="text-sm capitalize">{weather.description}</p>
                  <p className="text-xs opacity-80">📍 {weather.city}</p>
                  {(sunrise || sunset) && (
                    <div className="mt-2 text-xs opacity-90">
                      {sunrise && <>🌅 {sunrise.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</>}
                      {'  ·  '}
                      {sunset && <>🌇 {sunset.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</>}
                    </div>
                  )}
                  {lastUpdated && (
                    <div className="text-[11px] opacity-70 mt-1">
                      Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Smart Search */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-full shadow-2xl p-2 flex items-center mb-4">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Tìm tên địa điểm (VD: Ba Na Hills, Hội An...)"
                className="flex-1 px-4 py-3 text-gray-800 outline-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSmartSearch(); }}
              />
              <button
                onClick={handleSmartSearch}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? '🔍 Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </div>

          {/* Kết quả tìm kiếm */}
          {recommendations.length > 0 && (
            <div className="w-full max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl p-4 text-gray-800 shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition"
                  onClick={() => handleRecommendationClick(rec.id)}
                >
                  <img
                    src={rec.thumbnail || 'https://via.placeholder.com/300x200'}
                    alt={rec.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-lg mb-2">📍 {rec.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features (Giữ nguyên) */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            🧩 Tính năng
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Sun, title: 'Dự báo thời tiết', desc: 'API OpenWeatherMap', color: 'orange' },
              { icon: Compass, title: 'Gợi ý AI', desc: 'Gemini AI tư vấn điểm đến', color: 'purple' },
              { icon: Map, title: 'Bản đồ Leaflet', desc: 'React Leaflet', color: 'blue' }, 
              { icon: Languages, title: 'Phiên dịch AI', desc: 'Dịch & Lồng tiếng', color: 'green' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
                <feature.icon className={`w-12 h-12 mx-auto mb-4 text-${feature.color}-500`} />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tools Page (Giữ nguyên)
const ToolsMenu = ({ setCurrentPage }) => {
  const cards = [
    { key: 'currency', title: 'Đổi tiền tệ', desc: 'Tỷ giá thời gian thực', Icon: DollarSign, color: 'text-green-500', btn: 'Mở trang' },
    { key: 'translate', title: 'Phiên dịch AI', desc: 'Auto-detect → Tiếng Việt', Icon: Languages, color: 'text-purple-500', btn: 'Mở trang' },
    { key: 'cost', title: 'Dự đoán chi phí (AI)', desc: 'Ước tính theo ngày/người', Icon: Navigation, color: 'text-blue-500', btn: 'Mở trang' },
    { key: 'directions', title: 'Chỉ đường', desc: 'Google Maps Directions', Icon: Map, color: 'text-red-500', btn: 'Mở trang' },
  ];

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Công cụ</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map(({ key, title, desc, Icon, color, btn }) => (
            <div key={key} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
              <p className="text-gray-600 mb-6">{desc}</p>
              <button
                onClick={() => setCurrentPage(key)}
                className="self-start bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:opacity-90"
              >
                {btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

  const CurrencyPage = ({ setCurrentPage }) => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        setRates(res.data.rates);
      } catch {
        setRates({ VND: 24000, EUR: 0.85, GBP: 0.73, USD: 1 });
      }
    };
    fetchRates();
  }, []);

  const handleConvert = () => {
    if (!rates) return;
    const inUSD = fromCurrency === 'USD' ? amount : amount / (rates[fromCurrency] || 1);
    const result = toCurrency === 'USD' ? inUSD : inUSD * (rates[toCurrency] || 1);
    setConvertedAmount(result);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <button onClick={() => setCurrentPage('tools')} className="text-cyan-600 hover:underline mb-4">← Quay lại Công cụ</button>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" /> Đổi tiền tệ
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Số tiền</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value || 0))}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Từ</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="USD">USD 🇺🇸</option>
                  <option value="VND">VND 🇻🇳</option>
                  <option value="EUR">EUR 🇪🇺</option>
                  <option value="GBP">GBP 🇬🇧</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sang</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="VND">VND 🇻🇳</option>
                  <option value="USD">USD 🇺🇸</option>
                  <option value="EUR">EUR 🇪🇺</option>
                  <option value="GBP">GBP 🇬🇧</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Quy đổi (Live Rate)
            </button>

            {convertedAmount > 0 && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Kết quả</p>
                <p className="text-3xl font-bold text-green-600">
                  {convertedAmount.toLocaleString()} {toCurrency}
                </p>
                {rates && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tỷ giá: 1 {fromCurrency} = {(rates[toCurrency] || 1).toFixed(2)} {toCurrency}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === TranslatePage: tự phát hiện ngôn ngữ, dịch về Tiếng Việt ===
// --- Patch: Ưu tiên dịch về Tiếng Việt & phát giọng Tiếng Việt ổn định ---
// (Bạn chỉ cần thay thế các hàm dưới đây vào file App.js của bạn)

// 1) Hook lấy danh sách voice như cũ
function useVoices() {
  const [voices, setVoices] = React.useState(window.speechSynthesis.getVoices());
  React.useEffect(() => {
    const handle = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", handle);
    // Kích hoạt tải voice (đặc biệt Safari/iOS)
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handle);
  }, []);
  return voices;
}

// 2) Tìm đúng giọng Tiếng Việt (nếu có)
function findVietnameseVoice(voices) {
  if (!voices || !voices.length) return null;
  const byExact = voices.find(v => (v.lang || '').toLowerCase() === 'vi-vn');
  const byPrefix = voices.find(v => (v.lang || '').toLowerCase().startsWith('vi'));
  const byName = voices.find(v => /vietnam|vi[eê]t/i.test(v.name || ''));
  return byExact || byPrefix || byName || null;
}

// 3) Chọn voice theo ngôn ngữ (mặc định có ưu tiên vi-VN nếu langHint là vi-VN)
function pickVoice(voices, lang) {
  if (!voices || !voices.length) return null;
  if (lang && lang.toLowerCase() === 'vi-vn') {
    const vi = findVietnameseVoice(voices);
    if (vi) return vi;
  }
  return (
    voices.find(v => (v.lang || '').toLowerCase() === (lang || '').toLowerCase()) ||
    voices.find(v => (v.lang || '').toLowerCase().startsWith((lang || '').split('-')[0].toLowerCase())) ||
    voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) ||
    voices[0]
  );
}

// 4) Đoán ngôn ngữ (giữ nguyên logic cũ cho nút "nghe bản gốc")
function guessLang(text = "") {
  if (/[ぁ-ゟ゠-ヿ一-龯]/.test(text)) return "ja-JP";       // Nhật
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) return "ko-KR";     // Hàn
  if (/[\u4E00-\u9FFF]/.test(text) && !/[ぁ-ゟ゠-ヿ]/.test(text)) {
    if (/[的是我你了嗎吗他她們们在不有]/.test(text)) return "zh-CN";
  }
  if (/[а-яё]/i.test(text)) return "ru-RU";                // Nga
  if (/[áàảãạăâđéèẻẽẹêíìỉĩịóòỏõọôơúùủũụưýỳỷỹỵ]/i.test(text)) return "vi-VN"; // Việt
  if (/[ก-๙]/.test(text)) return "th-TH";                  // Thái
  if (/[a-z]/i.test(text)) return "en-US";                 // Latin chung -> EN
  return "en-US";
}

// 5) Hook speak: đảm bảo khi langHint='vi-VN' sẽ phát tiếng Việt
export function useSpeak() {
  const voices = useVoices();
  const speakingRef = React.useRef(false);

  const speak = (text, langHint) => {
    if (!text) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const lang = (langHint && langHint.trim()) || guessLang(text);
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(voices, lang);
    if (voice) u.voice = voice;
    // Nếu yêu cầu vi-VN mà không tìm thấy voice vi, vẫn đặt lang='vi-VN' để hệ thống chọn gần nhất
    u.lang = voice?.lang || lang || 'vi-VN';
    u.rate = 0.95;   // tốc độ tự nhiên
    u.pitch = 1.0;   // cao độ tự nhiên
    speakingRef.current = true;
    u.onend = () => (speakingRef.current = false);
    window.speechSynthesis.speak(u);
  };

  // helper ngắn gọn: luôn đọc tiếng Việt
  const speakVI = (text) => speak(text, 'vi-VN');

  return { speak, speakVI };
}

// === Cách dùng trong TranslatePage ===
// - Nút "Nghe bản gốc": giữ nguyên auto-detect -> speak(textToTranslate)
// - Nút "Nghe tiếng Việt": đổi sang dùng speakVI để luôn đảm bảo giọng Việt
//   <button onClick={() => speakVI(translatedText)} ...>


// --- Patch 2: Translate từ Tiếng Việt sang NGÔN NGỮ KHÁC + đọc giọng đích ---
// Thay thế nguyên component TranslatePage bằng phiên bản dưới đây.
// Giữ nguyên useSpeak ở Patch 1 (đã có speak() và speakVI()).

const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English' },
  { code: 'ja-JP', label: '日本語 (Japanese)' },
  { code: 'ko-KR', label: '한국어 (Korean)' },
  { code: 'zh-CN', label: '中文-简体 (Chinese Simplified)' },
  { code: 'zh-TW', label: '中文-繁體 (Chinese Traditional)' },
  { code: 'fr-FR', label: 'Français (French)' },
  { code: 'de-DE', label: 'Deutsch (German)' },
  { code: 'es-ES', label: 'Español (Spanish)' },
  { code: 'it-IT', label: 'Italiano (Italian)' },
  { code: 'pt-PT', label: 'Português (Portuguese)' },
  { code: 'th-TH', label: 'ไทย (Thai)' },
  { code: 'ru-RU', label: 'Русский (Russian)' },
];

const TranslatePage = ({ setCurrentPage }) => {
  const [textToTranslate, setTextToTranslate] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState("");
  const [translating, setTranslating] = React.useState(false);
  const [targetLang, setTargetLang] = React.useState("de-DE");
  const { speak } = useSpeak();

  const targetLabel = React.useMemo(() => {
    return LANGUAGE_OPTIONS.find((l) => l.code === targetLang)?.label || targetLang;
  }, [targetLang]);

  const handleTranslate = async () => {
    const src = textToTranslate.trim();
    if (!src) return;
    setTranslating(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/chat",
        new URLSearchParams({
          message: `Hãy phát hiện ngôn ngữ của đoạn văn sau và dịch CHÍNH XÁC sang ${targetLabel} (${targetLang}).
Chỉ trả về bản dịch thuần văn bản, không ghi chú hay giải thích nào khác.
Đoạn văn:
"""${src}"""`,
        })
      );
      setTranslatedText(response.data.reply || "");
    } catch (err) {
      console.error("Lỗi dịch:", err);
      setTranslatedText("Lỗi kết nối API");
    } finally {
      setTranslating(false);
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text || ""); } catch {}
  };

  const clearAll = () => { setTextToTranslate(""); setTranslatedText(""); };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => setCurrentPage("tools")}
          className="group inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 mb-5"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span> Quay lại Công cụ
        </button>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-purple-100">🗣️</span>
              Trình dịch AI
            </span>
          </h2>
          <p className="mt-2 text-gray-600">Tự phát hiện ngôn ngữ nguồn và dịch sang ngôn ngữ đích. Hỗ trợ đọc to bằng giọng bản ngữ.</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="rounded-2xl bg-white">
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-5 items-start">
                {/* Left: input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Nhập văn bản (Tiếng Việt hoặc bất kỳ ngôn ngữ nào)</label>
                  <div className="relative">
                    <textarea
                      value={textToTranslate}
                      onChange={(e) => setTextToTranslate(e.target.value)}
                      rows={6}
                      placeholder="Dán đoạn văn cần dịch…"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition"
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <button
                        onClick={() => speak(textToTranslate)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition"
                        title="Nghe bản gốc (auto)"
                      >
                        Nghe gốc
                      </button>
                      <button
                        onClick={() => copy(textToTranslate)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 hover:border-purple-300 transition"
                        title="Sao chép"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: target lang */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Dịch sang</label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400"
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={clearAll}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Xoá nội dung
                    </button>
                    <button
                      onClick={() => copy(translatedText)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Copy kết quả
                    </button>
                  </div>
                </div>
              </div>

              {/* Translate button */}
              <div className="mt-6">
                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="relative w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-6 py-3 shadow-lg hover:opacity-95 disabled:opacity-60"
                >
                  {translating && (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"></path>
                    </svg>
                  )}
                  {translating ? "Đang dịch…" : `Dịch sang ${targetLabel}`}
                </button>
              </div>

              {/* Result */}
              {translatedText && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700">Bản dịch ({targetLabel})</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speak(translatedText, targetLang)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white border border-purple-300 text-purple-700 hover:bg-purple-50"
                        title={`Nghe ${targetLabel}`}
                      >
                        Nghe
                      </button>
                      <button
                        onClick={() => copy(translatedText)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                        title="Sao chép"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 leading-relaxed text-gray-900 whitespace-pre-wrap">
                    {translatedText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => setCurrentPage('tools')}
          className="text-cyan-600 hover:underline mb-4"
        >
          ← Quay lại Công cụ
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Languages className="w-6 h-6 text-purple-500" />
            Phiên dịch (Auto-detect)
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Nhập Tiếng Việt (hoặc bất kỳ ngôn ngữ nào)</label>
                <textarea
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Dán đoạn văn cần dịch..."
                />
                <button
                  onClick={() => speak(textToTranslate /* auto-detect giọng gốc */)}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  title="Nghe bản gốc (auto-detect giọng)"
                >
                  <Play className="w-4 h-4" /> Nghe bản gốc (auto)
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Dịch sang</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={translating}
              className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {translating ? 'Đang dịch...' : `Dịch sang ${targetLabel}`}
            </button>

            {translatedText && (
              <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-purple-700">
                    Bản dịch ({targetLabel})
                  </p>
                  <button
                    onClick={() => speak(translatedText, targetLang)}
                    className="text-purple-600 hover:text-purple-700"
                    title={`Nghe ${targetLabel}`}
                  >
                    <Play className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-lg whitespace-pre-wrap">{translatedText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DirectionsPage = ({ setCurrentPage }) => {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <button onClick={() => setCurrentPage('tools')} className="text-cyan-600 hover:underline mb-4">← Quay lại Công cụ</button>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Map className="w-6 h-6 text-red-500" /> Chỉ đường (Google Maps API)
          </h2>
          <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPinned className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Nhập điểm đến để xem chỉ đường</p>
              <input type="text" placeholder="VD: Vịnh Hạ Long" className="px-4 py-2 border rounded-lg mb-2" />
              <button className="block mx-auto bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                Chỉ đường
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map Page
const MapPage = () => {
  // ... (Toàn bộ code của MapPage giữ nguyên) ...
  const [currentWeather, setCurrentWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83'; 

  useEffect(() => {
    getUserLocationWeather();
  }, []);

  const getUserLocationWeather = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`
        );
        setCurrentWeather({
          temp: Math.round(weatherRes.data.main.temp),
          description: weatherRes.data.weather[0].description,
          icon: weatherRes.data.weather[0].icon,
          humidity: weatherRes.data.main.humidity,
          wind: weatherRes.data.wind.speed,
          city: weatherRes.data.name
        });
      }, (error) => {
        console.error('Lỗi lấy vị trí:', error);
        const fallbackLocation = { lat: 10.8231, lng: 106.6297 };
        setUserLocation(fallbackLocation);
        setCurrentWeather({
          temp: 32, description: 'nắng đẹp', icon: '01d',
          humidity: 65, wind: 12, city: 'Hồ Chí Minh'
        });
      });
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">🗺️ Bản đồ thời tiết</h1>
        <p className="text-gray-600 mb-8">Hiển thị thời tiết tại vị trí hiện tại của bạn</p>

        {/* Current Weather */}
        {currentWeather && (
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm opacity-80 mb-2">📍 Vị trí hiện tại</p>
                <h2 className="text-3xl font-bold mb-4">{currentWeather.city}</h2>
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`}
                    alt="weather"
                    className="w-24 h-24"
                  />
                  <div>
                    <p className="text-6xl font-bold">{currentWeather.temp}°C</p>
                    <p className="text-xl capitalize">{currentWeather.description}</p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-4 w-full md:w-auto">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center md:text-right">
                  <p className="text-sm opacity-80">Độ ẩm</p>
                  <p className="text-3xl font-bold">{currentWeather.humidity}%</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center md:text-right">
                  <p className="text-sm opacity-80">Gió</p>
                  <p className="text-3xl font-bold">{currentWeather.wind} km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaflet Map */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Bản đồ vị trí (React Leaflet)</h3>
          </div>
          {userLocation ? (
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ height: '500px', width: '100%' }} 
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <h4 className="font-bold">{currentWeather?.city || 'Vị trí của bạn'}</h4>
                    {currentWeather && (
                      <p>{currentWeather.temp}°C, {currentWeather.description}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPinned className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-600">Đang tải vị trí và bản đồ...</p>
              </div>
            </div>
          )}
        </div>
       
        {/* Weather Suggestions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🌤️ Gợi ý dựa trên thời tiết</h3>
          {currentWeather && currentWeather.temp > 30 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
              <p className="font-semibold text-orange-800">☀️ Thời tiết nắng nóng ({currentWeather.temp}°C)</p>
              <p className="text-sm text-orange-700">Gợi ý: Nên đi các điểm có bóng mát như thác nước, hang động, hoặc các điểm nghỉ dưỡng có hồ bơi.</p>
            </div>
          )}
          {currentWeather && currentWeather.temp < 25 && currentWeather.temp > 15 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold text-blue-800">🌤️ Thời tiết mát mẻ ({currentWeather.temp}°C)</p>
              <p className="text-sm text-blue-700">Gợi ý: Thích hợp cho các hoạt động ngoài trời như trekking, leo núi, hoặc tham quan thành phố.</p>
            </div>
          )}
          {currentWeather && currentWeather.temp <= 15 && (
             <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4">
              <p className="font-semibold text-cyan-800">❄️ Thời tiết lạnh ({currentWeather.temp}°C)</p>
              <p className="text-sm text-cyan-700">Gợi ý: Cần mang áo ấm, thích hợp cho các hoạt động săn mây, ngắm tuyết (nếu có).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
   // ===== ADMIN COMPONENTS (nhẹ, phù hợp hệ thống hiện tại) =====
const AdminStat = ({ icon: Icon, title, value, sub, tone = 'blue' }) => {
  const tones = {
    blue:  {bg:'bg-blue-100',  text:'text-blue-600'},
    green: {bg:'bg-green-100', text:'text-green-600'},
    yellow:{bg:'bg-yellow-100',text:'text-yellow-600'},
    purple:{bg:'bg-purple-100',text:'text-purple-600'},
  };
  const t = tones[tone] || tones.blue;
  return (
    <div className="p-6 rounded-xl border bg-white hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${t.bg}`}>
          <Icon className={`w-6 h-6 ${t.text}`} />
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-2">{sub}</div>}
    </div>
  );
};

const AdminDashboard = () => {
  const cards = [
    { title: "Tổng người dùng", value: "2,847", sub: "+12.5% tháng này", icon: Users, tone: "blue" },
    { title: "Địa điểm", value: "156", sub: "8 mới tuần này", icon: MapPin, tone: "green" },
    { title: "Đánh giá", value: "4,521", sub: "TB 4.2⭐", icon: Star, tone: "yellow" },
    { title: "Lượt tìm kiếm", value: "18.2K", sub: "+8.3% so tuần trước", icon: TrendingUp, tone: "purple" },
  ];
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c,i) => <AdminStat key={i} {...c} />)}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" /> Địa điểm được tìm kiếm nhiều
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
                <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</div>
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

const AdminLocations = () => {
  const [locations] = useState([
    { id: 1, name: "Vịnh Hạ Long", category: "Thiên nhiên", rating: 4.8, reviews: 1240, status: "active" },
    { id: 2, name: "Phố cổ Hội An", category: "Văn hóa", rating: 4.9, reviews: 2130, status: "active" },
    { id: 3, name: "Đảo Phú Quốc", category: "Nghỉ dưỡng", rating: 4.7, reviews: 980, status: "active" },
  ]);
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6" /> Quản lý Địa điểm</h1>
        <button className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition">➕ Thêm địa điểm</button>
      </div>
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Tên</th>
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
                <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{loc.category}</span></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{loc.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{loc.reviews}</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Hoạt động</span></td>
                <td className="px-4 py-3 text-center">
                  <button className="px-3 py-1 text-xs rounded border hover:bg-gray-100 mr-2">Sửa</button>
                  <button className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminReviews = () => {
  const reviews = [
    { id: 1, user: "Nguyễn Văn A", location: "Phú Quốc", rating: 5, comment: "Cực kỳ tuyệt vời!", date: "2025-01-05", status: "approved" },
    { id: 2, user: "Trần Thị B", location: "Đà Lạt", rating: 4, comment: "Đẹp nhưng hơi đông", date: "2025-01-04", status: "pending" },
  ];
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6" /> Quản lý Đánh giá</h1>
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
              ) : <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">Đã duyệt</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", role: "admin", status: "active", joined: "2024-01-15" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com", role: "user", status: "active", joined: "2024-03-20" },
  ];
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">👥 Quản lý Người dùng</h1>
        <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">➕ Thêm user</button>
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
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>{u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminLayout = ({ authUser }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const tabs = [
    { key: "dashboard", label: "📊 Tổng quan", icon: LayoutGrid },
    { key: "locations", label: "📍 Địa điểm", icon: MapPin },
    { key: "reviews",   label: "⭐ Đánh giá", icon: Star },
    { key: "users",     label: "👥 Người dùng", icon: Shield },
  ];
  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white border rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">⛔ Không có quyền truy cập</h2>
            <p className="text-gray-600">Vui lòng đăng nhập bằng tài khoản admin.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className={`fixed z-40 top-16 left-0 bottom-0 w-72 bg-white border-r transition-transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 font-bold text-lg border-b bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          🎯 Admin Panel
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              tab === t.key ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"
            }`}>
              <t.icon className="w-5 h-5" />
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b px-4 h-14 flex items-center gap-3 md:pl-76">
        <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-gray-100 md:hidden">
          <Menu size={20} />
        </button>
        <div className="font-semibold text-lg">{tabs.find(x => x.key === tab)?.label}</div>
      </div>

      <div className="md:pl-72">
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'locations' && <AdminLocations />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
};

// Trang chi tiết địa điểm (Destination Detail Page)
const DestinationDetailPage = ({ placeId, setCurrentPage }) => {
  const [placeData, setPlaceData] = useState(null);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVR, setShowVR] = useState(false);
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2); 
  const [costPrediction, setCostPrediction] = useState(null);
  const [loadingCost, setLoadingCost] = useState(false);

  // Fetch data chi tiết
  useEffect(() => {
    const fetchDetails = async () => {
      if (!placeId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/place/${placeId}`);
        setPlaceData(response.data);
      } catch (err) {
        setError('Không thể tải dữ liệu địa điểm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchRelated = async () => {
       try {
        const response = await axios.get(`http://127.0.0.1:5000/api/related-places`);
        setRelatedPlaces(response.data);
      } catch (err) {
        console.error('Lỗi tải địa điểm liên quan:', err);
      }
    }
    fetchDetails();
    fetchRelated();
  }, [placeId]);

  // Hàm dự đoán chi phí
  const handleCostPrediction = async () => {
    if (!placeData?.details?.name) return;
    setLoadingCost(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Ước tính chi phí du lịch ${placeData.details.name} cho ${people} người trong ${days} ngày. Bao gồm: vé máy bay/di chuyển, khách sạn, ăn uống, vé tham quan. Trả về JSON: {"transport": số, "hotel": số, "food": số, "tickets": số, "total": số}. Chỉ trả JSON, không giải thích.`
        })
      );
      const jsonMatch = response.data.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const costs = JSON.parse(jsonMatch[0]);
        setCostPrediction(costs);
      }
    } catch (error) {
      console.error('Lỗi dự đoán:', error);
      setCostPrediction(null);
    } finally {
      setLoadingCost(false);
    }
  };

  // Helper render sao
  const renderStars = (rating) => {
    let stars = [];
    for(let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const vrImageUrl = placeData?.images?.[0]?.image_url || 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Halong_Bay_Vietnam_360_main_cav.jpg';

  if (loading) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !placeData) {
    return (
       <div className="pt-24 pb-12 min-h-screen bg-gray-50 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Đã xảy ra lỗi</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => setCurrentPage('home')}
          className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const { details, images, reviews } = placeData;

  return (
    <div className="pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Nút Back */}
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800 mb-4 transition"
        >
          <ChevronsLeft className="w-5 h-5" />
          Quay lại tìm kiếm
        </button>

        {/* Header (Ảnh bìa và tên) */}
        <div className="relative rounded-xl shadow-lg overflow-hidden h-96 mb-8">
          <img 
            src={images[0]?.image_url || 'https://via.placeholder.com/1200x400'} 
            alt={details.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-5xl font-bold mb-2">{details.name}</h1>
            <p className="text-xl opacity-90">{details.address}</p>
          </div>
          <button
            onClick={() => setShowVR(true)}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition"
          >
            <Camera className="w-5 h-5" />
            Xem 360°
          </button>
        </div>

        {/* Nội dung chính: Grid 2 cột */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cột trái: Giới thiệu, Chi phí, Đánh giá */}
          <div className="lg:col-span-2 space-y-8">

            {/* Giới thiệu */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-4">Giới thiệu</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {details.description || "Chưa có mô tả cho địa điểm này."}
              </p>
            </div>

            {/* Dự đoán chi phí */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-blue-500" />
                Dự đoán chi phí (AI)
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Số ngày: {days}</label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số người: {people}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={people}
                    onChange={(e) => setPeople(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <button
                onClick={handleCostPrediction}
                disabled={loadingCost}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loadingCost ? '🤖 AI đang tính...' : `🤖 Ước tính cho ${people} người, ${days} ngày`}
              </button>
              {costPrediction && (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="flex items-center gap-2 text-blue-700"><Navigation className="w-4 h-4" /> Di chuyển</span>
                      <span className="font-bold">{costPrediction.transport?.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="flex items-center gap-2 text-green-700"><Building className="w-4 h-4" /> Khách sạn</span>
                      <span className="font-bold">{costPrediction.hotel?.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="flex items-center gap-2 text-yellow-700"><Utensils className="w-4 h-4" /> Ăn uống</span>
                      <span className="font-bold">{costPrediction.food?.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="flex items-center gap-2 text-purple-700"><Ticket className="w-4 h-4" /> Vé tham quan</span>
                      <span className="font-bold">{costPrediction.tickets?.toLocaleString()}đ</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-6 flex flex-col justify-center text-center">
                    <p className="text-sm mb-2">Tổng chi phí dự kiến</p>
                    <p className="text-4xl font-bold mb-4">{costPrediction.total?.toLocaleString()}đ</p>
                    <p className="text-xs opacity-80">(Cho {people} người / {days} ngày)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Đánh giá (Reviews) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-6">Đánh giá từ du khách</h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{review.user_name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      <p className="text-gray-700 mt-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có đánh giá nào cho địa điểm này.</p>
              )}
            </div>

          </div>

          {/* Cột phải: Bản đồ, Ảnh, Liên quan */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Bản đồ Mini (Leaflet) */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold text-lg">Vị trí trên bản đồ</h3>
              </div>
              <MapContainer
                center={[details.lat, details.lng]}
                zoom={14}
                style={{ height: '300px', width: '100%' }}
                scrollWheelZoom={false} 
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[details.lat, details.lng]}>
                  <Popup>{details.name}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Album ảnh */}
            <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="font-bold text-lg mb-4">Album ảnh</h3>
               <div className="grid grid-cols-2 gap-4">
                {images.length > 0 ? images.map((img) => (
                  <img 
                    key={img.id}
                    src={img.image_url}
                    alt={img.description || details.name}
                    className="w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition"
                    title={img.description}
                  />
                )) : <p className="text-sm text-gray-500 col-span-2">Chưa có ảnh cho địa điểm này.</p>}
               </div>
            </div>

            {/* Địa điểm liên quan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="font-bold text-lg mb-4">Gợi ý liên quan</h3>
               <div className="space-y-4">
                {relatedPlaces
                  .filter(p => p.id !== placeId) 
                  .map((place) => (
                  <div 
                    key={place.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => {
                      // Cập nhật URL và state mà không reload trang
                      window.history.pushState({}, '', `?place=${place.id}`);
                      // (Trong App.js, hàm setSelectedPlaceId sẽ được gọi để trigger load lại data)
                      // Tuy nhiên, logic hiện tại của App.js không truyền setSelectedPlaceId vào đây
                      // Cách đơn giản nhất là reload:
                      window.location.href = `?place=${place.id}`;
                    }}
                  >
                    <img src={place.thumbnail || 'https://via.placeholder.com/100x100'} alt={place.name} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h4 className="font-bold text-cyan-700">{place.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{place.description}</p>
                    </div>
                  </div>
                ))}
               </div>
            </div>

          </div>

        </div>
      </div>

      {/* VR360 Modal */}
      {showVR && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{details.name} - 360°</h3>
              <button onClick={() => setShowVR(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <a-scene embedded>
                <a-sky src={vrImageUrl} crossOrigin="anonymous"></a-sky>
                <a-camera position="0 0 0.1"></a-camera>
              </a-scene>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



// AI ChatBox
function ChatBox() {
  // ... (Toàn bộ code của ChatBox giữ nguyên) ...
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !image) return;
    const formData = new FormData();
    if (message.trim()) formData.append("message", message.trim());
    if (image) formData.append("image", image);
    setChat((prev) => [...prev, { user: "me", text: message.trim(), img: preview }]);
    setMessage("");
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/chat", formData);
      setChat((prev) => [...prev, { user: "ai", text: res.data.reply }]);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setChat((prev) => [
        ...prev,
        { user: "ai", text: "❌ Lỗi kết nối API. Vui lòng kiểm tra Flask server đang chạy tại http://127.0.0.1:5000" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl flex flex-col" style={{ width: "400px", maxWidth: "90vw", height: "550px" }}>
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-t-xl text-center font-bold text-lg">
        🤖 AI Trợ lý (Gemini)
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 #2d3748' }}>
        {chat.length === 0 ? (
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">💬 Xin chào! Tôi là AI Gemini</p>
            <p className="text-gray-500 text-sm">Hỏi tôi về điểm đến, chi phí, dịch văn bản, hoặc gửi ảnh!</p>
          </div>
        ) : (
          chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.user === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg shadow-md ${msg.user === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                {msg.img && <img src={msg.img} alt="preview" className="mt-2 rounded-lg object-cover max-w-[150px] max-h-[150px]" />}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 p-3 rounded-lg shadow-md max-w-[75%]">
              <p className="text-sm animate-pulse">⏳ AI đang xử lý...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
        {preview && (
          <div className="mb-2 relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-500">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => {setImage(null); setPreview(null); if(fileInputRef.current) fileInputRef.current.value = '';}}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi AI về du lịch..."
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={loading || (!message.trim() && !image)}
            className={`p-3 rounded-lg transition ${loading || (!message.trim() && !image) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Footer
const Footer = ({ setCurrentPage }) => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-8 h-8" />
            <span className="text-xl font-bold">TRAVINAI</span>
          </div>
          <p className="text-gray-400 text-sm">
            Nền tảng du lịch thông minh với AI & APIs
          </p>
        </div>
        <div>
          <h3 className="font-bold mb-4">Tính năng AI</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>🤖 Gợi ý điểm đến (Gemini AI)</li>
            <li>🌤️ Dự báo thời tiết (OpenWeather)</li>
            <li>💵 Đổi tiền tệ</li>
            <li>🗣️ Phiên dịch & Lồng tiếng</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Bản đồ & APIs</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>🗺️ React Leaflet</li>
            <li>📍 OpenStreetMap</li>
            <li>📸 A-Frame VR (360°)</li>
            <li>🌍 Gemini API (Flask)</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">API Keys</h3>
          <p className="text-xs text-gray-500 mb-2">Cần cấu hình:</p>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• OpenWeatherMap API</li>
            <li>• Exchange Rate API</li>
            <li>• Gemini API (Flask)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
        <p>© 2025 Smart Travel Hub - Powered by AI & APIs</p>
      </div>
    </div>
  </footer>
);

const CostPage = ({ setCurrentPage }) => {
  const [origin, setOrigin] = useState('TP. Hồ Chí Minh');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [costPrediction, setCostPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // NEW: phân tích
  const [analysis, setAnalysis] = useState(null);     // phân tích nhanh local
  const [aiAnalysis, setAiAnalysis] = useState('');   // phân tích chi tiết AI
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diff >= 1) setDays(diff);
    }
  }, [startDate, endDate]);

  const analyzeLocally = (c) => {
    if (!c) return null;
    const total = c.total || (c.transport + c.hotel + c.food + c.tickets);
    const pct = (x) => total ? Math.round((x / total) * 100) : 0;
    const parts = [
      { key: 'transport', label: 'Di chuyển', value: c.transport || 0, pct: pct(c.transport || 0) },
      { key: 'hotel',     label: 'Khách sạn', value: c.hotel || 0,     pct: pct(c.hotel || 0) },
      { key: 'food',      label: 'Ăn uống',   value: c.food || 0,      pct: pct(c.food || 0) },
      { key: 'tickets',   label: 'Vé tham quan', value: c.tickets || 0, pct: pct(c.tickets || 0) },
    ].sort((a,b)=>b.value-a.value);

    const top = parts[0];
    const tips = [];
    if (top.key === 'transport') tips.push('Cân nhắc đặt vé sớm, linh hoạt giờ bay, hoặc chọn hãng giá rẻ/đi tàu-xe thay máy bay chặng ngắn.');
    if (top.key === 'hotel')     tips.push('Chọn khách sạn cách trung tâm 1–2km, đặt combo nhiều đêm, hoặc cân nhắc homestay.');
    if (top.key === 'food')      tips.push('Ưu tiên quán địa phương/cơm phần, tránh khu quá “touristy”, tham khảo review giá trước.');
    if (top.key === 'tickets')   tips.push('Mua vé online sớm, gom combo địa điểm, kiểm tra ưu đãi theo khung giờ/ngày.');

    if (people > 4) tips.push('Nhóm đông: thuê căn hộ/nhà nguyên căn thường rẻ hơn tính trên đầu người.');
    if (days >= 6)  tips.push('Lịch dài ngày: gom điểm ở gần nhau để giảm chi phí di chuyển nội địa.');

    return { total, parts, top, tips };
  };

  const handleCostPrediction = async () => {
    setErr('');
    setAiAnalysis('');
    if (!destination.trim()) { setErr('⚠️ Vui lòng nhập điểm đến.'); return; }
    if (days < 1 || people < 1) { setErr('⚠️ Số ngày và số người phải lớn hơn 0.'); return; }

    setLoading(true);
    setCostPrediction(null);
    setAnalysis(null);

    try {
      const dateInfo = startDate && endDate
        ? `Thời gian: từ ${startDate} đến ${endDate} (≈ ${days} ngày).`
        : `Thời gian: khoảng ${days} ngày (chưa xác định ngày cụ thể).`;

      const response = await axios.post(
        'http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Hãy ước tính chi phí du lịch từ ${origin} đến ${destination} cho ${people} người trong ${days} ngày.
${dateInfo}
Bao gồm: vé máy bay/di chuyển, khách sạn, ăn uống, vé tham quan.
Trả về JSON: {"transport": số, "hotel": số, "food": số, "tickets": số, "total": số, "tourPrice": số}.
Chỉ trả JSON, không giải thích.`
        })
      );

      const m = response.data.reply?.match(/\{[\s\S]*\}/);
      if (m) {
        const costs = JSON.parse(m[0]);
        setCostPrediction(costs);
        setAnalysis(analyzeLocally(costs));  // NEW: phân tích ngay
      } else {
        setErr('AI không trả về dữ liệu hợp lệ.');
      }
    } catch (error) {
      console.error('Lỗi dự đoán:', error);
      setErr('Không thể tính chi phí. Hãy thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: gọi AI phân tích sâu (retry/backoff chống 429)
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const analyzeWithAI = async () => {
    if (!costPrediction) return;
    setAnalyzing(true);
    setAiAnalysis('');
    let attempt = 0, maxAttempt = 3, backoff = 1200;

    while (attempt < maxAttempt) {
      try {
        const resp = await axios.post(
          'http://127.0.0.1:5000/api/chat',
          new URLSearchParams({
            message: `Dựa trên dữ liệu chi phí JSON sau, hãy phân tích ngắn gọn, súc tích:
- Mục nào chiếm % cao nhất và vì sao.
- 2-3 gợi ý tối ưu chi phí có số %/tiền ước tính tiết kiệm.
- Cảnh báo rủi ro (mùa cao điểm, chi phí phát sinh).
- Tóm tắt 1-2 câu tổng thể cho hành trình ${origin} → ${destination}, ${people} người / ${days} ngày.
JSON:
"""${JSON.stringify(costPrediction)}"""`,
          }),
          { timeout: 30000 }
        );
        setAiAnalysis(resp.data.reply || '');
        return;
      } catch (e) {
        const code = e?.response?.status;
        const is429 = code === 429 || /RESOURCE_EXHAUSTED/i.test(e?.response?.data?.error?.status || '');
        if (!is429) { setAiAnalysis('Không phân tích được (lỗi khác 429).'); break; }
        attempt += 1;
        if (attempt >= maxAttempt) { setAiAnalysis('Máy chủ AI đang quá tải, hãy thử lại sau.'); break; }
        await sleep(backoff); backoff *= 1.8;
      }
    }
    setAnalyzing(false);
  };

  const resetAll = () => {
    setOrigin('TP. Hồ Chí Minh'); setDestination('');
    setStartDate(''); setEndDate('');
    setDays(3); setPeople(2);
    setCostPrediction(null); setAnalysis(null);
    setAiAnalysis(''); setErr('');
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => setCurrentPage('tools')}
          className="text-cyan-600 hover:underline mb-4"
        >
          ← Quay lại Công cụ
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-500" /> Dự đoán chi phí du lịch (AI)
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Điểm đi</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="VD: TP. Hồ Chí Minh"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Điểm đến</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="VD: Đà Nẵng"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ngày đi</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ngày về</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                min={startDate || undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Số ngày</label>
              <input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(+e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Số người</label>
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => setPeople(+e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {err && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleCostPrediction}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? '🤖 AI đang tính...' : `🤖 Ước tính chi phí`}
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Xoá
            </button>
          </div>

          {costPrediction && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="flex items-center gap-2 text-blue-700">
                    <Navigation className="w-4 h-4" /> Di chuyển
                  </span>
                  <span className="font-bold">{costPrediction.transport?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span className="flex items-center gap-2 text-green-700">
                    <Building className="w-4 h-4" /> Khách sạn
                  </span>
                  <span className="font-bold">{costPrediction.hotel?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="flex items-center gap-2 text-yellow-700">
                    <Utensils className="w-4 h-4" /> Ăn uống
                  </span>
                  <span className="font-bold">{costPrediction.food?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="flex items-center gap-2 text-purple-700">
                    <Ticket className="w-4 h-4" /> Vé tham quan
                  </span>
                  <span className="font-bold">{costPrediction.tickets?.toLocaleString()}đ</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-6 text-center">
                <p className="text-sm mb-2">Tổng chi phí dự kiến</p>
                <p className="text-4xl font-bold mb-4">{costPrediction.total?.toLocaleString()}đ</p>
                <p className="text-sm mb-1">So với giá tour</p>
                <p className="text-2xl font-bold">{costPrediction.tourPrice?.toLocaleString()}đ</p>
                <p className="text-xs opacity-90 mt-2">
                  {origin} → {destination} ({days} ngày / {people} người)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const ProfileModal = ({ user, onClose, onSaved }) => {
  const [name, setName] = React.useState(user?.name || "");
  const [username, setUsername] = React.useState(user?.username || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !username.trim() || !email.trim()) {
      setErr("Vui lòng nhập đủ họ tên / username / email");
      return;
    }
    try {
      setSaving(true);
      const { data } = await axios.put("http://127.0.0.1:5000/api/profile", {
        id: user.id, name: name.trim(), username: username.trim().toLowerCase(), email: email.trim().toLowerCase(),
      });
      onSaved?.(data.user);
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.error || "Lỗi cập nhật hồ sơ");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-lg">Hồ sơ cá nhân</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && <div className="p-2 text-sm rounded bg-red-50 text-red-700 border">{err}</div>}
          <div>
            <label className="text-sm font-semibold">Họ và tên</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Tên đăng nhập</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input type="email" className="w-full mt-1 px-3 py-2 border rounded-lg" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Hủy</button>
            <button disabled={saving} className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50">
              {saving ? "Đang lưu..." : "Lưu hồ sơ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ user, onClose }) => {
  const [oldPw, setOldPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [err, setErr] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!oldPw || !newPw) return setErr("Vui lòng nhập đủ mật khẩu cũ/mới");
    if (newPw !== confirmPw) return setErr("Xác nhận mật khẩu không khớp");
    try {
      setSaving(true);
      await axios.put("http://127.0.0.1:5000/api/change-password", {
        id: user.id, old_password: oldPw, new_password: newPw,
      });
      setMsg("Đổi mật khẩu thành công");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      setErr(e?.response?.data?.error || "Lỗi đổi mật khẩu");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-lg">Đổi mật khẩu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && <div className="p-2 text-sm rounded bg-red-50 text-red-700 border">{err}</div>}
          {msg && <div className="p-2 text-sm rounded bg-green-50 text-green-700 border">{msg}</div>}
          <div>
            <label className="text-sm font-semibold">Mật khẩu cũ</label>
            <input type="password" className="w-full mt-1 px-3 py-2 border rounded-lg" value={oldPw} onChange={e=>setOldPw(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Mật khẩu mới</label>
            <input type="password" className="w-full mt-1 px-3 py-2 border rounded-lg" value={newPw} onChange={e=>setNewPw(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Xác nhận mật khẩu</label>
            <input type="password" className="w-full mt-1 px-3 py-2 border rounded-lg" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Đóng</button>
            <button disabled={saving} className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50">
              {saving ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

const handleProfileSaved = (newUser) => {
  setAuthUser(newUser);
  localStorage.setItem("authUser", JSON.stringify(newUser));
}
  // Auth state
  const [authUser, setAuthUser] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('authUser') || 'null'); 
    } catch { 
      return null; 
    }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Xử lý URL cho trang chi tiết
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const placeIdFromUrl = urlParams.get('place');
    if (placeIdFromUrl) {
      setSelectedPlaceId(parseInt(placeIdFromUrl));
      setCurrentPage('details');
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage === 'details' && selectedPlaceId) {
      url.searchParams.set('place', selectedPlaceId);
      window.history.pushState({}, '', url);
    } else {
      url.searchParams.delete('place');
      window.history.pushState({}, '', url);
    }
  }, [currentPage, selectedPlaceId]);

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = (data) => {
  const u = data.user; // ✅ lấy đúng cấp "user" từ response
  setAuthUser(u);
  localStorage.setItem("authUser", JSON.stringify(u));
  setShowLogin(false);
};

const handleRegisterSuccess = (data) => {
  const u = data.user; // ✅ tương tự cho đăng ký
  setAuthUser(u);
  localStorage.setItem("authUser", JSON.stringify(u));
  setShowRegister(false);
};

  // Xử lý đăng xuất
  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar
        setCurrentPage={setCurrentPage}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
        setSelectedPlaceId={setSelectedPlaceId}
        authUser={authUser}
        onOpenLogin={() => setShowLogin(true)}
        onOpenRegister={() => setShowRegister(true)}
        onLogout={handleLogout}
      />

      {/* Routes */}
      {currentPage === 'home' && (
        <HomePage setCurrentPage={setCurrentPage} setSelectedPlaceId={setSelectedPlaceId} />
      )}
      {currentPage === 'explore' && <ExplorePage />}
      {currentPage === 'tools' && <ToolsMenu setCurrentPage={setCurrentPage} />}
      {currentPage === 'currency' && <CurrencyPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'translate' && <TranslatePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'cost' && <CostPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'directions' && <DirectionsPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'map' && <MapPage />}
      {currentPage === 'details' && (
        <DestinationDetailPage placeId={selectedPlaceId} setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'admin' && <AdminLayout authUser={authUser} />}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Chat button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-40 shadow-2xl rounded-lg overflow-hidden">
          <ChatBox />
        </div>
      )}

      {/* Auth Modals */}
      {showLogin && (
        <LoginModal 
          showLogin={showLogin}
          onClose={() => setShowLogin(false)}      // 👈 thêm dòng này
          showRegister={showRegister}
          setShowLogin={setShowLogin}        // 👈 thêm dòng này
          setShowRegister={setShowRegister}
          setAuthUser={setAuthUser}          // 👈 thêm dòng này
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess} 
        />
      )}
      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)} 
          onSuccess={handleRegisterSuccess} 
        />
      )}
      {showProfile && authUser && (
  <ProfileModal
    user={authUser}
    onClose={() => setShowProfile(false)}
    onSaved={(u) => { setAuthUser(u); localStorage.setItem('authUser', JSON.stringify(u)); }}
  />
)}

{showChangePw && authUser && (
  <ChangePasswordModal
    user={authUser}
    onClose={() => setShowChangePw(false)}
  />
)}
    </div>
  );
};

export default App;