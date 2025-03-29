using System.ComponentModel;
using backend.Services;
using Microsoft.SemanticKernel;

namespace backend.Plugins
{
    public class CensorPlugin(CensorService censorService)
    {
        private static readonly ILogger<CensorPlugin> _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<CensorPlugin>();
        private readonly CensorService _censorService = censorService;

        [KernelFunction("CensorContent")]
        [Description("Use Safety Content to analyse possible inappropriate content.")]
        public async Task<string> RecogniseTextFromImage(string content)
        {
            _logger.LogInformation("ℹ️ Censor Plugin: [Kernel Function = CensorContent]");
            
            return await _censorService.CensorContent(content);
        }
    }
}