using Azure;
using Azure.AI.ContentSafety;
using backend.Configurations;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class CensorService(IOptions<ContentSafetyOptions> csOptions)
    {
        private static readonly ILogger<CensorService> _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorService>();
        private readonly ContentSafetyClient _client = new(
            new Uri(csOptions.Value.ApiEndpoint),
            new AzureKeyCredential(csOptions.Value.ApiKey)
        );
        public async Task<string> CensorContent(string content)
        {
            _logger.LogInformation("ℹ️ Censor Service: [CensorContent]");

            AnalyzeTextOptions request = new(content);
            Response<AnalyzeTextResult> response = await _client.AnalyzeTextAsync(request);

            foreach (TextCategoriesAnalysis result in response.Value.CategoriesAnalysis)
            {
                if (result.Severity >= 1)
                {
                    _logger.LogWarning("⚠️ Content flagged: {Category} (Severity: {Severity})", result.Category, result.Severity);
                    
                    return $"⚠️ Content flagged as {result.Category}.";
                }
            }

            return "Content is safe.";
        }
    }
}