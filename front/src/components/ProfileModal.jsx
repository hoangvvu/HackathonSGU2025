import React, { useState } from "react";
import axios from "axios";
import { X, User, Mail, KeyRound, Save } from "lucide-react";

export default function ProfileModal({ authUser, setAuthUser, onClose }) {
  const [name, setName] = useState(authUser?.name || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [savingInfo, setSavingInfo] = useState(false);

  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [msg, setMsg] = useState("");
  const toast = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2000); };

  const saveInfo = async () => {
    try {
      setSavingInfo(true);
      const { data } = await axios.put("http://127.0.0.1:5000/api/me", {
        id: authUser.id,
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
      });
      setAuthUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      toast("✅ Đã cập nhật thông tin");
    } catch (e) {
      toast(e.response?.data?.error || "❌ Lỗi cập nhật");
    } finally {
      setSavingInfo(false);
    }
  };

  const changePassword = async () => {
    if (!currPw || !newPw) return toast("⚠️ Nhập đủ mật khẩu");
    if (newPw !== confirmPw) return toast("⚠️ Mật khẩu mới không khớp");
    try {
      setChangingPw(true);
      await axios.post("http://127.0.0.1:5000/api/change-password", {
        id: authUser.id,
        current_password: currPw,
        new_password: newPw
      });
      toast("✅ Đổi mật khẩu thành công");
      setCurrPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      toast(e.response?.data?.error || "❌ Đổi mật khẩu thất bại");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-bold">Hồ sơ cá nhân</h3>
          <button onClick={onClose}><X /></button>
        </div>

        {msg && (
          <div className="mx-6 mt-4 rounded-lg bg-cyan-50 text-cyan-800 px-4 py-2">{msg}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <User className="w-5 h-5" /> Thông tin cơ bản
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ & tên</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Tên đăng nhập</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={saveInfo}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
              disabled={savingInfo}
            >
              <Save className="w-4 h-4" /> {savingInfo ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>

          {/* Đổi mật khẩu */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <KeyRound className="w-5 h-5" /> Đổi mật khẩu
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  className="w-full border rounded-lg px-3 py-2"
                  value={currPw}
                  onChange={(e) => setCurrPw(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full border rounded-lg px-3 py-2"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
              <button
                onClick={changePassword}
                disabled={changingPw}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                {changingPw ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
