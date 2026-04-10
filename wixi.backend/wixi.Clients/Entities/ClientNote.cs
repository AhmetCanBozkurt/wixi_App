namespace wixi.Clients.Entities;

/// <summary>
/// Represents a note added to a client by an admin/employee
/// </summary>
public class ClientNote
{
    public int Id { get; set; }
    
    public int ClientId { get; set; }
    public virtual Client Client { get; set; } = null!;
    
    /// <summary>
    /// ID of the user (admin/employee) who created the note
    /// </summary>
    public int CreatedByUserId { get; set; }
    
    /// <summary>
    /// Note content
    /// </summary>
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether the note is pinned (important)
    /// </summary>
    public bool IsPinned { get; set; } = false;
    
    /// <summary>
    /// Whether the note is visible to the client
    /// </summary>
    public bool IsVisibleToClient { get; set; } = false;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

