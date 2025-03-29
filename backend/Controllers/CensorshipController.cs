using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using backend.DTO;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CensorshipController : ControllerBase
    {
        [HttpPost("censor")]
        public IActionResult CensorContent([FromBody] ContentRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Text))
            {
                return BadRequest("Text cannot be empty");
            }

            string[] bannedWords = new[] { "hate", "racist", "violence", "discriminate" };

            string censoredText = request.Text;
            foreach (string word in bannedWords)
            {
                censoredText = Regex.Replace(censoredText, word, new string('*', word.Length), RegexOptions.IgnoreCase);
            }

            return Ok(new ContentResponseDTO { OriginalText = censoredText });
        }
    }
}