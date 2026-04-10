using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Clients.Entities;
using wixi.Clients.DTOs;
using wixi.Clients.Interfaces;
using wixi.Core.Exceptions;

namespace wixi.WebAPI.Services;

public class ClientNoteService : IClientNoteService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<ClientNoteService> _logger;

    public ClientNoteService(
        WixiDbContext context,
        ILogger<ClientNoteService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<ClientNoteDto>> GetClientNotesAsync(int clientId)
    {
        var notes = await _context.ClientNotes
            .Where(n => n.ClientId == clientId)
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.CreatedAt)
            .ToListAsync();

        var userIds = notes.Select(n => n.CreatedByUserId).Distinct().ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);

        return notes.Select(n => new ClientNoteDto
        {
            Id = n.Id,
            ClientId = n.ClientId,
            CreatedByUserId = n.CreatedByUserId,
            CreatedByUserName = users.ContainsKey(n.CreatedByUserId) 
                ? $"{users[n.CreatedByUserId].FirstName} {users[n.CreatedByUserId].LastName}"
                : "Bilinmeyen Kullanıcı",
            CreatedByUserEmail = users.ContainsKey(n.CreatedByUserId) 
                ? users[n.CreatedByUserId].Email 
                : "",
            Content = n.Content,
            IsPinned = n.IsPinned,
            IsVisibleToClient = n.IsVisibleToClient,
            CreatedAt = n.CreatedAt,
            UpdatedAt = n.UpdatedAt
        }).ToList();
    }

    public async Task<ClientNoteDto> GetClientNoteByIdAsync(int noteId)
    {
        var note = await _context.ClientNotes
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note == null)
        {
            throw new NotFoundException($"Note with ID {noteId} not found");
        }

        var user = await _context.Users.FindAsync(note.CreatedByUserId);

        return new ClientNoteDto
        {
            Id = note.Id,
            ClientId = note.ClientId,
            CreatedByUserId = note.CreatedByUserId,
            CreatedByUserName = user != null 
                ? $"{user.FirstName} {user.LastName}"
                : "Bilinmeyen Kullanıcı",
            CreatedByUserEmail = user?.Email ?? "",
            Content = note.Content,
            IsPinned = note.IsPinned,
            IsVisibleToClient = note.IsVisibleToClient,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }

    public async Task<ClientNoteDto> CreateClientNoteAsync(int clientId, CreateClientNoteDto dto, int createdByUserId)
    {
        // Validate client exists
        var client = await _context.Clients.FindAsync(clientId);
        if (client == null)
        {
            throw new NotFoundException($"Client with ID {clientId} not found");
        }

        // Validate user exists
        var user = await _context.Users.FindAsync(createdByUserId);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {createdByUserId} not found");
        }

        var note = new ClientNote
        {
            ClientId = clientId,
            CreatedByUserId = createdByUserId,
            Content = dto.Content.Trim(),
            IsPinned = dto.IsPinned,
            IsVisibleToClient = dto.IsVisibleToClient,
            CreatedAt = DateTime.UtcNow
        };

        _context.ClientNotes.Add(note);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Client note created: NoteId={NoteId}, ClientId={ClientId}, CreatedBy={CreatedBy}", 
            note.Id, clientId, createdByUserId);

        return new ClientNoteDto
        {
            Id = note.Id,
            ClientId = note.ClientId,
            CreatedByUserId = note.CreatedByUserId,
            CreatedByUserName = user != null 
                ? $"{user.FirstName} {user.LastName}"
                : "Bilinmeyen Kullanıcı",
            CreatedByUserEmail = user?.Email ?? "",
            Content = note.Content,
            IsPinned = note.IsPinned,
            IsVisibleToClient = note.IsVisibleToClient,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }

    public async Task<ClientNoteDto> UpdateClientNoteAsync(int noteId, UpdateClientNoteDto dto)
    {
        var note = await _context.ClientNotes
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note == null)
        {
            throw new NotFoundException($"Note with ID {noteId} not found");
        }

        if (dto.Content != null)
        {
            note.Content = dto.Content.Trim();
        }

        if (dto.IsPinned.HasValue)
        {
            note.IsPinned = dto.IsPinned.Value;
        }

        if (dto.IsVisibleToClient.HasValue)
        {
            note.IsVisibleToClient = dto.IsVisibleToClient.Value;
        }

        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Client note updated: NoteId={NoteId}", noteId);

        var user = await _context.Users.FindAsync(note.CreatedByUserId);

        return new ClientNoteDto
        {
            Id = note.Id,
            ClientId = note.ClientId,
            CreatedByUserId = note.CreatedByUserId,
            CreatedByUserName = user != null 
                ? $"{user.FirstName} {user.LastName}"
                : "Bilinmeyen Kullanıcı",
            CreatedByUserEmail = user?.Email ?? "",
            Content = note.Content,
            IsPinned = note.IsPinned,
            IsVisibleToClient = note.IsVisibleToClient,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }

    public async Task DeleteClientNoteAsync(int noteId)
    {
        var note = await _context.ClientNotes.FindAsync(noteId);

        if (note == null)
        {
            throw new NotFoundException($"Note with ID {noteId} not found");
        }

        _context.ClientNotes.Remove(note);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Client note deleted: NoteId={NoteId}", noteId);
    }
}

