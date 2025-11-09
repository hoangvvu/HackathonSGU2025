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
VALUES (N'Nguyễn Đức Tài', N'tai', N'tai@example.com', N'123456', N'admin');
INSERT INTO dbo.Users (name, username, email, password, role)
VALUES (N'Nguyễn Văn A',   N'van', N'van@example.com', N'password123', N'user');
GO
GO

-- === SEED PLACES ===
-- Seed PLACES (tách từng dòng)
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Vịnh Hạ Long', N'Quảng Ninh, Việt Nam', 20.9101, 107.1839, N'Di sản thiên nhiên thế giới nổi tiếng với hàng nghìn đảo đá vôi.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Sa Pa', N'Lào Cai, Việt Nam', 22.3361, 103.8438, N'Thị trấn vùng cao với ruộng bậc thang và đỉnh Fansipan.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Hồ Hoàn Kiếm', N'Hà Nội, Việt Nam', 21.0288, 105.8520, N'Biểu tượng của Thủ đô Hà Nội với tháp Rùa giữa hồ.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Tràng An', N'Ninh Bình, Việt Nam', 20.2572, 105.9034, N'Quần thể danh thắng Tràng An – di sản kép thế giới.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Phú Quốc', N'Kiên Giang, Việt Nam', 10.2899, 103.9840, N'Đảo ngọc nổi tiếng với bãi biển dài và hải sản tươi ngon.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Hồ Ba Bể', N'Bắc Kạn, Việt Nam', 22.4140, 105.6270, N'Hồ nước ngọt tự nhiên lớn nhất Việt Nam, nằm giữa rừng nguyên sinh.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Cô Tô', N'Quảng Ninh, Việt Nam', 21.0084, 107.7896, N'Hòn đảo thơ mộng với bãi biển cát trắng mịn.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Đền Hùng', N'Phú Thọ, Việt Nam', 21.3829, 105.2228, N'Khu di tích lịch sử quốc gia tưởng nhớ các vua Hùng.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Làng cổ Đường Lâm', N'Hà Nội, Việt Nam', 21.1390, 105.4656, N'Làng cổ nổi tiếng với nhà cổ đá ong và di tích lịch sử.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Cố đô Huế', N'Thừa Thiên Huế, Việt Nam', 16.4637, 107.5909, N'Kinh thành triều Nguyễn, di sản văn hóa thế giới.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Phố cổ Hội An', N'Quảng Nam, Việt Nam', 15.8801, 108.3380, N'Thành phố cổ bên sông Hoài, di sản UNESCO.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Thánh địa Mỹ Sơn', N'Quảng Nam, Việt Nam', 15.7721, 108.1228, N'Thánh địa của người Chăm Pa cổ, di sản thế giới.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Cầu Rồng', N'Đà Nẵng, Việt Nam', 16.0617, 108.2285, N'Tree cầu biểu tượng Đà Nẵng có thể phun lửa, phun nước.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Bà Nà Hills', N'Đà Nẵng, Việt Nam', 16.0008, 107.9891, N'Khu du lịch nổi tiếng với Cầu Vàng và cáp treo dài nhất thế giới.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Ghềnh Đá Đĩa', N'Phú Yên, Việt Nam', 13.4170, 109.2210, N'Thiên tạo kỳ thú với hàng nghìn cột đá bazan xếp tầng.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Nha Trang', N'Khánh Hòa, Việt Nam', 12.2388, 109.1967, N'Thành phố biển nổi tiếng với vịnh đẹp và đảo san hô.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Đà Lạt', N'Lâm Đồng, Việt Nam', 11.9404, 108.4583, N'Thành phố ngàn hoa, khí hậu mát mẻ quanh năm.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Động Phong Nha', N'Quảng Bình, Việt Nam', 17.5919, 106.2876, N'Một trong những hang động kỳ vĩ nhất thế giới.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Eo Gió', N'Bình Định, Việt Nam', 13.7663, 109.2363, N'Địa điểm check-in nổi tiếng với cảnh biển và núi đá.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Vịnh Hy', N'Ninh Thuận, Việt Nam', 11.6988, 109.2353, N'Vịnh nhỏ đẹp hoang sơ với nước trong xanh.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'TP. Hồ Chí Minh', N'TP.HCM, Việt Nam', 10.7769, 106.7009, N'Thành phố năng động, trung tâm kinh tế và văn hóa lớn nhất cả nước.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Vũng Tàu', N'Bà Rịa - Vũng Tàu, Việt Nam', 10.3460, 107.0843, N'Thành phố biển với tượng Chúa Kitô và Bãi Sau nổi tiếng.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Mũi Né', N'Bình Thuận, Việt Nam', 10.9333, 108.2833, N'Thủ phủ resort với đồi cát bay và bãi biển đẹp.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Chợ nổi Cái Răng', N'Cần Thơ, Việt Nam', 9.9997, 105.7520, N'Chợ nổi đặc trưng miền sông nước.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Châu Đốc', N'An Giang, Việt Nam', 10.7000, 105.1167, N'Thành phố du lịch tâm linh, gần núi Sam và Miếu Bà Chúa Xứ.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Chùa Dơi', N'Sóc Trăng, Việt Nam', 9.6000, 105.9833, N'Ngôi chùa nổi tiếng với đàn dơi sinh sống trong khuôn viên.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Bến Tre', N'Bến Tre, Việt Nam', 10.2433, 106.3750, N'Xứ dừa miền Tây với hệ thống kênh rạch và vườn cây trái.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Đảo Phú Quốc', N'Kiên Giang, Việt Nam', 10.2899, 103.9840, N'Hòn đảo du lịch nổi tiếng với nhiều bãi biển đẹp.');
GO
INSERT INTO dbo.Places (name, address, lat, lng, description)
VALUES (N'Rạch Giá', N'Kiên Giang, Việt Nam', 10.0125, 105.0809, N'Thành phố ven biển, cửa ngõ ra các đảo miền Tây.');
GO


