-- === RESET (an toàn theo thứ tự FK) ===
IF DB_ID('hackathon') IS NULL
CREATE DATABASE hackathon;
GO

USE hackathon;
GO

IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.Images',  'U') IS NOT NULL DROP TABLE dbo.Images;
IF OBJECT_ID('dbo.Places',  'U') IS NOT NULL DROP TABLE dbo.Places;
IF OBJECT_ID('dbo.Users',   'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- === USERS: thêm email (unique), password nới 255 để chứa hash, username NOT NULL ===
CREATE TABLE dbo.Users (
id         INT IDENTITY(1,1) PRIMARY KEY,
name       NVARCHAR(100)      NOT NULL,
username   NVARCHAR(100)      NOT NULL UNIQUE,
email      NVARCHAR(255)      NOT NULL UNIQUE,
password   NVARCHAR(255)      NOT NULL,  -- lưu hash (pbkdf2/bcrypt)
role       NVARCHAR(20)       NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
created_at DATETIME2          NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- === PLACES ===
CREATE TABLE dbo.Places (
id          INT IDENTITY(1,1) PRIMARY KEY,
name        NVARCHAR(100) NOT NULL,
address     NVARCHAR(255) NULL,
lat         FLOAT         NULL,
lng         FLOAT         NULL,
description NVARCHAR(MAX) NULL,
created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- === IMAGES ===
CREATE TABLE dbo.Images (
id          INT IDENTITY(1,1) PRIMARY KEY,
place_id    INT           NOT NULL FOREIGN KEY REFERENCES dbo.Places(id) ON DELETE CASCADE,
image_url   NVARCHAR(255) NULL,
image_data  VARBINARY(MAX) NULL,
description NVARCHAR(255) NULL,
created_at  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- === REVIEWS ===
CREATE TABLE dbo.Reviews (
id         INT IDENTITY(1,1) PRIMARY KEY,
user_id    INT       NOT NULL FOREIGN KEY REFERENCES dbo.Users(id)  ON DELETE CASCADE,
place_id   INT       NOT NULL FOREIGN KEY REFERENCES dbo.Places(id) ON DELETE CASCADE,
rating     INT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
comment    NVARCHAR(MAX) NULL,
created_at DATETIME2  NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- === SEED USERS (demo) ===
-- Lưu ý: để dùng mật khẩu mã hoá với Flask (check_password_hash),
-- hãy tạo tài khoản qua API /api/register hoặc cập nhật password bằng hash.
-- Dưới đây tạm seed mật khẩu thuần cho mục đích dữ liệu mẫu. Bạn có thể thay thế
-- bằng chuỗi hash được tạo từ Python (pbkdf2:sha256/ bcrypt) sau.
-- Seed USERS (tách từng dòng để tránh lỗi 10709)
INSERT INTO dbo.Users (name, username, email, password, role)
VALUES
(N'Nguyễn Đức Tài', N'tai', N'tai@example.com', 'pbkdf2:sha256:600000$5AYHApHbmMSehSZe$fe74b981ca38a4aaf8705a543e66a1b6b9ab31a45fa4f7d851448ea98e7e53e0', N'admin');

INSERT INTO dbo.Users (name, username, email, password, role)
VALUES
(N'Nguyễn Văn A', N'van', N'van@example.com', 'pbkdf2:sha256:600000$PfWefqTvM0u4Ztfe$fec16fae1a5a1ab9c27e16d1d314544eb9296d9297b5a95e9d3f403e4adad2e0', N'user');
GO
GO

-- === SEED PLACES ===
-- Seed PLACES (tách từng dòng)
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Bà Nà Hills',     N'Đà Nẵng, Việt Nam',    16.0355, 108.0065, N'Khu du lịch nổi tiếng với cáp treo và cây Cầu Vàng');
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Phố Cổ Hội An',    N'Hội An, Việt Nam',     15.8801, 108.3380, N'Phố cổ Hội An, Di sản Thế giới UNESCO');
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Kinh thành Huế',   N'Thừa Thiên Huế, VN',   16.4695, 107.5790, N'Di tích cố đô với Hoàng thành, lăng tẩm triều Nguyễn.');
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Hang Sơn Đoòng',   N'Quảng Bình, Việt Nam', 17.4560, 106.2870, N'Hệ thống hang động kỳ vĩ thuộc VQG Phong Nha - Kẻ Bàng.');
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Chợ nổi Cái Răng', N'Cần Thơ, Việt Nam',     9.9997, 105.7520, N'Chợ nổi đặc trưng sông nước miền Tây.');
GO

-- Seed IMAGES (tách từng dòng)
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (1, 'https://example.com/bana1.jpg',    N'Cầu Vàng nhìn từ trên cao');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (1, 'https://example.com/bana2.jpg',    N'Cổng vào Bà Nà Hills');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (2, 'https://example.com/hoian1.jpg',   N'Phố cổ Hội An lúc hoàng hôn');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (2, 'https://example.com/hoian2.jpg',   N'Lồng đèn Hội An');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (3, 'https://example.com/hue1.jpg',     N'Cổng Ngọ Môn');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (4, 'https://example.com/sondoong1.jpg',N'Bên trong Hang Sơn Đoòng');
INSERT INTO dbo.Images (place_id, image_url, description)
VALUES (5, 'https://example.com/cairang1.jpg', N'Buôn bán tấp nập trên sông');
GO

-- Seed REVIEWS (tách từng dòng)
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (1, 1, 5, N'Tuyệt vời, nên đi ít nhất 1 lần!');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (2, 2, 4, N'Hội An đẹp nhưng hơi đông vào cuối tuần.');
GO

-- === GỢI Ý: Nếu muốn seed bằng mật khẩu HASH ngay trong DB ===
-- 1) Tạo hash bằng Python (Werkzeug):
--    >>> from werkzeug.security import generate_password_hash
--    >>> print(generate_password_hash('123456'))
-- 2) Sau đó UPDATE vào DB, ví dụ:
--    UPDATE dbo.Users SET password = 'pbkdf2:sha256:XXXX$....' WHERE username = 'tai';
--    UPDATE dbo.Users SET password = 'pbkdf2:sha256:YYYY$....' WHERE username = 'van';
-- 3) Từ đây backend dùng check_password_hash() sẽ đăng nhập được bằng username/email + mật khẩu thật.

select * from [dbo].[Users]