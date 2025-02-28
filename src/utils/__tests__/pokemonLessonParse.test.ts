
import { parseAIResponse } from "../lessonParser";

describe('Pokémon Lesson Plan Parser Test', () => {
  const pokemonLessonPlan = `**Lesson Plan: Mastering Fractions with Pokémon**

### 1. Learning Objectives

* Students will understand the concept of fractions and their real-world applications.
* Students will learn to identify, write, and simplify fractions.
* Students will apply fraction concepts to solve problems using Pokémon-themed scenarios.
* Students will demonstrate their understanding of fractions through a hands-on project and formative quiz.

### 2. Materials and Resources

* Whiteboard and markers
* Pokémon-themed worksheets and activity sheets
* Educational apps (e.g., Math Games, Fraction Wall) for auditory learners
* Tablets or laptops with internet access for each student
* Pokémon cards or figures for hands-on project
* Formative quiz worksheets
* Common Core State Standards for Mathematics (9th grade) reference guide

### 3. Introduction/Hook (10 minutes)

* Begin the lesson with a Pokémon-themed introduction, asking students if they have a favorite Pokémon and what they know about its statistics (e.g., HP, attack, and defense points).
* Write a sample fraction problem on the board, using a Pokémon scenario: "If Pikachu has 12/16 of its HP remaining, what fraction of its HP is gone?"
* Introduce the concept of fractions, explaining that they represent a part of a whole, and use the Pokémon example to illustrate this concept.
* Use an educational app to provide an auditory explanation of fractions, allowing students to listen and interact with the content.

### 4. Main Activities (40 minutes)

* **Hands-on Project (20 minutes):** Divide students into small groups and provide each group with a set of Pokémon cards or figures. Ask each group to create a Pokémon team with 4-6 members, assigning a fraction of HP to each member (e.g., 3/4, 1/2, 2/3). Students will work together to calculate the total HP of their team and determine the fraction of HP remaining after a simulated battle.
* **Guided Practice (10 minutes):** Use the educational app to provide guided practice exercises, where students can work in pairs to solve fraction problems using Pokémon-themed scenarios.
* **Independent Practice (10 minutes):** Provide students with a worksheet containing Pokémon-themed fraction problems, allowing them to work independently and apply their understanding of fractions.

### 5. Assessment Strategies

* **Formative Quiz (15 minutes):** Administer a formative quiz to assess students' understanding of fractions, using Pokémon-themed questions and scenarios.
* **Observation:** Observe students during the hands-on project and guided practice, taking note of their ability to apply fraction concepts and solve problems.

### 6. Differentiation Strategies

* **For auditory learners:** Use educational apps to provide auditory explanations and guided practice exercises, allowing students to listen and interact with the content.
* **For struggling students:** Provide additional support by offering one-on-one instruction, using visual aids to illustrate fraction concepts, and providing extra practice exercises.
* **For advanced students:** Offer challenging fraction problems, using Pokémon-themed scenarios with complex fractions (e.g., 3/4 ÷ 2/3).

### 7. Closure (5 minutes)

* Review the key concepts learned during the lesson, using Pokémon-themed examples to illustrate fraction concepts.
* Ask students to reflect on their learning, discussing what they enjoyed about the lesson and what they found challenging.
* Provide students with a preview of the next lesson, where they will continue to apply fraction concepts to real-world scenarios using Pokémon.`;

  it('should parse the Pokémon lesson plan without errors', () => {
    const parsedSections = parseAIResponse(pokemonLessonPlan);
    
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
    expect(materials?.content.length).toBe(7);
    
    // Check if activities are parsed correctly
    const activities = parsedSections.find(section => section.title === 'Activities');
    expect(activities?.activities).toBeDefined();
    
    if (activities?.activities) {
      expect(activities.activities.length).toBe(3);
      
      // Check the first activity
      expect(activities.activities[0].title).toBe('Hands-on Project');
      expect(activities.activities[0].duration).toBe('20 minutes');
      
      // Check the second activity
      expect(activities.activities[1].title).toBe('Guided Practice');
      expect(activities.activities[1].duration).toBe('10 minutes');
      
      // Check the third activity
      expect(activities.activities[2].title).toBe('Independent Practice');
      expect(activities.activities[2].duration).toBe('10 minutes');
    }
  });
});
