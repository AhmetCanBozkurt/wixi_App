using wixi.Documents.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class DocumentServiceExtensions
    {
        public static IServiceCollection AddDocumentServices(this IServiceCollection services)
        {
            // File Storage
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
            
            // Document Services
            services.AddScoped<IDocumentService, DocumentService>();
            services.AddScoped<IDocumentReviewService, DocumentReviewService>();
            
            return services;
        }
    }
}

