# Quản lý Sách — Đặng Thần Cầu — 23IT025

## Chạy local
```bash
npm install
cp .env.example .env   # điền MONGO_READ_URI, MONGO_WRITE_URI, SESSION_SECRET
npm start
```

## Quy trình Git (giữ Merge Node bằng --no-ff)
```bash
git init -b main
# Commit nền tảng trên main
git add package.json .gitignore .env.example README.md
git commit -m "chore: khoi tao du an"

# Tao 2 nhanh tinh nang tu cung 1 diem (de do thi Git phan nhanh that su)
git branch feature/database
git branch feature/session

# --- Nhanh 1: database ---
git checkout feature/database
git add config/db.js models controllers routes views public
git commit -m "feat(database): dual connection read/write + Book model + MVC + giao dien"

# --- Nhanh 2: session ---
git checkout feature/session
git add config/session.js server.js
git commit -m "feat(session): luu session tren MongoDB Atlas bang connect-mongo"

# --- Merge vao main, giu Merge Node ---
git checkout main
git merge --no-ff feature/database -m "merge: feature/database vao main"
git merge --no-ff feature/session  -m "merge: feature/session vao main"

git log --oneline --graph --all     # kiem tra do thi co 2 Merge Node

# Day len GitHub
git remote add origin https://github.com/<ten-ban>/<repo>.git
git push -u origin main feature/database feature/session
```
> Không dùng `git merge --ff` hay `rebase`; giữ nguyên các nhánh feature (không xóa) để đồ thị còn hiển thị.

## Deploy lên Render (không hardcode secret)
1. Render → **New → Web Service** → kết nối repo GitHub.
2. Runtime: **Node** · Build Command: `npm install` · Start Command: `npm start`.
3. Tab **Environment** → thêm biến (KHÔNG commit vào code):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DB_NAME` | `DB_23IT025` |
| `MONGO_READ_URI` | chuỗi kết nối user chỉ-đọc |
| `MONGO_WRITE_URI` | chuỗi kết nối user chỉ-ghi |
| `SESSION_SECRET` | chuỗi ngẫu nhiên dài (`openssl rand -hex 48`) |
| `NODE_VERSION` | `20` |

   (`PORT` do Render tự cấp.)
4. MongoDB Atlas → **Network Access**: cho phép IP của Render (nhanh nhất: `0.0.0.0/0`).
5. Atlas → **Database Access**: tạo 2 user — `read_user` (role `read` trên `DB_23IT025`) và `write_user` (role `readWrite`, hoặc custom role có `insert`, `createIndex`, và quyền trên collection `sessions`).
   Nếu `write_user` không đọc được `sessions`, tạo thêm user riêng và đặt `MONGO_SESSION_URI`.
6. Health check path (tùy chọn): `/health`.
