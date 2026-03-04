using Microsoft.AspNetCore.Mvc;
using Englishv1.Services;

namespace Englishv1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<AIController> _logger;

    public AIController(IOpenAIService openAIService, ILogger<AIController> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
    }

    [HttpPost("conversation")]
    public async Task<IActionResult> Conversation([FromBody] ConversationRequest request)
    {
        try
        {
            _logger.LogInformation("Processing conversation request");
            
            // Get AI response
            var aiResponse = await _openAIService.GetConversationResponseAsync(
                request.Message,
                request.Context
            );

            var response = new
            {
                message = aiResponse,
                suggestions = new[]
                {
                    "Can you rephrase that using different vocabulary?",
                    "Try using a more complex sentence structure.",
                    "What's your opinion on this topic?"
                },
                voiceResponse = true,
                timestamp = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in conversation");
            return StatusCode(500, new { error = "Failed to process conversation", message = ex.Message });
        }
    }

    [HttpPost("generate-questions")]
    public async Task<IActionResult> GenerateQuestions([FromBody] QuestionRequest request)
    {
        try
        {
            _logger.LogInformation("Generating questions for topic: {Topic}", request.Topic);
            
            var questions = new
            {
                topic = request.Topic,
                questions = new[]
                {
                    new
                    {
                        id = 1,
                        type = "multiple-choice",
                        question = "What is the main idea of the passage?",
                        options = new[] { "Option A", "Option B", "Option C", "Option D" },
                        correctAnswer = "B"
                    },
                    new
                    {
                        id = 2,
                        type = "reading-comprehension",
                        question = "According to the passage, what causes this phenomenon?",
                        options = new[] { "Option A", "Option B", "Option C", "Option D" },
                        correctAnswer = "C"
                    }
                }
            };

            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating questions");
            return StatusCode(500, new { error = "Failed to generate questions", message = ex.Message });
        }
    }

    [HttpPost("analyze-speaking")]
    public async Task<IActionResult> AnalyzeSpeaking([FromBody] SpeakingAnalysis request)
    {
        try
        {
            _logger.LogInformation("Analyzing speaking");
            
            // Call OpenAI to analyze speaking
            var analysis = await _openAIService.AnalyzeSpeakingAsync(
                request.Transcription,
                request.Question,
                request.Duration
            );

            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing speaking");
            return StatusCode(500, new { error = "Failed to analyze speaking", message = ex.Message });
        }
    }
}

public record ConversationRequest(string Message, string Context);
public record QuestionRequest(string Topic, string Difficulty, int Count);
public record SpeakingAnalysis(string Transcription, string Question, double Duration);
