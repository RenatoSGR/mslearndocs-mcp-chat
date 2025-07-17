<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=azure,nextjs,ai,nodejs,docker" />
  </a>
</p>

<h1 align="center">Microsoft Learn MCP Chat</h1>

<p align="center">
  <strong>An intelligent chatbot for Microsoft Learn documentation powered by MCP (Model Context Protocol)</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

This Next.js application creates an intelligent chatbot that leverages the **Microsoft Docs MCP Server** to provide accurate, contextual answers from official Microsoft Learn documentation. The application uses a two-step "Retrieve and Synthesize" pattern to deliver comprehensive responses.

### How It Works

1. **🔍 Retrieve**: The application queries the [Microsoft Docs MCP Server](https://github.com/MicrosoftDocs/mcp) at `https://learn.microsoft.com/api/mcp` to fetch relevant documentation
2. **🤖 Synthesize**: Retrieved content is processed by Azure OpenAI to generate concise, helpful answers based on official Microsoft documentation

### Architecture

```
User Question → Next.js API → Microsoft Docs MCP Server → Azure OpenAI → Synthesized Response
```

## Features

- ✅ **Official Microsoft Documentation**: Powered by the Microsoft Docs MCP Server
- ✅ **Azure OpenAI Integration**: Uses Azure OpenAI for intelligent response synthesis
- ✅ **Real-time Chat Interface**: Modern, responsive chat UI built with Next.js and Tailwind CSS
- ✅ **Markdown Support**: Rich text formatting in responses
- ✅ **Conversation History**: Maintains context across conversations
- ✅ **Docker Support**: Ready for containerized deployment
- ✅ **Azure Container Apps Ready**: Optimized for Azure cloud deployment

## Microsoft Docs MCP Server

This application integrates with the [Microsoft Docs MCP Server](https://github.com/MicrosoftDocs/mcp), an official Microsoft project that provides programmatic access to Microsoft Learn documentation through the Model Context Protocol (MCP).

### What is MCP?

The Model Context Protocol (MCP) is an open standard for connecting LLMs to external data sources and tools. The Microsoft Docs MCP Server implements this protocol to provide:

- **Comprehensive Coverage**: Access to thousands of Microsoft documentation pages
- **Real-time Updates**: Always up-to-date with the latest official documentation
- **Structured Responses**: Well-formatted content optimized for AI processing
- **High Performance**: Efficient querying and retrieval mechanisms

## Quick Start

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn**
- **Azure OpenAI** resource (or alternative LLM API)

### 1. Clone and Install

```bash
git clone https://github.com/RenatoSGR/mslearn-mcp-chat.git
cd mslearn-mcp-chat
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start chatting!

### 4. Build for Production

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI service endpoint | ✅ | `https://myopenai.openai.azure.com` |
| `AZURE_OPENAI_KEY` | Azure OpenAI API key | ✅ | `abc123...` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Azure OpenAI model deployment name | ✅ | `gpt-4` |

### Setting Up Azure OpenAI

1. **Create Azure OpenAI Resource**:
   ```bash
   az cognitiveservices account create \
     --name myopenai \
     --resource-group myResourceGroup \
     --location eastus \
     --kind OpenAI \
     --sku s0
   ```

2. **Deploy a Model**:
   - Go to Azure OpenAI Studio
   - Navigate to "Deployments" → "Create new deployment"
   - Select model (recommended: `gpt-4` or `gpt-35-turbo`)
   - Set deployment name (use this for `AZURE_OPENAI_DEPLOYMENT_NAME`)

3. **Get Credentials**:
   ```bash
   # Get endpoint
   az cognitiveservices account show \
     --name myopenai \
     --resource-group myResourceGroup \
     --query "properties.endpoint"
   
   # Get API key
   az cognitiveservices account keys list \
     --name myopenai \
     --resource-group myResourceGroup \
     --query "key1"
   ```

### Alternative: Google Gemini Integration

The application also supports Google Gemini API. Use the `mcp-gemini.js` file in the `pages/api/` directory and configure:

```env
GEMINI_API_KEY=your-gemini-api-key
```

## Deployment

### Docker Deployment

#### Using Standard Dockerfile

```bash
# Build the image
docker build -t mslearn-mcp-chat .

# Run the container
docker run -p 3000:3000 \
  -e AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com" \
  -e AZURE_OPENAI_KEY="your-api-key" \
  -e AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment" \
  mslearn-mcp-chat
```

#### Using Multi-stage Dockerfile (Recommended)

```bash
# Build optimized image
docker build -f Dockerfile.multistage -t mslearn-mcp-chat:optimized .

# Run with smaller footprint
docker run -p 3000:3000 \
  -e AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com" \
  -e AZURE_OPENAI_KEY="your-api-key" \
  -e AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment" \
  mslearn-mcp-chat:optimized
```

### Azure Container Apps Deployment

Azure Container Apps provides a serverless container platform perfect for this application.

#### 1. Prerequisites

```bash
# Install Azure CLI (if not already installed)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Container Apps extension
az extension add --name containerapp --upgrade

# Login to Azure
az login
```

#### 2. Create Azure Resources

```bash
# Set variables
RESOURCE_GROUP="rg-mslearn-mcp-chat"
LOCATION="eastus"
CONTAINERAPPS_ENVIRONMENT="env-mslearn-mcp-chat"
CONTAINER_APP_NAME="mslearn-mcp-chat"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create Container Apps environment
az containerapp env create \
  --name $CONTAINERAPPS_ENVIRONMENT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

#### 3. Deploy from Container Registry

```bash
# Push image to Azure Container Registry (ACR)
ACR_NAME="myacr$(date +%s)"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Build and push image
az acr build \
  --registry $ACR_NAME \
  --image mslearn-mcp-chat:latest \
  --file Dockerfile.multistage .

# Get ACR login server
ACR_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
```

#### 4. Create Container App

```bash
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENVIRONMENT \
  --image $ACR_SERVER/mslearn-mcp-chat:latest \
  --target-port 3000 \
  --ingress 'external' \
  --registry-server $ACR_SERVER \
  --query properties.configuration.ingress.fqdn \
  --env-vars \
    AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com" \
    AZURE_OPENAI_KEY="your-api-key" \
    AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment"
```

#### 5. Update Environment Variables (if needed)

```bash
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="https://new-endpoint.openai.azure.com" \
    AZURE_OPENAI_KEY="new-api-key" \
    AZURE_OPENAI_DEPLOYMENT_NAME="new-deployment"
```

#### 6. Monitor and Scale

```bash
# View logs
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP

# Scale the app
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 1 \
  --max-replicas 10
```

### Alternative Deployment: Azure App Service

For a simpler deployment option, you can also use Azure App Service:

```bash
# Create App Service plan
az appservice plan create \
  --name plan-mslearn-mcp-chat \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create web app
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan plan-mslearn-mcp-chat \
  --name mslearn-mcp-chat-app \
  --deployment-container-image-name $ACR_SERVER/mslearn-mcp-chat:latest

# Configure environment variables
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name mslearn-mcp-chat-app \
  --settings \
    AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com" \
    AZURE_OPENAI_KEY="your-api-key" \
    AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment"
```

## Usage Examples

### Basic Queries

```
Tell me about Azure Container Apps
```

```
How do I deploy a Next.js app to Azure?
```

```
What are the Azure CLI commands to create a resource group?
```

### Advanced Queries

```
Give me step-by-step instructions for setting up Azure OpenAI with managed identity
```

```
Compare Azure Container Apps vs Azure App Service for hosting Next.js applications
```

## Project Structure

```
├── pages/
│   ├── api/
│   │   ├── mcp.js              # Main API route for MCP integration
│   │   ├── mcp-gemini.js       # Alternative Gemini integration
│   │   └── ...
│   ├── index.js                # Main chat interface
│   └── ...
├── public/                     # Static assets
├── styles/                     # CSS and Tailwind styles
├── Dockerfile                  # Standard Docker configuration
├── Dockerfile.multistage       # Optimized Docker configuration
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds work correctly

## Acknowledgments

### To the Microsoft Docs Community Team & MCP Server Creators

A huge **thank you** for creating and sharing the [Microsoft Learn MCP Server](https://github.com/MicrosoftDocs/mcp)! 🙏

Your work on this powerful tool has opened up incredible new possibilities for developers looking to build intelligent applications on top of the Microsoft Learn platform. The ability to programmatically access the wealth of knowledge in the official documentation is a game-changer.

We truly appreciate the effort, the clear documentation, and your commitment to empowering the developer community. This project was a fantastic learning experience, and it wouldn't have been possible without your innovation.

Keep up the amazing work! 🚀

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Microsoft Learn Documentation](https://learn.microsoft.com/)
- 🔧 [Microsoft Docs MCP Server](https://github.com/MicrosoftDocs/mcp)
- 🌐 [Next.js Documentation](https://nextjs.org/docs)
- ☁️ [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)

---

<p align="center">
  Built with ❤️ using Microsoft Learn MCP Server and Azure OpenAI
</p>
