// Generates the TOEFL test prompt based on difficulty and sections
// Matches EXACTLY the official TOEFL iBT Practice Test 1 format (January 2026)
export function generateToeflPrompt(difficulty, sections) {
  const difficultyLabel = {
    beginner: 'Beginner (TOEFL score range 1-3)',
    intermediate: 'Intermediate (TOEFL score range 3-4)',
    advanced: 'Advanced (TOEFL score range 4-6)'
  }[difficulty] || difficulty;

  let prompt = `Generate a complete TOEFL iBT practice test. Follow the EXACT format below.
Difficulty: ${difficultyLabel}
Sections: ${sections.join(', ')}

**CRITICAL INSTRUCTIONS:**
1. Generate ALL sections in ONE single response - DO NOT split into multiple messages
2. Include ALL content: passages, questions, and answer keys
3. Use EXACTLY the format specified below
4. Each question must have (A), (B), (C), (D) options on separate lines
5. Do NOT ask if you should continue - complete everything in this response

`;

  if (sections.includes('Reading')) {
    prompt += `

## Reading Section

### Reading Section, Module 1

#### Fill in the missing letters in the paragraph (Questions 1-10)

Write a paragraph (80-120 words) about an interesting academic topic. Remove 2-4 letters from EXACTLY 10 different words and replace them with underscores.

**IMPORTANT FORMAT RULES:**
- Number each blank clearly: (1)___, (2)___, (3)___, etc.
- Remove 2-4 letters from each word (not just 1 letter)
- Make sure there are EXACTLY 10 blanks
- The Answer Key should list ONLY the missing letters (not the full word)

Example:
"The human brain is a complex organ responsible for controlling all bodily functions. It is (1)divi___ into several regions, each with (2)spe___ roles. The cerebrum, the (3)lar___ part, is involved in cognitive (4)func___ such as reasoning and (5)mem___. The cerebellum (6)coor___ movement and balance. The brain stem (7)reg___ basic life functions like breathing and heart rate. (8)Neur___ transmit signals between brain regions. The brain (9)cons___ about 2% of body weight but uses 20% of the body's (10)ener___."

Answer Key:
1. ded
2. cific
3. gest
4. tions
5. ory
6. dinates
7. ulates
8. ons
9. umes
10. gy

#### Read a notice (Questions 11-12)

Write a short notice (40-60 words) like a bank notice, office memo, or sign.

11. What type of business issued the notice?
(A) An Internet provider
(B) A computer company
(C) A paper company
(D) A bank

12. How can customers enroll in paperless billing?
(A) By visiting an office
(B) By accessing the website
(C) By using the app
(D) By calling customer service

#### Read a social media post (Questions 13-15)

Write a social media post (80-120 words) about a local event, market, or recommendation.

13. What is the main purpose of the post?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

14. [Question about a detail]
(A) [option]
(B) [option]
(C) [option]
(D) [option]

15. [Question about a detail]
(A) [option]
(B) [option]
(C) [option]
(D) [option]

#### Read an Academic Passage (Questions 16-20)

Write a 200-300 word academic passage on a topic like science, psychology, or history.

16. What is the passage mainly about?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

17. The word "[word]" in the passage is closest in meaning to
(A) [option]
(B) [option]
(C) [option]
(D) [option]

18. [Factual question]
(A) [option]
(B) [option]
(C) [option]
(D) [option]

19. According to the passage, all of the following are true EXCEPT:
(A) [option]
(B) [option]
(C) [option]
(D) [option]

20. Why does the author mention [something]?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

### Reading Section, Module 2

#### Fill in the missing letters in the paragraph (Questions 1-10)

Write a DIFFERENT paragraph (80-120 words) about a NEW topic. Use the SAME FORMAT as Module 1.

**IMPORTANT:** Number each blank: (1)___, (2)___, up to (10)___. Remove 2-4 letters from each word.

Answer Key should list only the missing letters.

#### Read a notice (Questions 11-12)

Write a different notice with 2 questions (same format as Module 1).

#### Read a social media post (Questions 13-15)

Write a different post with 3 questions (same format as Module 1).

#### Read an Academic Passage (Questions 16-20)

Write a different academic passage with 5 questions (same format as Module 1).

### Reading Section Answer Key

IMPORTANT: List answers for BOTH modules clearly separated!

**Reading Section Answer Key (Module 1):**
1-1. [missing letters only]
1-2. [missing letters only]
...
1-10. [missing letters only]
1-11. [A/B/C/D]
...
1-20. [A/B/C/D]

**Reading Section Answer Key (Module 2):**
2-1. [missing letters only]
2-2. [missing letters only]
...
2-10. [missing letters only]
2-11. [A/B/C/D]
...
2-20. [A/B/C/D]
`;
  }

  if (sections.includes('Listening')) {
    prompt += `

## Listening Section

### Listening Section, Module 1

#### Choose the best response (Questions 1-8)

Write 8 short dialogue prompts. Format each exactly like this:

1. Woman: Didn't I just see you in the library an hour ago?
(A) As a matter of fact, I was returning a book.
(B) Yes, you can find it in the reference section.
(C) I don't think I'll have enough time to do that.
(D) Actually, I think I can get there a little earlier.

2. Man: Where is the nearest bus stop?
(A) I nearly missed the bus.
(B) Every 30 minutes.
(C) I can help you find it.
(D) I'll take the subway instead.

[Continue for questions 3-8, alternating Man/Woman]

#### Listen to a conversation (Questions 9-10)

Write a short conversation (4-6 lines) between two people about everyday topics.

Woman: Need anything from the supermarket?
Man: Huh? Aren't we getting ready to go see that play in a few minutes?
Woman: That's tomorrow.
Man: Oh. Wow, I'd forget my head if it wasn't screwed on...

9. What does the woman imply that she was about to do?
(A) See a play
(B) Change her clothes
(C) Go shopping
(D) Eat dinner

10. Why does the man say "I'd forget my head if it wasn't screwed on"?
(A) He forgot what the woman wanted him to buy.
(B) He forgot about the timing of their plans.
(C) He forgot what they were going to eat.
(D) He forgot to buy something at the supermarket.

#### Listen to a conversation (Questions 11-12)

Write another short conversation (4-6 lines) about workplace or campus topics.

11. [Question]
(A) [option]
(B) [option]
(C) [option]
(D) [option]

12. [Question]
(A) [option]
(B) [option]
(C) [option]
(D) [option]

#### Listen to an announcement (Questions 13-14)

Write a short classroom announcement (50-80 words).

13. What is the announcement about?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

14. Why does the professor mention [something]?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

#### Listen to a talk (Questions 15-18)

Write a podcast or lecture talk (150-200 words) about psychology, science, or an academic topic.

15. What is the topic of the talk?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

16. Why does the speaker mention [something]?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

17. What does the speaker say about [topic]?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

18. What does the speaker say about [topic]?
(A) [option]
(B) [option]
(C) [option]
(D) [option]

### Listening Section, Module 2

[Same format as Module 1: 1-8 choose response, 9-12 conversations, 13-16 announcement and talk]

### Listening Section Answer Key

**Listening Section Answer Key (Module 1):**
1-1. A
1-2. C
...
1-18. [A/B/C/D]

**Listening Section Answer Key (Module 2):**
2-1. B
...
2-16. [A/B/C/D]
`;
  }

  if (sections.includes('Writing')) {
    prompt += `

## Writing Section

### Build a Sentence (Questions 1-10)

Move the words in the boxes to create grammatical sentences. Format exactly like this:

1. What was the highlight of your trip?
The ___ fantastic.
were / the / was / old city / showed us around / who / tour guides
Answer: The tour guides who showed us around the old city were fantastic.

2. I heard Anna got a promotion.
___ she will be ___?
a different department / if / moving to / know / do / you
Answer: Do you know if she will be moving to a different department?

3. We're planning a trip to the mountains next weekend.
___ tell me ___?
the cabins / available / whether / can / will be / you
Answer: Can you tell me whether the cabins will be available?

4. I'm looking forward to the concert this weekend.
___?
does / what / time / it / start
Answer: What time does it start?

5. The museum exhibition opens next month.
___?
do / you / how / know / tickets / will cost / much
Answer: Do you know how much the tickets will cost?

[Continue questions 6-10 with similar format]

### Write an Email

A new poetry magazine has asked its readers for submissions, and you decided to submit two of your poems. However, you had a problem using the online submission form, and you are not certain that your submissions were received.

Write an email to the editor of the magazine. In your email, do the following:
- Tell the editor what you like about the new magazine.
- Describe the problem you experienced.
- Ask about the status of your submissions.

Write as much as you can in complete sentences.

To: editor@sunshinepoetrymagazine.com
Subject: Problem using submission form

### Write for an Academic Discussion

A professor has posted a question about a topic and students have responded. Make a contribution to the discussion.

Professor:
Volunteerism refers to the act of offering your time and service without financial compensation to benefit a community, organization, or cause. While many people volunteer mainly to help others, some institutions have mandatory volunteer programs. High schools are one example, where students may be required to complete a certain number of volunteer hours to graduate. What do you think? Should high school students be required to do volunteer work? Why or why not?

Student A (Emma):
Yes, I think high schools should require volunteer hours because it helps students build a sense of civic responsibility. Many teenagers don't naturally think about helping others, and this requirement can introduce them to the idea that their time and effort can make a real difference in the lives of others.

Student B (James):
I don't think volunteer hours should be required because many students already have limited free time. Some have part-time jobs or take care of younger siblings after school. Adding a mandatory volunteer requirement could create extra stress and make it harder for those students to balance their existing responsibilities.

Your Response: [Write at least 100 words expressing and supporting your opinion]

### Writing Section Answer Key

1. The tour guides who showed us around the old city were fantastic.
2. Do you know if she will be moving to a different department?
[... continue to 10]
`;
  }

  if (sections.includes('Speaking')) {
    prompt += `

## Speaking Section

### Listen and Repeat (Questions 1-7)

You are learning to welcome visitors to the zoo. Listen to your manager and repeat what she says. Repeat only once.

Trainer: "We have a variety of wildlife."
Trainer: "Bears, wolves, and large cats are to the right."
Trainer: "You can find sea lions and elephants further down the path."
Trainer: "Please, no outside food or drinks, and do not feed the animals."
Trainer: "Avoid banging or tapping on the displays and enclosures."
Trainer: "For those with children, we offer summer camps and educational opportunities."
Trainer: "The visitor's center, located near the front entrance, can give you more information."

### Take an Interview (Questions 8-11)

You have agreed to take part in a research study about urban life. You will have a short online interview with a researcher.

Interviewer: Thank you for speaking with me today. I'm conducting a study about people's experiences and perceptions of living in a city. I'd like to ask you some questions. Now, do you currently live in a big city, a small town, or a village?

Interviewer: Great. Cities affect people in different ways. Some people find cities dynamic and exciting. Others find that cities are overwhelming and drain them of energy. What kind of reaction do you have to cities? Why do you think you react in this way?

Interviewer: OK. Next, I'd like to ask your opinion. Some people believe that those who live in cities lead more interesting lives. They would argue, for example, that people who live in cities have more access to professional opportunities and interesting leisure activities. Do you agree that people who live in cities lead more interesting lives? Why or why not?

Interviewer: Good points. Let me ask you one final question. For some time now, researchers have been interested in whether green spaces, such as parks, make people who live in cities happier. Do you think that city governments should create more parks in urban areas to promote a general sense of happiness and life satisfaction? Why or why not?
`;
  }

  prompt += `

---

**FINAL INSTRUCTIONS - READ CAREFULLY:**

✅ Generate ALL content for the selected sections IN THIS SINGLE RESPONSE
✅ Do NOT split into multiple messages or ask if you should continue
✅ Include EVERYTHING: all passages, questions, options, and answer keys
✅ Use the EXACT format shown above
✅ Each multiple choice question MUST have (A), (B), (C), (D) on separate lines
✅ Fill in the blanks questions: use numbered blanks like (1)___, (2)___, etc.
✅ Provide complete answer keys at the end of each section
✅ Make content appropriate for ${difficultyLabel} level

BEGIN GENERATING THE COMPLETE TEST NOW:
`;

  return prompt;
}

