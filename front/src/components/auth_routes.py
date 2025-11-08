from flask import Blueprint, request, jsonify
import pyodbc
import hashlib
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

# Cấu hình kết nối SQL Server
def get_db_connection():
    """Tạo kết nối đến SQL Server"""
    try:
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=LAPTOP-UE0L3QPE\SQLEXPRESS;'  # Thay bằng tên server của bạn
            'DATABASE=hackathon;'
            'UID=sa;'         # Thay bằng username của bạn
            'PWD=anhkhoa020305;'         # Thay bằng password của bạn
            'Trusted_Connection=yes;'    # Dùng Windows Authentication (hoặc bỏ nếu dùng SQL Auth)
        )
        return conn
    except Exception as e:
        print(f"Lỗi kết nối database: {e}")
        return None

def hash_password(password):
    """Mã hóa mật khẩu bằng SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route('/api/register', methods=['POST'])
def register():
    """API đăng ký tài khoản mới"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        # Validation
        if not name or not username or not password:
            return jsonify({'error': 'Vui lòng điền đầy đủ thông tin'}), 400

        if len(password) < 6:
            return jsonify({'error': 'Mật khẩu phải có ít nhất 6 ký tự'}), 400

        # Kết nối database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Không thể kết nối database'}), 500

        cursor = conn.cursor()

        # Kiểm tra username đã tồn tại chưa
        cursor.execute("SELECT id FROM Users WHERE username = ?", (username,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({'error': 'Username đã được sử dụng'}), 400

        # Mã hóa mật khẩu
        hashed_password = hash_password(password)

        # Insert user mới
        cursor.execute(
            """INSERT INTO Users (name, username, password, role, created_at) 
               OUTPUT INSERTED.id, INSERTED.name, INSERTED.username, INSERTED.role
               VALUES (?, ?, ?, 'user', GETDATE())""",
            (name, username, hashed_password)
        )
        
        # Lấy thông tin user vừa tạo
        new_user = cursor.fetchone()
        conn.commit()
        conn.close()

        return jsonify({
            'id': new_user[0],
            'name': new_user[1],
            'username': new_user[2],
            'role': new_user[3],
            'message': 'Đăng ký thành công'
        }), 201

    except Exception as e:
        print(f"Lỗi đăng ký: {e}")
        return jsonify({'error': 'Đã xảy ra lỗi khi đăng ký'}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    """API đăng nhập"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        # Validation
        if not username or not password:
            return jsonify({'error': 'Vui lòng điền đầy đủ thông tin'}), 400

        # Kết nối database
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Không thể kết nối database'}), 500

        cursor = conn.cursor()

        # Mã hóa mật khẩu để so sánh
        hashed_password = hash_password(password)

        # Tìm user theo username và password
        cursor.execute(
            """SELECT id, name, username, role 
               FROM Users 
               WHERE username = ? AND password = ?""",
            (username, hashed_password)
        )
        
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({'error': 'Username hoặc mật khẩu không đúng'}), 401

        return jsonify({
            'id': user[0],
            'name': user[1],
            'username': user[2],
            'role': user[3],
            'message': 'Đăng nhập thành công'
        }), 200

    except Exception as e:
        print(f"Lỗi đăng nhập: {e}")
        return jsonify({'error': 'Đã xảy ra lỗi khi đăng nhập'}), 500

@auth_bp.route('/api/check-auth', methods=['GET'])
def check_auth():
    """API kiểm tra trạng thái đăng nhập (optional)"""
    # Có thể implement JWT token validation ở đây
    return jsonify({'authenticated': False}), 200