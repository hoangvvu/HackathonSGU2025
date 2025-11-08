from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv
import os
import pyodbc

# Load biến môi trường
load_dotenv()

app = Flask(__name__)
# SỬA LỖI CORS: Chỉ dùng Flask-CORS để xử lý tất cả headers
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# --- CẤU HÌNH GEMINI AI ---
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ Thiếu GEMINI_API_KEY trong file .env. Các tính năng AI sẽ không hoạt động.")
client = genai.Client(api_key=API_KEY)


# --- CẤU HÌNH DATABASE (SQL SERVER) ---
# SỬA LỖI DẤU BACKSLASH: Sử dụng r'' (raw string)
DB_SERVER = r'LAPTOP-UE0L3QPE\SQLEXPRESS'
DB_DATABASE = 'hackathon' 
DB_USERNAME = 'sa'
DB_PASSWORD = 'anhkhoa020305'
# SỬA LỖI NHÁY ĐƠN THỪA: Chỉ giữ 1 cặp nháy
DB_DRIVER = '{ODBC Driver 17 for SQL Server}'

CONNECTION_STRING = f"DRIVER={DB_DRIVER};SERVER={DB_SERVER};DATABASE={DB_DATABASE};UID={DB_USERNAME};PWD={DB_PASSWORD}"

