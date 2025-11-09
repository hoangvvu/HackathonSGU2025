# backend/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db_utils import query_db, execute_insert_return_id

auth_bp = Blueprint("auth", __name__)

def norm(s): return (s or "").strip()
def norm_lower(s): return (s or "").strip().lower()
def get_payload():
    # Ưu tiên JSON; nếu không có thì đọc form (URL-encoded / multipart)
    data = request.get_json(silent=True)
    if not data:
        if request.form:
            data = request.form.to_dict()
        else:
            data = {}
    return data

@auth_bp.route("/api/register", methods=["POST"])
def api_register():
    data = get_payload()
    name     = norm(data.get("name"))
    username = norm_lower(data.get("username"))
    email    = norm_lower(data.get("email"))
    password = norm(data.get("password"))

    # thiếu trường nào thì báo đúng trường đó
    missing = [k for k, v in {
        "name": name, "username": username, "email": email, "password": password
    }.items() if not v]
    if missing:
        return jsonify({"error": f"Thiếu {', '.join(missing)}"}), 400

    # trùng username / email?
    if query_db("SELECT 1 FROM Users WHERE username = ?", (username,)):
        return jsonify({"error": "Tên đăng nhập đã tồn tại"}), 409
    if query_db("SELECT 1 FROM Users WHERE email = ?", (email,)):
        return jsonify({"error": "Email đã tồn tại"}), 409

    pw_hash = generate_password_hash(password)
    new_id = execute_insert_return_id("""
        INSERT INTO Users (name, username, email, password, role)
        OUTPUT INSERTED.id VALUES (?, ?, ?, ?, 'user')
    """, (name, username, email, pw_hash))

    if not new_id:
        return jsonify({"error": "Không thể tạo tài khoản"}), 500

    return jsonify({"user": {
        "id": int(new_id), "name": name, "username": username, "email": email, "role": "user"
    }}), 201


@auth_bp.route("/api/login", methods=["POST"])
def api_login():
    data = get_payload()
    # chấp nhận identifier = username hoặc email
    identifier = norm_lower(data.get("identifier")) or norm_lower(data.get("email")) or norm_lower(data.get("username"))
    password   = norm(data.get("password"))

    if not identifier or not password:
        missing = []
        if not identifier: missing.append("identifier (username hoặc email)")
        if not password:   missing.append("password")
        return jsonify({"error": f"Thiếu {', '.join(missing)}"}), 400

    rows = query_db("""
        SELECT TOP 1 id, name, username, email, password, role
        FROM Users
        WHERE username = ? OR email = ?
    """, (identifier, identifier))

    if not rows:
        return jsonify({"error": "Sai thông tin đăng nhập"}), 401

    u = rows[0]
    # nếu DB đang là hash:
    if not check_password_hash(u["password"], password):
        return jsonify({"error": "Sai thông tin đăng nhập"}), 401
    # nếu bạn vẫn còn dữ liệu seed là plain-text, có thể tạm hỗ trợ fallback:
    # if u["password"] != password and not check_password_hash(u["password"], password):
    #     return jsonify({"error": "Sai thông tin đăng nhập"}), 401

    return jsonify({"user": {
        "id": int(u["id"]),
        "name": u["name"],
        "username": u.get("username"),
        "email": u.get("email"),
        "role": u.get("role", "user")
    }})

