using Azure;
using Azure.AI.ContentSafety;
using backend.Configurations;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class CensorService
    {
        private readonly ILogger<CensorService> _logger;
        private readonly ContentSafetyClient _client;
        private readonly BlocklistClient _blocklistClient;
        private readonly string blocklistName;
        private readonly string blocklistDescription;
        private readonly string data;

        public CensorService(IOptions<ContentSafetyOptions> csOptions)
        {
            _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorService>();

            _client = new(
                new Uri(csOptions.Value.ApiEndpoint),
                new AzureKeyCredential(csOptions.Value.ApiKey)
            );

            _blocklistClient = new(
                new Uri(csOptions.Value.ApiEndpoint),
                new AzureKeyCredential(csOptions.Value.ApiKey)
            );

            blocklistName = "CensorBlockList";

            blocklistDescription = "Censor blocklist for sensitive content.";
        }

        public async Task<string> CensorContent(string content)
        {
            _logger.LogInformation("ℹ️ Censor Service: [CensorContent]");

            AnalyzeTextOptions request = new(content);
            Response<AnalyzeTextResult> response = await _client.AnalyzeTextAsync(request);

            List<string> blockedWords = new();

            // Vérification des catégories d'analyse
            foreach (TextCategoriesAnalysis result in response.Value.CategoriesAnalysis)
            {
                if (result.Severity >= 1) // Niveau de sensibilité (0-7)
                {
                    _logger.LogWarning("⚠️ Content flagged: {Category} (Severity: {Severity})", result.Category, result.Severity);
                    return $"⚠️ Content flagged as {result.Category}.";
                }
            }

            // Vérification des listes de blocage si disponibles
            if (response.Value.BlocklistsMatch is not null)
            {
                blockedWords.AddRange(response.Value.BlocklistsMatch.Select(match => match.BlocklistItemText));
            }

            if (blockedWords.Count > 0)
            {
                return $"⚠️ Content flagged. Problematic words: {string.Join(", ", blockedWords)}";
            }

            return "Content is safe.";
        }
    }
}