
import { parseActivities } from "../lessonParser";

describe('parseActivities Function', () => {
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

  it('handles multiple activities', () => {
    const activities = parseActivities([
      'Activity 1: First Activity (5 minutes) - Step one. Step two.',
      'Activity 2: Second Activity (10 minutes) - Another step.'
    ]);
    
    expect(activities.length).toBe(2);
    expect(activities[0].title).toBe('First Activity');
    expect(activities[1].title).toBe('Second Activity');
    expect(activities[0].steps.length).toBe(2);
    expect(activities[1].steps.length).toBe(1);
  });

  it('handles empty input', () => {
    expect(parseActivities([])).toEqual([]);
  });
});
