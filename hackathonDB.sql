DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Places;
DROP TABLE IF EXISTS Users;


-- Tạo lại database nếu chưa có (GIỮ NGUYÊN)
CREATE DATABASE hackathon;
GO

USE hackathon;
GO

-- USERS (Sử dụng NVARCHAR là đúng)
CREATE TABLE Users (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100),
    email NVARCHAR(100) UNIQUE,
    password NVARCHAR(200),
    role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at DATETIME DEFAULT GETDATE()
);

-- PLACES (Sử dụng NVARCHAR là đúng)
CREATE TABLE Places (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255),
    lat FLOAT,
    lng FLOAT,
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- IMAGES (Sử dụng NVARCHAR là đúng)
CREATE TABLE Images (
    id INT IDENTITY PRIMARY KEY,
    place_id INT NOT NULL FOREIGN KEY REFERENCES Places(id) ON DELETE CASCADE,
    image_url NVARCHAR(255),
    image_data VARBINARY(MAX),  
    description NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);

-- REVIEWS (Sử dụng NVARCHAR là đúng)
CREATE TABLE Reviews (
    id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    place_id INT NOT NULL FOREIGN KEY REFERENCES Places(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);


-- Users (ĐÃ SỬA: Thêm N' cho tên có dấu)
INSERT INTO Users (name, email, password, role)
VALUES 
(N'Nguyễn Đức Tài', 'tai@example.com', '123456', 'admin'),
(N'Nguyễn Văn A', 'vana@example.com', 'password123', 'user');

-- Places (ĐÃ SỬA: Thêm N' cho Tên và Description)
INSERT INTO Places (name, address, lat, lng, description)
VALUES
(N'Bà Nà Hills', N'Đà Nẵng, Việt Nam', 16.0355, 108.0065, N'Khu du lịch nổi tiếng với cáp treo và cây Cầu Vàng'),
(N'Phố Cổ Hội An', N'Hội An, Việt Nam', 15.8801, 108.3380, N'Phố cổ Hội An, Di sản Thế giới UNESCO'),
(N'Kinh thành Huế', N'Thừa Thiên Huế, Việt Nam', 16.4695, 107.5790, N'Di tích cố đô với Hoàng thành, lăng tẩm triều Nguyễn.'),
(N'Hang Sơn Đoòng', N'Quảng Bình, Việt Nam', 17.4560, 106.2870, N'Hệ thống hang động kỳ vĩ thuộc Vườn quốc gia Phong Nha - Kẻ Bàng.'),
(N'Chợ nổi Cái Răng', N'Cần Thơ, Việt Nam', 9.9997, 105.7520, N'Chợ nổi đặc trưng sông nước miền Tây.'),



INSERT INTO Images (place_id, image_url, description)
VALUES
(1, 'https://example.com/bana1.jpg', N'Cầu Vàng nhìn từ trên cao'),
(1, 'https://example.com/bana2.jpg', N'Cổng vào Bà Nà Hills'),
(2, 'https://example.com/hoian1.jpg', N'Phố cổ Hội An lúc hoàng hôn'),
(2, 'https://example.com/hoian2.jpg', N'Lồng đèn Hội An'),
(3, 'https://example.com/hue1.jpg', N'Cổng Ngọ Môn'),
(4, 'https://example.com/sondoong1.jpg', N'Bên trong Hang Sơn Đoòng'),
(5, 'https://example.com/cairang1.jpg', N'Buôn bán tấp nập trên sông');

-- Reviews (ĐÃ SỬA: Thêm N' cho Comment)
INSERT INTO Reviews (user_id, place_id, rating, comment)
VALUES
(1, 1, 5, N'Tuyệt vời, nên đi ít nhất 1 lần!'),
(2, 2, 4, N'Hội An đẹp nhưng hơi đông vào cuối tuần.');