def get_db_conn():
    """Hàm helper để lấy kết nối DB và in lỗi chi tiết"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except Exception as e:
        # THÔNG BÁO LỖI CHI TIẾT ĐỂ BẠN CHẨN ĐOÁN
        print("="*50)
        print("❌ LỖI KẾT NỐI DATABASE SQL SERVER! (Kiểm tra lỗi này)")
        print(f"   Lỗi chi tiết: {e}")
        print(f"   Chuỗi kết nối: {CONNECTION_STRING}")
        print("   Vui lòng kiểm tra 3 điểm sau trên máy tính của bạn:")
        print("   1. Dịch vụ SQL Server (SQLEXPRESS) và SQL Browser có Running không.")
        print("   2. Tên Server 'LAPTOP-UE0L3QPE\SQLEXPRESS' có chính xác không (Thử thay bằng 127.0.0.1\SQLEXPRESS).")
        print("   3. Tài khoản 'sa' có được kích hoạt và mật khẩu đúng không.")
        print("="*50)
        return None

def query_db(query, params=()):
    """Hàm helper để chạy query và trả về list of dicts"""
    conn = get_db_conn()
    if not conn:
        return []
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return results
    except Exception as e:
        print(f"❌ Lỗi query DB: {e}")
        return []
    finally:
        if conn:
            conn.close()

# --- API CHAT (Giữ nguyên) ---
@app.route("/api/chat", methods=["POST"])
def chat():
    # ... (logic chat giữ nguyên) ...
    message = request.form.get("message", "").strip()
    image = request.files.get("image")

    if not message and not image:
        return jsonify({"reply": "⚠️ Vui lòng nhập tin nhắn hoặc tải ảnh."})

    if not API_KEY:
        return jsonify({"reply": "❌ Gemini API Key không khả dụng. Không thể thực hiện chức năng AI."})

    try:
        if image:
            image_bytes = image.read()
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {"text": message or "Mô tả hình ảnh này"},
                            {
                                "inline_data": {
                                    "mime_type": image.mimetype,
                                    "data": image_bytes
                                }
                            }
                        ]
                    }
                ],
            )
        else:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    {"role": "user", "parts": [{"text": message}]}
                ]
            )

        return jsonify({"reply": response.text})

    except Exception as e:
        print("🔥 Lỗi khi gọi Gemini:", str(e))
        return jsonify({"reply": f"❌ Lỗi server khi gọi AI: {str(e)}"})


# --- CÁC API CHO DATABASE ---

@app.route("/api/search-places", methods=["GET"])
def search_places():
    """API tìm kiếm địa điểm từ DB (Đã sửa lỗi Unicode SQL)"""
    search_term = request.args.get("q", "").strip()

    if not search_term:
        return jsonify([])

    # SỬA LỖI UNICODE: Sử dụng N'%' + ? + N'%' để hỗ trợ tiếng Việt có dấu
    query = """
    SELECT 
        p.id, 
        p.name, 
        p.description,
        p.address,
        (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as thumbnail,
        (SELECT AVG(rating) FROM Reviews WHERE place_id = p.id) as avg_rating
    FROM Places p
    WHERE p.name LIKE N'%' + ? + N'%' OR p.description LIKE N'%' + ? + N'%'
    """
    like_param = search_term 
    
    places = query_db(query, (like_param, like_param))

    # Xử lý thumbnail None
    for place in places:
        if place.get('thumbnail') is None:
            place['thumbnail'] = 'https://via.placeholder.com/300x200?text=No+Image'

    return jsonify(places)


# *** API: Lấy các địa điểm được đánh giá cao nhất ***
@app.route("/api/top-rated-places", methods=["GET"])
def get_top_rated_places():
    """API Lấy 6 địa điểm có rating cao nhất (Đã sửa lỗi JOIN Reviews)"""
    # SỬA LỖI: Sử dụng LEFT JOIN để lấy cả những địa điểm chưa có review
    query = """
    SELECT TOP 6
        p.id, 
        p.name, 
        p.description,
        p.address,
        (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as image,
        AVG(r.rating) as rating_score,
        'Database' as category,
        'VR_DEMO' as vr360
    FROM Places p
    LEFT JOIN Reviews r ON p.id = r.place_id
    GROUP BY p.id, p.name, p.description, p.address, p.created_at
    ORDER BY rating_score DESC, p.created_at DESC
    """
    
    places = query_db(query)
    
    formatted_places = []
    for place in places:
        rating_val = place['rating_score'] if place['rating_score'] is not None else 0.0

        formatted_places.append({
            "id": place['id'],
            "name": place['name'],
            "description": place['description'],
            "image": place['image'] or 'https://via.placeholder.com/300x200?text=No+Image',
            "rating": round(rating_val, 1),
            "category": place['category'],
            "vr360": 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Halong_Bay_Vietnam_360_main_cav.jpg'
        })
    
    return jsonify(formatted_places)


@app.route("/api/place/<int:place_id>", methods=["GET"])
def get_place_details(place_id):
    # 1. Lấy thông tin cơ bản của địa điểm
    place_details = query_db("SELECT * FROM Places WHERE id = ?", (place_id,))
    if not place_details:
        return jsonify({"error": "Không tìm thấy địa điểm"}), 404
        
    # 2. Lấy danh sách ảnh
    images = query_db("SELECT id, image_url, description FROM Images WHERE place_id = ?", (place_id,))
    
    # 3. Lấy danh sách reviews (JOIN với Users để lấy tên)
    reviews = query_db("""
    SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        u.name as user_name
    FROM Reviews r
    LEFT JOIN Users u ON r.user_id = u.id
    WHERE r.place_id = ?
    ORDER BY r.created_at DESC
    """, (place_id,))
    
    # Gom 3 kết quả lại
    response_data = {
        "details": place_details[0], 
        "images": images,
        "reviews": reviews
    }
    
    return jsonify(response_data)


@app.route("/api/related-places", methods=["GET"])
def get_related_places():
    """API lấy các địa điểm liên quan (demo: lấy 3 cái ngẫu nhiên)"""
    query = """
    SELECT TOP 3
        p.id, 
        p.name, 
        p.description,
        (SELECT TOP 1 i.image_url 
         FROM Images i 
         WHERE i.place_id = p.id) as thumbnail
    FROM Places p
    ORDER BY NEWID() 
    """
    places = query_db(query)

    # Xử lý thumbnail None
    for place in places:
        if place.get('thumbnail') is None:
            place['thumbnail'] = 'https://via.placeholder.com/300x200?text=No+Image'
    
    return jsonify(places)


# --- Khai báo chính ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)