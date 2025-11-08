import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Search, Globe, Camera, Star, Menu, X, Play, Navigation, MessageSquare, Paperclip, DollarSign, Cloud, Languages, Map, Compass, Sun, MapPinned, Users, ChevronsLeft, Building, Utensils, Ticket } from 'lucide-react';
import 'aframe';

// *** Import Leaflet và CSS ***
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// *** Sửa lỗi icon marker mặc định của Leaflet ***
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
    shadowSize: [41, 41] 
});

L.Marker.prototype.options.icon = DefaultIcon;
// ************************************************


// Navigation
// *** CẬP NHẬT: Thêm 'setSelectedPlaceId' để reset khi về home ***
const NavBar = ({ setCurrentPage, setMobileMenuOpen, mobileMenuOpen, setSelectedPlaceId }) => {
  
  const goHome = () => {
    setCurrentPage('home');
    setSelectedPlaceId(null);
  };
  
  const navigate = (page) => {
    setCurrentPage(page);
    setSelectedPlaceId(null); // Reset ID khi chuyển trang
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
            <Globe className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">Smart Travel Hub</span>
          </div>
          
          <div className="hidden md:flex gap-6">
            <button onClick={goHome} className="hover:text-yellow-200 transition">Trang chủ</button>
            <button onClick={() => navigate('explore')} className="hover:text-yellow-200 transition">Khám phá</button>
            <button onClick={() => navigate('tools')} className="hover:text-yellow-200 transition">Công cụ</button>
            <button onClick={() => navigate('map')} className="hover:text-yellow-200 transition">Bản đồ</button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <button onClick={() => { setCurrentPage('home'); setSelectedPlaceId(null); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Trang chủ</button>
            <button onClick={() => navigate('explore')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Khám phá</button>
            <button onClick={() => navigate('tools')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Công cụ</button>
            <button onClick={() => navigate('map')} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Bản đồ</button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Home Page
// *** CẬP NHẬT: Thêm 'setSelectedPlaceId' và sửa 'handleSmartSearch' để gọi API DB ***
const HomePage = ({ setCurrentPage, setSelectedPlaceId }) => {
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]); // Sẽ chứa kết quả từ DB
  const [loading, setLoading] = useState(false);
  
  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83'; 

  // Lấy vị trí và thời tiết hiện tại (Giữ nguyên)
  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`
        );
        setWeather({
          temp: Math.round(weatherResponse.data.main.temp),
          description: weatherResponse.data.weather[0].description,
          icon: weatherResponse.data.weather[0].icon,
          city: weatherResponse.data.name
        });
      }, (error) => {
         console.error('Lỗi lấy vị trí:', error);
         // Fallback data
         setWeather({ temp: 28, description: 'nắng đẹp', icon: '01d', city: 'Hồ Chí Minh' });
      });
    } catch (error) {
      console.error('Lỗi lấy thời tiết:', error);
      setWeather({ temp: 28, description: 'nắng đẹp', icon: '01d', city: 'Hồ Chí Minh' });
    }
  };

  // *** THAY ĐỔI: Tìm kiếm địa điểm từ Database (Backend Flask) ***
  const handleSmartSearch = async () => {
    const query = searchInput.trim();
    if (!query) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setRecommendations([]); // Xóa kết quả cũ

    try {
      // Gọi API /api/search-places
      const response = await axios.get('http://127.0.0.1:5000/api/search-places', {
        params: { q: query }
      });
      
      // Lưu kết quả (đã có id, name, description, thumbnail)
      setRecommendations(response.data || []);

    } catch (error) {
      console.error('Lỗi tìm kiếm địa điểm:', error);
      // Bạn có thể đặt fallback data ở đây nếu muốn
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // *** THÊM MỚI: Hàm xử lý khi click vào thẻ kết quả ***
  const handleRecommendationClick = (placeId) => {
    setSelectedPlaceId(placeId);
    setCurrentPage('details'); // Chuyển sang trang chi tiết
  };

  return (
    <div className="pt-16">
      {/* Hero Section (Giữ nguyên) */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1600" 
          alt="Vietnam" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            🌍 Smart Travel Hub
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
            Tìm kiếm địa điểm du lịch tại Việt Nam
          </p>
          
          {/* Weather Display (Giữ nguyên) */}
          {weather && (
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
              <div className="flex items-center justify-center gap-4">
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="weather"
                  className="w-16 h-16"
                />
                <div className="text-left">
                  <p className="text-3xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm capitalize">{weather.description}</p>
                  <p className="text-xs opacity-80">📍 {weather.city}</p>
                </div>
              </div>
            </div>
          )}

          {/* Smart Search - Đã cập nhật */}
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
            <p className="text-sm text-center text-white/80">
              💡 Tìm kiếm địa điểm trực tiếp từ cơ sở dữ liệu
            </p>
          </div>

          {/* *** CẬP NHẬT: Hiển thị kết quả tìm kiếm từ DB *** */}
          {recommendations.length > 0 && (
            <div className="w-full max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className="bg-white rounded-xl p-4 text-gray-800 shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition"
                  onClick={() => handleRecommendationClick(rec.id)}
                >
                  <img src={rec.thumbnail || 'https://via.placeholder.com/300x200'} alt={rec.name} className="w-full h-32 object-cover rounded-lg mb-3" />
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
            🧩 Tính năng AI & API
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
const ToolsPage = () => {
  // ... (Toàn bộ code của ToolsPage giữ nguyên như file gốc) ...
  // Currency Converter
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [rates, setRates] = useState(null);

  // Translation
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translating, setTranslating] = useState(false);

  // Cost Prediction
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [costPrediction, setCostPrediction] = useState(null);

  // Fetch exchange rates
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      // Sử dụng exchangerate-api.com (free tier)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      setRates(response.data.rates);
    } catch (error) {
      console.error('Lỗi lấy tỷ giá:', error);
      // Fallback rates
      setRates({ VND: 24000, EUR: 0.85, GBP: 0.73, USD: 1 });
    }
  };

  const handleConvert = () => {
    if (!rates) return;
    
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
    } else {
      // Convert through USD
      const inUSD = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
      const result = toCurrency === 'USD' ? inUSD : inUSD * rates[toCurrency];
      setConvertedAmount(result);
    }
  };

  // AI Translation
  const handleTranslate = async () => {
    if (!textToTranslate.trim()) return;
    
    setTranslating(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Dịch sang tiếng Anh: "${textToTranslate}". Chỉ trả về bản dịch, không giải thích.`
        })
      );
      setTranslatedText(response.data.reply);
    } catch (error) {
      console.error('Lỗi dịch:', error);
      setTranslatedText('Lỗi kết nối API');
    } finally {
      setTranslating(false);
    }
  };

  // Text-to-Speech
  const handleSpeak = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // AI Cost Prediction
  const handleCostPrediction = async () => {
    if (!destination.trim()) return;
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Ước tính chi phí du lịch ${destination} cho ${people} người trong ${days} ngày. Bao gồm: vé máy bay, khách sạn, ăn uống, vé tham quan. Trả về JSON: {"transport": số, "hotel": số, "food": số, "tickets": số, "total": số, "tourPrice": số}. Chỉ trả JSON, không giải thích.`
        })
      );
      
      const jsonMatch = response.data.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const costs = JSON.parse(jsonMatch[0]);
        setCostPrediction(costs);
      }
    } catch (error) {
      console.error('Lỗi dự đoán:', error);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">🛠️ Công cụ AI & API</h1>
        <p className="text-gray-600 mb-8">Sử dụng API thực tế và AI để hỗ trợ chuyến đi</p>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Currency Converter với API */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              Đổi tiền tệ (Live API)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Số tiền</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
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
                  {rates && <p className="text-xs text-gray-500 mt-2">Tỷ giá: 1 {fromCurrency} = {rates[toCurrency]?.toFixed(2)} {toCurrency}</p>}
                </div>
              )}
            </div>
          </div>

          {/* AI Translation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Languages className="w-6 h-6 text-purple-500" />
              Phiên dịch AI + Lồng tiếng
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Văn bản tiếng Việt</label>
                <textarea
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Nhập văn bản cần dịch..."
                />
                <button
                  onClick={() => handleSpeak(textToTranslate, 'vi')}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Play className="w-4 h-4" /> Nghe tiếng Việt
                </button>
              </div>

              <button
                onClick={handleTranslate}
                disabled={translating}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50"
              >
                {translating ? '🤖 AI đang dịch...' : 'Dịch sang tiếng Anh (AI)'}
              </button>

              {translatedText && (
                <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-purple-700">Bản dịch (English)</p>
                    <button
                      onClick={() => handleSpeak(translatedText, 'en')}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg">{translatedText}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Cost Prediction */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-500" />
              Dự đoán chi phí du lịch (AI)
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Điểm đến</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Đà Nẵng"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Số ngày: {days}</label>
                <input
                  type="range"
                  min="1"
                  max="7"
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
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition mb-4"
            >
              🤖 AI dự đoán chi phí
            </button>

            {costPrediction && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Di chuyển</span>
                    <span className="font-bold">{costPrediction.transport?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span>Khách sạn</span>
                    <span className="font-bold">{costPrediction.hotel?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                    <span>Ăn uống</span>
                    <span className="font-bold">{costPrediction.food?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span>Vé tham quan</span>
                    <span className="font-bold">{costPrediction.tickets?.toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-6">
                  <p className="text-sm mb-2">Tổng chi phí dự kiến</p>
                  <p className="text-4xl font-bold mb-4">{costPrediction.total?.toLocaleString()}đ</p>
                  <p className="text-sm mb-1">So với giá tour</p>
                  <p className="text-2xl font-bold">{costPrediction.tourPrice?.toLocaleString()}đ</p>
                  <p className="text-xs mt-2">
                    {costPrediction.total < costPrediction.tourPrice ? 
                      `✨ Tiết kiệm ${(costPrediction.tourPrice - costPrediction.total).toLocaleString()}đ` :
                      '💡 Đặt tour có thể tiện lợi hơn'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Google Maps Direction (GIỮ NGUYÊN) */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Map className="w-6 h-6 text-red-500" />
              Chỉ đường (Google Maps API)
            </h2>
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPinned className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Nhập điểm đến để xem chỉ đường</p>
                <input
                  type="text"
                  placeholder="VD: Vịnh Hạ Long"
                  className="px-4 py-2 border rounded-lg mb-2"
                />
                <button className="block mx-auto bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                  Chỉ đường
                </button>
                <p className="text-xs text-gray-500 mt-2">Tích hợp Google Maps Directions API</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Explore Page (Giữ nguyên)
const ExplorePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      // *** THAY ĐỔI LỚN: Gọi API mới từ Database (top-rated-places) ***
      const response = await axios.get('http://127.0.0.1:5000/api/top-rated-places');
      
      // Response.data đã được format sẵn trong app.py
      setDestinations(response.data || []);

    } catch (error) {
      console.error('Lỗi load điểm đến từ DB:', error);
      // Fallback data
      setDestinations([
        {
          name: 'Lỗi Kết Nối DB',
          description: 'Không thể tải dữ liệu. Vui lòng kiểm tra Flask Server và kết nối DB.',
          image: 'https://via.placeholder.com/800x400?text=Database+Error',
          rating: 0.0,
          category: 'lỗi',
          vr360: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Halong_Bay_Vietnam_360_main_cav.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDests = destinations.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">🗺️ Khám phá điểm đến (Top Rate)</h1>
        <p className="text-gray-600 mb-8">Danh sách 6 điểm đến được đánh giá cao nhất từ cơ sở dữ liệu</p>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm điểm đến..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">💾 Đang tải dữ liệu từ Database...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDests.map((dest, idx) => (
              // Lưu ý: dest.rating giờ là rating trung bình từ DB
              <DestinationCard key={idx} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Destination Card Component (Giữ nguyên)
const DestinationCard = ({ destination }) => {
  // ... (Toàn bộ code của DestinationCard giữ nguyên như file gốc) ...
  const [showVR, setShowVR] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [loadingDesc, setLoadingDesc] = useState(false);

  const loadAIDescription = async () => {
    setLoadingDesc(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Viết thuyết minh chi tiết về ${destination.name} bằng tiếng Việt (3-4 câu). Chỉ trả về nội dung thuyết minh.`
        })
      );
      setAiDescription(response.data.reply);
    } catch (error) {
      setAiDescription('Không thể tải thuyết minh.');
    } finally {
      setLoadingDesc(false);
    }
  };

  const speakDescription = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
      <img src={destination.image} alt={destination.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{destination.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold">{destination.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
        <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs mb-4">
          {destination.category}
        </span>

        <div className="space-y-2">
          <button
            onClick={() => setShowVR(!showVR)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {showVR ? 'Đóng VR360' : 'Xem VR360'}
          </button>

          <button
            onClick={loadAIDescription}
            disabled={loadingDesc}
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition text-sm disabled:opacity-50"
          >
            {loadingDesc ? '🤖 Đang tải...' : '🎙️ Thuyết minh AI'}
          </button>
        </div>

        {/* VR360 Modal */}
        {showVR && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">{destination.name} - VR360</h3>
                <button onClick={() => setShowVR(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                {/* Đảm bảo crossOrigin="anonymous" nếu ảnh từ domain khác */}
                <a-scene embedded>
                  <a-sky src={destination.vr360} crossOrigin="anonymous"></a-sky>
                  <a-camera position="0 0 0.1"></a-camera>
                </a-scene>
              </div>
            </div>
          </div>
        )}

        {/* AI Description */}
        {aiDescription && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-purple-700">Thuyết minh AI</p>
              <div className="flex gap-2">
                <button
                  onClick={() => speakDescription(aiDescription, 'vi-VN')}
                  className="text-purple-600 hover:text-purple-700"
                  title="Nghe tiếng Việt"
                >
                  🇻🇳 <Play className="w-4 h-4 inline" />
                </button>
                <button
                  onClick={async () => {
                    const res = await axios.post('http://127.0.0.1:5000/api/chat',
                      new URLSearchParams({
                        message: `Translate to English: "${aiDescription}". Only return translation.`
                      })
                    );
                    speakDescription(res.data.reply, 'en-US');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                  title="Nghe tiếng Anh"
                >
                  🇬🇧 <Play className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">{aiDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Map Page (Giữ nguyên)
const MapPage = () => {
  // ... (Toàn bộ code của MapPage giữ nguyên như file gốc) ...
  const [currentWeather, setCurrentWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // { lat: number, lng: number }
  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83'; 


  useEffect(() => {
    getUserLocationWeather();
  }, []);

  const getUserLocationWeather = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Fetch weather
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
        // Fallback Hồ Chí Minh
        const fallbackLocation = { lat: 10.8231, lng: 106.6297 };
        setUserLocation(fallbackLocation);
        
        setCurrentWeather({
          temp: 32,
          description: 'nắng đẹp',
          icon: '01d',
          humidity: 65,
          wind: 12,
          city: 'Hồ Chí Minh'
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


// *** THÊM MỚI: Trang chi tiết địa điểm (Destination Detail Page) ***
const DestinationDetailPage = ({ placeId, setCurrentPage }) => {
  const [placeData, setPlaceData] = useState(null);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVR, setShowVR] = useState(false);

  // State cho dự đoán chi phí
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2); // Thêm state số người
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

  // Hàm dự đoán chi phí (Copy từ ToolsPage và chỉnh sửa)
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

  // Lấy ảnh 360 (Giả sử ảnh đầu tiên là 360, hoặc bạn có thể thêm 1 trường
  // 'is_360' vào bảng Images trong DB)
  // Tạm thời, chúng ta sẽ dùng ảnh từ DB (nếu có) hoặc 1 ảnh mẫu
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

            {/* Dự đoán chi phí (Theo yêu cầu) */}
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
                  {/* *** THÊM MỚI: Input số người *** */}
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
                scrollWheelZoom={false} // Tắt zoom cuộn chuột
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
                {images.map((img) => (
                  <img 
                    key={img.id}
                    src={img.image_url}
                    alt={img.description || details.name}
                    className="w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition"
                    title={img.description}
                  />
                ))}
               </div>
            </div>

            {/* Địa điểm liên quan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="font-bold text-lg mb-4">Gợi ý liên quan</h3>
               <div className="space-y-4">
                {relatedPlaces
                  .filter(p => p.id !== placeId) // Loại địa điểm hiện tại
                  .map((place) => (
                  <div 
                    key={place.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    // Chuyển sang địa điểm liên quan khi click
                    onClick={() => window.location.href = `?place=${place.id}`} // Tạm thời reload, hoặc tốt hơn là setPlaceId(place.id)
                  >
                    <img src={place.thumbnail} alt={place.name} className="w-20 h-20 object-cover rounded-md" />
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

      {/* VR360 Modal (Giống ExplorePage) */}
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



// AI ChatBox (Giữ nguyên)
function ChatBox() {
  // ... (Toàn bộ code của ChatBox giữ nguyên như file gốc) ...
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

// Footer (Giữ nguyên)
const Footer = ({ setCurrentPage }) => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-8 h-8" />
            <span className="text-xl font-bold">Smart Travel Hub</span>
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
            <li>💵 Đổi tiền tệ (Live API)</li>
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

// Main App
// *** CẬP NHẬT: Thêm 'selectedPlaceId' và route cho trang 'details' ***
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null); // ID của địa điểm đang xem
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // *** THÊM MỚI: Xử lý nếu URL có query ?place=... (để F5 trang chi tiết) ***
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const placeIdFromUrl = urlParams.get('place');
    if (placeIdFromUrl) {
      setSelectedPlaceId(parseInt(placeIdFromUrl));
      setCurrentPage('details');
    }
  }, []);

  // *** THÊM MỚI: Cập nhật URL khi chuyển trang chi tiết ***
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


  return (
    <div className="min-h-screen bg-white">
      <NavBar 
        setCurrentPage={setCurrentPage} 
        setMobileMenuOpen={setMobileMenuOpen} 
        mobileMenuOpen={mobileMenuOpen}
        setSelectedPlaceId={setSelectedPlaceId} // Truyền hàm set
      />
      
      {/* Logic điều hướng trang */}
      {currentPage === 'home' && <HomePage 
                                    setCurrentPage={setCurrentPage} 
                                    setSelectedPlaceId={setSelectedPlaceId} 
                                  />}
      {currentPage === 'explore' && <ExplorePage />}
      {currentPage === 'tools' && <ToolsPage />}
      {currentPage === 'map' && <MapPage />}
      {currentPage === 'details' && <DestinationDetailPage 
                                      placeId={selectedPlaceId} 
                                      setCurrentPage={setCurrentPage} 
                                    />}
      
      <Footer setCurrentPage={setCurrentPage} />

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
    </div>
  );
};

export default App;