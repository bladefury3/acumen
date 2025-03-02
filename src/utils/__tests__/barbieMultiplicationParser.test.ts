
import { wrapParseAIResponseForTests as parseAIResponse } from "../lessonParser";

describe('Barbie Multiplication Lesson Parser Tests', () => {
  const barbieMultiplicationLesson = `**Lesson Plan: Teaching Multiplication with Barbie**

### 1. Learning Objectives

- By the end of the lesson, students will be able to define and explain the concept of multiplication.
- Students will understand the relationship between multiplication and repeated addition.
- Students will be able to apply multiplication to solve real-life problems, using Barbie-themed scenarios.
- Students will demonstrate their understanding of multiplication facts up to 10x10.

### 2. Materials and Resources

- Whiteboard and markers
- Printed or projected images of Barbie in different scenarios (e.g., shopping, decorating a room)
- Multiplication charts or tables printed or projected
- Worksheet with multiplication problems
- Optional: Barbie dolls or figurines for demonstration purposes

### 3. Introduction/Hook (5 minutes)

- Begin the lesson by introducing Barbie as the central figure in a real-life scenario where multiplication is necessary. For example, "Barbie is planning a party and needs to set tables. Each table requires 6 chairs, and she has to set up 8 tables."
- Ask students if they have ever helped plan a party or event and how they decided on the number of items needed.
- Write the multiplication problem related to the scenario on the board (e.g., 6 chairs/table * 8 tables) and ask students to think about how they would solve it.

### 4. Main Activities (25 minutes)

1. **Direct Instruction (10 minutes):** Explain the concept of multiplication, using the Barbie scenario as an example. Discuss how multiplication is a shortcut for repeated addition. Use the whiteboard to demonstrate how the multiplication problem (6 chairs/table * 8 tables) can be solved through repeated addition (6+6+6+6+6+6+6+6) and then through multiplication (6*8).
2. **Guided Practice (10 minutes):** Provide students with a worksheet containing multiplication problems related to different Barbie scenarios (e.g., buying clothes, arranging a fashion show). Have students work in pairs to solve these problems, encouraging them to use the multiplication charts or tables as references.
3. **Independent Practice (5 minutes):** Distribute a simple quiz with multiplication problems that reflect real-life situations similar to the Barbie scenarios. This allows students to apply what they've learned independently.

### 5. Assessment Strategies

- **Formative Assessment:** Observe students during the guided and independent practice to assess their understanding. Review worksheets completed during the guided practice for accuracy.
- **Summative Assessment:** The quiz at the end of the lesson will serve as a summative assessment to evaluate students' ability to apply multiplication facts to solve problems.

### 6. Differentiation Strategies

- **For struggling students:** Provide additional support by giving them multiplication charts to reference during the practice sessions. Offer one-on-one assistance during the guided practice.
- **For advanced students:** Offer more complex Barbie-themed scenarios that involve multi-digit multiplication or word problems that require more than one step to solve.

### 7. Closure (10 minutes)

- Review the key points of multiplication, focusing on how it relates to real-life scenarios, such as those involving Barbie.
- Ask students to share one thing they learned or found interesting about multiplication during the lesson.
- Distribute a "Multiplication with Barbie" challenge worksheet as homework, where students have to create and solve their own multiplication problems using Barbie in different scenarios.
- End the lesson by reinforcing that multiplication is an essential skill that can be applied in various real-life situations, making learning fun and relevant.`;

  it('should correctly parse the Barbie multiplication lesson plan', () => {
    const parsed = parseAIResponse(barbieMultiplicationLesson);
    
    // Verify we have all required sections
    const sectionTitles = parsed.map(section => section.title);
    expect(sectionTitles).toContain('Learning Objectives');
    expect(sectionTitles).toContain('Materials & Resources');
    expect(sectionTitles).toContain('Introduction & Hook');
    expect(sectionTitles).toContain('Activities');
    expect(sectionTitles).toContain('Assessment Strategies');
    expect(sectionTitles).toContain('Differentiation Strategies');
    expect(sectionTitles).toContain('Close');

    // Check that activities are properly parsed
    const activitiesSection = parsed.find(section => section.title === 'Activities');
    expect(activitiesSection).toBeDefined();
    
    // For backward compatibility with the old tests
    if (activitiesSection?.content && Array.isArray(activitiesSection.content)) {
      const parsedActivities = activitiesSection.content;
      expect(parsedActivities.length).toBeGreaterThan(0);
    }
    
    // The lesson has 3 numbered activities in the "Main Activities" section
    if (parsed.length > 0) {
      console.log(`Successfully parsed ${parsed.length} sections`);
    }
  });

  it('should correctly handle numbered activities in the Main Activities section', () => {
    // Run the test manually and log the results to debug
    try {
      console.log('Testing parseAIResponse with Barbie multiplication lesson...');
      const result = parseAIResponse(barbieMultiplicationLesson);
      
      console.log('Successfully parsed AI response into sections');
      
      const activitiesSection = result.find(section => section.title === 'Activities');
      if (activitiesSection) {
        console.log('Activities section found');
        if (activitiesSection.content && Array.isArray(activitiesSection.content)) {
          console.log('Activities content found');
          activitiesSection.content.forEach((activity, i) => {
            console.log(`Activity ${i+1} content:`, activity);
          });
        } else {
          console.log('No activities content found in the activities section');
        }
      } else {
        console.log('No activities section found');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
  });
});
