using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Englishv1.Services;

public interface IToeflPdfService
{
    byte[] GeneratePdf(string aiContent, string difficulty, string testId, string[] sections);
}

public class ToeflPdfService : IToeflPdfService
{
    // ETS-style colors
    private static readonly string PrimaryBlue = "#003366";
    private static readonly string AccentBlue = "#0077C8";
    private static readonly string LightGray = "#F5F5F5";
    private static readonly string DarkGray = "#333333";
    private static readonly string MediumGray = "#666666";
    private static readonly string BorderGray = "#CCCCCC";
    private static readonly string SectionHeaderBg = "#E8F0FE";

    public byte[] GeneratePdf(string aiContent, string difficulty, string testId, string[] sections)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        if (string.IsNullOrWhiteSpace(aiContent))
            throw new ArgumentException("AI content is empty. Cannot generate PDF without content.");

        if (sections == null || sections.Length == 0)
            sections = new[] { "Reading", "Listening", "Speaking", "Writing" };

        var parsedSections = ParseAIContent(aiContent, sections);

        if (parsedSections == null || parsedSections.Count == 0)
            throw new InvalidOperationException("Failed to parse AI content into sections. Content may be malformed.");

        var document = Document.Create(container =>
        {
            // --- Cover Page ---
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);

                page.Content().Column(col =>
                {
                    // Top blue bar
                    col.Item().Height(8).Background(Color.FromHex(AccentBlue));

                    col.Item().PaddingHorizontal(60).PaddingTop(80).Column(inner =>
                    {
                        // ETS header area
                        inner.Item().AlignCenter().Text("ETS")
                            .FontSize(16).FontColor(Color.FromHex(MediumGray)).Bold();

                        inner.Item().Height(20);

                        // Big blue header block
                        inner.Item().Background(Color.FromHex(PrimaryBlue)).Padding(30).Column(blueBlock =>
                        {
                            blueBlock.Item().AlignCenter().Text("TOEFL iBT®")
                                .FontSize(42).FontColor(Colors.White).Bold();
                            blueBlock.Item().Height(8);
                            blueBlock.Item().AlignCenter().Text("Full-Length Practice Test")
                                .FontSize(22).FontColor(Colors.White);
                        });

                        inner.Item().Height(40);

                        // Test info box
                        inner.Item().Border(1).BorderColor(Color.FromHex(BorderGray)).Padding(20).Column(info =>
                        {
                            info.Item().Text("Test Information").FontSize(14).Bold().FontColor(Color.FromHex(PrimaryBlue));
                            info.Item().Height(10);
                            InfoRow(info, "Test ID:", testId);
                            InfoRow(info, "Difficulty:", MapDifficulty(difficulty));
                            InfoRow(info, "Generated:", DateTime.Now.ToString("MMMM dd, yyyy - HH:mm"));
                            InfoRow(info, "Sections:", string.Join(", ", sections));
                            InfoRow(info, "Total Score Range:", "0 – 120");
                        });

                        inner.Item().Height(30);

                        // Section summary table
                        inner.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(3);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            // Header
                            TableHeaderCell(table, "Section");
                            TableHeaderCell(table, "Questions");
                            TableHeaderCell(table, "Time");
                            TableHeaderCell(table, "Score");

                            if (sections.Contains("Reading"))
                                AddSectionRow(table, "Reading", "30", "54 min", "0–30");
                            if (sections.Contains("Listening"))
                                AddSectionRow(table, "Listening", "28", "41 min", "0–30");
                            if (sections.Contains("Speaking"))
                                AddSectionRow(table, "Speaking", "4 Tasks", "17 min", "0–30");
                            if (sections.Contains("Writing"))
                                AddSectionRow(table, "Writing", "2 Tasks", "50 min", "0–30");
                        });

                        inner.Item().Height(40);

                        // Disclaimer
                        inner.Item().Padding(10).Background(Color.FromHex(LightGray)).Text(text =>
                        {
                            text.Span("Note: ").Bold().FontSize(9);
                            text.Span("This is an AI-generated practice test designed to simulate the TOEFL iBT® format. " +
                                      "It is not affiliated with or endorsed by ETS. Each generated test contains unique, " +
                                      "original content produced by artificial intelligence.")
                                .FontSize(9).FontColor(Color.FromHex(MediumGray));
                        });
                    });

                    // Bottom bar
                    col.Item().ExtendVertical().AlignBottom().Height(8).Background(Color.FromHex(AccentBlue));
                });
            });

            // --- Content Pages for each section ---
            foreach (var section in parsedSections)
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.MarginVertical(40);
                    page.MarginHorizontal(50);

                    page.Header().Column(headerCol =>
                    {
                        headerCol.Item().Row(row =>
                        {
                            row.RelativeItem().Text("TOEFL iBT® Practice Test")
                                .FontSize(9).FontColor(Color.FromHex(MediumGray));
                            row.RelativeItem().AlignRight().Text($"Test ID: {testId}")
                                .FontSize(9).FontColor(Color.FromHex(MediumGray));
                        });
                        headerCol.Item().Height(2).Background(Color.FromHex(AccentBlue));
                        headerCol.Item().Height(10);
                    });

                    page.Content().Column(col =>
                    {
                        // Section title
                        col.Item().Background(Color.FromHex(PrimaryBlue)).Padding(12).Row(row =>
                        {
                            row.RelativeItem().Text(section.Title.ToUpper())
                                .FontSize(18).FontColor(Colors.White).Bold();
                            row.ConstantItem(120).AlignRight().AlignMiddle()
                                .Text(section.TimeInfo)
                                .FontSize(11).FontColor(Colors.White);
                        });

                        col.Item().Height(15);

                        // Section instructions
                        if (!string.IsNullOrEmpty(section.Instructions))
                        {
                            col.Item().Background(Color.FromHex(SectionHeaderBg))
                                .Border(1).BorderColor(Color.FromHex(BorderGray))
                                .Padding(10).Text(section.Instructions)
                                .FontSize(10).FontColor(Color.FromHex(DarkGray)).Italic();
                            col.Item().Height(10);
                        }

                        // Section content blocks
                        foreach (var block in section.ContentBlocks)
                        {
                            RenderContentBlock(col, block);
                        }
                    });

                    page.Footer().Column(footerCol =>
                    {
                        footerCol.Item().Height(1).Background(Color.FromHex(BorderGray));
                        footerCol.Item().Height(5);
                        footerCol.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"{section.Title}")
                                .FontSize(8).FontColor(Color.FromHex(MediumGray));
                            row.RelativeItem().AlignCenter().Text(text =>
                            {
                                text.CurrentPageNumber().FontSize(8).FontColor(Color.FromHex(MediumGray));
                                text.Span(" / ").FontSize(8).FontColor(Color.FromHex(MediumGray));
                                text.TotalPages().FontSize(8).FontColor(Color.FromHex(MediumGray));
                            });
                            row.RelativeItem().AlignRight()
                                .Text("AI-Generated Practice Test")
                                .FontSize(8).FontColor(Color.FromHex(MediumGray));
                        });
                    });
                });
            }

            // --- Answer Key Page ---
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginVertical(40);
                page.MarginHorizontal(50);

                page.Header().Column(headerCol =>
                {
                    headerCol.Item().Row(row =>
                    {
                        row.RelativeItem().Text("TOEFL iBT® Practice Test")
                            .FontSize(9).FontColor(Color.FromHex(MediumGray));
                        row.RelativeItem().AlignRight().Text($"Test ID: {testId}")
                            .FontSize(9).FontColor(Color.FromHex(MediumGray));
                    });
                    headerCol.Item().Height(2).Background(Color.FromHex(AccentBlue));
                    headerCol.Item().Height(10);
                });

                page.Content().Column(col =>
                {
                    col.Item().Background(Color.FromHex(PrimaryBlue)).Padding(12)
                        .Text("ANSWER KEY").FontSize(18).FontColor(Colors.White).Bold();
                    col.Item().Height(15);

                    foreach (var section in parsedSections)
                    {
                        var answers = section.ContentBlocks
                            .Where(b => b.Type == ContentBlockType.Question && !string.IsNullOrEmpty(b.Answer))
                            .ToList();

                        if (answers.Any())
                        {
                            col.Item().Text(section.Title).FontSize(13).Bold()
                                .FontColor(Color.FromHex(PrimaryBlue));
                            col.Item().Height(5);

                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.ConstantColumn(80);
                                    c.RelativeColumn();
                                });

                                foreach (var answer in answers)
                                {
                                    table.Cell().Padding(3).Text(answer.QuestionNumber)
                                        .FontSize(10).Bold();
                                    table.Cell().Padding(3).Text(answer.Answer)
                                        .FontSize(10);
                                }
                            });

                            col.Item().Height(15);
                        }
                    }
                });

                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().Height(1).Background(Color.FromHex(BorderGray));
                    footerCol.Item().Height(5);
                    footerCol.Item().AlignCenter().Text(text =>
                    {
                        text.CurrentPageNumber().FontSize(8).FontColor(Color.FromHex(MediumGray));
                        text.Span(" / ").FontSize(8).FontColor(Color.FromHex(MediumGray));
                        text.TotalPages().FontSize(8).FontColor(Color.FromHex(MediumGray));
                    });
                });
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        return stream.ToArray();
    }

    // ──── Rendering helpers ────

    private void RenderContentBlock(ColumnDescriptor col, ContentBlock block)
    {
        switch (block.Type)
        {
            case ContentBlockType.PassageTitle:
                col.Item().Height(8);
                col.Item().Background(Color.FromHex(SectionHeaderBg))
                    .Border(1).BorderColor(Color.FromHex(BorderGray))
                    .Padding(8).Text(block.Text)
                    .FontSize(13).Bold().FontColor(Color.FromHex(PrimaryBlue));
                col.Item().Height(6);
                break;

            case ContentBlockType.Passage:
                col.Item().PaddingHorizontal(5).Text(block.Text)
                    .FontSize(10.5f).LineHeight(1.6f).FontColor(Color.FromHex(DarkGray));
                col.Item().Height(10);
                break;

            case ContentBlockType.Question:
                col.Item().PaddingLeft(5).Column(qCol =>
                {
                    // Check if this is a multi-line question (e.g., Build a Sentence)
                    var questionLines = block.Text.Split('\n');
                    
                    // First line with question number
                    qCol.Item().Text(text =>
                    {
                        text.Span(block.QuestionNumber + " ").Bold().FontSize(10);
                        text.Span(questionLines[0]).FontSize(10);
                    });

                    // Additional lines (partial sentence, scrambled words)
                    for (int lineIdx = 1; lineIdx < questionLines.Length; lineIdx++)
                    {
                        var line = questionLines[lineIdx].Trim();
                        if (string.IsNullOrEmpty(line)) continue;
                        
                        if (line.StartsWith("Words:"))
                        {
                            // Scrambled words - show in a box
                            qCol.Item().PaddingLeft(15).PaddingTop(4)
                                .Background(Color.FromHex(LightGray))
                                .Border(1).BorderColor(Color.FromHex(BorderGray))
                                .Padding(6).Text(line.Substring(6).Trim())
                                .FontSize(10).Italic().FontColor(Color.FromHex(MediumGray));
                        }
                        else
                        {
                            // Partial sentence with blanks
                            qCol.Item().PaddingLeft(15).PaddingTop(2).Text(line)
                                .FontSize(10).FontColor(Color.FromHex(DarkGray));
                        }
                    }

                    if (block.Options != null)
                    {
                        foreach (var opt in block.Options)
                        {
                            qCol.Item().PaddingLeft(15).PaddingTop(2).Row(row =>
                            {
                                row.ConstantItem(18).Text(opt.Key + ")")
                                    .FontSize(10).Bold().FontColor(Color.FromHex(AccentBlue));
                                row.RelativeItem().Text(opt.Value).FontSize(10);
                            });
                        }
                    }

                    qCol.Item().Height(8);
                });
                break;

            case ContentBlockType.Instruction:
                col.Item().PaddingVertical(4).PaddingHorizontal(8)
                    .Background(Color.FromHex(LightGray))
                    .Border(1).BorderColor(Color.FromHex(BorderGray))
                    .Padding(8).Text(block.Text)
                    .FontSize(10).Italic().FontColor(Color.FromHex(MediumGray));
                col.Item().Height(6);
                break;

            case ContentBlockType.Dialogue:
                col.Item().PaddingHorizontal(10).PaddingVertical(3).Text(text =>
                {
                    if (!string.IsNullOrEmpty(block.Speaker))
                    {
                        text.Span(block.Speaker + ": ").Bold().FontSize(10)
                            .FontColor(Color.FromHex(AccentBlue));
                    }
                    text.Span(block.Text).FontSize(10).FontColor(Color.FromHex(DarkGray));
                });
                break;

            case ContentBlockType.TaskHeader:
                col.Item().Height(10);
                col.Item().Background(Color.FromHex("#E0ECF8"))
                    .BorderBottom(2).BorderColor(Color.FromHex(AccentBlue))
                    .Padding(8).Text(block.Text)
                    .FontSize(12).Bold().FontColor(Color.FromHex(PrimaryBlue));
                col.Item().Height(6);
                break;

            case ContentBlockType.SubHeader:
                col.Item().Height(4);
                col.Item().PaddingLeft(5).Text(block.Text)
                    .FontSize(11).Bold().FontColor(Color.FromHex(DarkGray));
                col.Item().Height(4);
                break;

            case ContentBlockType.Separator:
                col.Item().Height(8);
                col.Item().Height(1).Background(Color.FromHex(BorderGray));
                col.Item().Height(8);
                break;

            default:
                col.Item().PaddingHorizontal(5).Text(block.Text)
                    .FontSize(10).FontColor(Color.FromHex(DarkGray));
                col.Item().Height(4);
                break;
        }
    }

    private void InfoRow(ColumnDescriptor col, string label, string value)
    {
        col.Item().PaddingVertical(3).Row(row =>
        {
            row.ConstantItem(130).Text(label).FontSize(10).Bold().FontColor(Color.FromHex(DarkGray));
            row.RelativeItem().Text(value).FontSize(10).FontColor(Color.FromHex(MediumGray));
        });
    }

    private void TableHeaderCell(TableDescriptor table, string text)
    {
        table.Cell().Background(Color.FromHex(PrimaryBlue)).Padding(6)
            .Text(text).FontSize(10).FontColor(Colors.White).Bold();
    }

    private void AddSectionRow(TableDescriptor table, string section, string questions, string time, string score)
    {
        var bgColor = Color.FromHex(LightGray);
        table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Color.FromHex(BorderGray))
            .Padding(6).Text(section).FontSize(10).Bold();
        table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Color.FromHex(BorderGray))
            .Padding(6).Text(questions).FontSize(10);
        table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Color.FromHex(BorderGray))
            .Padding(6).Text(time).FontSize(10);
        table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Color.FromHex(BorderGray))
            .Padding(6).Text(score).FontSize(10);
    }

    private string MapDifficulty(string difficulty) => difficulty switch
    {
        "beginner" => "Beginner (Target: 60–80)",
        "intermediate" => "Intermediate (Target: 80–100)",
        "advanced" => "Advanced (Target: 100–120)",
        _ => difficulty
    };

    // ──── AI content parser ────

    private List<PdfSection> ParseAIContent(string content, string[] requestedSections)
    {
        var result = new List<PdfSection>();
        if (string.IsNullOrWhiteSpace(content)) return result;

        var lines = content.Split('\n');
        PdfSection? currentSection = null;
        var currentPassageLines = new List<string>();
        bool inPassage = false;

        var sectionMap = new Dictionary<string, (string title, string time, string instructions)>
        {
            ["reading"] = ("Reading Section", "54 minutes",
                "Directions: Read the passage below and answer the questions that follow. " +
                "For each question, choose the best answer from the four choices provided."),
            ["listening"] = ("Listening Section", "41 minutes",
                "Directions: Listen to the conversations and lectures, then answer the questions. " +
                "You may take notes while listening. Choose the best answer for each question."),
            ["speaking"] = ("Speaking Section", "17 minutes",
                "Directions: This section measures your ability to speak in English about a variety of topics. " +
                "Read each task carefully and prepare your response within the allotted time."),
            ["writing"] = ("Writing Section", "50 minutes",
                "Directions: This section measures your ability to use writing to communicate in an academic environment. " +
                "Read each task carefully and compose your response.")
        };

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].TrimEnd();
            var trimmed = line.Trim();

            // Skip empty markdown artifacts
            if (trimmed == "---" || trimmed == "```")
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection!, currentPassageLines);
                    inPassage = false;
                }
                if (currentSection != null && trimmed == "---")
                    currentSection.ContentBlocks.Add(new ContentBlock { Type = ContentBlockType.Separator });
                continue;
            }

            // Detect section headers (## READING SECTION, ## LISTENING SECTION, etc.)
            if (trimmed.StartsWith("## ") || trimmed.StartsWith("# "))
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection!, currentPassageLines);
                    inPassage = false;
                }

                var headerText = trimmed.TrimStart('#').Trim();
                var headerLower = headerText.ToLower();

                foreach (var kvp in sectionMap)
                {
                    if (headerLower.Contains(kvp.Key))
                    {
                        currentSection = new PdfSection
                        {
                            Title = kvp.Value.title,
                            TimeInfo = kvp.Value.time,
                            Instructions = kvp.Value.instructions
                        };
                        result.Add(currentSection);
                        break;
                    }
                }
                continue;
            }

            if (currentSection == null) continue;

            // Passage / Task titles (### Passage 1, ### Task 1, ### Conversation 1, ### Lecture 1, #### headers)
            if (trimmed.StartsWith("### ") || trimmed.StartsWith("#### "))
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection, currentPassageLines);
                    inPassage = false;
                }

                var title = trimmed.TrimStart('#').Trim();
                if (title.ToLower().Contains("task"))
                {
                    currentSection.ContentBlocks.Add(new ContentBlock
                    {
                        Type = ContentBlockType.TaskHeader,
                        Text = title
                    });
                }
                else
                {
                    currentSection.ContentBlocks.Add(new ContentBlock
                    {
                        Type = ContentBlockType.PassageTitle,
                        Text = title
                    });
                }
                continue;
            }

            // Bold sub-headers like **Questions 1-10:** or **Reading:** or **Listening:**
            if (trimmed.StartsWith("**") && trimmed.EndsWith("**"))
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection, currentPassageLines);
                    inPassage = false;
                }

                var subHeader = trimmed.Trim('*').Trim();
                currentSection.ContentBlocks.Add(new ContentBlock
                {
                    Type = ContentBlockType.SubHeader,
                    Text = subHeader
                });
                continue;
            }

            // Question lines: starts with number + period or number + )
            if (IsQuestionLine(trimmed))
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection, currentPassageLines);
                    inPassage = false;
                }

                var (qNum, qText) = ParseQuestionLine(trimmed);
                var options = new Dictionary<string, string>();
                string answer = "";
                var extraLines = new List<string>(); // For Build a Sentence format

                // Look ahead for options, answer, or Build a Sentence components
                int j = i + 1;
                bool isBuildSentence = false;
                
                while (j < lines.Length)
                {
                    var optLine = lines[j].Trim();
                    if (string.IsNullOrWhiteSpace(optLine)) { j++; continue; }

                    // Option line: (A) ... or A) ... or A. ...
                    // Check for (A) format first
                    if (optLine.Length > 3 && optLine[0] == '(' && char.IsLetter(optLine[1]) && optLine[2] == ')')
                    {
                        var key = optLine[1].ToString();
                        var value = optLine.Substring(3).Trim();
                        options[key] = value;
                        j++;
                        continue;
                    }
                    
                    // Check for A) or A. format
                    if (optLine.Length > 2 && char.IsLetter(optLine[0]) &&
                        (optLine[1] == ')' || optLine[1] == '.'))
                    {
                        var key = optLine[0].ToString();
                        var value = optLine.Substring(2).Trim();
                        options[key] = value;
                        j++;
                        continue;
                    }

                    // Answer: X pattern (for Build a Sentence)
                    if (optLine.StartsWith("Answer:") || optLine.StartsWith("**Answer:"))
                    {
                        var ansIdx = optLine.IndexOf("Answer");
                        if (ansIdx >= 0)
                        {
                            var afterAnswer = optLine.Substring(ansIdx + 6).Trim(':', ' ', '*');
                            answer = afterAnswer.Trim();
                        }
                        j++;
                        break;
                    }

                    // Next question or section starts
                    if (IsQuestionLine(optLine) || optLine.StartsWith("#"))
                        break;

                    // Build a Sentence: partial sentence with blanks (contains ___)
                    if (optLine.Contains("___") || optLine.Contains("_ _"))
                    {
                        isBuildSentence = true;
                        extraLines.Add(optLine);
                        j++;
                        continue;
                    }
                    
                    // Build a Sentence: scrambled words line (contains multiple / separators)
                    if (optLine.Contains(" / ") && optLine.Count(c => c == '/') >= 2)
                    {
                        isBuildSentence = true;
                        extraLines.Add("Words: " + optLine);
                        j++;
                        continue;
                    }

                    j++;
                }

                // Combine question text with extra lines for Build a Sentence
                var fullText = qText;
                if (isBuildSentence && extraLines.Count > 0)
                {
                    fullText = qText + "\n" + string.Join("\n", extraLines);
                }

                currentSection.ContentBlocks.Add(new ContentBlock
                {
                    Type = ContentBlockType.Question,
                    QuestionNumber = qNum,
                    Text = fullText,
                    Options = options.Count > 0 ? options : null,
                    Answer = answer
                });

                i = j - 1; // advance past parsed content
                continue;
            }

            // Dialogue lines: **Speaker:** text
            if (trimmed.StartsWith("**") && trimmed.Contains(":**"))
            {
                if (inPassage && currentPassageLines.Count > 0)
                {
                    FlushPassage(currentSection, currentPassageLines);
                    inPassage = false;
                }

                var colonIdx = trimmed.IndexOf(":**");
                if (colonIdx > 2)
                {
                    var speaker = trimmed.Substring(2, colonIdx - 2);
                    var dialogue = trimmed.Substring(colonIdx + 3).Trim();
                    currentSection.ContentBlocks.Add(new ContentBlock
                    {
                        Type = ContentBlockType.Dialogue,
                        Speaker = speaker,
                        Text = dialogue
                    });
                    continue;
                }
            }

            // Instruction-like lines (bold prefix with colon)
            if (trimmed.StartsWith("**") && trimmed.Contains(":**") && !trimmed.StartsWith("**Answer"))
            {
                var endBold = trimmed.IndexOf(":**");
                if (endBold > 2)
                {
                    var label = trimmed.Substring(2, endBold - 2);
                    var rest = trimmed.Substring(endBold + 3).Trim();

                    if (label.ToLower().Contains("question") || label.ToLower().Contains("preparation") ||
                        label.ToLower().Contains("response time") || label.ToLower().Contains("reading time"))
                    {
                        currentSection.ContentBlocks.Add(new ContentBlock
                        {
                            Type = ContentBlockType.Instruction,
                            Text = $"{label}: {rest}"
                        });
                        continue;
                    }
                }
            }

            // Regular text → accumulate as passage
            if (!string.IsNullOrWhiteSpace(trimmed))
            {
                inPassage = true;
                currentPassageLines.Add(trimmed);
            }
            else if (inPassage && currentPassageLines.Count > 0)
            {
                // Empty line = paragraph break in passage
                currentPassageLines.Add(""); 
            }
        }

        // Flush remaining passage
        if (inPassage && currentPassageLines.Count > 0 && currentSection != null)
        {
            FlushPassage(currentSection, currentPassageLines);
        }

        // If no sections were parsed, create a generic one with the raw content
        if (result.Count == 0 && !string.IsNullOrWhiteSpace(content))
        {
            var fallback = new PdfSection
            {
                Title = "Practice Test",
                TimeInfo = "",
                Instructions = ""
            };
            fallback.ContentBlocks.Add(new ContentBlock
            {
                Type = ContentBlockType.Passage,
                Text = content
            });
            result.Add(fallback);
        }

        return result;
    }

    private void FlushPassage(PdfSection section, List<string> lines)
    {
        var text = string.Join("\n", lines).Trim();
        if (!string.IsNullOrWhiteSpace(text))
        {
            section.ContentBlocks.Add(new ContentBlock
            {
                Type = ContentBlockType.Passage,
                Text = text
            });
        }
        lines.Clear();
    }

    private bool IsQuestionLine(string line)
    {
        if (string.IsNullOrWhiteSpace(line)) return false;
        // Match: "1." "1)" "10." "10)" etc.
        for (int i = 0; i < line.Length && i < 4; i++)
        {
            if (char.IsDigit(line[i])) continue;
            if (line[i] == '.' || line[i] == ')')
                return i > 0; // at least one digit before the separator
            break;
        }
        return false;
    }

    private (string num, string text) ParseQuestionLine(string line)
    {
        for (int i = 0; i < line.Length && i < 4; i++)
        {
            if (char.IsDigit(line[i])) continue;
            if (line[i] == '.' || line[i] == ')')
            {
                var num = line.Substring(0, i + 1).Trim();
                var text = line.Substring(i + 1).Trim();
                return (num, text);
            }
            break;
        }
        return ("", line);
    }
}

// ──── Data models ────

public class PdfSection
{
    public string Title { get; set; } = "";
    public string TimeInfo { get; set; } = "";
    public string Instructions { get; set; } = "";
    public List<ContentBlock> ContentBlocks { get; set; } = new();
}

public class ContentBlock
{
    public ContentBlockType Type { get; set; }
    public string Text { get; set; } = "";
    public string? Speaker { get; set; }
    public string QuestionNumber { get; set; } = "";
    public Dictionary<string, string>? Options { get; set; }
    public string Answer { get; set; } = "";
}

public enum ContentBlockType
{
    Passage,
    PassageTitle,
    Question,
    Instruction,
    Dialogue,
    TaskHeader,
    SubHeader,
    Separator
}
