-- Create Testimonials Table
-- This script creates the testimonials table for customer references/testimonials

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='wixi_Testimonials' AND xtype='U')
BEGIN
    CREATE TABLE wixi_Testimonials (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Role NVARCHAR(200) NULL,
        Location NVARCHAR(200) NULL,
        Company NVARCHAR(200) NULL,
        Content NVARCHAR(MAX) NOT NULL,
        ContentDe NVARCHAR(MAX) NULL,
        ContentEn NVARCHAR(MAX) NULL,
        ContentAr NVARCHAR(MAX) NULL,
        Rating INT NOT NULL DEFAULT 5 CHECK (Rating >= 1 AND Rating <= 5),
        ImageUrl NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CreatedBy NVARCHAR(100) NULL,
        UpdatedBy NVARCHAR(100) NULL,
        
        INDEX IX_Testimonials_IsActive (IsActive),
        INDEX IX_Testimonials_DisplayOrder (DisplayOrder),
        INDEX IX_Testimonials_CreatedAt (CreatedAt DESC)
    );

    PRINT 'wixi_Testimonials table created successfully';
END
ELSE
BEGIN
    PRINT 'wixi_Testimonials table already exists';
END
GO

-- Insert sample data (optional)
IF NOT EXISTS (SELECT * FROM wixi_Testimonials)
BEGIN
    INSERT INTO wixi_Testimonials (Name, Role, Location, Company, Content, ContentDe, ContentEn, Rating, IsActive, DisplayOrder, CreatedAt)
    VALUES 
    (N'Ayşe Demir', N'Ausbildung Öğrencisi', N'Berlin', NULL, 
     N'EduGermany sayesinde hayalim olan meslek eğitimini Almanya''da alabiliyorum. Süreç boyunca her adımda yanımda oldular.',
     N'Dank EduGermany kann ich meine Traumausbildung in Deutschland absolvieren. Sie haben mich bei jedem Schritt unterstützt.',
     N'Thanks to EduGermany, I can pursue my dream vocational training in Germany. They supported me every step of the way.',
     5, 1, 1, GETUTCDATE()),
    
    (N'Mehmet Kaya', N'Üniversite Öğrencisi', N'München', NULL,
     N'Dil eğitiminden üniversite başvurusuna kadar tüm süreçte profesyonel destek aldım. Kesinlikle tavsiye ederim.',
     N'Von der Sprachausbildung bis zur Universitätsbewerbung habe ich in allen Prozessen professionelle Unterstützung erhalten. Ich kann es auf jeden Fall empfehlen.',
     N'I received professional support throughout the entire process, from language training to university application. I definitely recommend it.',
     5, 1, 2, GETUTCDATE()),
    
    (N'Zeynep Özkan', N'Çalışan', N'Hamburg', NULL,
     N'İş bulma sürecimde çok yardımcı oldular. Almanya''daki kariyerimi onlar sayesinde başlatabildim.',
     N'Sie haben mir sehr bei meiner Jobsuche geholfen. Ich konnte meine Karriere in Deutschland dank ihnen starten.',
     N'They were very helpful during my job search process. I was able to start my career in Germany thanks to them.',
     5, 1, 3, GETUTCDATE());

    PRINT '3 sample testimonials inserted successfully';
END
GO

-- Verify the table
SELECT COUNT(*) AS TotalTestimonials FROM wixi_Testimonials;
SELECT * FROM wixi_Testimonials ORDER BY DisplayOrder, CreatedAt DESC;
GO

