-- Enable Row-Level Security (RLS) for wixi-worklines-V2
-- This script sets up RLS to ensure users can only access their own data

USE [wixi-worklines-V2];
GO

-- =============================================
-- 1. Create Security Policy Function for Users
-- =============================================

CREATE OR ALTER FUNCTION Security.fn_SecurityPredicate_Users(@UserId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS result
    WHERE 
        -- Admin can see all users
        IS_ROLEMEMBER('Admin') = 1
        OR
        -- Users can see their own data
        @UserId = CAST(SESSION_CONTEXT(N'UserId') AS INT)
        OR
        -- Employees can see client users
        (IS_ROLEMEMBER('Employee') = 1 AND 
         EXISTS (SELECT 1 FROM dbo.wixi_UserRoles ur 
                 JOIN dbo.wixi_Roles r ON ur.RoleId = r.Id 
                 WHERE ur.UserId = @UserId AND r.Name = 'Client'));
GO

-- =============================================
-- 2. Create Security Policy for Users Table
-- =============================================

CREATE SECURITY POLICY Security.UserSecurityPolicy
    ADD FILTER PREDICATE Security.fn_SecurityPredicate_Users(Id)
        ON dbo.wixi_Users,
    ADD BLOCK PREDICATE Security.fn_SecurityPredicate_Users(Id)
        ON dbo.wixi_Users AFTER UPDATE
WITH (STATE = OFF); -- Start with policy OFF, enable manually when ready
GO

-- =============================================
-- 3. Create Security Policy Function for Audit Logs
-- =============================================

CREATE OR ALTER FUNCTION Security.fn_SecurityPredicate_AuditLogs(@UserId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS result
    WHERE 
        -- Only Admin can see audit logs
        IS_ROLEMEMBER('Admin') = 1
        OR
        -- Users can see their own audit logs
        @UserId = CAST(SESSION_CONTEXT(N'UserId') AS INT);
GO

-- =============================================
-- 4. Create Security Policy for Audit Logs Table
-- =============================================

CREATE SECURITY POLICY Security.AuditLogSecurityPolicy
    ADD FILTER PREDICATE Security.fn_SecurityPredicate_AuditLogs(UserId)
        ON dbo.wixi_AuditLogs
WITH (STATE = OFF); -- Start with policy OFF
GO

-- =============================================
-- 5. Create Security Policy Function for Refresh Tokens
-- =============================================

CREATE OR ALTER FUNCTION Security.fn_SecurityPredicate_RefreshTokens(@UserId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS result
    WHERE 
        -- Users can only see their own refresh tokens
        @UserId = CAST(SESSION_CONTEXT(N'UserId') AS INT)
        OR
        -- Admin can see all tokens
        IS_ROLEMEMBER('Admin') = 1;
GO

-- =============================================
-- 6. Create Security Policy for Refresh Tokens Table
-- =============================================

CREATE SECURITY POLICY Security.RefreshTokenSecurityPolicy
    ADD FILTER PREDICATE Security.fn_SecurityPredicate_RefreshTokens(UserId)
        ON dbo.wixi_RefreshTokens,
    ADD BLOCK PREDICATE Security.fn_SecurityPredicate_RefreshTokens(UserId)
        ON dbo.wixi_RefreshTokens AFTER INSERT,
    ADD BLOCK PREDICATE Security.fn_SecurityPredicate_RefreshTokens(UserId)
        ON dbo.wixi_RefreshTokens AFTER UPDATE
WITH (STATE = OFF); -- Start with policy OFF
GO

-- =============================================
-- 7. Instructions for Enabling RLS
-- =============================================

/*
To enable RLS policies:

1. Make sure Security schema exists:
   CREATE SCHEMA Security;

2. Enable each policy:
   ALTER SECURITY POLICY Security.UserSecurityPolicy WITH (STATE = ON);
   ALTER SECURITY POLICY Security.AuditLogSecurityPolicy WITH (STATE = ON);
   ALTER SECURITY POLICY Security.RefreshTokenSecurityPolicy WITH (STATE = ON);

3. Set SESSION_CONTEXT in your application:
   EXEC sp_set_session_context @key = N'UserId', @value = @UserId;

4. To disable (for maintenance):
   ALTER SECURITY POLICY Security.UserSecurityPolicy WITH (STATE = OFF);
   ALTER SECURITY POLICY Security.AuditLogSecurityPolicy WITH (STATE = OFF);
   ALTER SECURITY POLICY Security.RefreshTokenSecurityPolicy WITH (STATE = OFF);

5. To drop policies (if needed):
   DROP SECURITY POLICY IF EXISTS Security.UserSecurityPolicy;
   DROP SECURITY POLICY IF EXISTS Security.AuditLogSecurityPolicy;
   DROP SECURITY POLICY IF EXISTS Security.RefreshTokenSecurityPolicy;
   DROP FUNCTION IF EXISTS Security.fn_SecurityPredicate_Users;
   DROP FUNCTION IF EXISTS Security.fn_SecurityPredicate_AuditLogs;
   DROP FUNCTION IF EXISTS Security.fn_SecurityPredicate_RefreshTokens;
*/

PRINT 'Row-Level Security policies created successfully (STATE = OFF)';
PRINT 'Follow instructions in script to enable policies.';
GO