-- Seed IMAGES (tách từng dòng)
-- 1. Vịnh Hạ Long
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (1,  N'Images/Ha_Long_Bay-1.jpg', N'Toàn cảnh vịnh Hạ Long');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (1,  N'Images/Ha_Long_Bay-2.jpg', N'Những đảo đá vôi kỳ vĩ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (1,  N'Images/Ha_Long_Bay-3.jpg', N'Du thuyền trên vịnh');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (1,  N'Images/Ha_Long_Bay-4.jpg', N'Vịnh nhìn từ trên cao');
GO

-- 2. Sa Pa
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (2,  N'Images/Sa_Pa-1.jpg', N'Thị trấn trong sương');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (2,  N'Images/Sa_Pa-2.jpg', N'Ruộng bậc thang');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (2,  N'Images/Sa_Pa-3.jpg', N'Fansipan hùng vĩ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (2,  N'Images/Sa_Pa-4.jpg', N'Thác nước Sa Pa');
GO

-- 3. Hồ Hoàn Kiếm
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (3,  N'Images/Hoan_Kiem_Lake-1.jpg', N'Tháp Rùa giữa hồ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (3,  N'Images/Hoan_Kiem_Lake-2.jpg', N'Cầu Thê Húc buổi sớm');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (3,  N'Images/Hoan_Kiem_Lake-3.jpg', N'Hồ nhìn từ trên cao');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (3,  N'Images/Hoan_Kiem_Lake-4.jpg', N'Hồ Hoàn Kiếm về đêm');
GO

-- 4. Tràng An
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (4,  N'Images/Trang_An-1.jpg', N'Thuyền trên sông');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (4,  N'Images/Trang_An-2.jpg', N'Hang động đá vôi');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (4,  N'Images/Trang_An-3.jpg', N'Quần thể danh thắng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (4,  N'Images/Trang_An-4.jpg', N'Tràng An toàn cảnh');
GO

-- 5. Phú Quốc
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (5,  N'Images/Phu_Quoc-1.jpg', N'Biển xanh cát trắng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (5,  N'Images/Phu_Quoc-2.jpg', N'Bãi Sao nổi tiếng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (5,  N'Images/Phu_Quoc-3.jpg', N'Hoàng hôn Phú Quốc');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (5,  N'Images/Phu_Quoc-4.jpg', N'Cảnh biển thơ mộng');
GO

-- 6. Hồ Ba Bể
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (6,  N'Images/Ba_Be_Lake-1.jpg', N'Hồ Ba Bể yên bình');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (6,  N'Images/Ba_Be_Lake-2.jpg', N'Thuyền trên hồ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (6,  N'Images/Ba_Be_Lake-3.jpg', N'Rừng núi quanh hồ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (6,  N'Images/Ba_Be_Lake-4.jpg', N'Hồ nhìn từ cao');
GO

-- 7. Cô Tô
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (7,  N'Images/Co_To_Island-1.jpg', N'Bờ biển Cô Tô');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (7,  N'Images/Co_To_Island-2.jpg', N'Hải đăng Cô Tô');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (7,  N'Images/Co_To_Island-3.jpg', N'Nước trong vắt');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (7,  N'Images/Co_To_Island-4.jpg', N'Bãi biển hoang sơ');
GO

-- 8. Đền Hùng
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (8,  N'Images/Hung_Temple-1.jpg', N'Khu di tích Đền Hùng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (8,  N'Images/Hung_Temple-2.jpg', N'Bậc thang lên đền');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (8,  N'Images/Hung_Temple-3.jpg', N'Kiến trúc cổ kính');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (8,  N'Images/Hung_Temple-4.jpg', N'Khung cảnh linh thiêng');
GO

-- 9. Làng cổ Đường Lâm
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (9,  N'Images/Lang_Co_Duong_Lam-1.jpg', N'Nhà cổ đá ong');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (9,  N'Images/Lang_Co_Duong_Lam-2.jpg', N'Ngõ làng xưa');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (9,  N'Images/Lang_Co_Duong_Lam-3.jpg', N'Đình làng cổ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (9,  N'Images/Lang_Co_Duong_Lam-4.jpg', N'Không gian yên bình');
GO

-- 10. Cố đô Huế
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (10, N'Images/Co_Do_Hue-1.jpg', N'Hoàng thành Huế');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (10, N'Images/Co_Do_Hue-2.jpg', N'Ngọ Môn');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (10, N'Images/Co_Do_Hue-3.jpg', N'Lầu Ngũ Phụng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (10, N'Images/Co_Do_Hue-4.jpg', N'Toàn cảnh Kinh thành');
GO

-- 11. Phố cổ Hội An
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (11, N'Images/Pho_Co_Hoi_An-1.jpg', N'Phố cổ bên sông');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (11, N'Images/Pho_Co_Hoi_An-2.jpg', N'Phố lồng đèn');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (11, N'Images/Pho_Co_Hoi_An-3.jpg', N'Nhà cổ Hội An');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (11, N'Images/Pho_Co_Hoi_An-4.jpg', N'Hội An về đêm');
GO

-- 12. Thánh địa Mỹ Sơn
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (12, N'Images/Thanh_Dia_My_Son-1.jpg', N'Đền tháp Chăm');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (12, N'Images/Thanh_Dia_My_Son-2.jpg', N'Khu thánh địa cổ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (12, N'Images/Thanh_Dia_My_Son-3.jpg', N'Di sản văn hóa');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (12, N'Images/Thanh_Dia_My_Son-4.jpg', N'Toàn cảnh Mỹ Sơn');
GO

-- 13. Cầu Rồng (Đà Nẵng)
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (13, N'Images/Cau_Rong-1.jpg', N'Biểu tượng Đà Nẵng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (13, N'Images/Cau_Rong-2.jpg', N'Rồng phun lửa');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (13, N'Images/Cau_Rong-3.jpg', N'Cầu về đêm');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (13, N'Images/Cau_Rong-4.jpg', N'Góc nhìn toàn cảnh');
GO

-- 14. Bà Nà Hills
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (14, N'Images/Ba_Na_Hills-1.jpg', N'Cầu Vàng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (14, N'Images/Ba_Na_Hills-2.jpg', N'Làng Pháp');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (14, N'Images/Ba_Na_Hills-3.jpg', N'Cáp treo');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (14, N'Images/Ba_Na_Hills-4.jpg', N'Toàn cảnh Bà Nà');
GO

-- 15. Gành Đá Đĩa
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (15, N'Images/Ganh_Da_Dia-1.jpg', N'Cột đá bazan');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (15, N'Images/Ganh_Da_Dia-2.jpg', N'Ghềnh đá sát biển');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (15, N'Images/Ganh_Da_Dia-3.jpg', N'Cảnh quan kỳ thú');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (15, N'Images/Ganh_Da_Dia-4.jpg', N'Toàn cảnh ghềnh đá');
GO

-- 16. Nha Trang
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (16, N'Images/Nha_Trang-1.jpg', N'Bờ biển Nha Trang');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (16, N'Images/Nha_Trang-2.jpg', N'Vịnh Nha Trang');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (16, N'Images/Nha_Trang-3.jpg', N'Biển xanh cát trắng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (16, N'Images/Nha_Trang-4.jpg', N'Toàn cảnh thành phố biển');
GO

-- 17. Đà Lạt
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (17, N'Images/Da_Lat-1.jpg', N'Hồ, rừng thông');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (17, N'Images/Da_Lat-2.jpg', N'Khí hậu mát mẻ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (17, N'Images/Da_Lat-3.jpg', N'Đồi thông Đà Lạt');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (17, N'Images/Da_Lat-4.jpg', N'Toàn cảnh thành phố');
GO

-- 18. Phong Nha
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (18, N'Images/Phong_Nha_Cave-1.jpg', N'Cửa động Phong Nha');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (18, N'Images/Phong_Nha_Cave-2.jpg', N'Trên thuyền trong hang');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (18, N'Images/Phong_Nha_Cave-3.jpg', N'Măng đá, thạch nhũ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (18, N'Images/Phong_Nha_Cave-4.jpg', N'Kỳ quan hang động');
GO

-- 19. Eo Gió
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (19, N'Images/Eo_Gio-1.jpg', N'Lối đi ven biển');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (19, N'Images/Eo_Gio-2.jpg', N'Đồi cỏ và đá');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (19, N'Images/Eo_Gio-3.jpg', N'Check-in Eo Gió');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (19, N'Images/Eo_Gio-4.jpg', N'Toàn cảnh eo biển');
GO

-- 20. Vịnh Hy
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (20, N'Images/Vinh_Hy-1.jpg', N'Vịnh nước trong');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (20, N'Images/Vinh_Hy-2.jpg', N'Bờ đá và biển');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (20, N'Images/Vinh_Hy-3.jpg', N'Vẻ đẹp hoang sơ');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (20, N'Images/Vinh_Hy-4.jpg', N'Toàn cảnh vịnh');
GO

-- 21. TP. Hồ Chí Minh
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (21, N'Images/Ho_Chi_Minh_City-1.jpg', N'Trung tâm Sài Gòn');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (21, N'Images/Ho_Chi_Minh_City-2.jpg', N'Nhà thờ, bưu điện');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (21, N'Images/Ho_Chi_Minh_City-3.jpg', N'Tòa nhà hiện đại');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (21, N'Images/Ho_Chi_Minh_City-4.jpg', N'TP.HCM về đêm');
GO

-- 22. Vũng Tàu
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (22, N'Images/Vung_Tau-1.jpg', N'Biển Vũng Tàu');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (22, N'Images/Vung_Tau-2.jpg', N'Ngọn hải đăng');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (22, N'Images/Vung_Tau-3.jpg', N'Bãi Sau nhộn nhịp');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (22, N'Images/Vung_Tau-4.jpg', N'Toàn cảnh thành phố biển');
GO

-- 23. Mũi Né
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (23, N'Images/Mui_Ne-1.jpg', N'Đồi cát bay');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (23, N'Images/Mui_Ne-2.jpg', N'Biển Mũi Né');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (23, N'Images/Mui_Ne-3.jpg', N'Làng chài');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (23, N'Images/Mui_Ne-4.jpg', N'Hoàng hôn trên cát');
GO

-- 24. Chợ nổi Cái Răng
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (24, N'Images/Cai_Rang_Market-1.jpg', N'Chợ trên sông');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (24, N'Images/Cai_Rang_Market-2.jpg', N'Ghe thuyền tấp nập');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (24, N'Images/Cai_Rang_Market-3.jpg', N'Đặc trưng miền sông nước');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (24, N'Images/Cai_Rang_Market-4.jpg', N'Buổi sáng trên chợ nổi');
GO

-- 25. Châu Đốc
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (25, N'Images/Chau_Doc-1.jpg', N'Thành phố miền Tây');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (25, N'Images/Chau_Doc-2.jpg', N'Cảnh sông nước');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (25, N'Images/Chau_Doc-3.jpg', N'Miếu Bà, núi Sam');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (25, N'Images/Chau_Doc-4.jpg', N'Toàn cảnh Châu Đốc');
GO

-- 26. Chùa Dơi
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (26, N'Images/Chua_Doi-1.jpg', N'Sân chùa nhiều dơi');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (26, N'Images/Chua_Doi-2.jpg', N'Kiến trúc chùa Khmer');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (26, N'Images/Chua_Doi-3.jpg', N'Không gian rợp bóng cây');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (26, N'Images/Chua_Doi-4.jpg', N'Quang cảnh chùa');
GO

-- 27. Bến Tre
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (27, N'Images/Ben_Tre-1.jpg', N'Xứ dừa Bến Tre');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (27, N'Images/Ben_Tre-2.jpg', N'Kênh rạch miệt vườn');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (27, N'Images/Ben_Tre-3.jpg', N'Du thuyền trên kênh');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (27, N'Images/Ben_Tre-4.jpg', N'Vườn cây trái');
GO

-- 28. Đảo Phú Quốc (bộ ảnh khác)
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (28, N'Images/Phu_Quoc_Island-1.jpg', N'Bờ biển đảo Phú Quốc');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (28, N'Images/Phu_Quoc_Island-2.jpg', N'Nước biển trong xanh');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (28, N'Images/Phu_Quoc_Island-3.jpg', N'Cảnh biển yên bình');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (28, N'Images/Phu_Quoc_Island-4.jpg', N'Hoàng hôn trên đảo');
GO

-- 29. Rạch Giá
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (29, N'Images/Rach_Gia-1.jpg', N'Thành phố Rạch Giá');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (29, N'Images/Rach_Gia-2.jpg', N'Bờ biển, cảng tàu');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (29, N'Images/Rach_Gia-3.jpg', N'Đường ven biển');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (29, N'Images/Rach_Gia-4.jpg', N'Toàn cảnh thành phố');
GO

-- 30. Mộc Châu
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (30, N'Images/Moc_Chau-1.jpg', N'Đồi chè Mộc Châu');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (30, N'Images/Moc_Chau-2.jpg', N'Biển mây cao nguyên');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (30, N'Images/Moc_Chau-3.jpg', N'Cánh đồng hoa');
INSERT INTO dbo.Images (place_id, image_url, description) VALUES (30, N'Images/Moc_Chau-4.jpg', N'Cao nguyên xanh');
GO

-- Seed REVIEWS (tách từng dòng)
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (1, 1, 5, N'Vịnh Hạ Long thật sự xứng đáng là kỳ quan thế giới, cảnh đẹp hùng vĩ.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (2, 2, 5, N'Sa Pa mát lạnh, ruộng bậc thang quá đẹp, đồ ăn ngon.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (3, 3, 4, N'Hồ Hoàn Kiếm rất đẹp, nhưng đông người vào buổi tối.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (4, 4, 5, N'Tràng An là điểm đến tuyệt vời, đi thuyền qua hang rất thú vị.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (5, 5, 5, N'Phú Quốc là thiên đường biển, nước trong xanh, cát trắng mịn.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (6, 6, 4, N'Hồ Ba Bể yên tĩnh, thích hợp nghỉ dưỡng, hơi xa trung tâm.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (7, 7, 5, N'Cô Tô có biển rất đẹp, nước trong, không khí trong lành.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (8, 8, 4, N'Đền Hùng linh thiêng, đường lên khá dốc nhưng đáng để đi.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (9, 9, 5, N'Làng cổ Đường Lâm mang đậm nét văn hóa Việt, rất đáng ghé.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (10, 10, 5, N'Cố đô Huế cổ kính và trầm mặc, đồ ăn ngon, con người thân thiện.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (11, 11, 5, N'Phố cổ Hội An lung linh khi thắp đèn lồng, rất lãng mạn.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (12, 12, 4, N'Thánh địa Mỹ Sơn đẹp và cổ kính, phù hợp với người yêu lịch sử.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (13, 13, 5, N'Cầu Rồng phun lửa rất ấn tượng, biểu tượng đáng tự hào của Đà Nẵng.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (14, 14, 5, N'Bà Nà Hills đẹp như châu Âu thu nhỏ, đi cáp treo rất phê.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (15, 15, 4, N'Ghềnh Đá Đĩa độc đáo, cảnh quan thiên nhiên kỳ thú.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (16, 16, 5, N'Nha Trang biển đẹp, hải sản rẻ, người dân thân thiện.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (17, 17, 5, N'Đà Lạt mộng mơ, khí hậu mát lạnh, hoa nở quanh năm.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (18, 18, 5, N'Phong Nha kỳ vĩ, trải nghiệm thuyền trong hang tuyệt vời.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (19, 19, 5, N'Eo Gió có phong cảnh tuyệt đẹp, chụp hình sống ảo cực chất.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (20, 20, 4, N'Vịnh Hy hoang sơ, nước biển xanh như ngọc.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (21, 21, 4, N'TP.HCM năng động, nhiều điểm tham quan, đồ ăn ngon.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (22, 22, 5, N'Vũng Tàu gần Sài Gòn, dễ đi, biển sạch, nhiều món ngon.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (23, 23, 4, N'Mũi Né nắng gió, đồi cát đẹp, dịch vụ hơi đông.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (24, 24, 5, N'Chợ nổi Cái Răng vui nhộn, người dân thân thiện, nhiều đặc sản.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (25, 25, 4, N'Châu Đốc có nhiều điểm du lịch tâm linh, khá đông khách.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (26, 26, 5, N'Chùa Dơi độc đáo, nhiều dơi thật, không gian yên tĩnh.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (27, 27, 4, N'Bến Tre xứ dừa, đi xuồng ba lá rất thú vị.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (28, 28, 5, N'Phú Quốc Island có nhiều bãi tắm đẹp, thích hợp nghỉ dưỡng.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (29, 29, 4, N'Rạch Giá yên bình, thích hợp đi đảo Nam Du hoặc Phú Quốc.');
INSERT INTO dbo.Reviews (user_id, place_id, rating, comment)
VALUES (30, 30, 5, N'Mộc Châu tuyệt đẹp vào mùa hoa cải, không khí mát lạnh.');
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

