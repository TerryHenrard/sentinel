using backend.Services;

namespace backend.Plugins
{
    public class CensorPlugin(CensorService censorService)
    {
        private static readonly ILogger<CensorPlugin> _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorPlugin>();
        private readonly CensorService _textProcessingService = censorService;
    }
}