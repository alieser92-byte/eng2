using Microsoft.AspNetCore.Mvc;
using Englishv1.Services;

namespace Englishv1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToeflController : ControllerBase
{
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<ToeflController> _logger;

    public ToeflController(IOpenAIService openAIService, ILogger<ToeflController> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
    }

    [HttpPost("generate-practice-test")]
    public async Task<IActionResult> GeneratePracticeTest([FromBody] TestGenerationRequest request)
    {
        try
        {
            _logger.LogInformation("Generating practice test with difficulty: {Difficulty}", request.Difficulty);
            
            // Call OpenAI to generate test content
            var aiResponse = await _openAIService.GenerateToeflTestAsync(request.Difficulty, request.Sections);
            
            var testData = new
            {
                sections = request.Sections.Select(s => new
                {
                    name = s,
                    questions = s switch
                    {
                        "Reading" => 50,
                        "Listening" => 47,
                        "Speaking" => 11,
                        "Writing" => 12,
                        _ => 10
                    },
                    timeLimit = s switch
                    {
                        "Reading" => 30,
                        "Listening" => 29,
                        "Speaking" => 8,
                        "Writing" => 23,
                        _ => 30
                    },
                    tasks = s switch
                    {
                        "Reading" => new[] { "Kelimeleri Tamamlayın", "Günlük Hayatta Okuyun", "Bir Akademik Pasaj Okuyun" },
                        "Listening" => new[] { "Dinleyin ve Bir Yanıt Seçin", "Bir Konuşmayı Dinleyin", "Duyuruyu Dinleyin", "Akademik Konuşmayı Dinleyin" },
                        "Writing" => new[] { "Bir Cümle İnşa Et", "Bir E-posta Yazma", "Akademik Tartışma için Yazma" },
                        "Speaking" => new[] { "Dinleyin ve Tekrarlayın", "Bir Mülakata Katılın" },
                        _ => new string[] { }
                    }
                }).ToArray(),
                generatedAt = DateTime.UtcNow,
                difficulty = request.Difficulty,
                testId = Guid.NewGuid(),
                aiGeneratedContent = aiResponse
            };

            return Ok(testData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating practice test");
            return StatusCode(500, new { error = "Failed to generate test", message = ex.Message });
        }
    }

    [HttpPost("evaluate-writing")]
    public async Task<IActionResult> EvaluateWriting([FromBody] WritingSubmission submission)
    {
        try
        {
            _logger.LogInformation("Evaluating writing submission");
            
            // Call OpenAI to evaluate the essay
            var evaluation = await _openAIService.EvaluateWritingAsync(
                submission.Content,
                submission.Prompt,
                submission.Type
            );

            return Ok(evaluation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating writing");
            return StatusCode(500, new { error = "Failed to evaluate writing", message = ex.Message });
        }
    }

    [HttpPost("transcribe-speech")]
    public async Task<IActionResult> TranscribeSpeech([FromBody] SpeechRequest request)
    {
        try
        {
            _logger.LogInformation("Transcribing speech");
            
            // Call OpenAI to transcribe and evaluate speech
            var transcription = await _openAIService.TranscribeSpeechAsync(
                request.AudioData,
                request.Question
            );

            return Ok(transcription);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error transcribing speech");
            return StatusCode(500, new { error = "Failed to transcribe speech", message = ex.Message });
        }
    }

    [HttpPost("generate-pdf")]
    public async Task<IActionResult> GeneratePdf([FromBody] PdfGenerationRequest request, [FromServices] IToeflPdfService pdfService)
    {
        try
        {
            _logger.LogInformation("Generating PDF for test {TestId}, Sections: {Sections}, ContentLength: {ContentLength}",
                request.TestId,
                request.Sections != null ? string.Join(", ", request.Sections) : "null",
                request.AiGeneratedContent?.Length ?? 0);

            string aiContent;

            // If content is already provided, use it; otherwise generate new content
            if (!string.IsNullOrWhiteSpace(request.AiGeneratedContent))
            {
                aiContent = request.AiGeneratedContent;
                _logger.LogInformation("Using provided AI content ({Length} chars)", aiContent.Length);
            }
            else
            {
                _logger.LogInformation("No AI content provided, generating fresh content");
                // Generate fresh AI content
                aiContent = await _openAIService.GenerateToeflTestAsync(
                    request.Difficulty ?? "intermediate",
                    request.Sections ?? new[] { "Reading", "Listening", "Speaking", "Writing" });
                _logger.LogInformation("Generated fresh AI content ({Length} chars)", aiContent.Length);
            }

            var sections = request.Sections ?? new[] { "Reading", "Listening", "Speaking", "Writing" };
            var difficulty = request.Difficulty ?? "intermediate";
            var testId = request.TestId ?? Guid.NewGuid().ToString();

            _logger.LogInformation("Calling PDF service to generate document");
            var pdfBytes = pdfService.GeneratePdf(aiContent, difficulty, testId, sections);
            _logger.LogInformation("PDF generated successfully ({Size} bytes)", pdfBytes.Length);

            return File(pdfBytes, "application/pdf", $"TOEFL_Practice_Test_{testId}.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF. Type: {ExType}, Message: {ExMessage}", ex.GetType().FullName, ex.Message);
            return StatusCode(500, new { error = "Failed to generate PDF", message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpGet("study-progress")]
    public async Task<IActionResult> GetStudyProgress()
    {
        var progress = new
        {
            totalTests = 15,
            averageScore = 87.5,
            strongAreas = new[] { "Reading", "Writing" },
            improvementAreas = new[] { "Listening", "Speaking" },
            studyStreak = 7,
            lastStudied = DateTime.UtcNow.AddHours(-5)
        };

        return Ok(progress);
    }
}

public record TestGenerationRequest(string Difficulty, string[] Sections);
public record PdfGenerationRequest(string? TestId, string? Difficulty, string[]? Sections, string? AiGeneratedContent);
public record WritingSubmission(string Content, string Prompt, string Type);
public record SpeechRequest(string AudioData, string Question);
