# Multi-stage build for TOEFL Prep App
# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/ClientApp

# Copy package files and install dependencies
COPY ClientApp/package*.json ./
RUN npm ci --silent

# Copy frontend source and build
COPY ClientApp/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app

# Copy csproj and restore dependencies
COPY Englishv1/*.csproj ./Englishv1/
RUN dotnet restore ./Englishv1/Englishv1.csproj

# Copy entire backend source
COPY Englishv1/ ./Englishv1/

# Copy built frontend files to backend wwwroot
COPY --from=frontend-build /app/ClientApp/dist ./Englishv1/wwwroot

# Build backend
RUN dotnet publish ./Englishv1/Englishv1.csproj -c Release -o /app/publish

# Stage 3: Runtime Image (ARM64 compatible)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app

# Copy published app
COPY --from=backend-build /app/publish .

# Expose port
EXPOSE 5000

# Set environment for production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

# Run the application
ENTRYPOINT ["dotnet", "Englishv1.dll"]
