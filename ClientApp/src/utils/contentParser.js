// Central content parser for TOEFL AI-generated content

/**
 * Parse AI content for Reading Section
 */
export function parseReadingContent(content) {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n');
  
  let currentPassage = '';
  let currentQuestion = null;
  let currentOptions = [];
  let inAnswerKey = false;
  let answerKeyAnswers = [];
  let questionType = 'multiple-choice';
  let inReadingSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check if we're in Reading section
    if (line.includes('## Reading Section') || line.includes('### Reading Section')) {
      inReadingSection = true;
      continue;
    }
    
    // Exit Reading section when another section starts
    if (inReadingSection && (line.includes('## Listening') || line.includes('## Writing') || line.includes('## Speaking'))) {
      break;
    }
    
    if (!inReadingSection) continue;
    
    // Detect section headers
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      if (line.includes('Fill in the missing letters')) {
        questionType = 'fill-in-letters';
        currentPassage = '';
      } else if (line.includes('Read a notice') || line.includes('Read a social media') || line.includes('Read an Academic')) {
        questionType = 'multiple-choice';
        currentPassage = '';
      }
      continue;
    }
    
    // Detect Answer Key section
    if (line === 'Answer Key:' || line.startsWith('Answer Key')) {
      inAnswerKey = true;
      continue;
    }
    
    // If in answer key, collect answers
    if (inAnswerKey) {
      const answerMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (answerMatch) {
        answerKeyAnswers.push({ num: parseInt(answerMatch[1]), answer: answerMatch[2].trim() });
      } else if (line.startsWith('####') || line.startsWith('###')) {
        inAnswerKey = false;
        
        if (questionType === 'fill-in-letters' && answerKeyAnswers.length > 0) {
          answerKeyAnswers.forEach((ans) => {
            questions.push({
              type: 'fill-in-letters',
              number: ans.num,
              passage: currentPassage,
              questionText: `Eksik harfleri tamamlayın (Boşluk ${ans.num})`,
              correctAnswer: ans.answer,
              options: []
            });
          });
          answerKeyAnswers = [];
        }
      }
      continue;
    }
    
    // Collect passage text (for fill-in-letters, it's in quotes)
    if (questionType === 'fill-in-letters' && (line.startsWith('"') || currentPassage.startsWith('"'))) {
      if (line.startsWith('"')) {
        currentPassage = line;
      } else if (!line.match(/^\d+\./) && !line.startsWith('(')) {
        currentPassage += ' ' + line;
      }
      continue;
    }
    
    // Detect question number
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch && !inAnswerKey) {
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...currentQuestion,
          options: currentOptions
        });
      }
      
      currentQuestion = {
        type: questionType,
        number: parseInt(questionMatch[1]),
        questionText: questionMatch[2],
        passage: currentPassage
      };
      currentOptions = [];
      continue;
    }
    
    // Detect options
    const optionMatch = line.match(/^\s*\(([A-D])\)\s*(.+)$/);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim()
      });
      continue;
    }
    
    // Collect passage for reading comprehension
    if (questionType === 'multiple-choice' && !line.match(/^\d+\./) && !line.match(/^\(/) && currentQuestion === null) {
      currentPassage += (currentPassage ? '\n' : '') + line;
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      ...currentQuestion,
      options: currentOptions
    });
  }
  
  return questions;
}

/**
 * Parse AI content for Listening Section
 */
