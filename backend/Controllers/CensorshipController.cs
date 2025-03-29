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
        public async Task<IActionResult> CensorContent([FromBody] ContentRequestDTO request)
        {
            
            System.Console.WriteLine($"Received request: {request.Text}");

            if (string.IsNullOrEmpty(request.Text))
            {
                return BadRequest("Text cannot be empty");
            }

            

            string requestText = request.Text;

            string response = await _censorAgent.Run(requestText);

            return Ok(response);
        }
    }
}