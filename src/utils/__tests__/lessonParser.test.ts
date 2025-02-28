
import { parseAIResponse, cleanMarkdown, parseActivities } from "../lessonParser";

describe('Lesson Parser Functions', () => {
  describe('cleanMarkdown', () => {
    it('removes markdown formatting characters', () => {
      expect(cleanMarkdown('**bold text**')).toBe('bold text');
      expect(cleanMarkdown('_italic text_')).toBe('italic text');
      expect(cleanMarkdown('`code text`')).toBe('code text');
      expect(cleanMarkdown('***bold italic***')).toBe('bold italic');
    });
  });

  describe('parseActivities', () => {
    it('extracts activity title and duration', () => {
      const activities = parseActivities([
        'Activity 1: Understanding Arguments (10 minutes) - Present an example argument and identify components'
      ]);
      
      expect(activities[0].title).toBe('Understanding Arguments');
      expect(activities[0].duration).toBe('10 minutes');
      expect(activities[0].steps.length).toBeGreaterThan(0);
    });

    it('handles activities without explicit duration', () => {
      const activities = parseActivities([
        'Activity 1: Understanding Arguments - Present an example argument and identify components'
      ]);
      
      expect(activities[0].title).toBe('Understanding Arguments');
      expect(activities[0].duration).toBe("");
    });

    it('parses steps from activity description', () => {
      const activities = parseActivities([
        'Activity 1: Research and Evidence (15 minutes) - Have students work in groups to find factual evidence. Emphasize the use of credible sources.'
      ]);
      
      expect(activities[0].steps).toContain('Have students work in groups to find factual evidence.');
      expect(activities[0].steps).toContain('Emphasize the use of credible sources.');
    });
  });

  describe('parseAIResponse', () => {
    const testAIResponse = `**Lesson Plan: Refuting Arguments with Facts and Data**

### 1. Learning Objectives
- Students will be able to analyze an argument and identify its claims.
- Students will understand how to use facts and data to refute an argument.

### 2. Materials and Resources
- Digital whiteboard
- Educational apps (e.g., Kahoot, Quizlet) for interactive learning

### 3. Introduction/Hook (5 minutes)
- **Wild Animal Debate**: Begin with a hook that grabs students' attention.
- Introduce the concept of argumentation.

### 4. Main Activities (40 minutes)
- **Activity 1: Understanding Arguments** (10 minutes)
  - Present an example argument related to wild animals.
  - Use the digital whiteboard to organize thoughts.
- **Activity 2: Research and Evidence** (15 minutes)
  - Have students work in groups to find factual evidence.
  - Emphasize the use of credible sources.

### 5. Assessment Strategies
- **Formative Quiz**: Administer a short quiz at the end of the lesson.
- **Self-Reflection**: Provide a self-reflection worksheet.

### 6. Differentiation Strategies
- **For Auditory Learners**: Use verbal instructions and discussions.
- **For ESL Students**: Offer visual aids and simplified examples.

### 7. Closure (5 minutes)
- **Review Key Points**: Summarize the key points learned.
- **Preview Next Steps**: Preview the next lesson.`;

    it('correctly identifies all required sections', () => {
      const parsedSections = parseAIResponse(testAIResponse);
      
      const sectionTitles = parsedSections.map(section => section.title);
      expect(sectionTitles).toContain('Learning Objectives');
      expect(sectionTitles).toContain('Materials & Resources');
      expect(sectionTitles).toContain('Introduction & Hook');
      expect(sectionTitles).toContain('Activities');
      expect(sectionTitles).toContain('Assessment Strategies');
      expect(sectionTitles).toContain('Differentiation Strategies');
      expect(sectionTitles).toContain('Close');
    });

    it('extracts activities from the Main Activities section', () => {
      const parsedSections = parseAIResponse(testAIResponse);
      
      const activitiesSection = parsedSections.find(section => 
        section.title === 'Activities' || section.title.includes('Activities')
      );
      
      expect(activitiesSection).toBeDefined();
      expect(activitiesSection?.activities).toBeDefined();
      expect(activitiesSection?.activities?.length).toBe(2);
      expect(activitiesSection?.activities?.[0].title).toBe('Understanding Arguments');
      expect(activitiesSection?.activities?.[1].title).toBe('Research and Evidence');
    });

    it('handles the full real-world example', () => {
      const fullExample = `**Lesson Plan: Refuting Arguments with Facts and Data**

### 1. Learning Objectives
- Students will be able to analyze an argument and identify its claims.
- Students will understand how to use facts and data to refute an argument.
- Students will learn to cite sources in MLA format.
- Students will apply critical thinking skills to evaluate arguments and construct counterarguments.
- By the end of the lesson, students will demonstrate an understanding of how to effectively refute an argument using evidence.

### 2. Materials and Resources
- Digital whiteboard
- Educational apps (e.g., Kahoot, Quizlet) for interactive learning
- Example arguments related to wild animals (e.g., the impact of zoos on conservation)
- Access to online databases or libraries for research
- MLA citation guide
- Whiteboard markers
- Printed or digital copies of the lesson objectives and key terms
- Self-reflection worksheets

### 3. Introduction/Hook (5 minutes)
- **Wild Animal Debate**: Begin with a hook that grabs students' attention, such as a provocative statement about wild animals (e.g., "Zoos are the only way to save endangered species"). Ask students if they agree or disagree.
- Introduce the concept of argumentation and the importance of using facts and data to support or refute claims.
- Write down key terms on the board, such as "claim," "evidence," "counterargument," and "MLA format."

### 4. Main Activities (40 minutes)
- **Activity 1: Understanding Arguments** (10 minutes)
  - Present an example argument related to wild animals and ask students to identify the claim, evidence, and potential counterarguments.
  - Use the digital whiteboard to organize thoughts and ideas.
- **Activity 2: Research and Evidence** (15 minutes)
  - Have students work in groups to find factual evidence (using online databases or libraries) that either supports or refutes the argument presented.
  - Emphasize the use of credible sources and how to cite them in MLA format.
- **Activity 3: Group Discussion** (10 minutes)
  - After research, have each group discuss and prepare to present their findings, focusing on how they can use evidence to refute the argument.
  - Encourage the use of educational apps for interactive presentations or to create quizzes related to their findings.
- **Activity 4: Presentations** (5 minutes)
  - Allow each group to present their refutation, ensuring they use facts, data, and proper MLA citations.

### 5. Assessment Strategies
- **Formative Quiz**: Administer a short quiz at the end of the lesson to assess students' understanding of how to refute an argument with facts and data, and their ability to cite sources in MLA format.
- **Self-Reflection**: Provide a self-reflection worksheet for students to evaluate their own learning and understanding of the objectives. This will help identify areas where they need more practice or review.

### 6. Differentiation Strategies
- **For Auditory Learners**: Use verbal instructions and discussions, and consider providing audio recordings of arguments for analysis.
- **For ESL Students**: Offer visual aids and simplified examples. Provide additional support by offering one-on-one assistance during the research activity and encouraging the use of translation tools on educational apps.
- **For Advanced Learners**: Provide more complex arguments to analyze and ask them to create their own arguments with evidence for peers to refute.

### 7. Closure (5 minutes)
- **Review Key Points**: Summarize the key points learned during the lesson, including the importance of evidence-based arguments and MLA citation.
- **Preview Next Steps**: Preview the next lesson, which could involve writing a full argumentative essay using the skills practiced in this lesson.
- **Final Thoughts**: End the lesson with a thought-provoking question related to wild animals and argumentation, encouraging students to think critically about the topics discussed.`;

      const parsedSections = parseAIResponse(fullExample);
      
      // Check that all sections are identified
      const sectionTitles = parsedSections.map(section => section.title);
      expect(sectionTitles).toContain('Learning Objectives');
      expect(sectionTitles).toContain('Materials & Resources');
      expect(sectionTitles).toContain('Introduction & Hook');
      expect(sectionTitles).toContain('Activities');
      expect(sectionTitles).toContain('Assessment Strategies');
      expect(sectionTitles).toContain('Differentiation Strategies');
      expect(sectionTitles).toContain('Close');
      
      // Check activities
      const activitiesSection = parsedSections.find(section => section.title === 'Activities');
      expect(activitiesSection?.activities?.length).toBe(4);
      
      // Check specific activities
      if (activitiesSection?.activities) {
        expect(activitiesSection.activities[0].title).toBe('Understanding Arguments');
        expect(activitiesSection.activities[0].duration).toBe('10 minutes');
        
        expect(activitiesSection.activities[1].title).toBe('Research and Evidence');
        expect(activitiesSection.activities[1].duration).toBe('15 minutes');
        
        expect(activitiesSection.activities[2].title).toBe('Group Discussion');
        expect(activitiesSection.activities[2].duration).toBe('10 minutes');
        
        expect(activitiesSection.activities[3].title).toBe('Presentations');
        expect(activitiesSection.activities[3].duration).toBe('5 minutes');
      }
      
      // Validate individual section content
      const learningObjectives = parsedSections.find(section => section.title === 'Learning Objectives');
      expect(learningObjectives?.content.length).toBe(5);
      
      const closure = parsedSections.find(section => section.title === 'Close');
      expect(closure?.content.length).toBe(3);
    });
  });

  // This test specifically checks the way the parser handles the actual AI response provided by the user
  describe('parseAIResponse with actual user example', () => {
    const actualUserExample = `**Lesson Plan: Refuting Arguments with Facts and Data**

### 1. Learning Objectives
- Students will be able to analyze an argument and identify its claims.
- Students will understand how to use facts and data to refute an argument.
- Students will learn to cite sources in MLA format.
- Students will apply critical thinking skills to evaluate arguments and construct counterarguments.
- By the end of the lesson, students will demonstrate an understanding of how to effectively refute an argument using evidence.

### 2. Materials and Resources
- Digital whiteboard
- Educational apps (e.g., Kahoot, Quizlet) for interactive learning
- Example arguments related to wild animals (e.g., the impact of zoos on conservation)
- Access to online databases or libraries for research
- MLA citation guide
- Whiteboard markers
- Printed or digital copies of the lesson objectives and key terms
- Self-reflection worksheets

### 3. Introduction/Hook (5 minutes)
- **Wild Animal Debate**: Begin with a hook that grabs students' attention, such as a provocative statement about wild animals (e.g., "Zoos are the only way to save endangered species"). Ask students if they agree or disagree.
- Introduce the concept of argumentation and the importance of using facts and data to support or refute claims.
- Write down key terms on the board, such as "claim," "evidence," "counterargument," and "MLA format."

### 4. Main Activities (40 minutes)
- **Activity 1: Understanding Arguments** (10 minutes)
  - Present an example argument related to wild animals and ask students to identify the claim, evidence, and potential counterarguments.
  - Use the digital whiteboard to organize thoughts and ideas.
- **Activity 2: Research and Evidence** (15 minutes)
  - Have students work in groups to find factual evidence (using online databases or libraries) that either supports or refutes the argument presented.
  - Emphasize the use of credible sources and how to cite them in MLA format.
- **Activity 3: Group Discussion** (10 minutes)
  - After research, have each group discuss and prepare to present their findings, focusing on how they can use evidence to refute the argument.
  - Encourage the use of educational apps for interactive presentations or to create quizzes related to their findings.
- **Activity 4: Presentations** (5 minutes)
  - Allow each group to present their refutation, ensuring they use facts, data, and proper MLA citations.

### 5. Assessment Strategies
- **Formative Quiz**: Administer a short quiz at the end of the lesson to assess students' understanding of how to refute an argument with facts and data, and their ability to cite sources in MLA format.
- **Self-Reflection**: Provide a self-reflection worksheet for students to evaluate their own learning and understanding of the objectives. This will help identify areas where they need more practice or review.

### 6. Differentiation Strategies
- **For Auditory Learners**: Use verbal instructions and discussions, and consider providing audio recordings of arguments for analysis.
- **For ESL Students**: Offer visual aids and simplified examples. Provide additional support by offering one-on-one assistance during the research activity and encouraging the use of translation tools on educational apps.
- **For Advanced Learners**: Provide more complex arguments to analyze and ask them to create their own arguments with evidence for peers to refute.

### 7. Closure (5 minutes)
- **Review Key Points**: Summarize the key points learned during the lesson, including the importance of evidence-based arguments and MLA citation.
- **Preview Next Steps**: Preview the next lesson, which could involve writing a full argumentative essay using the skills practiced in this lesson.
- **Final Thoughts**: End the lesson with a thought-provoking question related to wild animals and argumentation, encouraging students to think critically about the topics discussed.`;

    it('successfully parses the actual user example without errors', () => {
      expect(() => parseAIResponse(actualUserExample)).not.toThrow();
      
      const parsed = parseAIResponse(actualUserExample);
      expect(parsed.length).toBeGreaterThan(0);
      
      // Check that we have all required sections
      const sectionTitles = new Set(parsed.map(section => section.title));
      const requiredSections = [
        'Learning Objectives',
        'Materials & Resources',
        'Introduction & Hook',
        'Activities',
        'Assessment Strategies',
        'Differentiation Strategies',
        'Close'
      ];
      
      for (const section of requiredSections) {
        expect(sectionTitles.has(section)).toBe(true);
      }
    });

    it('correctly extracts activities from the Main Activities section', () => {
      const parsed = parseAIResponse(actualUserExample);
      
      const activitiesSection = parsed.find(section => 
        section.title === 'Activities' || section.title.includes('Activities')
      );
      
      expect(activitiesSection).toBeDefined();
      expect(activitiesSection?.activities).toBeDefined();
      expect(activitiesSection?.activities?.length).toBe(4);
      
      if (activitiesSection?.activities) {
        // First activity
        expect(activitiesSection.activities[0].title).toBe('Understanding Arguments');
        expect(activitiesSection.activities[0].duration).toBe('10 minutes');
        expect(activitiesSection.activities[0].steps.length).toBe(2);
        
        // Second activity
        expect(activitiesSection.activities[1].title).toBe('Research and Evidence');
        expect(activitiesSection.activities[1].duration).toBe('15 minutes');
        expect(activitiesSection.activities[1].steps.length).toBe(2);
        
        // Third activity
        expect(activitiesSection.activities[2].title).toBe('Group Discussion');
        expect(activitiesSection.activities[2].duration).toBe('10 minutes');
        expect(activitiesSection.activities[2].steps.length).toBe(2);
        
        // Fourth activity
        expect(activitiesSection.activities[3].title).toBe('Presentations');
        expect(activitiesSection.activities[3].duration).toBe('5 minutes');
        expect(activitiesSection.activities[3].steps.length).toBe(1);
      }
    });
  });
});

// Add a manual test function that we can run to verify the parsing
export const manualTestParsing = (aiResponse: string) => {
  try {
    console.log('Testing parseAIResponse with provided AI response...');
    const result = parseAIResponse(aiResponse);
    console.log('Successfully parsed AI response into', result.length, 'sections:');
    
    result.forEach(section => {
      console.log(`\nSection: ${section.title}`);
      console.log('Content items:', section.content.length);
      
      if (section.activities) {
        console.log('Activities:', section.activities.length);
        section.activities.forEach((activity, i) => {
          console.log(`  Activity ${i+1}: ${activity.title} (${activity.duration})`);
          console.log(`    Steps: ${activity.steps.length}`);
          activity.steps.forEach((step, j) => {
            console.log(`      ${j+1}. ${step}`);
          });
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};
