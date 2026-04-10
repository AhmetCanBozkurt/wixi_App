using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Support.Entities;
using wixi.Support.DTOs;
using wixi.Support.Interfaces;

namespace wixi.WebAPI.Services
{
    public class SupportService : ISupportService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<SupportService> _logger;

        public SupportService(WixiDbContext context, ILogger<SupportService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SupportTicketDto> CreateTicketAsync(SupportTicketDto createDto)
        {
            if (!Enum.TryParse<TicketPriority>(createDto.Priority, true, out var priority))
                priority = TicketPriority.Normal;
            if (!Enum.TryParse<TicketCategory>(createDto.Category, true, out var category))
                category = TicketCategory.General;

            // Get client to find UserId
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == createDto.ClientId && c.DeletedAt == null);
            
            if (client == null)
                throw new Exception("Client not found");

            var ticket = new SupportTicket
            {
                ClientId = createDto.ClientId,
                Subject = createDto.Subject,
                TicketNumber = $"TKT-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(10000, 99999)}",
                Status = TicketStatus.Open,
                Priority = priority,
                Category = category,
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Add initial message - use client's UserId, not ClientId
            // Use Description if provided, otherwise use Subject as fallback
            var initialMessageText = !string.IsNullOrWhiteSpace(createDto.Description) 
                ? createDto.Description 
                : createDto.Subject;
            
            var initialMessage = new SupportMessage
            {
                TicketId = ticket.Id,
                SenderId = client.UserId,
                Message = initialMessageText,
                IsFromClient = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.SupportMessages.Add(initialMessage);
            await _context.SaveChangesAsync();

            return await GetTicketByIdAsync(ticket.Id);
        }

        public async Task<SupportTicketDto> GetTicketByIdAsync(long ticketId)
        {
            var ticket = await _context.SupportTickets
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null) throw new Exception("Ticket not found");
            return await MapToDtoAsync(ticket);
        }

        public async Task<List<SupportTicketDto>> GetClientTicketsAsync(int clientId)
        {
            var tickets = await _context.SupportTickets
                .Include(t => t.Messages)
                .Where(t => t.ClientId == clientId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var result = new List<SupportTicketDto>();
            foreach (var ticket in tickets)
            {
                result.Add(await MapToDtoAsync(ticket));
            }
            return result;
        }

        public async Task<List<SupportTicketDto>> GetAllTicketsAsync()
        {
            var tickets = await _context.SupportTickets
                .Include(t => t.Messages)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var result = new List<SupportTicketDto>();
            foreach (var ticket in tickets)
            {
                result.Add(await MapToDtoAsync(ticket));
            }
            return result;
        }

        public async Task<SupportTicketDto> UpdateTicketAsync(long ticketId, SupportTicketDto updateDto)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);
            if (ticket == null) throw new Exception("Ticket not found");

            ticket.Subject = updateDto.Subject;
            if (Enum.TryParse<TicketPriority>(updateDto.Priority, true, out var priority))
                ticket.Priority = priority;
            if (Enum.TryParse<TicketStatus>(updateDto.Status, true, out var status))
                ticket.Status = status;

            ticket.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetTicketByIdAsync(ticketId);
        }

