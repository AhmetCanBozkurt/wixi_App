using wixi.Support.DTOs;

namespace wixi.Support.Interfaces
{
    public interface ISupportService
    {
        // Ticket operations
        Task<SupportTicketDto> CreateTicketAsync(SupportTicketDto createDto);
        Task<SupportTicketDto> GetTicketByIdAsync(long ticketId);
        Task<List<SupportTicketDto>> GetClientTicketsAsync(int clientId);
        Task<List<SupportTicketDto>> GetAllTicketsAsync();
        Task<SupportTicketDto> UpdateTicketAsync(long ticketId, SupportTicketDto updateDto);
        Task<bool> DeleteTicketAsync(long ticketId);
        
        // Message operations
        Task<SupportMessageDto> AddMessageAsync(SupportMessageDto messageDto);
        Task<List<SupportMessageDto>> GetTicketMessagesAsync(long ticketId);
        
        // FAQ operations
        Task<List<FAQDto>> GetAllFAQsAsync();
        Task<List<FAQDto>> GetFAQsByCategoryAsync(string category);
        Task<FAQDto> CreateFAQAsync(FAQDto createDto);
        Task<FAQDto> UpdateFAQAsync(int faqId, FAQDto updateDto);
        Task<bool> DeleteFAQAsync(int faqId);
    }
}
