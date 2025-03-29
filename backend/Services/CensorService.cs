namespace backend.Services
{
    public class CensorService
    {
        private static readonly ILogger<CensorService> _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorService>();

        public async Task<string> CensorContent(string content)
        {
            _logger.LogInformation("ℹ️ Censor Service: [CensorContent]");

            await Task.Delay(1000);

            return "Content is safe.";
        }   
    }
}