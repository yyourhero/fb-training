# FB Training - Random Phrase Display

Ứng dụng hiển thị cụm từ ngẫu nhiên cho training.

## Chạy local

```bash
node server.js
```

Mở trình duyệt:
- Trang hiển thị: http://localhost:3000/
- Trang quản lý: http://localhost:3000/admin.html

## Deploy lên Render.com

### Cách 1: Deploy từ GitHub (khuyên dùng)

1. **Push code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

2. **Tạo Web Service trên Render:**
   - Vào https://dashboard.render.com → **New +** → **Web Service**
   - Kết nối GitHub repo
   - Cấu hình:
     - **Name**: `fb-training` (hoặc tên bạn muốn)
     - **Runtime**: Node
     - **Build Command**: `echo 'No build needed'`
     - **Start Command**: `node server.js`
     - **Plan**: Free
   - Click **Create Web Service**

3. **Đợi deploy xong** (2-3 phút), Render sẽ cấp URL dạng:
   `https://fb-training-xxxx.onrender.com`

4. Mở URL đó để dùng. Trang quản lý tại `/admin.html`

### Cách 2: Dùng Render Blueprint (render.yaml)

1. Push code (kèm file `render.yaml`) lên GitHub
2. Vào https://render.com/deploy
3. Chọn repo → Render tự đọc `render.yaml` và tạo service

## ⚠️ Lưu ý quan trọng về Render Free Tier

- **Filesystem tạm thời**: Trên Render free, khi service sleep/redeploy, các thay đổi ghi vào `phrases.json`/`config.json` sẽ bị mất. Để lưu vĩnh viễn, cần:
  - **Upgrade lên paid plan** + thêm **Persistent Disk**, HOẶC
  - Dùng **environment variables** / database
- **Sleep mode**: Free tier sleep sau 15 phút không hoạt động, wake up mất ~30-50 giây khi có request
- **Workaround**: Trang admin vẫn lưu vào `localStorage` trình duyệt được (chế độ hybrid), nên thay đổi vẫn áp dụng cho từng trình duyệt

## Cấu trúc file

| File | Mô tả |
|------|-------|
| `server.js` | Server Node.js (HTTP + API đọc/ghi file) |
| `index.html` | Trang hiển thị cụm từ ngẫu nhiên |
| `admin.html` | Trang quản lý danh sách & thời gian |
| `phrases.json` | Danh sách cụm từ (mặc định) |
| `config.json` | Cấu hình thời gian random (mặc định 15s) |
| `package.json` | Cấu hình Node.js project |
| `render.yaml` | Render Blueprint (deploy 1 click) |
| `netlify.toml` | Cấu hình Netlify (nếu dùng static host) |