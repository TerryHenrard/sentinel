using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using backend.DTO;
using backend.Agents;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using backend.Configurations;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CensorshipController(CensorAgent censorAgent) : ControllerBase
    {
        private readonly CensorAgent _censorAgent = censorAgent;

        [HttpPost("censor")]
        public async Task<IActionResult> CensorContent([FromBody] string request)
        {
            System.Console.WriteLine("test");
            if (string.IsNullOrEmpty(request))
            {
                return BadRequest("Text cannot be empty");
            }

            string requestText = request;

            string response = await _censorAgent.Run(requestText);

            return Ok(response);
        }
    }
}