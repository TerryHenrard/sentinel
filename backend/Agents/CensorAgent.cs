using backend.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;

namespace backend.Agents
{
    public class CensorAgent
    {
        private readonly ILogger<CensorAgent> _logger;
        private readonly IChatCompletionService _chat;
        private readonly Kernel _kernel;
        private readonly string CENSOR_SYSTEM_MESSAGE;

        public CensorAgent(IOptions<AOAIOptions> client)
        {
            CENSOR_SYSTEM_MESSAGE = """
                Hello world!
            """;

            _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorAgent>();

            _kernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion(
                    deploymentName: client.Value.DepName,
                    endpoint: client.Value.ApiEndpoint,
                    apiKey: client.Value.ApiKey
                )
                .Build();
            _chat = _kernel.GetRequiredService<IChatCompletionService>();
        }
        
        public async Task<string> Run(string content)
        {
            _logger.LogInformation("ℹ️ ======== Censor Agent: Starting ========");

            ChatHistory agentChatHistory = new(CENSOR_SYSTEM_MESSAGE);

            agentChatHistory.AddUserMessage(content);

            IReadOnlyList<ChatMessageContent> messages = await _chat.GetChatMessageContentsAsync(
                chatHistory: agentChatHistory,
                kernel: _kernel,
                executionSettings: new AzureOpenAIPromptExecutionSettings()
                {
                    Temperature = 0.0,
                    TopP = 1.0,
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
                }
            );

            ChatMessageContent lastMessage = messages.Count > 0 ? messages[messages.Count - 1] : new();

            _logger.LogInformation("ℹ️ Last message from Censor Agent: {LastMessageContent}", lastMessage.Content);

            return lastMessage.Content ?? string.Empty;
        }
    }
}