// Generates the writing evaluation prompt
export function generateWritingEvalPrompt(content, prompt, type) {
  return `You are an expert TOEFL writing evaluator. Evaluate the essay on a scale of 0-30 points.
Provide detailed feedback on:
1. Grammar and Syntax (0-10)
2. Vocabulary and Word Choice (0-10)
3. Organization and Structure (0-10)
4. Development and Support (bonus points for excellent work)

Return your evaluation in JSON format like this:
{
  "score": 24.5,
  "maxScore": 30,
  "feedback": {
    "grammar": "...",
    "vocabulary": "...",
    "organization": "...",
    "development": "...",
    "overallComments": "..."
  }
}

Task Type: ${type}
Prompt: ${prompt}

Essay:
${content}

Please evaluate this essay following TOEFL iBT Writing rubrics.`;
}

// Generates the speaking analysis prompt
export function generateSpeakingAnalysisPrompt(transcription, question, duration) {
  return `As a TOEFL speaking evaluator, analyze this response:

Question: ${question}
Response: ${transcription}
Duration: ${duration} seconds

Evaluate on:
1. Delivery (pace, clarity, pronunciation) - Score 0-4
2. Language Use (grammar, vocabulary) - Score 0-4
3. Topic Development (coherence, completeness) - Score 0-4

Overall Score: (sum of above) / 12 * 30 = X/30

Provide specific feedback and improvement suggestions.
Return in JSON format like:
{
  "overallScore": 24,
  "delivery": { "score": 3.5, "feedback": "..." },
  "languageUse": { "score": 3.0, "feedback": "..." },
  "topicDevelopment": { "score": 3.5, "feedback": "..." },
  "improvements": ["...", "...", "..."]
}`;
}