export function parseListeningContent(content) {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n');
  
  let currentConversation = '';
  let currentQuestion = null;
  let currentOptions = [];
  let inListeningSection = false;
  let inListeningAnswerKey = false;
  let answerKeyAnswers = [];
  let questionType = 'best-response';
  let conversationLines = [];
  let currentModule = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Specifically detect LISTENING answer key (not Reading/Writing/Speaking)
    if (!inListeningAnswerKey && (
      (line.includes('Listening') && line.includes('Answer Key')) ||
      (line.includes('### Listening Section Answer Key'))
    )) {
      inListeningAnswerKey = true;
      // Check if module is in the same line (e.g., "Listening Section Answer Key (Module 1):")
      const modMatch = line.match(/Module\s*(\d+)/i);
      if (modMatch) {
        currentModule = parseInt(modMatch[1], 10);
      } else {
        currentModule = 1; // default to Module 1
      }
      console.log(`📋 Entering Listening Answer Key section, Module ${currentModule}`);
      continue;
    }
    
    // Exit Listening Answer Key when another section's answer key starts
    if (inListeningAnswerKey) {
      if ((line.includes('Reading') || line.includes('Writing') || line.includes('Speaking')) && line.includes('Answer Key')) {
        inListeningAnswerKey = false;
        console.log('📋 Exiting Listening Answer Key (found other section answer key)');
        continue;
      }
      
      // Module header inside answer key (e.g., "Module 1:")
      const moduleHeader = line.match(/^Module\s*(\d+)\s*[:]?/i);
      if (moduleHeader) {
        currentModule = parseInt(moduleHeader[1], 10);
        console.log(`📋 Switching to Module ${currentModule} in answer key`);
        continue;
      }

      // Support multiple answer key formats:
      // 1. "1-11. A" - module-question. answer (module in format)
      // 2. "11. A" - question. answer (module from context)
      // 3. "1. A" - question. answer (simple format)
      const ansMatch = line.match(/^(?:(\d+)-)?(\d+)\.\s*\(?([A-Da-d])\)?\.?/);
      if (ansMatch) {
        const moduleFromFormat = ansMatch[1] ? parseInt(ansMatch[1], 10) : currentModule;
        const questionNum = parseInt(ansMatch[2], 10);
        const answerLetter = ansMatch[3].toUpperCase();
        
        const entry = { 
          num: questionNum, 
          module: moduleFromFormat, 
          answer: answerLetter 
        };
        answerKeyAnswers.push(entry);
        console.log(`📋 Answer key entry: Module ${entry.module}, Q${entry.num} = ${entry.answer} (format match: ${line})`);
        continue;
      }
      
      // Exit on new major section (not answer key related)
      if (line.startsWith('## ') && !line.includes('Answer Key')) {
        inListeningAnswerKey = false;
        console.log('📋 Exiting Listening Answer Key (new section started)');
      }
      continue;
    }
    
    // Check if we're in Listening section (skip answer key headers)
    if (line.includes('Listening Section') && !line.includes('Answer Key')) {
      inListeningSection = true;
      // Check for module number in header
      const modMatch = line.match(/Module\s*(\d+)/i);
      if (modMatch) {
        currentModule = parseInt(modMatch[1], 10);
        console.log(`📂 Entered Listening Section - Module ${currentModule}`);
      } else {
        // Default to Module 1 if no module specified
        currentModule = 1;
        console.log(`📂 Entered Listening Section - defaulting to Module 1`);
      }
      continue;
    }
    
    // Exit Listening section when another section starts
    if (inListeningSection && (line.includes('## Writing') || line.includes('## Speaking') || line.includes('## Reading'))) {
      break;
    }
    
    if (!inListeningSection) continue;
    
    // Detect section headers
    if (line.startsWith('#### ')) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...currentQuestion,
          conversation: conversationLines.join('\n'),
          options: currentOptions
        });
        currentQuestion = null;
        currentOptions = [];
      }
      
      if (line.includes('Choose the best response')) {
        questionType = 'best-response';
      } else if (line.includes('Listen to a conversation')) {
        questionType = 'conversation';
      } else if (line.includes('Listen to an announcement')) {
        questionType = 'announcement';
      } else if (line.includes('Listen to a talk')) {
        questionType = 'talk';
      }
      conversationLines = [];
      continue;
    }
    
    // Handle module headers (both ### and ####)
    if ((line.startsWith('### ') || line.startsWith('#### ')) && line.includes('Module')) {
      const modMatch = line.match(/Module\s*(\d+)/i);
      if (modMatch) {
        currentModule = parseInt(modMatch[1], 10);
        console.log(`📂 Detected Module ${currentModule} in question section`);
      }
      continue;
    }
    
    // Detect question number
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...currentQuestion,
          conversation: conversationLines.join('\n'),
          options: currentOptions
        });
      }
      
      currentQuestion = {
        type: questionType,
        number: parseInt(questionMatch[1]),
        module: currentModule,
        questionText: questionMatch[2],
        conversation: ''
      };
      currentOptions = [];
      
      console.log(`📝 Parsed question: Module ${currentModule}, Q${currentQuestion.number}`);
      
      if (questionType === 'best-response') {
        conversationLines = [];
      }
      continue;
    }
    
    // Detect conversation lines
    if (line.match(/^(Woman|Man|Student|Professor|Interviewer|Trainer):/)) {
      if (currentQuestion) {
        conversationLines.push(line);
      }
      continue;
    }
    
    // Detect options
    const optionMatch = line.match(/^\s*\(([A-D])\)\s*(.+)$/);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim()
      });
      continue;
    }
    
    // Collect conversation or passage text
    if (currentQuestion === null && !line.match(/^\d+\./)) {
      conversationLines.push(line);
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      ...currentQuestion,
      conversation: conversationLines.join('\n'),
      options: currentOptions
    });
  }

  // Map answer keys to questions
  if (answerKeyAnswers.length > 0) {
    console.log(`🔗 Mapping ${answerKeyAnswers.length} answers to ${questions.length} questions`);
    console.log('📋 Answer key data:', answerKeyAnswers);
    console.log('📝 Questions data (first 3):', questions.slice(0, 3).map(q => ({ num: q.number, module: q.module, hasCorrect: !!q.correctAnswer })));
    
    answerKeyAnswers.forEach(({ num, module, answer }) => {
      const q = questions.find(x => x.number === num && x.module === module);
      if (q) {
        q.correctAnswer = answer;
        console.log(`✅ Mapped answer for Module ${module}, Q${num}: ${answer}`);
      } else {
        console.warn(`⚠️ Could not find question for Module ${module}, Q${num}`);
      }
    });
    
    // Count how many questions have answers
    const withAnswers = questions.filter(q => q.correctAnswer).length;
    console.log(`✅ ${withAnswers}/${questions.length} questions have correct answers`);
  }
  
  // Calculate global question numbers across modules
  // Module 1 questions get their original numbers (1-18)
  // Module 2 questions get offset by Module 1's count (19-36)
  const module1Questions = questions.filter(q => q.module === 1);
  const module2Questions = questions.filter(q => q.module === 2);
  const module1Count = module1Questions.length;
  
  console.log(`📊 LISTENING SUMMARY: Module 1 = ${module1Count} questions, Module 2 = ${module2Questions.length} questions, Total = ${questions.length}`);
  
  questions.forEach(q => {
    if (q.module === 1) {
      q.globalNumber = q.number;
    } else if (q.module === 2) {
      q.globalNumber = module1Count + q.number;
    } else {
      q.globalNumber = q.number; // For sections without modules
    }
  });
  
  console.log('📝 Parsed questions:', questions.length, 'with answers:', answerKeyAnswers.length);
  console.log('📝 Global numbers assigned - Module 1 count:', module1Count);
  
  return questions;
}

