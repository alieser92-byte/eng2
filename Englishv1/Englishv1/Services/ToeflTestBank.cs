namespace Englishv1.Services;

/// <summary>
/// Contains a large bank of TOEFL iBT practice test content.
/// Each call to Generate() returns a unique, randomised full-length test.
/// </summary>
public static class ToeflTestBank
{
    private static readonly Random _rng = new();

    // ───────────────────── PUBLIC API ─────────────────────

    public static string Generate(string difficulty, string[] sections)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("# TOEFL iBT Practice Test\n");

        if (sections.Contains("Reading"))
            AppendReading(sb, difficulty);

        if (sections.Contains("Listening"))
            AppendListening(sb, difficulty);

        if (sections.Contains("Speaking"))
            AppendSpeaking(sb, difficulty);

        if (sections.Contains("Writing"))
            AppendWriting(sb, difficulty);

        sb.AppendLine("\n---\n");
        sb.AppendLine("**SCORING GUIDE:**");
        sb.AppendLine("- Reading: 0-30 points (30 questions)");
        sb.AppendLine("- Listening: 0-30 points (28 questions)");
        sb.AppendLine("- Speaking: 0-30 points (4 tasks, 0-4 each, scaled)");
        sb.AppendLine("- Writing: 0-30 points (2 tasks, 0-5 each, scaled)");
        sb.AppendLine("- **Total: 0-120 points**");

