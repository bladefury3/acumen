
import { parseAIResponse } from "../lessonParser";

describe('New Pokémon Lesson Plan Parser Test', () => {
  const newPokemonLessonPlan = `**Lesson Plan: Mastering Fractions with Pokémon**

### 1. Learning Objectives
- By the end of this lesson, students will be able to define and identify fractions.
- Students will understand how to simplify fractions.
- Students will learn to compare fractions.
- Students will apply fraction concepts to solve real-world problems, incorporating Pokémon-themed scenarios.

### 2. Materials and Resources
- Whiteboard and markers
- Printed or projected Pokémon images and scenarios for context
- Fraction worksheets with Pokémon-themed problems
- Blank paper and pencils for calculations
- Optional: Access to a computer or tablet for interactive fraction tools (though not required)

### 3. Introduction/Hook (5 minutes)
- **Introduction to Fractions**: Begin by asking students if they've ever had to share something (like a pizza) among friends. Introduce the concept of fractions as a way to show part of a whole.
- **Pokémon Hook**: Show a popular Pokémon image (e.g., Pikachu) and pose a scenario: "Pikachu has 12 berries and wants to give 1/4 of them to its friend Squirtle. How many berries will Pikachu give away?"
- This sparks interest and relates fractions to a familiar, engaging context.

### 4. Main Activities (40 minutes)
- **Activity 1: Defining and Identifying Fractions** (10 minutes)
  - Explain the concept of fractions using visual aids. Define numerator and denominator and provide examples.
  - Use Pokémon images divided into parts to illustrate (e.g., a picture of a Poké Ball divided into quarters).
- **Activity 2: Simplifying Fractions with Pokémon Scenarios** (15 minutes)
  - Provide worksheets with Pokémon-themed fraction problems (e.g., "If Charizard has 8/12 of its health left, what fraction of its health is gone?").
  - Have students work in pairs to simplify fractions and discuss answers as a class.
- **Activity 3: Comparing Fractions** (10 minutes)
  - Introduce how to compare fractions (using <, >, =) with Pokémon battle scenarios (e.g., "Which Pokémon has a higher speed, one with 3/4 or 2/3 of the maximum speed?").
  - Students calculate and compare fractions to determine the winner of each battle.
- **Activity 4: Applying Fractions to Real-World Problems** (5 minutes)
  - Present a scenario where Pokémon trainers need to divide items (e.g., potions) among their team. Students apply fraction knowledge to solve the problem.

### 5. Assessment Strategies
- **Participation**: Observe student engagement during activities.
- **Worksheet Review**: Collect worksheets from Activities 2 and 3 to assess understanding of simplifying and comparing fractions.
- **Class Discussion**: Engage students in a class discussion at the end to assess their ability to apply fractions to real-world problems.
- **Quiz (Optional)**: Consider a short quiz at the end of the lesson to formally assess comprehension.

### 6. Differentiation Strategies
- **For Struggling Students**: Provide additional visual aids and one-on-one assistance during activities. Simplify problems or offer basic fraction review worksheets.
- **For Advanced Students**: Offer more complex Pokémon-themed fraction problems or ask them to create their own problems for peers to solve.

### 7. Closure (5 minutes)
- **Review Key Concepts**: Briefly review the definition of fractions, how to simplify them, and how to compare fractions.
- **Pokémon Fraction Challenge**: End with a fun, simple challenge (e.g., "If a Pokémon has 2/3 of its energy and uses 1/6 of it, what fraction of its energy does it have left?").
- **Encouragement**: Encourage students to apply fraction concepts in their everyday lives and to continue exploring math through engaging themes like Pokémon.`;

  it('should parse the new Pokémon lesson plan without errors', () => {
    const parsedSections = parseAIResponse(newPokemonLessonPlan);
    
    // Check that all required sections are parsed
    const sectionTitles = parsedSections.map(section => section.title);
    expect(sectionTitles).toContain('Learning Objectives');
    expect(sectionTitles).toContain('Materials & Resources');
    expect(sectionTitles).toContain('Introduction & Hook');
    expect(sectionTitles).toContain('Activities');
    expect(sectionTitles).toContain('Assessment Strategies');
    expect(sectionTitles).toContain('Differentiation Strategies');
    expect(sectionTitles).toContain('Close');
    
    // Check that content is extracted correctly
    const learningObjectives = parsedSections.find(section => section.title === 'Learning Objectives');
    expect(learningObjectives?.content.length).toBe(4);
    
    const materials = parsedSections.find(section => section.title === 'Materials & Resources');
    expect(materials?.content.length).toBe(5);
    
    // Check if activities are parsed correctly
    const activities = parsedSections.find(section => section.title === 'Activities');
    expect(activities?.activities).toBeDefined();
    
    if (activities?.activities) {
      expect(activities.activities.length).toBe(4);
      
      // Check the first activity
      expect(activities.activities[0].title).toBe('Defining and Identifying Fractions');
      expect(activities.activities[0].duration).toBe('10 minutes');
      expect(activities.activities[0].steps.length).toBe(2);
      
      // Check the second activity
      expect(activities.activities[1].title).toBe('Simplifying Fractions with Pokémon Scenarios');
      expect(activities.activities[1].duration).toBe('15 minutes');
      expect(activities.activities[1].steps.length).toBe(2);
      
      // Check the third activity
      expect(activities.activities[2].title).toBe('Comparing Fractions');
      expect(activities.activities[2].duration).toBe('10 minutes');
      expect(activities.activities[2].steps.length).toBe(2);
      
      // Check the fourth activity
      expect(activities.activities[3].title).toBe('Applying Fractions to Real-World Problems');
      expect(activities.activities[3].duration).toBe('5 minutes');
      expect(activities.activities[3].steps.length).toBe(1);
    }
  });
});