/**
 * Parse AI content for Writing Section
 */
export function parseWritingContent(content) {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n');
  
  let inWritingSection = false;
  let questionType = 'build-sentence';
  let currentQuestion = null;
  let emailContent = [];
  let discussionContent = [];
  let inEmail = false;
  let inDiscussion = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check if we're in Writing section
    if (line.includes('## Writing Section')) {
      inWritingSection = true;
      continue;
    }
    
    // Exit Writing section when another section starts
    if (inWritingSection && (line.includes('## Speaking') || line.includes('## Reading') || line.includes('## Listening'))) {
      break;
    }
    
    if (!inWritingSection) continue;
    
    // Skip Answer Key section
    if (line.includes('### Writing Section Answer Key')) {
      break;
    }
    
    // Detect section headers
    if (line.startsWith('### ')) {
      if (line.includes('Build a Sentence')) {
        questionType = 'build-sentence';
        inEmail = false;
        inDiscussion = false;
      } else if (line.includes('Write an Email')) {
        questionType = 'email';
        inEmail = true;
        inDiscussion = false;
        emailContent = [];
      } else if (line.includes('Write for an Academic')) {
        questionType = 'academic-discussion';
        inEmail = false;
        inDiscussion = true;
        discussionContent = [];
      }
      continue;
    }
    
    // Handle Build a Sentence questions
    if (questionType === 'build-sentence') {
      // Detect question number (context line)
      const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (questionMatch) {
        // Save previous question
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        currentQuestion = {
          type: 'build-sentence',
          number: parseInt(questionMatch[1]),
          context: questionMatch[2],
          partialSentence: '',
          scrambledWords: '',
          correctAnswer: ''
        };
        continue;
      }
      
      // Partial sentence (contains ___)
      if (currentQuestion && (line.includes('___') || line.startsWith('The _') || line.startsWith('_'))) {
        currentQuestion.partialSentence = line;
        continue;
      }
      
      // Scrambled words (contains /)
      if (currentQuestion && line.includes(' / ') && !line.startsWith('Answer:')) {
        currentQuestion.scrambledWords = line;
        continue;
      }
      
      // Answer
      if (currentQuestion && line.startsWith('Answer:')) {
        currentQuestion.correctAnswer = line.replace('Answer:', '').trim();
        questions.push(currentQuestion);
        currentQuestion = null;
        continue;
      }
    }
    
    // Handle Email content
    if (inEmail) {
      emailContent.push(line);
    }
    
    // Handle Academic Discussion content
    if (inDiscussion) {
      discussionContent.push(line);
    }
  }
  
  // Add email question
  if (emailContent.length > 0) {
    questions.push({
      type: 'email',
      number: 11,
      content: emailContent.join('\n'),
      instructions: 'Write an email response based on the given scenario.'
    });
  }
  
  // Add discussion question
  if (discussionContent.length > 0) {
    questions.push({
      type: 'academic-discussion',
      number: 12,
      content: discussionContent.join('\n'),
      instructions: 'Write a response to the academic discussion.'
    });
  }
  
  // Add globalNumber for consistency (Writing has no modules, so globalNumber = number)
  questions.forEach(q => {
    q.globalNumber = q.number;
  });
  
  return questions;
}

