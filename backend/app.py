from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv
from flask import Flask, send_from_directory
import os
import pyodbc
import re  # 👈 THÊM MỚI: Để xử lý JSON từ AI
import json # 👈 THÊM MỚI: Để xử lý JSON từ AI
from auth import auth_bp   # 👈 import blueprint từ file trên
from werkzeug.security import generate_password_hash, check_password_hash


# Load biến môi trường
load_dotenv()

app = Flask(__name__, static_folder='Images', static_url_path='/Images')

app.register_blueprint(auth_bp)  # gắn /api/login, /api/register

# Đã xử lý CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# --- CẤU HÌNH GEMINI AI ---
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ Thiếu GEMINI_API_KEY trong file .env. Các tính năng AI sẽ không hoạt động.")
client = genai.Client(api_key=API_KEY)


# --- CẤU HÌNH DATABASE (SQL SERVER) ---
DB_SERVER = r'LAPTOP-UE0L3QPE\SQLEXPRESS'
DB_DATABASE = 'hackathon' 
DB_USERNAME = 'sa'
DB_PASSWORD = 'anhkhoa020305'
DB_DRIVER = '{ODBC Driver 17 for SQL Server}'

CONNECTION_STRING = f"DRIVER={DB_DRIVER};SERVER={DB_SERVER};DATABASE={DB_DATABASE};UID={DB_USERNAME};PWD={DB_PASSWORD}"

