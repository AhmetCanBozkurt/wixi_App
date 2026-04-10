# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["wixi.backend/wixi.WebAPI/wixi.WebAPI.csproj", "wixi.backend/wixi.WebAPI/"]
COPY ["wixi.backend/wixi.Core/wixi.Core.csproj", "wixi.backend/wixi.Core/"]
COPY ["wixi.backend/wixi.DataAccess/wixi.DataAccess.csproj", "wixi.backend/wixi.DataAccess/"]
COPY ["wixi.backend/wixi.Identity/wixi.Identity.csproj", "wixi.backend/wixi.Identity/"]
COPY ["wixi.backend/wixi.Forms/wixi.Forms.csproj", "wixi.backend/wixi.Forms/"]
COPY ["wixi.backend/wixi.Appointments/wixi.Appointments.csproj", "wixi.backend/wixi.Appointments/"]
COPY ["wixi.backend/wixi.Payments/wixi.Payments.csproj", "wixi.backend/wixi.Payments/"]
COPY ["wixi.backend/wixi.Content/wixi.Content.csproj", "wixi.backend/wixi.Content/"]
COPY ["wixi.backend/wixi.Clients/wixi.Clients.csproj", "wixi.backend/wixi.Clients/"]
COPY ["wixi.backend/wixi.Applications/wixi.Applications.csproj", "wixi.backend/wixi.Applications/"]
COPY ["wixi.backend/wixi.Documents/wixi.Documents.csproj", "wixi.backend/wixi.Documents/"]
COPY ["wixi.backend/wixi.Email/wixi.Email.csproj", "wixi.backend/wixi.Email/"]
COPY ["wixi.backend/wixi.Support/wixi.Support.csproj", "wixi.backend/wixi.Support/"]
COPY ["wixi.backend/wixi.CVBuilder/wixi.CVBuilder.csproj", "wixi.backend/wixi.CVBuilder/"]

# Copy Iyzipay project files
COPY ["wixi.backend/Iyzipay/Iyzipay.csproj", "wixi.backend/Iyzipay/"]

# Restore dependencies
RUN dotnet restore "wixi.backend/wixi.WebAPI/wixi.WebAPI.csproj"

# Copy all source files
COPY wixi.backend/ ./wixi.backend/

# Build project
WORKDIR "/src/wixi.backend/wixi.WebAPI"
RUN dotnet build "wixi.WebAPI.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "wixi.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

# Create Logs directory
RUN mkdir -p /app/Logs && chmod 777 /app/Logs

# Expose ports (will be configured via environment)
EXPOSE 5045
EXPOSE 5115

ENTRYPOINT ["dotnet", "wixi.WebAPI.dll"]

