using backend.Configurations;
using backend.Plugins;
using backend.Services;
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

        public CensorAgent(IOptions<AOAIOptions> client, IOptions<ContentSafetyOptions> csOptions)
        {
            CENSOR_SYSTEM_MESSAGE = """
                You are an online content moderation assistant. Your task is to analyze text and retrieve a moderation report to determine whether it contains harassment, hate speech, violence, or other inappropriate material.

                To perform this analysis, you must use the `CensorPlugin.CensorContent` function.  
                - This function will analyze the text and return a safety report.  
                - Your role is to simply retrieve and display the results without making any modifications to the text.  

                **Objectives:**  
                - Send the given text to `CensorPlugin.CensorContent`.  
                - Display the moderation report exactly as received.  
                - Do not alter, censor, or modify the content in any way.  

                Always respond in JSON format as follows:  
                ```json
                {
                    "moderation_report": {
                        "original_text": "<analyzed text>",
                        "status": "safe" | "flagged",
                        "reason": "<reason for flagging, if applicable>",
                        "severity": <severity level from response>
                    }
                }
                ```
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

            KernelPlugin censorPlugin = KernelPluginFactory.CreateFromObject(
                target: new CensorPlugin(new CensorService(csOptions)),
                pluginName: "CensorPlugin"
            );

            _kernel.Plugins.Add(censorPlugin);
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