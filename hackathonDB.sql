DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Places;
DROP TABLE IF EXISTS Users;


-- Tạo lại database nếu chưa có
CREATE DATABASE hackathon;
GO

USE hackathon;
GO

-- USERS
CREATE TABLE Users (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100),
    email NVARCHAR(100) UNIQUE,
    password NVARCHAR(200),
    role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at DATETIME DEFAULT GETDATE()
);

-- PLACES
CREATE TABLE Places (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255),
    lat FLOAT,
    lng FLOAT,
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- IMAGES (1:N với Places)
CREATE TABLE Images (
    id INT IDENTITY PRIMARY KEY,
    place_id INT NOT NULL FOREIGN KEY REFERENCES Places(id) ON DELETE CASCADE,
    image_url NVARCHAR(255),
    image_data VARBINARY(MAX),  -- nếu bạn lưu ảnh trực tiếp
    description NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);

-- REVIEWS (User + Place)
CREATE TABLE Reviews (
    id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    place_id INT NOT NULL FOREIGN KEY REFERENCES Places(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);


-- Users (1 thường, 1 admin)
INSERT INTO Users (name, email, password, role)
VALUES 
('Nguyen Duc Tai', 'tai@example.com', '123456', 'admin'),
('Nguyen Van A', 'vana@example.com', 'password123', 'user');

-- Places
INSERT INTO Places (name, address, lat, lng, description)
VALUES
('Ba Na Hills', 'Da Nang, Vietnam', 16.0355, 108.0065, 'Khu du lịch nổi tiếng với cáp treo và cây Cầu Vàng'),
('Hoi An Ancient Town', 'Hoi An, Vietnam', 15.8801, 108.3380, 'Phố cổ Hoi An, Di sản Thế giới UNESCO');

-- Images (nhiều ảnh cho 1 địa điểm)
INSERT INTO Images (place_id, image_url, description)
VALUES
(1, 'https://example.com/bana1.jpg', 'Cầu Vàng nhìn từ trên cao'),
(1, 'https://example.com/bana2.jpg', 'Cổng vào Ba Na Hills'),
(2, 'https://example.com/hoian1.jpg', 'Phố cổ Hội An lúc hoàng hôn'),
(2, 'https://example.com/hoian2.jpg', 'Lồng đèn Hội An');

-- Reviews
INSERT INTO Reviews (user_id, place_id, rating, comment)
VALUES
(1, 1, 5, 'Tuyệt vời, nên đi ít nhất 1 lần!'),
(2, 2, 4, 'Hội An đẹp nhưng hơi đông vào cuối tuần.');