/**
 * Parse AI content for Speaking Section
 */
export function parseSpeakingContent(content) {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n');
  
  let inSpeakingSection = false;
  let questionType = 'listen-repeat';
  let repeatCount = 0;
  let interviewCount = 7; // Interview questions start at 8
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) continue;
    
    // Remove markdown formatting
    const cleanLine = line.replace(/\*\*/g, '').trim();
    
    // Check if we're in Speaking section - more flexible matching
    if (cleanLine.match(/^#{0,3}\s*speaking/i) || 
        cleanLine.toLowerCase().includes('speaking section')) {
      inSpeakingSection = true;
      console.log('✅ Entered Speaking Section');
      continue;
    }
    
    // Exit on other major sections
    if (inSpeakingSection && 
        (cleanLine.match(/^#{1,3}\s*(writing|reading|listening)/i) || 
         cleanLine.includes('Score:') ||
         cleanLine.includes('Answer Key'))) {
      console.log('🛑 Exiting Speaking Section');
      break;
    }
    
    if (!inSpeakingSection) continue;
    
    // Detect section headers
    if (cleanLine.startsWith('###') || cleanLine.startsWith('####')) {
      if (cleanLine.match(/listen\s+and\s+repeat/i)) {
        questionType = 'listen-repeat';
        repeatCount = 0;
        console.log('📢 Section: Listen and Repeat');
      } else if (cleanLine.match(/interview|take an interview/i)) {
        questionType = 'interview';
        interviewCount = 7; // Next question will be 8
        console.log('📢 Section: Interview');
      }
      continue;
    }
    
    // Handle Listen and Repeat questions
    if (questionType === 'listen-repeat') {
      // Match patterns like:
      // 1. Trainer: "We have a variety of wildlife."
      // Trainer: "We have a variety of wildlife."
      const trainerMatch = cleanLine.match(/^(?:\d+\.\s*)?Trainer:\s*[""]?(.+?)[""]?\s*$/);
      if (trainerMatch) {
        repeatCount++;
        const prompt = trainerMatch[1].replace(/[""]/g, '').trim();
        questions.push({
          type: 'listen-repeat',
          number: repeatCount,
          prompt: prompt,
          instructions: 'Listen to the sentence and repeat it clearly.'
        });
        console.log(`✅ Listen-Repeat Q${repeatCount}: ${prompt.substring(0, 30)}...`);
        continue;
      }
    }
    
    // Handle Interview questions
    if (questionType === 'interview') {
      // Match patterns like:
      // 8. Interviewer: Thank you for speaking...
      // Interviewer: Thank you for speaking...
      // **Interviewer:** Thank you for speaking...
      const interviewMatch = cleanLine.match(/^(?:\d+\.\s*)?Interviewer:\s*(.+)$/);
      if (interviewMatch) {
        interviewCount++;
        const prompt = interviewMatch[1].trim();
        questions.push({
          type: 'interview',
          number: interviewCount,
          prompt: prompt,
          instructions: 'Listen to the question and respond in your own words.'
        });
        console.log(`✅ Interview Q${interviewCount}: ${prompt.substring(0, 30)}...`);
        continue;
      }
    }
  }
  
  console.log(`📊 Total Speaking Questions Parsed: ${questions.length}`);
  
  // Add globalNumber for consistency (Speaking has no modules, so globalNumber = number)
  questions.forEach(q => {
    q.globalNumber = q.number;
  });
  
  return questions;
}

/**
 * Parse all sections from AI content
 */
export function parseAllContent(content) {
  return {
    reading: parseReadingContent(content),
    listening: parseListeningContent(content),
    writing: parseWritingContent(content),
    speaking: parseSpeakingContent(content)
  };
}
