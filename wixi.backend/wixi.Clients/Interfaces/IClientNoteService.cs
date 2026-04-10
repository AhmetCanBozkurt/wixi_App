using wixi.Clients.DTOs;

namespace wixi.Clients.Interfaces;

public interface IClientNoteService
{
    Task<List<ClientNoteDto>> GetClientNotesAsync(int clientId);
    Task<ClientNoteDto> GetClientNoteByIdAsync(int noteId);
    Task<ClientNoteDto> CreateClientNoteAsync(int clientId, CreateClientNoteDto dto, int createdByUserId);
    Task<ClientNoteDto> UpdateClientNoteAsync(int noteId, UpdateClientNoteDto dto);
    Task DeleteClientNoteAsync(int noteId);
}

