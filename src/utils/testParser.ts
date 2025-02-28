
import { parseAIResponse } from "./lessonParser";

// The actual AI response provided by the user
const aiResponseExample = `**Lesson Plan: Refuting Arguments with Facts and Data**

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

export const testParserWithExample = () => {
  try {
    console.log("Testing parser with the example AI response...");
    const parsed = parseAIResponse(aiResponseExample);
    
    console.log(`Successfully parsed ${parsed.length} sections:`);
    parsed.forEach(section => {
      console.log(`\nSection: ${section.title}`);
      console.log(`Content items: ${section.content.length}`);
      
      if (section.activities) {
        console.log(`Activities: ${section.activities.length}`);
        section.activities.forEach(activity => {
          console.log(`  - ${activity.title} (${activity.duration || 'no duration'})`);
          console.log(`    Steps: ${activity.steps.length}`);
        });
      }
    });
    
    // Check for the Activities section specifically
    const activitiesSection = parsed.find(s => s.title === 'Activities');
    if (activitiesSection && activitiesSection.activities) {
      console.log("\nDetailed Activities:");
      activitiesSection.activities.forEach((activity, i) => {
        console.log(`\nActivity ${i+1}: ${activity.title}`);
        console.log(`Duration: ${activity.duration}`);
        console.log("Steps:");
        activity.steps.forEach((step, j) => {
          console.log(`  ${j+1}. ${step}`);
        });
      });
    }
    
    return parsed;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
};

// Run the test
testParserWithExample();
