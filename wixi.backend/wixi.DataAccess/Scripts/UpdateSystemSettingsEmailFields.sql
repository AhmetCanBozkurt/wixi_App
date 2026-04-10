-- Update SystemSettings to add email-related fields
-- This script updates PortalUrl and SupportEmail in wixi_SystemSettings table

-- Check if record exists
IF EXISTS (SELECT 1 FROM wixi_SystemSettings WHERE Id = 1)
BEGIN
    -- Update existing record
    UPDATE wixi_SystemSettings
    SET 
        PortalUrl = 'https://portal.worklines.de',
        SupportEmail = 'support@worklines.de',
        UpdatedAt = GETUTCDATE()
    WHERE Id = 1;
    
    PRINT 'SystemSettings updated successfully.';
END
ELSE
BEGIN
    -- Insert new record if none exists
    INSERT INTO wixi_SystemSettings (
        SiteName, 
        SiteUrl, 
        AdminEmail, 
        PortalUrl, 
        SupportEmail, 
        UpdatedAt
    )
    VALUES (
        'Worklines',
        'https://worklines.de',
        'admin@worklines.de',
        'https://portal.worklines.de',
        'support@worklines.de',
        GETUTCDATE()
    );
    
    PRINT 'SystemSettings record created successfully.';
END