// Generates the conversation practice prompt
export function generateConversationPrompt(message, context) {
  return `You are a friendly TOEFL speaking practice assistant. 
Help users practice English conversation skills. 
Provide natural responses and occasionally correct grammar or suggest better vocabulary.
Keep responses concise and encouraging.

Context: ${context}

User message: ${message}

Please respond naturally as a conversation partner.`;
}

// Builds the test structure from AI content
// Matches official TOEFL iBT Practice Test 1 format (January 2026)
export function buildTestStructure(difficulty, sections, aiContent) {
  return {
    sections: sections.map(s => ({
      name: s,
      questions: { Reading: 40, Listening: 34, Speaking: 11, Writing: 12 }[s] || 10,
      timeLimit: { Reading: 30, Listening: 29, Speaking: 8, Writing: 23 }[s] || 30,
      modules: {
        Reading: [
          { name: 'Module 1', questions: 20, tasks: ['Kelimeleri Tamamlayın (1-10)', 'Günlük Hayatta Okuyun (11-15)', 'Akademik Pasaj Okuyun (16-20)'] },
          { name: 'Module 2', questions: 20, tasks: ['Kelimeleri Tamamlayın (1-10)', 'Günlük Hayatta Okuyun (11-15)', 'Akademik Pasaj Okuyun (16-20)'] }
        ],
        Listening: [
          { name: 'Module 1', questions: 18, tasks: ['Dinleyin ve Yanıt Seçin (1-8)', 'Konuşmalar (9-12)', 'Duyurular ve Akademik Konuşmalar (13-18)'] },
          { name: 'Module 2', questions: 16, tasks: ['Dinleyin ve Yanıt Seçin (1-8)', 'Konuşmalar (9-12)', 'Duyurular ve Akademik Konuşmalar (13-16)'] }
        ],
        Writing: [
          { name: 'Yazma', questions: 12, tasks: ['Cümle Oluşturun (1-10)', 'E-posta Yazın (11)', 'Akademik Tartışma (12)'] }
        ],
        Speaking: [
          { name: 'Konuşma', questions: 11, tasks: ['Dinleyin ve Tekrarlayın (1-7)', 'Mülakata Katılın (8-11)'] }
        ]
      }[s] || [],
      tasks: {
        Reading: ['Kelimeleri Tamamlayın', 'Günlük Hayatta Okuyun', 'Akademik Pasaj Okuyun'],
        Listening: ['Dinleyin ve Yanıt Seçin', 'Konuşmalar', 'Duyurular ve Akademik Konuşmalar'],
        Writing: ['Cümle Oluşturun (1-10)', 'E-posta Yazın (11)', 'Akademik Tartışma (12)'],
        Speaking: ['Dinleyin ve Tekrarlayın (1-7)', 'Mülakata Katılın (8-11)']
      }[s] || []
    })),
    generatedAt: new Date().toISOString(),
    difficulty,
    testId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
    aiGeneratedContent: aiContent
  };
}
