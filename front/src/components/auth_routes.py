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

@auth_bp.route('/api/me', methods=['PUT'])
def update_profile():
    """Cập nhật thông tin cá nhân"""
    try:
        data = request.get_json()
        user_id = data.get('id')
        name = data.get('name', '').strip()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()

        if not all([user_id, name, username, email]):
            return jsonify({'error': 'Thiếu thông tin bắt buộc'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Kiểm tra username hoặc email đã tồn tại chưa (ngoại trừ chính mình)
        cursor.execute("""
            SELECT id FROM Users 
            WHERE (username = ? OR email = ?) AND id <> ?
        """, (username, email, user_id))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Tên đăng nhập hoặc email đã được sử dụng'}), 400

        # Cập nhật thông tin
        cursor.execute("""
            UPDATE Users SET name = ?, username = ?, email = ? 
            WHERE id = ?
        """, (name, username, email, user_id))
        conn.commit()

        # Trả lại thông tin user sau khi cập nhật
        cursor.execute("SELECT id, name, username, email, role, created_at FROM Users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        conn.close()

        user = {
            'id': u[0],
            'name': u[1],
            'username': u[2],
            'email': u[3],
            'role': u[4],
            'created_at': str(u[5])
        }

        return jsonify({'message': 'Cập nhật thành công', 'user': user}), 200

    except Exception as e:
        print("Lỗi update profile:", e)
        return jsonify({'error': 'Không thể cập nhật thông tin'}), 500

@auth_bp.route('/api/change-password', methods=['POST'])
def change_password():
    """Đổi mật khẩu người dùng"""
    try:
        data = request.get_json()
        user_id = data.get('id')
        current_pw = data.get('current_password', '')
        new_pw = data.get('new_password', '')

        if not all([user_id, current_pw, new_pw]):
            return jsonify({'error': 'Thiếu thông tin'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Lấy mật khẩu cũ
        cursor.execute("SELECT password FROM Users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({'error': 'Không tìm thấy người dùng'}), 404

        hashed_old = hash_password(current_pw)
        if hashed_old != row[0]:
            conn.close()
            return jsonify({'error': 'Mật khẩu hiện tại không đúng'}), 401

        hashed_new = hash_password(new_pw)
        cursor.execute("UPDATE Users SET password = ? WHERE id = ?", (hashed_new, user_id))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Đổi mật khẩu thành công'}), 200

    except Exception as e:
        print("Lỗi đổi mật khẩu:", e)
        return jsonify({'error': 'Không thể đổi mật khẩu'}), 500