        public async Task<bool> DeleteTicketAsync(long ticketId)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);
            if (ticket == null) throw new Exception("Ticket not found");

            _context.SupportTickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SupportMessageDto> AddMessageAsync(SupportMessageDto messageDto)
        {
            var message = new SupportMessage
            {
                TicketId = messageDto.TicketId,
                SenderId = messageDto.SenderId,
                Message = messageDto.Message,
                IsFromClient = messageDto.IsFromClient,
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportMessages.Add(message);

            var ticket = await _context.SupportTickets.FindAsync(messageDto.TicketId);
            if (ticket != null)
            {
                ticket.UpdatedAt = DateTime.UtcNow;
                if (ticket.FirstResponseAt == null && !message.IsFromClient)
                    ticket.FirstResponseAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return await MapToMessageDtoAsync(message);
        }

        public async Task<List<SupportMessageDto>> GetTicketMessagesAsync(long ticketId)
        {
            var messages = await _context.SupportMessages
                .Where(m => m.TicketId == ticketId && m.DeletedAt == null)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var result = new List<SupportMessageDto>();
            foreach (var msg in messages)
            {
                result.Add(await MapToMessageDtoAsync(msg));
            }
            return result;
        }

        public async Task<List<FAQDto>> GetAllFAQsAsync()
        {
            var faqs = await _context.FAQs
                .Where(f => f.IsActive)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();

            return faqs.Select(f => MapToFAQDto(f)).ToList();
        }

        public async Task<List<FAQDto>> GetFAQsByCategoryAsync(string category)
        {
            if (!Enum.TryParse<FAQCategory>(category, true, out var faqCategory))
                throw new Exception($"Invalid FAQ category: {category}");

            var faqs = await _context.FAQs
                .Where(f => f.IsActive && f.Category == faqCategory)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();

            return faqs.Select(f => MapToFAQDto(f)).ToList();
        }

        public async Task<FAQDto> CreateFAQAsync(FAQDto createDto)
        {
            if (!Enum.TryParse<FAQCategory>(createDto.Category, true, out var faqCategory))
                throw new Exception($"Invalid FAQ category: {createDto.Category}");

            var faq = new FAQ
            {
                Category = faqCategory,
                Question_TR = createDto.Question_TR,
                Answer_TR = createDto.Answer_TR,
                Question_EN = createDto.Question_EN,
                Answer_EN = createDto.Answer_EN,
                Question_DE = createDto.Question_DE,
                Answer_DE = createDto.Answer_DE,
                Question_AR = createDto.Question_AR,
                Answer_AR = createDto.Answer_AR,
                Tags = createDto.Tags,
                DisplayOrder = createDto.DisplayOrder,
                IsFeatured = createDto.IsFeatured,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.FAQs.Add(faq);
            await _context.SaveChangesAsync();
            return MapToFAQDto(faq);
        }

        public async Task<FAQDto> UpdateFAQAsync(int faqId, FAQDto updateDto)
        {
            var faq = await _context.FAQs.FindAsync(faqId);
            if (faq == null) throw new Exception("FAQ not found");

            if (!Enum.TryParse<FAQCategory>(updateDto.Category, true, out var faqCategory))
                throw new Exception($"Invalid FAQ category: {updateDto.Category}");

            faq.Category = faqCategory;
            faq.Question_TR = updateDto.Question_TR;
            faq.Answer_TR = updateDto.Answer_TR;
            faq.Question_EN = updateDto.Question_EN;
            faq.Answer_EN = updateDto.Answer_EN;
            faq.Question_DE = updateDto.Question_DE;
            faq.Answer_DE = updateDto.Answer_DE;
            faq.Question_AR = updateDto.Question_AR;
            faq.Answer_AR = updateDto.Answer_AR;
            faq.Tags = updateDto.Tags;
            faq.DisplayOrder = updateDto.DisplayOrder;
            faq.IsActive = updateDto.IsActive;
            faq.IsFeatured = updateDto.IsFeatured;
            faq.RelatedLink = updateDto.RelatedLink;
            faq.VideoUrl = updateDto.VideoUrl;
            faq.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToFAQDto(faq);
        }

        public async Task<bool> DeleteFAQAsync(int faqId)
        {
            var faq = await _context.FAQs.FindAsync(faqId);
            if (faq == null) throw new Exception("FAQ not found");

            _context.FAQs.Remove(faq);
            await _context.SaveChangesAsync();
            return true;
        }

        // Helper methods
        private async Task<SupportTicketDto> MapToDtoAsync(SupportTicket ticket)
        {
            // Get description from the first message (initial message from client)
            var description = ticket.Messages
                ?.Where(m => m.IsFromClient)
                .OrderBy(m => m.CreatedAt)
                .FirstOrDefault()?.Message;

            // Get messages and map them
            var messagesList = new List<SupportMessageDto>();
            if (ticket.Messages != null && ticket.Messages.Any())
            {
                foreach (var msg in ticket.Messages.OrderBy(m => m.CreatedAt))
                {
                    messagesList.Add(await MapToMessageDtoAsync(msg));
                }
            }
            var messages = messagesList;

            // Get assigned user name if assigned
            string? assignedToName = null;
            if (ticket.AssignedToId.HasValue)
            {
                try
                {
                    var assignedUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == ticket.AssignedToId.Value);
                    assignedToName = assignedUser != null 
                        ? $"{assignedUser.FirstName} {assignedUser.LastName}".Trim()
                        : null;
                }
                catch
                {
                    // Ignore errors when fetching assigned user
                }
            }

            return new SupportTicketDto
            {
                Id = ticket.Id,
                ClientId = ticket.ClientId,
                TicketNumber = ticket.TicketNumber,
                Subject = ticket.Subject,
                Description = description,
                Status = ticket.Status.ToString(),
                Priority = ticket.Priority.ToString(),
                Category = ticket.Category.ToString(),
                AssignedToId = ticket.AssignedToId,
                AssignedToName = assignedToName,
                FirstResponseAt = ticket.FirstResponseAt,
                ResolvedAt = ticket.ResolvedAt,
                ClosedAt = ticket.ClosedAt,
                Resolution = ticket.Resolution,
                Rating = ticket.Rating,
                CreatedAt = ticket.CreatedAt,
                Messages = messages
            };
        }

        private async Task<SupportMessageDto> MapToMessageDtoAsync(SupportMessage message)
        {
            // Get sender name and role
            string? senderName = null;
            string? senderRole = null;
            
            try
            {
                var sender = await _context.Users
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Id == message.SenderId);
                
                if (sender != null)
                {
                    senderName = $"{sender.FirstName} {sender.LastName}".Trim();
                    if (string.IsNullOrWhiteSpace(senderName))
                    {
                        senderName = sender.UserName ?? sender.Email ?? "Unknown";
                    }
                    
                    // Get sender role
                    var roles = sender.UserRoles?
                        .Where(ur => ur.Role != null)
                        .Select(ur => ur.Role!.Name)
                        .ToList();
                    
                    if (roles != null && roles.Any())
                    {
                        senderRole = roles.FirstOrDefault();
                    }
                    else
                    {
                        // Check if sender is a client
                        var client = await _context.Clients
                            .FirstOrDefaultAsync(c => c.UserId == message.SenderId && c.DeletedAt == null);
                        if (client != null)
                        {
                            senderRole = "Client";
                        }
                        else
                        {
                            senderRole = message.IsFromClient ? "Client" : "Support";
                        }
                    }
                }
                else
                {
                    // If user not found, determine role from IsFromClient
                    senderName = "Unknown";
                    senderRole = message.IsFromClient ? "Client" : "Support";
                }
            }
            catch
            {
                // If error, use fallback
                senderName = "Unknown";
                senderRole = message.IsFromClient ? "Client" : "Support";
            }

            return new SupportMessageDto
            {
                Id = message.Id,
                TicketId = message.TicketId,
                SenderId = message.SenderId,
                SenderName = senderName,
                SenderRole = senderRole,
                Message = message.Message,
                IsInternal = message.IsInternal,
                IsFromClient = message.IsFromClient,
                IsAutomated = message.IsAutomated,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt,
                AttachmentFileName = message.AttachmentFileName,
                AttachmentSizeBytes = message.AttachmentSizeBytes,
                CreatedAt = message.CreatedAt
            };
        }

        private FAQDto MapToFAQDto(FAQ faq)
        {
            return new FAQDto
            {
                Id = faq.Id,
                Category = faq.Category.ToString(),
                Question_TR = faq.Question_TR,
                Answer_TR = faq.Answer_TR,
                Question_EN = faq.Question_EN,
                Answer_EN = faq.Answer_EN,
                Question_DE = faq.Question_DE,
                Answer_DE = faq.Answer_DE,
                Question_AR = faq.Question_AR,
                Answer_AR = faq.Answer_AR,
                Tags = faq.Tags,
                DisplayOrder = faq.DisplayOrder,
                IsActive = faq.IsActive,
                IsFeatured = faq.IsFeatured,
                ViewCount = faq.ViewCount,
                HelpfulCount = faq.HelpfulCount,
                NotHelpfulCount = faq.NotHelpfulCount,
                HelpfulRatio = faq.HelpfulRatio,
                RelatedLink = faq.RelatedLink,
                VideoUrl = faq.VideoUrl,
                CreatedAt = faq.CreatedAt
            };
        }
    }
}

