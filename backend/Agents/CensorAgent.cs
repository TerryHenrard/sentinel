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
                You are an online content moderation assistant. Your task is to analyze text and identify 
                any potentially harmful or inappropriate content, such as harassment, hate speech, violence, or other 
                offensive material.

                **Objectives:**  
                - Analyze the provided text to identify words or phrases that may be inappropriate.
                - Provide an alternative for any identified problematic content while maintaining the original context.
                - Respond with both the problematic text and the proposed alternative, clearly indicating the change.

                Always respond in JSON format as follows:  
                ```json
                {
                    "moderation_report": {
                        "original_text": "<analyzed text>",
                        "flagged_phrases": [
                            {
                                "problematic_phrase": "<problematic phrase>",
                                "suggested_alternative": "<alternative phrase>"
                            }
                        ],
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

            /* KernelPlugin censorPlugin = KernelPluginFactory.CreateFromObject(
                target: new CensorPlugin(new CensorService(csOptions)),
                pluginName: "CensorPlugin"
            );

            _kernel.Plugins.Add(censorPlugin); */
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