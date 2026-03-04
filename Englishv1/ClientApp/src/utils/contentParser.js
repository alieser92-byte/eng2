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
  let questionType = 'best-response';
  let conversationLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check if we're in Listening section
    if (line.includes('## Listening Section') || line.includes('### Listening Section')) {
      inListeningSection = true;
      continue;
    }
    
    // Exit Listening section when another section starts
    if (inListeningSection && (line.includes('## Writing') || line.includes('## Speaking') || line.includes('## Reading'))) {
      break;
    }
    
    if (!inListeningSection) continue;
    
    // Skip Answer Key section
    if (line.includes('### Listening Section Answer Key') || line.startsWith('Module 1:') || line.startsWith('Module 2:')) {
      continue;
    }
    
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
    
    // Skip module headers
    if (line.startsWith('### ')) continue;
    
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
        questionText: questionMatch[2],
        conversation: ''
      };
      currentOptions = [];
      
      // For best-response, the conversation is on the same line or next line
      if (questionType === 'best-response') {
        conversationLines = [];
      }
      continue;
    }
    
    // Detect conversation lines (Woman:, Man:, Student:, Professor:, etc.)
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
  let interviewCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Check if we're in Speaking section
    if (line.includes('## Speaking Section')) {
      inSpeakingSection = true;
      continue;
    }
    
    if (!inSpeakingSection) continue;
    
    // Detect section headers
    if (line.startsWith('### ')) {
      if (line.includes('Listen and Repeat')) {
        questionType = 'listen-repeat';
        repeatCount = 0;
      } else if (line.includes('Take an Interview')) {
        questionType = 'interview';
        interviewCount = 7; // Start from 8
      }
      continue;
    }
    
    // Handle Listen and Repeat questions
    if (questionType === 'listen-repeat') {
      const trainerMatch = line.match(/^Trainer:\s*"?(.+?)"?$/);
      if (trainerMatch) {
        repeatCount++;
        questions.push({
          type: 'listen-repeat',
          number: repeatCount,
          prompt: trainerMatch[1].replace(/"/g, ''),
          instructions: 'Listen to the sentence and repeat it clearly.'
        });
        continue;
      }
    }
    
    // Handle Interview questions
    if (questionType === 'interview') {
      const interviewMatch = line.match(/^Interviewer:\s*(.+)$/);
      if (interviewMatch) {
        interviewCount++;
        questions.push({
          type: 'interview',
          number: interviewCount,
          prompt: interviewMatch[1],
          instructions: 'Listen to the question and respond in your own words.'
        });
        continue;
      }
    }
  }
  
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