def get_db_conn():
    """Hàm helper để lấy kết nối DB và in lỗi chi tiết"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except Exception as e:
        print("="*50)
        print("❌ LỖI KẾT NỐI DATABASE SQL SERVER! (Kiểm tra lỗi này)")
        print(f"   Lỗi chi tiết: {e}")
        # ... (giữ nguyên phần in lỗi) ...
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
    # ... (Giữ nguyên logic API chat) ...
    message = request.form.get("message", "").strip()
    image = request.files.get("image")

    if not message and not image:
        return jsonify({"reply": "⚠️ Vui lòng nhập tin nhắn hoặc tải ảnh."})

    if not API_KEY:
        return jsonify({"reply": "❌ Gemini API Key không khả dụng. Không thể thực hiện chức năng AI."})

    try:
        if image:
            # ... (Giữ nguyên logic xử lý ảnh) ...
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

# 🛑 THAY THẾ API TÌM KIẾM CŨ BẰNG AI SEARCH MỚI 🛑
@app.route("/api/ai-search", methods=["GET"])
def ai_search_places():
    """API tìm kiếm bằng AI (Gemini) dựa trên context của DB"""
    search_term = request.args.get("q", "").strip()

    if not search_term:
        return jsonify([])
    
    if not API_KEY:
        print("🚨 LỖI AI-SEARCH: Thiếu Gemini API Key.")
        return jsonify({"error": "Gemini API Key not configured"}), 500

    try:
        # --- Bước 1: Lấy toàn bộ tên địa điểm từ DB làm 'context' ---
        all_places_rows = query_db("SELECT id, name, description FROM Places")
        if not all_places_rows:
            return jsonify({"error": "No places in database"}), 404
        
        # Format context cho AI: "ID: Tên (Mô tả)"
        context_list = [f"ID {p['id']}: {p['name']} ({p['description']})" for p in all_places_rows]
        db_context_string = "\n".join(context_list)

        # --- Bước 2: Tạo prompt cho Gemini ---
        prompt = f"""
        Bạn là một chuyên gia gợi ý du lịch Việt Nam. Dưới đây là danh sách các địa điểm có sẵn trong cơ sở dữ liệu của chúng ta:
        ---
        {db_context_string}
        ---
        Dựa vào yêu cầu của người dùng: "{search_term}"

        Hãy chọn ra 1 hoặc 2 địa điểm phù hợp nhất từ danh sách trên.
        Nhiệm vụ của bạn là chỉ trả về MỘT CHUỖI JSON chứa danh sách các ID của địa điểm, ví dụ: [1, 2] hoặc [5].
        Không giải thích, không thêm bất kỳ văn bản nào khác (không dùng markdown ```json). Chỉ trả về JSON.
        """

        # --- Bước 3: Gọi Gemini ---
        response = client.models.generate_content(
            model="gemini-2.0-flash", # Hoặc gemini-1.5-flash
            contents=[{"role": "user", "parts": [{"text": prompt}]}]
        )
        
        ai_response_text = response.text.strip()
        
        # --- Bước 4: Parse ID từ AI response ---
        json_match = re.search(r'\[.*?\]', ai_response_text)
        
        if not json_match:
            print(f"Lỗi AI: Không tìm thấy JSON. Response: {ai_response_text}")
            return jsonify([])

        try:
            suggested_ids = json.loads(json_match.group(0))
            if not isinstance(suggested_ids, list) or not all(isinstance(i, int) for i in suggested_ids):
                 raise ValueError("AI did not return a list of integers")
        except Exception as e:
            print(f"Lỗi Parse JSON: {e}. Response: {ai_response_text}")
            return jsonify([])
        
        if not suggested_ids:
            return jsonify([])

        # --- Bước 5: Truy vấn DB với các ID đã được AI gợi ý ---
        placeholders = ','.join('?' for _ in suggested_ids)
        query_sql = f"""
        SELECT 
            p.id, p.name, p.description, p.address,
            (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as thumbnail,
            (SELECT AVG(rating) FROM Reviews WHERE place_id = p.id) as avg_rating
        FROM Places p
        WHERE p.id IN ({placeholders})
        """
        
        suggested_places = query_db(query_sql, tuple(suggested_ids))

        # Xử lý thumbnail None
        for place in suggested_places:
            if place.get('thumbnail') is None:
                    place['thumbnail'] = 'https://via.placeholder.com/300x200?text=No+Image'

        return jsonify(suggested_places)

    except Exception as e:
        print(f"🔥 Lỗi nghiêm trọng trong /api/ai-search: {e}")
        return jsonify({"error": str(e)}), 500


# API /api/search-places (Cũ - giữ lại nếu cần, hoặc xóa đi)
@app.route("/api/search-places", methods=["GET"])
def search_places():
    """API tìm kiếm (LIKE) cũ - Đã được thay thế bằng /api/ai-search"""
    search_term = request.args.get("q", "").strip()

    if not search_term:
        return jsonify([])

    query = """
    SELECT 
        p.id, p.name, p.description, p.address,
        (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as thumbnail,
        (SELECT AVG(rating) FROM Reviews WHERE place_id = p.id) as avg_rating
    FROM Places p
    WHERE p.name LIKE N'%' + ? + N'%' OR p.description LIKE N'%' + ? + N'%'
    """
    like_param = search_term 
    
    places = query_db(query, (like_param, like_param))
    # ... (xử lý thumbnail) ...
    return jsonify(places)


# *** API: Lấy các địa điểm được đánh giá cao nhất (Giữ nguyên) ***
@app.route("/api/top-rated-places", methods=["GET"])
def get_top_rated_places():
    # ... (Giữ nguyên logic API top-rated) ...
    query = """
    SELECT TOP 6
        p.id, p.name, p.description, p.address,
        (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as image,
        AVG(r.rating) as rating_score,
        'Database' as category, 'VR_DEMO' as vr360
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


# --- API Chi tiết và Liên quan (Giữ nguyên) ---
@app.route("/api/place/<int:place_id>", methods=["GET"])
def get_place_details(place_id):
    # ... (Giữ nguyên logic API details) ...
    place_details = query_db("SELECT * FROM Places WHERE id = ?", (place_id,))
    if not place_details:
        return jsonify({"error": "Không tìm thấy địa điểm"}), 404
    images = query_db("SELECT id, image_url, description FROM Images WHERE place_id = ?", (place_id,))
    reviews = query_db("""
    SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
    FROM Reviews r LEFT JOIN Users u ON r.user_id = u.id
    WHERE r.place_id = ? ORDER BY r.created_at DESC
    """, (place_id,))
    response_data = {"details": place_details[0], "images": images, "reviews": reviews}
    return jsonify(response_data)


@app.route("/api/related-places", methods=["GET"])
def get_related_places():
    # ... (Giữ nguyên logic API related) ...
    query = """
    SELECT TOP 3 p.id, p.name, p.description,
        (SELECT TOP 1 i.image_url FROM Images i WHERE i.place_id = p.id) as thumbnail
    FROM Places p
    ORDER BY NEWID() 
    """
    places = query_db(query)
    for place in places:
        if place.get('thumbnail') is None:
            place['thumbnail'] = 'https://via.placeholder.com/300x200?text=No+Image'
    return jsonify(places)

# Helper insert trả về ID mới
def execute_insert_return_id(sql, params=()):
    conn = get_db_conn()
    if not conn: return None
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        new_id = int(row[0]) if row and row[0] is not None else None
        conn.commit()
        return new_id
    except Exception as e:
        print("❌ execute_insert_return_id:", e)
        return None
    finally:
        try: conn.close()
        except: pass

# Route test
@app.route('/')
def index():
    return {'message': 'Travel AI API is running', 'status': 'ok'}

# Route health check
@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)