        return sb.ToString();
    }

    // ───────────────────── READING ─────────────────────

    private static void AppendReading(System.Text.StringBuilder sb, string difficulty)
    {
        sb.AppendLine("# Reading Section\n");
        
        // Module 1
        sb.AppendLine("## Reading Section, Module 1\n");
        sb.AppendLine("### Fill in the missing letters in the paragraph (Questions 1-10)\n");
        
        var fillInPara1 = PickRandom(FillInParagraphs, 1)[0];
        sb.AppendLine(fillInPara1.Paragraph);
        sb.AppendLine("\nAnswer Key:\n");
        for (int i = 0; i < fillInPara1.Answers.Count; i++)
        {
            sb.AppendLine($"{i + 1}. {fillInPara1.Answers[i]}");
        }
        sb.AppendLine("\n---\n");
        
        // Notice
        sb.AppendLine("### Read a notice (Questions 11-12)\n");
        var notice1 = PickRandom(Notices, 1)[0];
        sb.AppendLine($"**Notice**\n\n{notice1.Text}\n");
        for (int i = 0; i < notice1.Questions.Count; i++)
        {
            var q = notice1.Questions[i];
            sb.AppendLine($"{11 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Social Media Post
        sb.AppendLine("### Read a social media post (Questions 13-15)\n");
        var post1 = PickRandom(SocialMediaPosts, 1)[0];
        sb.AppendLine($"{post1.Text}\n");
        for (int i = 0; i < post1.Questions.Count; i++)
        {
            var q = post1.Questions[i];
            sb.AppendLine($"{13 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Academic Passage
        sb.AppendLine("### Read an Academic Passage (Questions 16-20)\n");
        var academic1 = PickRandom(AcademicPassages, 1)[0];
        sb.AppendLine($"{academic1.Text}\n");
        for (int i = 0; i < academic1.Questions.Count; i++)
        {
            var q = academic1.Questions[i];
            sb.AppendLine($"{16 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Module 2
        sb.AppendLine("# Reading Section, Module 2\n");
        sb.AppendLine("## Fill in the missing letters in the paragraph (Questions 1-10)\n");
        
        var fillInPara2 = PickRandom(FillInParagraphs, 1)[0];
        sb.AppendLine(fillInPara2.Paragraph);
        sb.AppendLine("\nAnswer Key:\n");
        for (int i = 0; i < fillInPara2.Answers.Count; i++)
        {
            sb.AppendLine($"{i + 1}. {fillInPara2.Answers[i]}");
        }
        sb.AppendLine("\n---\n");
        
        // Notice
        sb.AppendLine("### Read a notice (Questions 11-12)\n");
        var notice2 = PickRandom(Notices, 1)[0];
        sb.AppendLine($"**Notice**\n\n{notice2.Text}\n");
        for (int i = 0; i < notice2.Questions.Count; i++)
        {
            var q = notice2.Questions[i];
            sb.AppendLine($"{11 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Social Media Post
        sb.AppendLine("### Read a social media post (Questions 13-15)\n");
        var post2 = PickRandom(SocialMediaPosts, 1)[0];
        sb.AppendLine($"{post2.Text}\n");
        for (int i = 0; i < post2.Questions.Count; i++)
        {
            var q = post2.Questions[i];
            sb.AppendLine($"{13 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Academic Passage
        sb.AppendLine("### Read an Academic Passage (Questions 16-20)\n");
        var academic2 = PickRandom(AcademicPassages, 1)[0];
        sb.AppendLine($"{academic2.Text}\n");
        for (int i = 0; i < academic2.Questions.Count; i++)
        {
            var q = academic2.Questions[i];
            sb.AppendLine($"{16 + i}. {q.Stem}");
            sb.AppendLine($"    (A) {q.A}");
            sb.AppendLine($"    (B) {q.B}");
            sb.AppendLine($"    (C) {q.C}");
            sb.AppendLine($"    (D) {q.D}");
            sb.AppendLine();
        }
        sb.AppendLine("---\n");
        
        // Answer Key for Module 1
        sb.AppendLine("## Reading Section Answer Key\n\n### Module 1\n");
        for (int i = 0; i < fillInPara1.Answers.Count; i++)
        {
            sb.AppendLine($"{i + 1}. {fillInPara1.Answers[i]}");
        }
        for (int i = 0; i < notice1.Questions.Count; i++)
        {
            sb.AppendLine($"{11 + i}. {notice1.Questions[i].Answer}");
        }
        for (int i = 0; i < post1.Questions.Count; i++)
        {
            sb.AppendLine($"{13 + i}. {post1.Questions[i].Answer}");
        }
        for (int i = 0; i < academic1.Questions.Count; i++)
        {
            sb.AppendLine($"{16 + i}. {academic1.Questions[i].Answer}");
        }
        
        // Answer Key for Module 2
        sb.AppendLine("\n### Module 2\n");
        for (int i = 0; i < fillInPara2.Answers.Count; i++)
        {
            sb.AppendLine($"{i + 1}. {fillInPara2.Answers[i]}");
        }
        for (int i = 0; i < notice2.Questions.Count; i++)
        {
            sb.AppendLine($"{11 + i}. {notice2.Questions[i].Answer}");
        }
        for (int i = 0; i < post2.Questions.Count; i++)
        {
            sb.AppendLine($"{13 + i}. {post2.Questions[i].Answer}");
        }
        for (int i = 0; i < academic2.Questions.Count; i++)
        {
            sb.AppendLine($"{16 + i}. {academic2.Questions[i].Answer}");
        }
        sb.AppendLine();
    }

    // ───────────────────── LISTENING ─────────────────────

    private static void AppendListening(System.Text.StringBuilder sb, string difficulty)
    {
        sb.AppendLine("## LISTENING SECTION (41 minutes)\n");

        var convs = PickRandom(ListeningConversations, 2);
        var lectures = PickRandom(ListeningLectures, 2);
        int qNum = 1;

        for (int i = 0; i < 2; i++)
        {
            // Conversation
            var conv = convs[i];
            sb.AppendLine($"### Conversation {i + 1}: {conv.Title}\n");
            foreach (var line in conv.Dialogue)
                sb.AppendLine($"**{line.Speaker}:** {line.Text}\n");

            sb.AppendLine($"**Questions {qNum}-{qNum + conv.Questions.Count - 1}:**\n");
            foreach (var q in conv.Questions)
            {
                sb.AppendLine($"{qNum}. {q.Stem}");
                sb.AppendLine($"   A) {q.A}");
                sb.AppendLine($"   B) {q.B}");
                sb.AppendLine($"   C) {q.C}");
                sb.AppendLine($"   D) {q.D}");
                sb.AppendLine($"   **Answer: {q.Answer}**\n");
                qNum++;
            }

            // Lecture
            var lec = lectures[i];
            sb.AppendLine($"### Lecture {i + 1}: {lec.Title}\n");
            sb.AppendLine(lec.Text);
            sb.AppendLine();

            sb.AppendLine($"**Questions {qNum}-{qNum + lec.Questions.Count - 1}:**\n");
            foreach (var q in lec.Questions)
            {
                sb.AppendLine($"{qNum}. {q.Stem}");
                sb.AppendLine($"   A) {q.A}");
                sb.AppendLine($"   B) {q.B}");
                sb.AppendLine($"   C) {q.C}");
                sb.AppendLine($"   D) {q.D}");
                sb.AppendLine($"   **Answer: {q.Answer}**\n");
                qNum++;
            }
        }
    }

    // ───────────────────── SPEAKING ─────────────────────

    private static void AppendSpeaking(System.Text.StringBuilder sb, string difficulty)
    {
        sb.AppendLine("## SPEAKING SECTION (17 minutes)\n");

        var t1 = PickRandom(SpeakingTask1, 1)[0];
        sb.AppendLine("### Task 1: Independent Speaking (Preparation: 15 seconds, Response: 45 seconds)\n");
        sb.AppendLine($"**Question:**\n{t1}\n");

        var t2 = PickRandom(SpeakingTask2, 1)[0];
        sb.AppendLine("### Task 2: Integrated Speaking – Campus Situation (Prep: 30s, Response: 60s)\n");
        sb.AppendLine($"**Reading (45 seconds):**\n{t2.Reading}\n");
        sb.AppendLine($"**Listening:**\n{t2.Listening}\n");
        sb.AppendLine($"**Question:**\n{t2.Question}\n");

        var t3 = PickRandom(SpeakingTask3, 1)[0];
        sb.AppendLine("### Task 3: Integrated Speaking – Academic Course (Prep: 30s, Response: 60s)\n");
        sb.AppendLine($"**Reading (45 seconds):**\n{t3.Reading}\n");
        sb.AppendLine($"**Listening:**\n{t3.Listening}\n");
        sb.AppendLine($"**Question:**\n{t3.Question}\n");

        var t4 = PickRandom(SpeakingTask4, 1)[0];
        sb.AppendLine("### Task 4: Academic Lecture (Prep: 20s, Response: 60s)\n");
        sb.AppendLine($"**Listening:**\n{t4.Listening}\n");
        sb.AppendLine($"**Question:**\n{t4.Question}\n");
    }

    // ───────────────────── WRITING ─────────────────────

    private static void AppendWriting(System.Text.StringBuilder sb, string difficulty)
    {
        sb.AppendLine("## WRITING SECTION (50 minutes)\n");

        var t1 = PickRandom(WritingTask1, 1)[0];
        sb.AppendLine("### Task 1: Integrated Writing (20 minutes, 150-225 words)\n");
        sb.AppendLine($"**Reading Passage (3 minutes):**\n{t1.Reading}\n");
        sb.AppendLine($"**Listening:**\n{t1.Listening}\n");
        sb.AppendLine($"**Question:**\n{t1.Question}\n");

        var t2 = PickRandom(WritingTask2, 1)[0];
        sb.AppendLine("### Task 2: Independent Writing (30 minutes, 300+ words)\n");
        sb.AppendLine($"**Question:**\n{t2}\n");
    }

    // ───────────────────── HELPERS ─────────────────────

    private static List<T> PickRandom<T>(List<T> source, int count)
    {
        var shuffled = source.OrderBy(_ => _rng.Next()).ToList();
        return shuffled.Take(Math.Min(count, shuffled.Count)).ToList();
    }

    // ═══════════════════════════════════════════════════
    //                  CONTENT BANKS
    // ═══════════════════════════════════════════════════

    #region Reading Passages

    private static readonly List<ReadingPassage> ReadingPassages = new()
    {
        // ── Passage A ──
        new ReadingPassage
        {
            Title = "The Evolution of Urban Planning",
            Text = @"Urban planning, as a formal discipline, emerged in the late 19th century in response to the rapid industrialization and urbanization of cities throughout Europe and North America. Prior to this period, cities grew organically, often without systematic consideration of infrastructure, housing, or public health. The Industrial Revolution brought unprecedented numbers of people into urban centers, creating severe overcrowding, unsanitary conditions, and social problems that demanded coordinated solutions.

Early urban planners like Ebenezer Howard pioneered concepts such as the ""garden city,"" which sought to combine the benefits of urban and rural living. Howard's vision involved self-contained communities surrounded by greenbelts, combining residential areas with agricultural land and industrial zones. His ideas influenced the development of new towns in Britain and inspired similar movements worldwide. The garden city concept represented a radical departure from the dense, polluted industrial cities of the era, emphasizing the importance of green spaces, adequate housing, and community facilities.

The 20th century saw the rise of various schools of urban planning thought. Modernist planners, influenced by architects like Le Corbusier, advocated for rational, functional city designs featuring high-rise buildings, separated land uses, and extensive highway systems. This approach, exemplified by projects like Brasília and Chandigarh, prioritized efficiency and order. However, by the 1960s, critics like Jane Jacobs challenged modernist principles, arguing that they destroyed the social fabric of neighborhoods and created sterile, lifeless environments. Jacobs championed mixed-use development, pedestrian-friendly streets, and preservation of historic neighborhoods.

Contemporary urban planning faces new challenges, including climate change, sustainability, and social equity. Planners now emphasize concepts like transit-oriented development, which concentrates housing and commercial activity around public transportation nodes, reducing automobile dependence. Green infrastructure, such as urban forests and rain gardens, is being integrated into city designs to manage stormwater and improve environmental quality. Additionally, participatory planning processes increasingly involve community members in decision-making, ensuring that development reflects local needs and values rather than top-down mandates.",
            Questions = new()
            {
                new McQuestion("What is the main purpose of this passage?", "To criticize modern urban planning approaches", "To trace the historical development of urban planning as a discipline", "To promote Ebenezer Howard's garden city concept", "To explain why cities grew during the Industrial Revolution", "B"),
                new McQuestion("The word \"unprecedented\" in paragraph 1 is closest in meaning to:", "Unexpected", "Never experienced before", "Gradual", "Unfortunate", "B"),
                new McQuestion("According to paragraph 2, Ebenezer Howard's garden city concept included all of the following EXCEPT:", "Green spaces surrounding communities", "Integration of residential and agricultural areas", "High-rise apartment buildings", "Industrial zones within the community", "C"),
                new McQuestion("Why does the author mention Jane Jacobs in paragraph 3?", "To provide an example of a modernist urban planner", "To introduce alternative perspectives on urban planning", "To explain the success of high-rise buildings", "To criticize the garden city movement", "B"),
                new McQuestion("The phrase \"social fabric\" in paragraph 3 refers to:", "The physical infrastructure of neighborhoods", "The network of relationships and community connections", "The economic system of cities", "The architectural style of buildings", "B"),
                new McQuestion("What can be inferred about transit-oriented development?", "It increases automobile usage", "It is a response to climate change concerns", "It was first proposed by Le Corbusier", "It separates residential and commercial areas", "B"),
                new McQuestion("The word \"mandates\" in the last paragraph is closest in meaning to:", "Requests", "Suggestions", "Directives", "Elections", "C"),
                new McQuestion("According to the passage, green infrastructure serves which purpose?", "Increasing urban sprawl", "Managing stormwater and improving environmental quality", "Replacing public transportation", "Promoting automobile dependence", "B"),
                new McQuestion("Which of the following best describes the organization of the passage?", "A comparison of two opposing viewpoints", "A chronological overview followed by current developments", "A series of arguments supporting one theory", "A problem-and-solution structure", "B"),
                new McQuestion("What is the author's attitude toward participatory planning?", "Skeptical", "Neutral", "Generally positive", "Dismissive", "C"),
            }
        },

        // ── Passage B ──
        new ReadingPassage
        {
            Title = "Photosynthesis and Its Global Impact",
            Text = @"Photosynthesis is arguably the most important biochemical process on Earth, responsible for producing the oxygen that sustains most life forms and converting solar energy into chemical energy stored in organic molecules. This process, carried out primarily by plants, algae, and cyanobacteria, involves the absorption of carbon dioxide from the atmosphere and water from the soil, using sunlight as an energy source to synthesize glucose and release oxygen as a byproduct.

The mechanism of photosynthesis occurs in two main stages: the light-dependent reactions and the light-independent reactions, also known as the Calvin cycle. During the light-dependent reactions, which take place in the thylakoid membranes of chloroplasts, chlorophyll and other pigments absorb photons of light. This energy is used to split water molecules, releasing oxygen and generating ATP and NADPH — energy-carrying molecules. In the Calvin cycle, which occurs in the stroma of chloroplasts, the ATP and NADPH produced in the first stage drive the fixation of carbon dioxide into three-carbon sugars, which are subsequently assembled into glucose.

The efficiency of photosynthesis varies considerably among species and environmental conditions. C3 plants, which include most trees and crops like wheat and rice, fix carbon dioxide directly through the Calvin cycle but suffer from a process called photorespiration, which wastes energy in hot, dry conditions. C4 plants, such as maize and sugarcane, have evolved a preliminary carbon fixation step that concentrates carbon dioxide around the enzyme RuBisCO, minimizing photorespiration and making them more efficient in tropical environments. CAM plants, including cacti and pineapples, open their stomata at night to fix carbon dioxide, conserving water in arid climates.

The global significance of photosynthesis extends far beyond biology. It forms the foundation of virtually all food chains, provides the raw materials for fossil fuels formed over millions of years, and plays a critical role in regulating atmospheric carbon dioxide levels. As concerns about climate change intensify, researchers are investigating ways to enhance photosynthetic efficiency — through genetic engineering of crop plants and the development of artificial photosynthesis systems — to increase food production and capture more atmospheric carbon dioxide.",
            Questions = new()
            {
                new McQuestion("What is the primary purpose of this passage?", "To argue for genetic modification of crops", "To explain the process and significance of photosynthesis", "To compare C3 and C4 plants exclusively", "To describe the history of photosynthesis research", "B"),
                new McQuestion("The word \"sustains\" in paragraph 1 is closest in meaning to:", "Creates", "Supports", "Destroys", "Modifies", "B"),
                new McQuestion("According to paragraph 2, where do the light-dependent reactions occur?", "In the stroma", "In the cell nucleus", "In the thylakoid membranes", "In the mitochondria", "C"),
                new McQuestion("What is the role of ATP and NADPH in photosynthesis?", "They absorb sunlight directly", "They carry energy from light reactions to the Calvin cycle", "They release oxygen as a byproduct", "They break down glucose", "B"),
                new McQuestion("Why are C4 plants more efficient in tropical environments?", "They have larger leaves", "They concentrate CO₂ to minimize photorespiration", "They do not use the Calvin cycle", "They open stomata only at night", "B"),
                new McQuestion("The word \"preliminary\" in paragraph 3 is closest in meaning to:", "Final", "Complex", "Initial", "Unnecessary", "C"),
                new McQuestion("What can be inferred about CAM plants?", "They are well-adapted to humid environments", "They evolved to conserve water in dry conditions", "They are more efficient than C4 plants", "They do not perform the Calvin cycle", "B"),
                new McQuestion("According to paragraph 4, fossil fuels are related to photosynthesis because:", "They enhance modern photosynthetic efficiency", "They were formed from photosynthetic organisms over millions of years", "They produce oxygen when burned", "They are used to power artificial photosynthesis", "B"),
                new McQuestion("Which of the following is NOT mentioned as a current area of research?", "Genetic engineering of crop plants", "Development of artificial photosynthesis", "Transplanting chloroplasts between species", "Enhancing photosynthetic efficiency", "C"),
                new McQuestion("What is the author's tone in discussing the future of photosynthesis research?", "Pessimistic", "Cautiously optimistic", "Indifferent", "Highly critical", "B"),
            }
        },

        // ── Passage C ──
        new ReadingPassage
        {
            Title = "The Psychology of Decision-Making",
            Text = @"Human decision-making has long been studied by psychologists, economists, and neuroscientists seeking to understand how people choose between alternatives. Classical economic theory assumed that individuals are rational agents who consistently make choices that maximize their utility — a concept known as ""homo economicus."" However, decades of research in behavioral psychology have revealed that human decisions are often influenced by cognitive biases, emotions, and social pressures that lead to systematic deviations from rational behavior.

One of the most influential contributions to this field came from psychologists Daniel Kahneman and Amos Tversky, whose prospect theory challenged the expected utility model. Their research demonstrated that people evaluate potential losses and gains asymmetrically: the pain of losing a certain amount is psychologically about twice as powerful as the pleasure of gaining the same amount. This ""loss aversion"" helps explain why investors hold onto losing stocks too long and why consumers are more motivated by the fear of missing out than by potential benefits.

Kahneman further popularized the dual-process theory of thinking, which distinguishes between two cognitive systems. System 1 operates automatically, quickly, and with little effort — it handles routine judgments such as recognizing faces or completing familiar phrases. System 2, by contrast, requires deliberate attention and mental effort and is engaged when solving complex problems or making important decisions. While System 1 is efficient, it is also prone to errors because it relies on heuristics — mental shortcuts that can produce biased judgments. The availability heuristic, for instance, leads people to overestimate the likelihood of events that are easily recalled, such as plane crashes, while underestimating more common risks like car accidents.

The anchoring effect represents another well-documented bias in decision-making. When people are presented with an initial piece of information — the ""anchor"" — their subsequent judgments tend to be insufficiently adjusted from that starting point. In one famous experiment, Kahneman and Tversky asked participants to estimate the percentage of African countries in the United Nations. When first shown a randomly generated number, participants' estimates were strongly influenced by that number, even though it was entirely irrelevant. This effect has profound implications for negotiations, pricing, and legal judgments, where initial figures can disproportionately shape outcomes.

Understanding these biases has practical applications in many domains. In healthcare, the way choices are presented — known as ""framing"" — can significantly influence patient decisions about treatments. In public policy, insights from behavioral economics have led to the design of ""nudges"" — subtle changes in the way options are presented that encourage better decisions without restricting freedom of choice. For example, making organ donation the default option rather than an opt-in choice has dramatically increased donation rates in several countries.",
            Questions = new()
            {
                new McQuestion("What is the main topic of this passage?", "The history of economic theory", "How cognitive biases affect human decision-making", "Daniel Kahneman's biography", "The differences between psychology and economics", "B"),
                new McQuestion("The word \"asymmetrically\" in paragraph 2 is closest in meaning to:", "Equally", "Unevenly", "Rapidly", "Predictably", "B"),
                new McQuestion("According to prospect theory, people tend to:", "Value gains and losses equally", "Feel the impact of losses more strongly than equivalent gains", "Make purely rational financial decisions", "Ignore potential losses entirely", "B"),
                new McQuestion("What is the primary function of System 1 thinking?", "Solving complex mathematical problems", "Making quick, automatic judgments", "Analyzing detailed scientific data", "Planning long-term strategies", "B"),
                new McQuestion("The author mentions plane crashes and car accidents to illustrate:", "The danger of modern transportation", "The anchoring effect", "The availability heuristic", "Loss aversion in insurance decisions", "C"),
                new McQuestion("In the experiment described in paragraph 4, the randomly generated number served as:", "A statistical baseline", "An anchor that biased estimates", "A correct answer participants should match", "A distraction to test attention", "B"),
                new McQuestion("The word \"profound\" in paragraph 4 is closest in meaning to:", "Minimal", "Deep and significant", "Temporary", "Unpredictable", "B"),
                new McQuestion("What is a \"nudge\" as described in the passage?", "A legal requirement to make certain choices", "A subtle change in how options are presented to encourage better decisions", "A financial incentive for good behavior", "A punishment for making poor decisions", "B"),
                new McQuestion("Why does the author mention organ donation defaults?", "To criticize government overreach", "To provide an example of how framing influences decisions", "To argue against behavioral economics", "To explain how System 2 thinking works", "B"),
                new McQuestion("What can be inferred about the author's view of behavioral economics?", "It is a flawed discipline", "It has valuable practical applications", "It should replace classical economics entirely", "It is only relevant to healthcare", "B"),
            }
        },

        // ── Passage D ──
        new ReadingPassage
        {
            Title = "The Rise and Fall of the Maya Civilization",
            Text = @"The Maya civilization, one of the most sophisticated pre-Columbian cultures in the Americas, flourished in the tropical lowlands of present-day southern Mexico, Guatemala, Belize, Honduras, and El Salvador. At its peak during the Classic period (approximately 250–900 CE), the Maya developed an advanced writing system, a remarkably accurate calendar, impressive architectural achievements, and complex mathematical concepts, including the independent invention of the concept of zero.

Maya cities were not unified under a single political authority but instead consisted of numerous independent city-states, each ruled by a divine king known as a k'uhul ajaw. These city-states, including Tikal, Calakmul, Palenque, and Copán, engaged in complex diplomatic relationships, trade networks, and frequent warfare. The architecture of these centers featured massive stone pyramids, elaborate palace complexes, and ball courts where a ritualistic game with cosmological significance was played. The construction of these monuments required sophisticated engineering knowledge and the mobilization of large labor forces.

Maya intellectual achievements were equally remarkable. Their writing system, consisting of approximately 800 hieroglyphic signs, was the most complete in the pre-Columbian Americas and was used to record historical events, astronomical observations, and religious rituals on stone monuments, pottery, and bark-paper books called codices. Maya astronomers tracked the movements of the sun, moon, Venus, and other celestial bodies with extraordinary precision. Their Long Count calendar could express dates spanning millions of years, and their calculations of the length of the solar year were more accurate than those used in Europe at the same time.

The decline of the Classic Maya civilization, often referred to as the ""Maya collapse,"" remains one of archaeology's most debated mysteries. Between approximately 800 and 1000 CE, many major cities in the southern lowlands were abandoned. Researchers have proposed multiple contributing factors, including prolonged drought, environmental degradation from deforestation, intensifying warfare between city-states, and social upheaval. Recent paleoclimatic studies analyzing lake sediments and cave formations have confirmed that several severe droughts coincided with the periods of abandonment, suggesting that climate played a significant role. However, it is important to note that the Maya did not disappear — millions of Maya people continue to live in Central America today, maintaining many cultural traditions.",
            Questions = new()
            {
                new McQuestion("What is the passage primarily about?", "The Maya writing system", "The history, achievements, and decline of the Maya civilization", "Archaeological methods used to study the Maya", "A comparison of Maya and European civilizations", "B"),
                new McQuestion("The word \"sophisticated\" in paragraph 1 is closest in meaning to:", "Simple", "Ancient", "Advanced and complex", "Mysterious", "C"),
                new McQuestion("According to paragraph 2, Maya city-states were:", "Unified under one emperor", "Independent political entities ruled by divine kings", "Peaceful communities focused on agriculture", "Temporary settlements that moved frequently", "B"),
                new McQuestion("What was significant about the Maya ball game?", "It was purely recreational entertainment", "It had cosmological and ritual significance", "It was identical to modern basketball", "It was only played by children", "B"),
                new McQuestion("The word \"codices\" in paragraph 3 refers to:", "Stone monuments", "Ceramic pottery", "Books made from bark paper", "Metal inscriptions", "C"),
                new McQuestion("What can be inferred about Maya astronomical knowledge?", "It was inferior to European knowledge of the same era", "It was remarkably precise and in some ways surpassed European calculations", "It focused exclusively on the sun", "It was borrowed from other civilizations", "B"),
                new McQuestion("According to the passage, which is NOT a proposed cause of the Maya collapse?", "Prolonged drought", "European colonization", "Environmental degradation", "Intensifying warfare", "B"),
                new McQuestion("The word \"coincided\" in paragraph 4 is closest in meaning to:", "Conflicted", "Occurred at the same time", "Were caused by", "Preceded", "B"),
                new McQuestion("Why does the author mention that millions of Maya people live today?", "To suggest the collapse theory is wrong", "To clarify that the civilization declined but the people did not vanish", "To argue that the Maya were unaffected by the collapse", "To promote tourism in Central America", "B"),
                new McQuestion("What is the author's perspective on the cause of the Maya collapse?", "It was definitely caused by drought alone", "Multiple factors likely contributed, with drought playing a significant role", "It was entirely due to warfare", "Scientists have no useful theories about it", "B"),
            }
        },

        // ── Passage E ──
        new ReadingPassage
        {
            Title = "Ocean Acidification: The Other Carbon Problem",
            Text = @"While much public attention has focused on global warming as the primary consequence of rising atmospheric carbon dioxide levels, another equally serious threat has been developing largely beneath the surface — ocean acidification. Since the beginning of the Industrial Revolution, the world's oceans have absorbed approximately 30 percent of the carbon dioxide produced by human activities. While this absorption has slowed the rate of atmospheric warming, it has come at a significant cost to marine chemistry, lowering the pH of ocean surface waters by about 0.1 units, representing a roughly 26 percent increase in acidity.

The chemistry behind ocean acidification is straightforward. When carbon dioxide dissolves in seawater, it reacts with water molecules to form carbonic acid, which then dissociates into bicarbonate and hydrogen ions. The increase in hydrogen ions lowers the pH of the water, making it more acidic. Critically, this process also reduces the concentration of carbonate ions in seawater. Carbonate ions are essential building blocks for the shells and skeletons of many marine organisms, including corals, mollusks, and certain types of plankton. As carbonate ion concentrations decrease, these organisms must expend more energy to build and maintain their calcium carbonate structures, and in severely acidified conditions, existing structures may begin to dissolve.

The ecological consequences of ocean acidification are far-reaching. Coral reefs, which support approximately 25 percent of all marine species, are particularly vulnerable. Reduced calcification rates weaken coral skeletons, making reefs more susceptible to erosion and storm damage. Studies have shown that some coral species experience a 15 to 40 percent reduction in calcification rates when exposed to projected end-of-century pH levels. Pteropods — tiny sea snails that form a crucial part of the marine food web, particularly in polar regions — have shown visible shell dissolution in waters with elevated CO₂ levels. Since pteropods serve as a primary food source for salmon, herring, and many whale species, their decline could trigger cascading effects throughout marine ecosystems.

Beyond calcifying organisms, ocean acidification affects a broad range of marine life. Research has demonstrated behavioral changes in fish exposed to elevated CO₂ levels, including impaired ability to detect predators, altered responses to auditory cues, and disrupted homing behavior. These effects appear to result from changes in the function of a neurotransmitter receptor called GABA-A, which is sensitive to changes in acid-base balance. Additionally, some studies suggest that ocean acidification may enhance the growth of harmful algal blooms, which produce toxins that can contaminate shellfish and pose risks to human health. Current projections indicate that if carbon dioxide emissions continue unabated, ocean pH could decline by an additional 0.3 to 0.4 units by the end of this century — a rate of change unprecedented in at least the past 66 million years.",
            Questions = new()
            {
                new McQuestion("What is the main argument of this passage?", "Global warming is not a serious problem", "Ocean acidification is a major, underappreciated consequence of CO₂ emissions", "Marine organisms can easily adapt to changing pH levels", "Coral reefs are the only ecosystems affected by acidification", "B"),
                new McQuestion("The word \"dissociates\" in paragraph 2 is closest in meaning to:", "Combines", "Separates into components", "Strengthens", "Evaporates", "B"),
                new McQuestion("Why is the reduction of carbonate ions significant?", "It increases water temperature", "It makes it harder for marine organisms to build shells and skeletons", "It improves coral growth rates", "It reduces the salt content of seawater", "B"),
                new McQuestion("According to paragraph 3, how much can coral calcification rates decrease?", "1 to 5 percent", "5 to 10 percent", "15 to 40 percent", "50 to 75 percent", "C"),
                new McQuestion("Why does the author discuss pteropods in detail?", "They are the largest marine animals", "Their decline could cause cascading effects through the food web", "They are commercially valuable shellfish", "They are responsible for producing carbonate ions", "B"),
                new McQuestion("The word \"cascading\" in paragraph 3 is closest in meaning to:", "Minimal", "Spreading progressively through connected systems", "Temporary", "Reversible", "B"),
                new McQuestion("What effect does elevated CO₂ have on fish behavior?", "It makes them swim faster", "It impairs predator detection and disrupts homing behavior", "It has no measurable effect", "It improves their reproductive rates", "B"),
                new McQuestion("The passage mentions GABA-A to explain:", "How corals build their skeletons", "The biochemical mechanism behind behavioral changes in fish", "Why pteropods lose their shells", "The formation of carbonic acid", "B"),
                new McQuestion("What can be inferred about the rate of current ocean pH change?", "It has happened many times before", "It is historically unprecedented in recent geological history", "It is slower than natural variations", "It will stabilize on its own", "B"),
                new McQuestion("The author's tone throughout the passage can best be described as:", "Hopeful and encouraging", "Concerned and evidence-based", "Angry and accusatory", "Neutral and uninterested", "B"),
            }
        },

        // ── Passage F ──
        new ReadingPassage
        {
            Title = "The Invention and Impact of the Printing Press",
            Text = @"Johannes Gutenberg's invention of the movable-type printing press around 1440 is widely regarded as one of the most transformative technological developments in human history. Before Gutenberg, books in Europe were produced by hand, a laborious process typically carried out by monks in monastery scriptoria. A single handwritten book could take months or even years to complete, making books extraordinarily expensive and accessible only to a tiny elite of clergy, nobility, and wealthy merchants.

Gutenberg's innovation combined several existing technologies in a novel way. He developed a practical system of individual metal type pieces that could be arranged, inked, pressed onto paper, and then rearranged for the next page. His invention also required the development of an oil-based ink that would adhere to metal type, a wooden press adapted from those used in winemaking, and a special alloy for casting durable, uniform letter forms. His most famous production, the Gutenberg Bible, printed around 1455, demonstrated the remarkable quality that this new technology could achieve — its typography is still considered beautiful by modern standards.

The impact of the printing press on European society was profound and multifaceted. Within just fifty years of Gutenberg's invention, an estimated 20 million volumes had been printed. The price of books dropped dramatically, making written knowledge accessible to a much broader segment of society. This democratization of information had enormous consequences. The Protestant Reformation, initiated by Martin Luther in 1517, spread with unprecedented speed thanks to the printing press. Luther's Ninety-Five Theses and subsequent writings were printed and distributed across Europe in weeks rather than years, enabling a grassroots religious movement that might otherwise have been easily suppressed.

The printing press also accelerated the Scientific Revolution. Scientists could now publish their findings and have them distributed widely, allowing for peer review, replication of experiments, and the rapid accumulation of knowledge. The standardization of scientific texts meant that researchers across Europe could work from identical sources, reducing errors introduced by hand-copying. Furthermore, the press contributed to the standardization of languages, as printed books established consistent spelling and grammar conventions. The rise of newspapers in the 17th century, made possible by printing technology, created an informed public sphere and laid the groundwork for democratic governance. In many ways, the printing press set in motion the forces that would shape the modern world.",
            Questions = new()
            {
                new McQuestion("What is the passage mainly about?", "The biography of Johannes Gutenberg", "The invention of the printing press and its transformative effects on society", "A comparison of handwritten and printed books", "The history of the Protestant Reformation", "B"),
                new McQuestion("The word \"laborious\" in paragraph 1 is closest in meaning to:", "Enjoyable", "Requiring great effort and time", "Simple", "Spiritual", "B"),
                new McQuestion("According to paragraph 2, Gutenberg's innovation included all of the following EXCEPT:", "Individual movable metal type pieces", "An oil-based ink for metal type", "An electric-powered press mechanism", "A special alloy for casting letter forms", "C"),
                new McQuestion("How does the author characterize the Gutenberg Bible?", "It was of poor quality compared to handwritten books", "Its typography is still considered beautiful by modern standards", "It was the first book ever produced", "It was only available in Latin", "B"),
                new McQuestion("The word \"multifaceted\" in paragraph 3 is closest in meaning to:", "Limited", "Having many aspects", "Temporary", "Controversial", "B"),
                new McQuestion("According to the passage, how did the printing press help the Protestant Reformation?", "It allowed Luther to personally distribute his writings across Europe", "It enabled rapid printing and distribution of Luther's writings", "It prevented the Catholic Church from publishing counter-arguments", "It translated religious texts into every European language", "B"),
                new McQuestion("What role did the printing press play in the Scientific Revolution?", "It allowed scientists to keep findings secret", "It enabled wide distribution and peer review of scientific findings", "It replaced the need for experiments", "It was primarily used for printing fiction", "B"),
                new McQuestion("The phrase \"informed public sphere\" in the last paragraph refers to:", "A specific government institution", "A society where citizens have access to information and can engage in discourse", "A type of printed publication", "An scientific research community", "B"),
                new McQuestion("Why does the author mention the standardization of languages?", "To argue that printing destroyed linguistic diversity", "To illustrate another significant cultural impact of the printing press", "To criticize modern spelling conventions", "To explain why Latin declined", "B"),
                new McQuestion("What can be inferred from the passage about pre-printing-press Europe?", "Most people had access to a wide variety of books", "Knowledge was largely controlled by a small privileged class", "Monks preferred not to produce books", "Scientific knowledge was widely shared", "B"),
            }
        },
    };

    private static readonly List<FillInParagraph> FillInParagraphs = new()
    {
        new FillInParagraph
        {
            Paragraph = "Traveling to new places can be an exc____ing experience for many people. It a__ows individuals to le___n about different cultures and tra____ions. Many travelers en___y tasting lo___l food and mee___g new people. Visiting museums and histo____ sites can also he__ visitors understand a city's pa___. Although travel can sometimes be expen___ve, many peo___ believe the memories they ga__ are worth it.",
            Answers = new() { "it", "ll", "ar", "dit", "jo", "ca", "tin", "ric", "lp", "st" }
        },
        new FillInParagraph
        {
            Paragraph = "The oce___ covers more than seventy per___nt of Earth's sur___ce and plays a vi___l role in regulating climate. It ab___rbs heat from the sun and helps dist___bute it around the pla__t. The ocean is also ho__ to millions of species of fish, pla___s, and other orga____ms. Scientists cont____e to explore the deep sea to learn mo__ about this fascinating enviro____ent.",
            Answers = new() { "an", "ce", "fa", "ta", "so", "ri", "ne", "me", "nt", "nu" }
        },
        new FillInParagraph
        {
            Paragraph = "Technology has tra____ormed how people comm____cate with each other. Smartpho___s and social me___ platforms allow instant mes___ging across long dis____ces. Many bus____sses now rely on video conf____ncing tools for remote meet___gs. However, some experts wa__ that excessive screen ti___ may negatively affect mental hea____.",
            Answers = new() { "nsf", "uni", "ne", "dia", "sag", "tan", "ine", "ere", "in", "rn", "me", "lth" }
        },
        new FillInParagraph
        {
            Paragraph = "Climate cha___ is one of the most ser____us challenges facing human____. Rising tempera____res are causing ice caps to me___, sea levels to ri___, and weather pat____ns to become more extr___. Scientists ag___ that reducing car___ emissions is ess____ial to prevent further envir____mental damage.",
            Answers = new() { "nge", "iou", "ity", "tur", "lt", "se", "ter", "eme", "ree", "bon", "ent", "onm" }
        },
    };

    private static readonly List<Notice> Notices = new()
    {
        new Notice
        {
            Text = @"Dear Customers,

Starting next month, all account statements will be available through our secure online banking system. Customers who prefer digital statements can easily enroll in paperless billing. This service helps reduce paper waste and allows you to access your financial records anytime.

Thank you for banking with us.",
            Questions = new()
            {
                new McQuestion("What type of business issued the notice?", "An Internet provider", "A computer company", "A paper company", "A bank", "D"),
                new McQuestion("How can customers enroll in paperless billing?", "By visiting an office", "By accessing the website", "By using the app", "By calling customer service", "B"),
            }
        },
        new Notice
        {
            Text = @"Office Notice

All employees are reminded that the office parking lot will be closed on Friday morning for maintenance work. Staff members are encouraged to use the public parking garage across the street during this time. The parking lot will reopen at 1:00 PM.

Thank you for your cooperation.",
            Questions = new()
            {
                new McQuestion("What type of organization issued the notice?", "A restaurant", "An office", "A hospital", "A school", "B"),
                new McQuestion("What should employees do Friday morning?", "Work from home", "Leave work early", "Use another parking area", "Avoid coming to work", "C"),
            }
        },
        new Notice
        {
            Text = @"Library Announcement

The university library will be extending its hours during final exam week. Starting December 10th, the library will remain open 24 hours a day until December 17th. Additional study rooms and computer stations will be available. Students are reminded to bring their ID cards for late-night access.

Good luck with your exams!",
            Questions = new()
            {
                new McQuestion("What is the main purpose of the notice?", "To announce new library rules", "To inform students about extended library hours", "To advertise library services", "To remind students about ID cards", "B"),
                new McQuestion("When will the extended hours begin?", "December 9th", "December 10th", "December 17th", "During all exam weeks", "B"),
            }
        },
    };

    private static readonly List<SocialMediaPost> SocialMediaPosts = new()
    {
        new SocialMediaPost
        {
            Text = @"Last Saturday I visited the Riverside Weekend Market, and it was fantastic! The market had dozens of small stands selling fresh fruits, handmade crafts, and local snacks. I especially enjoyed the homemade bread and fresh lemonade. There was also live music, which made the atmosphere very lively and fun. If you live nearby or plan to visit the area, I highly recommend stopping by on Saturday morning. It's a great place to support local businesses and spend time with friends or family.",
            Questions = new()
            {
                new McQuestion("What is the main purpose of the post?", "To complain about a market", "To advertise a music concert", "To recommend visiting a local market", "To explain how markets operate", "C"),
                new McQuestion("What did the writer especially enjoy?", "Handmade jewelry", "Fresh bread and lemonade", "The parking area", "Buying vegetables", "B"),
                new McQuestion("When does the writer recommend visiting the market?", "Friday evening", "Saturday morning", "Sunday night", "Monday afternoon", "B"),
            }
        },
        new SocialMediaPost
        {
            Text = @"I finally tried the new café that opened downtown last week, and I was pleasantly surprised. The café has a calm atmosphere and comfortable seating, which makes it perfect for studying or reading. Their coffee tastes fresh, and they also serve delicious pastries. I ordered a chocolate croissant, and it was amazing. The staff members were friendly and helpful as well. If you enjoy quiet places where you can relax or work on your laptop, this café is definitely worth a visit.",
            Questions = new()
            {
                new McQuestion("What is the main purpose of the post?", "To criticize a café", "To recommend a new café", "To explain how coffee is made", "To compare several restaurants", "B"),
                new McQuestion("What did the writer eat?", "A sandwich", "A muffin", "A chocolate croissant", "A bagel", "C"),
                new McQuestion("What does the writer say about the café atmosphere?", "It is very noisy", "It is calm and comfortable", "It is crowded and busy", "It is expensive", "B"),
            }
        },
        new SocialMediaPost
        {
            Text = @"Just got back from a weekend camping trip in the mountains, and it was exactly what I needed! We hiked to a beautiful lake surrounded by pine trees and set up our tents nearby. The night sky was incredible — I've never seen so many stars. We spent the evenings cooking over the campfire and telling stories. The only downside was the mosquitoes, but bug spray helped. If you're feeling stressed and need a break from city life, I highly recommend disconnecting and spending time in nature.",
            Questions = new()
            {
                new McQuestion("What is the main purpose of the post?", "To share a positive camping experience", "To complain about mosquitoes", "To promote a camping gear store", "To teach survival skills", "A"),
                new McQuestion("What did the writer particularly enjoy?", "The hotel accommodations", "The starry night sky", "Shopping for camping equipment", "Driving through the mountains", "B"),
                new McQuestion("What problem did the writer encounter?", "Bad weather", "Mosquitoes", "Broken equipment", "Getting lost", "B"),
            }
        },
    };

    private static readonly List<AcademicPassage> AcademicPassages = new()
    {
        new AcademicPassage
        {
            Text = @"Sleep is an important biological process that helps the body and mind recover from daily activities. Scientists believe that sleep plays a key role in memory, learning, and overall health. During sleep, the brain processes information collected throughout the day and stores it in long-term memory.

Researchers have discovered that people who regularly get enough sleep often perform better in school and at work. Lack of sleep, on the other hand, can cause problems such as difficulty concentrating, mood changes, and weaker immune systems. Over time, chronic sleep deprivation may also increase the risk of health problems including heart disease and diabetes.

Sleep occurs in several stages, including light sleep, deep sleep, and rapid eye movement (REM) sleep. Each stage serves a different function. For example, deep sleep is believed to help the body repair tissues and restore energy, while REM sleep is strongly connected to dreaming and emotional processing.

Because sleep is so essential, health experts recommend that adults aim for seven to nine hours of sleep each night.",
            Questions = new()
            {
                new McQuestion("What is the passage mainly about?", "How people remember dreams", "Why sleep is important for health and learning", "The history of sleep research", "How to avoid sleeping too much", "B"),
                new McQuestion("The word \"chronic\" in the passage is closest in meaning to", "temporary", "long-lasting", "surprising", "minor", "B"),
                new McQuestion("According to the passage, what happens during sleep?", "The brain stops working completely", "The body stops using energy", "The brain processes information", "People forget what they learned", "C"),
                new McQuestion("According to the passage, all of the following are true EXCEPT:", "Sleep helps memory and learning", "Lack of sleep may cause concentration problems", "Deep sleep helps repair the body", "Sleep has no connection to health problems", "D"),
                new McQuestion("Why does the author mention REM sleep?", "To describe a stage related to dreaming", "To explain how to fall asleep faster", "To show that REM sleep is dangerous", "To compare sleep with exercise", "A"),
            }
        },
        new AcademicPassage
        {
            Text = @"Urban parks are important features of modern cities. These green spaces provide residents with opportunities to relax, exercise, and spend time outdoors. In crowded urban environments, parks often serve as valuable places where people can escape from noise and pollution.

Studies have shown that access to parks can improve both physical and mental health. For example, people who walk or jog in parks often experience lower stress levels and better cardiovascular health. Children who play in natural environments may also develop stronger creativity and social skills.

Urban parks also provide environmental benefits. Trees and plants help clean the air by absorbing pollutants and producing oxygen. They also provide habitats for birds and insects, supporting biodiversity within cities.

Because of these advantages, many city planners now emphasize the importance of creating and maintaining parks. Well-designed parks can greatly improve the quality of life for urban residents.",
            Questions = new()
            {
                new McQuestion("What is the passage mainly about?", "The history of city parks", "The benefits of urban parks", "The problems of living in cities", "The design of playground equipment", "B"),
                new McQuestion("The word \"residents\" in the passage is closest in meaning to", "visitors", "workers", "people who live in a place", "tourists", "C"),
                new McQuestion("According to the passage, parks can help people", "reduce stress", "avoid exercise", "increase pollution", "work longer hours", "A"),
                new McQuestion("According to the passage, all of the following are true EXCEPT:", "Parks provide environmental benefits", "Trees help improve air quality", "Parks increase city pollution", "Parks support biodiversity", "C"),
                new McQuestion("Why does the author mention children playing in natural environments?", "To explain a benefit of parks", "To criticize city schools", "To describe playground safety", "To compare children and adults", "A"),
            }
        },
        new AcademicPassage
        {
            Text = @"Renewable energy sources such as solar and wind power are becoming increasingly important as societies seek alternatives to fossil fuels. Unlike coal, oil, and natural gas, renewable energy sources produce little or no greenhouse gas emissions, making them essential tools in combating climate change.

Solar energy harnesses the power of sunlight through photovoltaic panels that convert light into electricity. The technology has improved dramatically over the past decade, with solar panels becoming more efficient and affordable. Many homeowners and businesses now install solar panels to reduce their electricity bills and carbon footprints.

Wind energy is another rapidly growing renewable resource. Wind turbines convert the kinetic energy of moving air into electrical power. Large wind farms, often located in coastal areas or open plains where wind is strongest, can generate enough electricity to power thousands of homes. Offshore wind farms, built in ocean waters, are particularly effective because ocean winds tend to be stronger and more consistent than those on land.

Despite these advantages, renewable energy faces some challenges. Solar and wind power are intermittent — they only generate electricity when the sun shines or the wind blows. This variability requires effective energy storage systems, such as large batteries, to ensure a stable power supply. Additionally, building renewable energy infrastructure requires significant upfront investment, although costs continue to decline as technology advances.",
            Questions = new()
            {
                new McQuestion("What is the main topic of the passage?", "The history of fossil fuels", "The advantages and challenges of renewable energy", "How to build solar panels", "The cost of electricity for homeowners", "B"),
                new McQuestion("The word \"harnesses\" in paragraph 2 is closest in meaning to", "releases", "wastes", "captures and uses", "avoids", "C"),
                new McQuestion("According to the passage, why are offshore wind farms particularly effective?", "They are cheaper to build", "Ocean winds are stronger and more consistent", "They require less maintenance", "They do not affect marine life", "B"),
                new McQuestion("What challenge does the passage mention regarding renewable energy?", "Renewable energy produces too much pollution", "Solar and wind power are intermittent", "Renewable energy is always more expensive than fossil fuels", "There are no suitable locations for wind farms", "B"),
                new McQuestion("What does the author suggest about the future of renewable energy costs?", "Costs will remain unchanged", "Costs are declining as technology improves", "Costs are becoming prohibitively expensive", "Costs are only relevant for large businesses", "B"),
            }
        },
    };

    #endregion

    #region Listening Conversations

    private static readonly List<ListeningConv> ListeningConversations = new()
    {
        new ListeningConv
        {
            Title = "Student and Academic Advisor",
            Dialogue = new()
            {
                new("Student", "Hi, Professor Martinez. Thanks for meeting with me. I wanted to discuss my course schedule for next semester."),
                new("Advisor", "Of course, Sarah. What are you thinking about?"),
                new("Student", "Well, I'm majoring in Environmental Science, and I need to fulfill my statistics requirement. I'm debating between STAT 201 and STAT 301."),
                new("Advisor", "Those are quite different courses. STAT 201 is introductory and covers basic concepts — means, medians, probability distributions. STAT 301 is much more advanced. It focuses on regression analysis, hypothesis testing, and research applications."),
                new("Student", "I took Calculus II last year and did pretty well, but I've heard STAT 301 is really challenging."),
                new("Advisor", "It is rigorous, but given your math background, you could handle it. However, STAT 201 might be more practical for your field. Environmental studies often require data analysis skills, and the intro course teaches you foundational concepts you'll use in your capstone research project."),
                new("Student", "That makes sense. I think I'll go with 201 then. Also, do you know if the new Marine Biology elective has any prerequisites?"),
                new("Advisor", "Yes, you need BIO 102 or equivalent. Have you taken that?"),
                new("Student", "I have! Great, I'll add that too. Thanks so much for your help."),
            },
            Questions = new()
            {
                new McQuestion("Why does the student visit her advisor?", "To complain about a grade", "To discuss her course schedule for next semester", "To request a change of major", "To ask about graduation requirements", "B"),
                new McQuestion("What is the student's major?", "Statistics", "Environmental Science", "Marine Biology", "Mathematics", "B"),
                new McQuestion("What does the advisor suggest about STAT 301?", "It is easy for all students", "It is rigorous but manageable with a math background", "It should be avoided entirely", "It is required for all science majors", "B"),
                new McQuestion("Why does the student choose STAT 201?", "It has no homework", "It is more practical for environmental studies", "It is required by the university", "The advisor refuses to approve STAT 301", "B"),
                new McQuestion("What prerequisite is needed for the Marine Biology elective?", "STAT 201", "CHEM 101", "BIO 102 or equivalent", "No prerequisite is required", "C"),
            }
        },

        new ListeningConv
        {
            Title = "Student and Library Staff",
            Dialogue = new()
            {
                new("Student", "Excuse me, I'm looking for journal articles on renewable energy for my research paper, but I can't find what I need in the online database."),
                new("Librarian", "Sure, I can help. Which database have you been searching?"),
                new("Student", "I've been using the general academic search, but most of the results are either too old or not specific enough."),
                new("Librarian", "For renewable energy topics, I'd recommend trying the Environmental Science & Technology database. It has much more focused results. Also, have you tried using Boolean operators in your search — like AND, OR, and NOT?"),
                new("Student", "I've used AND, but not the others. How would that help?"),
                new("Librarian", "Well, if you search for 'solar energy AND efficiency NOT residential,' you'll filter out papers about home solar panels and focus on industrial or research-level studies. Let me show you on this computer."),
                new("Student", "Oh, that's exactly what I need. Can I also get access to articles behind paywalls?"),
                new("Librarian", "Absolutely. As a student, you have access through our institutional subscriptions. Just make sure you're logged in with your university ID. If you find an article we don't have, you can submit an interlibrary loan request and we'll get it from another university, usually within 48 hours."),
                new("Student", "That's amazing. I didn't know about the interlibrary loan option. Thank you!"),
            },
            Questions = new()
            {
                new McQuestion("Why does the student approach the librarian?", "To return overdue books", "To get help finding specific journal articles for a research paper", "To apply for a library job", "To complain about library hours", "B"),
                new McQuestion("What database does the librarian recommend?", "The general academic search", "Google Scholar", "Environmental Science & Technology database", "The university's main catalog", "C"),
                new McQuestion("How do Boolean operators help in searching?", "They translate articles into other languages", "They help filter and refine search results", "They speed up the internet connection", "They automatically download articles", "B"),
                new McQuestion("How can the student access articles behind paywalls?", "By paying individually for each article", "Through the university's institutional subscriptions", "By contacting the article authors directly", "Paywall articles are never accessible", "B"),
                new McQuestion("What is the interlibrary loan service?", "A system for borrowing books from other students", "A program that obtains materials from other universities", "A way to extend book return deadlines", "A loan program to help students buy textbooks", "B"),
            }
        },

        new ListeningConv
        {
            Title = "Student and Housing Office",
            Dialogue = new()
            {
                new("Student", "Hi, I'm a sophomore and I'd like to change my dormitory assignment for next semester. Is that possible?"),
                new("Housing Officer", "It depends on availability. What's the reason for the request?"),
                new("Student", "My current room is right next to the laundry room, and the noise from the machines makes it really hard to study, especially late at night."),
                new("Housing Officer", "I understand. That's actually a common complaint about that wing. We do have a few openings in Baker Hall, which is the quiet-study residence. Quiet hours start at 8 PM there instead of 11 PM."),
                new("Student", "That sounds perfect. Would I need to pay any additional fees for the transfer?"),
                new("Housing Officer", "Baker Hall rooms are the same rate as your current assignment, so there wouldn't be any extra cost. However, you'd need to complete a transfer form and have your current RA sign off on it. The deadline for next semester transfers is October 15th."),
                new("Student", "Great. Can I pick up the form here?"),
                new("Housing Officer", "You can, or you can download it from the housing portal online. I'd recommend doing it soon — Baker Hall fills up quickly because of its reputation as a study-friendly environment."),
            },
            Questions = new()
            {
                new McQuestion("Why does the student want to change rooms?", "The room is too small", "Noise from nearby laundry machines disrupts studying", "The roommate is incompatible", "The building is too far from classes", "B"),
                new McQuestion("What is special about Baker Hall?", "It has the largest rooms on campus", "It has earlier quiet hours, starting at 8 PM", "It is reserved for graduate students", "It has its own dining hall", "B"),
                new McQuestion("What does the student need to complete the transfer?", "A written essay explaining the request", "A transfer form signed by the current RA", "A meeting with the university president", "A medical certificate", "B"),
                new McQuestion("What is the deadline for transfer requests?", "September 1st", "October 15th", "December 1st", "There is no deadline", "B"),
                new McQuestion("Why does the housing officer suggest acting quickly?", "The form is complicated", "Baker Hall fills up fast due to its popularity", "The fees increase after a certain date", "The RA is leaving soon", "B"),
            }
        },
    };

    #endregion

    #region Listening Lectures

    private static readonly List<ListeningLecture> ListeningLectures = new()
    {
        new ListeningLecture
        {
            Title = "Art History – Impressionism",
            Text = @"**Professor:** Today we're going to talk about Impressionism, one of the most revolutionary art movements in Western history. Now, when we think of Impressionism, names like Claude Monet, Pierre-Auguste Renoir, and Edgar Degas immediately come to mind. But what made this movement so radical in the 1870s?

The key break from tradition was the Impressionists' rejection of the academic painting standards that had dominated European art for centuries. The French Academy expected paintings to have smooth, polished surfaces, historical or mythological subjects, and precise, realistic detail. The Impressionists, by contrast, painted everyday scenes — landscapes, cafés, leisure activities — using visible brushstrokes, vibrant colors, and an emphasis on capturing the fleeting effects of natural light.

Monet's ""Impression, Sunrise,"" painted in 1872, actually gave the movement its name — and it wasn't meant as a compliment. A critic named Louis Leroy used the title mockingly, saying the painting was just an ""impression"" rather than a finished work. But that captures exactly what these artists were trying to do: convey a momentary visual impression rather than a detailed, photographic reproduction of reality.

One important thing about the Impressionists — they often painted outdoors, or ""en plein air."" The development of portable paint tubes made this practical for the first time. Before that, artists had to mix pigments in their studios. Working outdoors allowed them to observe and capture natural light directly, which is why their paintings have such luminous, dynamic quality.",
            Questions = new()
            {
                new McQuestion("What is the main topic of the lecture?", "The biography of Claude Monet", "The Impressionist movement and what made it revolutionary", "Techniques for mixing paint pigments", "The history of the French Academy", "B"),
                new McQuestion("According to the professor, the French Academy expected paintings to feature:", "Everyday scenes and visible brushstrokes", "Smooth surfaces and historical or mythological subjects", "Portable paint tubes and outdoor settings", "Abstract shapes and bright colors", "B"),
                new McQuestion("How did the Impressionist movement get its name?", "Monet chose it as a deliberate artistic statement", "A critic used it mockingly based on a Monet painting title", "The French Academy officially designated them as Impressionists", "It was named after a famous art collector", "B"),
                new McQuestion("What does \"en plein air\" mean?", "In the Academy", "Outdoors, in the open air", "In a dark studio", "Under artificial light", "B"),
                new McQuestion("What technological development made outdoor painting practical?", "The invention of photography", "The development of portable paint tubes", "Electric lighting", "New types of canvas", "B"),
                new McQuestion("What can be inferred about the art establishment's initial reaction to Impressionism?", "It was immediately celebrated", "It was initially dismissed or criticized", "It was completely ignored", "It was supported by the French government", "B"),
            }
        },

        new ListeningLecture
        {
            Title = "Biology – Animal Migration Patterns",
            Text = @"**Professor:** Let's discuss one of the most fascinating phenomena in the animal kingdom — migration. Every year, billions of animals undertake long-distance journeys, sometimes spanning thousands of miles, driven by the need to find food, suitable breeding grounds, or favorable climate conditions.

Perhaps the most well-known example is the Arctic tern, which holds the record for the longest migration of any animal. These small seabirds travel roughly 44,000 miles annually, flying from their Arctic breeding grounds to the Antarctic and back. Over a 30-year lifespan, that's equivalent to traveling to the moon and back three times.

But how do animals navigate such enormous distances? Research has identified several mechanisms. Many birds use the Earth's magnetic field as a compass — they have magnetite crystals in their beaks that help them detect magnetic field lines. Other species rely on celestial navigation, using the position of the sun during the day and the stars at night. Salmon famously return to the exact stream where they were born to spawn, and they accomplish this primarily through their extraordinary sense of smell, detecting unique chemical signatures in the water.

What's really interesting from an ecological perspective is how climate change is disrupting these patterns. Some species are migrating earlier in the spring or later in the autumn. In some cases, the timing of migration no longer aligns with the availability of food resources at the destination — a phenomenon ecologists call ""phenological mismatch."" For example, some bird species arrive at their breeding grounds only to find that the insects they depend on have already peaked in abundance weeks earlier.",
            Questions = new()
            {
                new McQuestion("What is the lecture mainly about?", "The Arctic tern exclusively", "Animal migration patterns, navigation, and climate impacts", "How salmon reproduce", "Magnetic field research", "B"),
                new McQuestion("How far does an Arctic tern travel annually?", "About 5,000 miles", "About 20,000 miles", "About 44,000 miles", "About 100,000 miles", "C"),
                new McQuestion("Which navigation mechanism do many birds use?", "GPS technology", "Earth's magnetic field via magnetite crystals", "Following human-made landmarks", "Sound-based echolocation", "B"),
                new McQuestion("How do salmon find their way back to their birth stream?", "By following other salmon", "By detecting unique chemical signatures through smell", "By using magnetic crystals", "By following ocean currents", "B"),
                new McQuestion("What is \"phenological mismatch\"?", "When animals migrate to the wrong location", "When migration timing no longer aligns with food resource availability", "When two species compete for the same habitat", "When animals fail to reproduce", "B"),
                new McQuestion("What is a consequence of phenological mismatch mentioned in the lecture?", "Birds arrive too late to find adequate insect food", "Salmon cannot detect chemical signatures", "Arctic terns fly shorter distances", "Magnetic fields become unreliable", "A"),
            }
        },

        new ListeningLecture
        {
            Title = "Psychology – Memory Formation and Sleep",
            Text = @"**Professor:** Today I want to talk about the relationship between sleep and memory — specifically, how sleep plays an essential role in consolidating memories. This has been one of the most active areas of neuroscience research over the past two decades.

So first, let's distinguish between two types of memory. Declarative memory refers to facts and events — things you can consciously recall, like historical dates or what you had for breakfast. Procedural memory, on the other hand, involves skills and habits — things like riding a bicycle or playing a musical instrument.

Research shows that different stages of sleep benefit different types of memory. Slow-wave sleep, which is the deepest stage of non-REM sleep, appears to be particularly important for consolidating declarative memories. During this phase, the brain essentially ""replays"" experiences from the day, transferring information from the hippocampus — where short-term memories are initially stored — to the neocortex for long-term storage. This process is sometimes called ""memory replay.""

REM sleep — that's the stage associated with vivid dreaming — seems to be more important for procedural memory and emotional memory processing. Studies have found that musicians who practice a new piece and then get a full night's sleep perform significantly better the next day than those who are sleep-deprived, even if the sleep-deprived group spends extra time practicing.

One really compelling study had participants learn a list of words in the evening. Half slept normally, and half were kept awake. The next morning, the group that slept recalled about 40 percent more words. But here's the interesting part — the sleep group didn't just remember more words, they also showed better ability to identify patterns among the words that they hadn't explicitly been told about. This suggests that sleep doesn't just preserve memories — it actively reorganizes and integrates them.",
            Questions = new()
            {
                new McQuestion("What is the main topic of the lecture?", "The history of sleep research", "How sleep contributes to memory consolidation", "The causes of insomnia", "Differences between REM and non-REM sleep exclusively", "B"),
                new McQuestion("What is the difference between declarative and procedural memory?", "Declarative is unconscious; procedural is conscious", "Declarative involves facts and events; procedural involves skills and habits", "They are the same type of memory", "Declarative is long-term; procedural is short-term", "B"),
                new McQuestion("Which sleep stage is most important for declarative memory?", "REM sleep", "Light sleep", "Slow-wave (deep non-REM) sleep", "The dreaming stage", "C"),
                new McQuestion("What is \"memory replay\"?", "Dreaming about future events", "The brain replaying daily experiences during deep sleep to consolidate them", "Practicing a skill while sleeping", "Forgetting unimportant information", "B"),
                new McQuestion("What did the word-list study reveal about sleep and memory?", "Sleep had no effect on recall", "The sleep group recalled about 40% more words and found hidden patterns", "The awake group performed better due to extra practice time", "Only REM sleep improved recall", "B"),
                new McQuestion("What can be inferred from the lecture about sleep deprivation?", "It has no effect on learning", "It can significantly impair memory consolidation and learning", "It only affects procedural memory", "It improves creative thinking", "B"),
            }
        },
    };

    #endregion

    #region Speaking Tasks

    private static readonly List<string> SpeakingTask1 = new()
    {
        "Some people prefer to study alone, while others prefer to study in a group. Which do you prefer and why? Use specific reasons and examples to support your answer.",
        "Do you agree or disagree with the following statement? It is better to live in a small town than in a big city. Use specific reasons and details to explain your choice.",
        "Some people believe that university students should be required to attend classes, while others believe that attending classes should be optional. Which point of view do you agree with? Use specific reasons and details to explain your answer.",
        "If you could change one thing about your hometown, what would you change? Use specific reasons and details to explain your answer.",
        "Some people think that it is important to travel to learn about other cultures, while others think you can learn about other cultures through books and the internet. Which do you prefer and why?",
        "Do you agree or disagree that technology has made our lives easier? Use specific reasons and examples to support your answer.",
    };

    private static readonly List<SpeakingIntegrated> SpeakingTask2 = new()
    {
        new SpeakingIntegrated
        {
            Reading = "University Announces New Bike-Share Program\n\nBeginning next month, the university will launch a bike-share program to promote sustainable transportation on campus. Students and faculty can rent bikes from stations located near major buildings using their university ID cards. The first hour of each rental will be free, with a small fee for additional time. This initiative aims to reduce parking congestion and carbon emissions while encouraging physical activity.",
            Listening = "The man thinks the bike-share program is a great idea. He mentions that parking has become a nightmare — last week he spent 20 minutes looking for a spot and was late to his biology exam. He also points out that riding bikes between classes would be faster than walking, especially since the engineering building is a 15-minute walk from the library. The woman, however, is concerned about what happens when it rains, since the campus gets a lot of precipitation in the fall.",
            Question = "The man expresses his opinion about the bike-share program. State his opinion and explain the reasons he gives for holding that opinion."
        },
        new SpeakingIntegrated
        {
            Reading = "Library to Extend Operating Hours\n\nStarting November 1st, the university library will extend its hours of operation. The library will now remain open until 2:00 AM Sunday through Thursday, an increase from the current closing time of 11:00 PM. This change was made in response to a student government petition signed by over 2,000 students who requested more late-night study space during midterm and final exam periods.",
            Listening = "The woman is very happy about the extended hours. She says she works part-time until 8 PM most nights and by the time she gets to the library, she only has a couple of hours to study before it closes. With the new hours, she'll have until 2 AM. The man agrees but wonders about safety, since walking across campus that late could be risky. The woman points out that the university already has a night escort service that operates until 3 AM.",
            Question = "The woman expresses her opinion about the library's extended hours. State her opinion and explain the reasons she gives for holding that opinion."
        },
        new SpeakingIntegrated
        {
            Reading = "University to Replace Paper Textbooks with Digital Editions\n\nBeginning next academic year, the university will transition to digital textbooks for all introductory courses. Students will receive access to e-textbooks through the university's online learning platform at a flat fee of $200 per semester, significantly less than the average $600 students currently spend on physical textbooks. The university believes this change will reduce costs and ensure all students have materials on the first day of class.",
            Listening = "The man is skeptical about the change. He says he personally learns better from physical books because he likes highlighting and writing in the margins. He tried using an e-textbook last semester and found it hard to concentrate when reading on a screen for long periods. The woman disagrees — she says digital textbooks are searchable, lighter to carry, and the cost savings are significant. She also notes that many e-textbook platforms allow digital highlighting and annotation.",
            Question = "The man expresses his opinion about the switch to digital textbooks. State his opinion and explain the reasons he gives for holding that opinion."
        },
    };

    private static readonly List<SpeakingIntegrated> SpeakingTask3 = new()
    {
        new SpeakingIntegrated
        {
            Reading = "Social Facilitation\n\nSocial facilitation is a concept in psychology that describes the tendency for people to perform better on simple or well-practiced tasks when they are in the presence of others, compared to when they are alone. This effect was first observed by psychologist Norman Triplett in 1898, who noticed that cyclists rode faster when racing against others than when cycling alone. Later research showed that the presence of others can actually impair performance on complex or unfamiliar tasks.",
            Listening = "The professor gives an example from his own experience. He describes a study where participants were asked to do two tasks: tying their shoes (a simple, well-practiced task) and solving difficult math problems (a complex task). When observed by others, people tied their shoes faster but made more errors on the math problems. He also mentions a personal example — when he plays guitar at home, he plays his favorite songs perfectly, but when he performs at a faculty concert, he sometimes makes mistakes on difficult new pieces while playing simple songs even better than usual.",
            Question = "Using the example from the lecture, explain the concept of social facilitation."
        },
        new SpeakingIntegrated
        {
            Reading = "The Mere Exposure Effect\n\nThe mere exposure effect is a psychological phenomenon in which people tend to develop a preference for things simply because they are familiar with them. First studied by psychologist Robert Zajonc in 1968, the effect has been demonstrated across many domains — from faces and words to music and art. The effect occurs even when people are unaware of their prior exposure, suggesting that it operates at a subconscious level.",
            Listening = "The professor illustrates the mere exposure effect with a music industry example. She explains that radio stations deliberately play new songs repeatedly because research shows listeners who initially dislike a song gradually come to enjoy it after hearing it multiple times. She also describes an experiment where participants were shown a series of unfamiliar Chinese characters. Later, when asked which characters they preferred, participants consistently chose the ones they had seen before — even though they couldn't recall having seen them and didn't know what any of the characters meant.",
            Question = "Using the examples from the lecture, explain how the mere exposure effect works."
        },
    };

    private static readonly List<SpeakingAcademic> SpeakingTask4 = new()
    {
        new SpeakingAcademic
        {
            Listening = "The professor discusses two strategies that animals use to survive in extremely cold environments. The first is migration — moving to warmer areas when temperatures drop. She uses the example of caribou in North America, which travel up to 3,000 miles annually from their summer grazing grounds in the Arctic tundra to the warmer boreal forests in the south. The second strategy is hibernation — entering a state of reduced metabolic activity. She describes how ground squirrels can lower their body temperature to just above freezing and reduce their heart rate from 200 beats per minute to about 5, allowing them to survive for months without eating.",
            Question = "Using the points and examples from the lecture, explain two strategies animals use to survive in cold environments."
        },
        new SpeakingAcademic
        {
            Listening = "The professor talks about two types of symbiotic relationships in nature. The first is mutualism, where both species benefit. She gives the example of clownfish and sea anemones — the clownfish gets protection from predators by living among the anemone's stinging tentacles, while the clownfish's waste provides nutrients to the anemone and its movements increase water circulation. The second type is commensalism, where one species benefits while the other is neither helped nor harmed. The professor uses the example of cattle egrets, birds that follow grazing cattle. As cattle move through grass, they stir up insects, which the egrets then eat. The cattle are unaffected by the birds' presence.",
            Question = "Using the points and examples from the lecture, explain the two types of symbiotic relationships discussed."
        },
    };

    #endregion

    #region Writing Tasks

    private static readonly List<WritingIntegrated> WritingTask1 = new()
    {
        new WritingIntegrated
        {
            Reading = @"The use of artificial intelligence in medical diagnosis presents several significant advantages. First, AI systems can analyze vast amounts of medical data far more quickly than human doctors, potentially identifying patterns and correlations that might otherwise be missed. A single AI system can review thousands of medical images in the time it takes a radiologist to examine one.

Second, AI diagnostic tools can provide consistent results without being affected by fatigue, stress, or cognitive biases that sometimes influence human judgment. Studies have shown that diagnostic accuracy among human physicians can vary depending on the time of day, workload, and other factors.

Third, AI-powered systems can make medical expertise more accessible, particularly in rural or underserved areas where specialist doctors may not be available. Telemedicine platforms equipped with AI diagnostic capabilities could provide preliminary diagnoses and treatment recommendations to patients who otherwise might have to travel hundreds of miles to see a specialist.",
            Listening = @"The professor challenges each of the reading's points. First, regarding speed, she notes that while AI can process data quickly, it can also make rapid errors. She describes a case where an AI system misdiagnosed thousands of patients because it had been trained on biased data — the mistakes were only caught months later. Speed without accuracy, she argues, is not an advantage.

Second, on consistency, the professor points out that consistency can be a disadvantage when the AI has learned the wrong patterns. Unlike human doctors, AI systems cannot explain their reasoning, making it difficult to catch systematic errors. A doctor can describe why they made a diagnosis, but an AI system often functions as a 'black box.'

Third, regarding accessibility, the professor warns that relying on AI in underserved areas could create a two-tiered healthcare system where wealthy urban patients see real doctors while rural patients receive only AI-generated recommendations. She argues this could actually worsen healthcare inequality rather than improve it.",
            Question = "Summarize the points made in the lecture, explaining how they cast doubt on the specific points made in the reading passage."
        },
        new WritingIntegrated
        {
            Reading = @"Remote work has become increasingly common, and many argue it offers substantial benefits to both employees and employers. First, remote work eliminates commuting time, which averages 27 minutes each way in the United States. This saved time — nearly an hour daily — can be devoted to productive work or personal well-being, leading to improved work-life balance.

Second, companies that allow remote work can reduce overhead costs significantly. Office space, utilities, and maintenance represent major expenses. A study by Global Workplace Analytics estimated that employers can save an average of $11,000 per year for each employee who works remotely half the time.

Third, remote work expands the talent pool for employers, as they are no longer limited to hiring candidates who live within commuting distance. This is particularly beneficial for specialized positions where qualified candidates may be scarce in the local area. Companies can recruit the best talent regardless of geographic location.",
            Listening = @"The professor presents counterarguments to each point. First, she acknowledges that commuting time is saved but argues that many remote workers actually work longer hours because the boundary between work and personal life becomes blurred. Studies show remote workers are 40% more likely to experience burnout because they find it difficult to 'switch off.'

Second, while companies save on office costs, the professor notes there are hidden expenses. Companies often need to provide equipment, cybersecurity systems, and IT support for remote workers. Additionally, the cost of coordinating distributed teams — multiple software subscriptions, virtual meeting tools, and the time spent on video calls — can be substantial.

Third, regarding the talent pool, the professor points out that remote work creates management challenges. Time zone differences can make collaboration difficult, cultural differences may cause miscommunication, and building team cohesion is much harder when employees never meet in person. She cites research showing that remote teams take 20% longer to complete collaborative projects.",
            Question = "Summarize the points made in the lecture, explaining how they challenge the specific claims made in the reading passage."
        },
    };

    private static readonly List<string> WritingTask2 = new()
    {
        "Do you agree or disagree with the following statement?\n\n\"The best way to improve education is to increase teachers' salaries.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
        "Do you agree or disagree with the following statement?\n\n\"People today spend too much time on their smartphones and other electronic devices.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
        "Do you agree or disagree with the following statement?\n\n\"It is more important for students to study science and mathematics than the arts and humanities.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
        "Do you agree or disagree with the following statement?\n\n\"Success in life comes more from taking risks than from careful planning.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
        "Do you agree or disagree with the following statement?\n\n\"Governments should invest more money in public transportation rather than building new roads for private vehicles.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
        "Do you agree or disagree with the following statement?\n\n\"Learning from personal experience is the best way to gain knowledge.\"\n\nUse specific reasons and examples to support your answer. Write at least 300 words.",
    };

    #endregion

    // ───────────────────── RECORD TYPES ─────────────────────

    public record ReadingPassage
    {
        public string Title { get; init; } = "";
        public string Text { get; init; } = "";
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record McQuestion(string Stem, string A, string B, string C, string D, string Answer);

    public record FillInParagraph
    {
        public string Paragraph { get; init; } = "";
        public List<string> Answers { get; init; } = new();
    }

    public record Notice
    {
        public string Text { get; init; } = "";
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record SocialMediaPost
    {
        public string Text { get; init; } = "";
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record AcademicPassage
    {
        public string Text { get; init; } = "";
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record ListeningConv
    {
        public string Title { get; init; } = "";
        public List<DialogueLine> Dialogue { get; init; } = new();
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record DialogueLine(string Speaker, string Text);

    public record ListeningLecture
    {
        public string Title { get; init; } = "";
        public string Text { get; init; } = "";
        public List<McQuestion> Questions { get; init; } = new();
    }

    public record SpeakingIntegrated
    {
        public string Reading { get; init; } = "";
        public string Listening { get; init; } = "";
        public string Question { get; init; } = "";
    }

    public record SpeakingAcademic
    {
        public string Listening { get; init; } = "";
        public string Question { get; init; } = "";
    }

    public record WritingIntegrated
    {
        public string Reading { get; init; } = "";
        public string Listening { get; init; } = "";
        public string Question { get; init; } = "";
    }
}
