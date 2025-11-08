import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Search, Globe, Camera, Star, Menu, X, Play, Navigation, MessageSquare, Paperclip, DollarSign, Cloud, Languages, Map, Compass, Sun, MapPinned } from 'lucide-react';
import 'aframe';

// *** THÊM MỚI: Import Leaflet và CSS ***
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// *** THÊM MỚI: Sửa lỗi icon marker mặc định của Leaflet ***
// React Leaflet thường gặp lỗi không hiển thị icon marker do vấn đề với bundler (như Webpack)
// Đoạn code này import icon và gán lại thủ công
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconAnchor: [12, 41], // Vị trí neo của icon
    popupAnchor: [1, -34], // Vị trí của popup so với icon
    shadowSize: [41, 41]  // Kích thước của bóng
});

L.Marker.prototype.options.icon = DefaultIcon;
// ************************************************


// Navigation
const NavBar = ({ setCurrentPage, setMobileMenuOpen, mobileMenuOpen }) => (
  <nav className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <Globe className="w-8 h-8" />
          <span className="text-xl font-bold hidden sm:inline">Smart Travel Hub</span>
        </div>
        
        <div className="hidden md:flex gap-6">
          <button onClick={() => setCurrentPage('home')} className="hover:text-yellow-200 transition">Trang chủ</button>
          <button onClick={() => setCurrentPage('explore')} className="hover:text-yellow-200 transition">Khám phá</button>
          <button onClick={() => setCurrentPage('tools')} className="hover:text-yellow-200 transition">Công cụ</button>
          <button onClick={() => setCurrentPage('map')} className="hover:text-yellow-200 transition">Bản đồ</button>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 pb-4">
          <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Trang chủ</button>
          <button onClick={() => { setCurrentPage('explore'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Khám phá</button>
          <button onClick={() => { setCurrentPage('tools'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Công cụ</button>
          <button onClick={() => { setCurrentPage('map'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-cyan-600 px-2 rounded">Bản đồ</button>
        </div>
      )}
    </div>
  </nav>
);

// Home Page với AI Search & Weather
const HomePage = ({ setCurrentPage, setSearchQuery }) => {
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // (Giả sử bạn đã định nghĩa WEATHER_API_KEY ở đâu đó, 
  //  vì nó được dùng ở đây nhưng khai báo trong file .env)
  //  Trong React, bạn cần truy cập qua process.env.REACT_APP_WEATHER_API_KEY
  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83'; // Lấy từ file .env của bạn

  // Lấy vị trí và thời tiết hiện tại
  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = async () => {
    try {
      // Lấy vị trí hiện tại
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Gọi Weather API
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`
        );
        
        setWeather({
          temp: Math.round(weatherResponse.data.main.temp),
          description: weatherResponse.data.weather[0].description,
          icon: weatherResponse.data.weather[0].icon,
          city: weatherResponse.data.name
        });
      });
    } catch (error) {
      console.error('Lỗi lấy thời tiết:', error);
      // Fallback data
      setWeather({
        temp: 28,
        description: 'nắng đẹp',
        icon: '01d',
        city: 'Hồ Chí Minh'
      });
    }
  };

  // Tìm kiếm thông minh với AI
 // Tìm kiếm thông minh với AI — CHO PHÉP 1 TỪ KHÓA
const handleSmartSearch = async () => {
  const raw = (searchInput || "").trim();
  if (!raw) return;

  // Cắt thành các từ khóa rời, vẫn hoạt động dù chỉ có 1 từ
  const keywords = raw.toLowerCase().split(/\s+/).filter(Boolean);

  setLoading(true);
  try {
    // Ghép thông tin thời tiết (nếu có)
    const w = weather
      ? `${weather.temp}°C, ${weather.description}, ${weather.city}`
      : "không rõ";

    // Prompt chỉ dựa vào TỪ KHÓA, không yêu cầu câu hoàn chỉnh
    const prompt = `
Người dùng muốn gợi ý điểm đến tại Việt Nam.
TỪ KHÓA: ${keywords.join(", ")}.
Thời tiết hiện tại: ${w}.
Hãy suy luận ý định từ các từ khóa (vd: "biển", "leo núi", "lịch sử", "ẩm thực", "thư giãn"...)
và gợi ý 3 điểm đến PHÙ HỢP. Trả về JSON dạng:
[
  {"name": "tên", "description": "mô tả ngắn", "reason": "lý do phù hợp"}
]
CHỈ TRẢ JSON, không giải thích thêm.
`.trim();

    const aiResponse = await axios.post(
      'http://127.0.0.1:5000/api/chat',
      new URLSearchParams({ message: prompt })
    );

    const aiText = aiResponse.data.reply || "";
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    const normalizeRecs = (arr=[]) =>
      arr.map(item => ({
      ...item,
      explore: item.explore && Array.isArray(item.explore) && item.explore.length
      ? item.explore
      : buildExploreLinks(item.name || ""),
  }));
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      setRecommendations(Array.isArray(suggestions) ? suggestions : []);
    } else {
      setRecommendations([]);
    }
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    // Fallback siêu đơn giản theo một số từ khóa phổ biến
    const k = keywords.join(" ");
    const pick = (arr)=>arr.slice(0,3);
    if (/biển|bien/.test(k)) {
      setRecommendations(pick([
        {name:"Nha Trang",description:"Biển xanh cát trắng, nhiều hoạt động nước",reason:"Hợp từ khóa 'biển'"},
        {name:"Phú Quốc",description:"Đảo ngọc, lặn ngắm san hô",reason:"Khí hậu ấm, biển đẹp"},
        {name:"Đà Nẵng - Mỹ Khê",description:"Một trong những bãi biển đẹp nhất",reason:"Tiện di chuyển & dịch vụ tốt"}
      ]));
    } else if (/núi|leo|trek/.test(k)) {
      setRecommendations(pick([
        {name:"Sa Pa",description:"Ruộng bậc thang, Fansipan",reason:"Khí hậu mát, phù hợp leo núi"},
        {name:"Đà Lạt",description:"Đồi thông, trekking nhẹ",reason:"Không quá nắng nóng"},
        {name:"Bạch Mã",description:"Vườn quốc gia, thác nước",reason:"Đi bộ đường dài"}
      ]));
    } else {
      setRecommendations([]);
    }
  } finally {
    setLoading(false);
  }
};

const buildExploreLinks = (placeName) => {
  const q = encodeURIComponent(placeName);
  return [
    { label: "Google Maps", href: `https://www.google.com/maps/search/${q}` },
    { label: "Wikipedia",   href: `https://vi.wikipedia.org/wiki/Special:Search?search=${q}` },
    { label: "YouTube Vlog",href: `https://www.youtube.com/results?search_query=${q}+du+lich` },
    { label: "Lịch trình",  href: `https://www.google.com/search?q=lich+trinh+du+lich+${q}` },
  ];
};

  return (
    <div className="pt-16">
      {/* Hero Section */}
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
            Nền tảng du lịch thông minh với AI - Dự báo thời tiết & Gợi ý điểm đến
          </p>
          
          {/* Weather Display */}
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

          {/* Smart Search */}
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-full shadow-2xl p-2 flex items-center mb-4">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="VD: Tôi muốn đi biển, thư giãn..."
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
                {loading ? '🔍 Đang tìm...' : 'Tìm kiếm AI'}
              </button>
            </div>
            <p className="text-sm text-center text-white/80">
              💡 AI sẽ gợi ý điểm đến phù hợp với thời tiết và mong muốn của bạn
            </p>
          </div>

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="w-full max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 text-gray-800 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">✨ {rec.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-xs text-cyan-600">💡 {rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            🧩 Tính năng AI & API
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Sun, title: 'Dự báo thời tiết', desc: 'API OpenWeatherMap', color: 'orange' },
              { icon: Compass, title: 'Gợi ý AI', desc: 'Gemini AI tư vấn điểm đến', color: 'purple' },
              { icon: Map, title: 'Bản đồ Leaflet', desc: 'React Leaflet', color: 'blue' }, // Cập nhật
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

// Tools Page - Tích hợp API thực
const ToolsPage = () => {
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
          {/* Lưu ý: Leaflet không có tính năng chỉ đường (directions) mạnh như Google Maps.
              Để làm điều này với Leaflet, bạn cần một dịch vụ routing (như OSRM, Mapbox, hoặc 
              vẫn dùng Google Directions API) và một plugin như leaflet-routing-machine.
              Vì vậy, tôi giữ nguyên phần này làm placeholder như cũ. */}
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

// Explore Page - Fetch từ AI
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
      const response = await axios.post('http://127.0.0.1:5000/api/chat',
        new URLSearchParams({
          message: `Liệt kê 6 điểm đến du lịch nổi tiếng ở Việt Nam. Trả về JSON array: [{"name": "tên", "description": "mô tả ngắn", "image": "URL ảnh unsplash", "rating": 4.5-5.0, "category": "thiên nhiên/văn hóa/nghỉ dưỡng", "vr360": "URL ảnh 360 từ wikimedia commons"}]. Chỉ trả JSON, không giải thích.`
        })
      );
      
      const jsonMatch = response.data.reply.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const dests = JSON.parse(jsonMatch[0]);
        setDestinations(dests);
      }
    } catch (error) {
      console.error('Lỗi load điểm đến:', error);
      // Fallback data
      setDestinations([
        {
          name: 'Vịnh Hạ Long',
          description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
          rating: 4.9,
          category: 'thiên nhiên',
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
        <h1 className="text-4xl font-bold mb-4 text-gray-800">🗺️ Khám phá điểm đến</h1>
        <p className="text-gray-600 mb-8">Danh sách được AI gợi ý dựa trên độ phổ biến</p>

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
            <p className="text-gray-600 mt-4">🤖 AI đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDests.map((dest, idx) => (
              <DestinationCard key={idx} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Destination Card Component
const DestinationCard = ({ destination }) => {
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

// Map Page với Weather API - *** ĐÃ CẬP NHẬT ***
const MapPage = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // { lat: number, lng: number }
  
  // (Giả sử bạn đã định nghĩa WEATHER_API_KEY ở đâu đó)
  const WEATHER_API_KEY = 'bdb6cd644053354271d07e32ba89b83'; // Lấy từ file .env của bạn


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
        
        // (Tạm thời fetch thời tiết cho HCM, hoặc bạn có thể set cứng)
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

        {/* *** THAY THẾ Google Map BẰNG Leaflet Map *** */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Bản đồ vị trí (React Leaflet)</h3>
          </div>
          
          {/* Kiểm tra nếu userLocation đã có dữ liệu thì mới render bản đồ */}
          {userLocation ? (
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ height: '500px', width: '100%' }} // Đảm bảo set chiều cao
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            // Hiển thị loading trong khi chờ lấy vị trí
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPinned className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-600">Đang tải vị trí và bản đồ...</p>
              </div>
            </div>
          )}
        </div>
        {/* *************************************** */}


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

// AI ChatBox
function ChatBox() {
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
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <NavBar setCurrentPage={setCurrentPage} setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen} />
      
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'explore' && <ExplorePage />}
      {currentPage === 'tools' && <ToolsPage />}
      {currentPage === 'map' && <MapPage />}
      
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