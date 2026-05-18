# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore sadece .csproj dosyalarıyla yapılır — Docker layer cache'ini korur
COPY Wixi.Platform.sln .
COPY Wixi.API/Wixi.API.csproj                         Wixi.API/
COPY Wixi.Modules.Core/Wixi.Modules.Core.csproj       Wixi.Modules.Core/
COPY Wixi.Modules.ECommerce/Wixi.Modules.ECommerce.csproj Wixi.Modules.ECommerce/
COPY Wixi.Shared/Wixi.Shared.csproj                   Wixi.Shared/
RUN dotnet restore Wixi.Platform.sln

COPY . .
RUN dotnet publish Wixi.API/Wixi.API.csproj -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# uploads ve logs dizinleri volume olarak mount edilir
RUN mkdir -p wwwroot/uploads logs

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Wixi.API.dll"]
