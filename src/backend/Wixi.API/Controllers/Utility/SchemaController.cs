using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Wixi.API.Controllers.Utility;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class SchemaController : ControllerBase
{
    private readonly WixiCoreDbContext _context;

    public SchemaController(WixiCoreDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSchema()
    {
        var tables = new List<object>();
        var relations = new List<object>();

        var entityTypes = _context.Model.GetEntityTypes();

        foreach (var entityType in entityTypes)
        {
            var tableName = entityType.GetTableName();
            if (string.IsNullOrEmpty(tableName)) continue;

            // Get row count dynamically
            int rowCount = 0;
            try
            {
                // Safe metadata-driven query to get row count of this table.
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = $"SELECT COUNT(*) FROM [{tableName}]";
                    if (_context.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
                    {
                        await _context.Database.GetDbConnection().OpenAsync();
                    }
                    var count = await command.ExecuteScalarAsync();
                    rowCount = count != null ? Convert.ToInt32(count) : 0;
                }
            }
            catch
            {
                rowCount = 0;
            }

            var columns = new List<object>();

            // Get Primary Key properties
            var primaryKeyProperties = entityType.FindPrimaryKey()?.Properties.Select(p => p.Name).ToHashSet() ?? new HashSet<string>();

            // Get Foreign Key properties
            var foreignKeys = entityType.GetForeignKeys();
            var foreignKeyProperties = foreignKeys.SelectMany(fk => fk.Properties).Select(p => p.Name).ToHashSet();

            // Get Index properties to find unique constraints
            var uniqueIndexes = entityType.GetIndexes()
                .Where(idx => idx.IsUnique)
                .SelectMany(idx => idx.Properties)
                .Select(p => p.Name)
                .ToHashSet();

            foreach (var property in entityType.GetProperties())
            {
                string columnName = property.Name;
                try
                {
                    var storeObject = StoreObjectIdentifier.Table(tableName, null);
                    columnName = property.GetColumnName(storeObject) ?? property.Name;
                }
                catch
                {
                    try
                    {
                        columnName = property.GetColumnName() ?? property.Name;
                    }
                    catch
                    {
                        columnName = property.Name;
                    }
                }

                string dbType = "nvarchar(max)";
                try
                {
                    dbType = property.GetColumnType() ?? property.ClrType.Name;
                }
                catch
                {
                    dbType = property.ClrType.Name;
                }

                int? maxLength = null;
                try
                {
                    maxLength = property.GetMaxLength();
                }
                catch { }

                var isPk = primaryKeyProperties.Contains(property.Name);
                var isFk = foreignKeyProperties.Contains(property.Name);
                var isUnique = uniqueIndexes.Contains(property.Name) || isPk;
                var isNullable = property.IsNullable;

                columns.Add(new
                {
                    name = columnName,
                    dataType = dbType,
                    size = maxLength,
                    isPrimaryKey = isPk,
                    isForeignKey = isFk,
                    isUnique = isUnique,
                    isNullable = isNullable
                });
            }

            tables.Add(new
            {
                name = tableName,
                recordCount = rowCount,
                columns = columns
            });

            // Map Foreign Keys to relations
            foreach (var fk in foreignKeys)
            {
                var principalTableName = fk.PrincipalEntityType.GetTableName();
                if (string.IsNullOrEmpty(principalTableName)) continue;

                var relationType = fk.IsUnique ? "1:1" : "1:N";

                for (int i = 0; i < fk.Properties.Count; i++)
                {
                    string fromCol = fk.Properties[i].Name;
                    try
                    {
                        var storeObject = StoreObjectIdentifier.Table(tableName, null);
                        fromCol = fk.Properties[i].GetColumnName(storeObject) ?? fk.Properties[i].Name;
                    }
                    catch
                    {
                        try
                        {
                            fromCol = fk.Properties[i].GetColumnName() ?? fk.Properties[i].Name;
                        }
                        catch
                        {
                            fromCol = fk.Properties[i].Name;
                        }
                    }

                    string toCol = fk.PrincipalKey.Properties[i].Name;
                    try
                    {
                        var principalStoreObject = StoreObjectIdentifier.Table(principalTableName, null);
                        toCol = fk.PrincipalKey.Properties[i].GetColumnName(principalStoreObject) ?? fk.PrincipalKey.Properties[i].Name;
                    }
                    catch
                    {
                        try
                        {
                            toCol = fk.PrincipalKey.Properties[i].GetColumnName() ?? fk.PrincipalKey.Properties[i].Name;
                        }
                        catch
                        {
                            toCol = fk.PrincipalKey.Properties[i].Name;
                        }
                    }

                    relations.Add(new
                    {
                        fromTable = tableName,
                        fromColumn = fromCol,
                        toTable = principalTableName,
                        toColumn = toCol,
                        type = relationType
                    });
                }
            }
        }

        return Ok(new
        {
            tables = tables,
            relations = relations
        });
    }

    [HttpGet("layout")]
    public async Task<IActionResult> GetLayout()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized("Kullanıcı doğrulaması başarısız.");
        }

        var layout = await _context.DbSchemaLayouts
            .FirstOrDefaultAsync(l => l.UserId == userId && !l.IsDeleted);

        return Ok(new { layoutJson = layout?.LayoutJson });
    }

    public class SaveLayoutDto
    {
        public string LayoutJson { get; set; } = string.Empty;
    }

    [HttpPost("layout")]
    public async Task<IActionResult> SaveLayout([FromBody] SaveLayoutDto dto)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized("Kullanıcı doğrulaması başarısız.");
        }

        if (dto == null || string.IsNullOrEmpty(dto.LayoutJson))
        {
            return BadRequest("Düzen verisi boş olamaz.");
        }

        var layout = await _context.DbSchemaLayouts
            .FirstOrDefaultAsync(l => l.UserId == userId && !l.IsDeleted);

        if (layout == null)
        {
            layout = new WixiDbSchemaLayout
            {
                UserId = userId,
                LayoutJson = dto.LayoutJson,
                CreatedAt = DateTime.UtcNow,
                CreatedByUser = User.Identity?.Name ?? "System",
                IsActive = true,
                IsDeleted = false
            };
            await _context.DbSchemaLayouts.AddAsync(layout);
        }
        else
        {
            layout.LayoutJson = dto.LayoutJson;
            layout.UpdatedAt = DateTime.UtcNow;
            layout.UpdatedByUser = User.Identity?.Name ?? "System";
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Görünüm düzeni başarıyla kaydedildi." });
    }
}
