
import { cleanMarkdown } from "../lessonParser";

describe('cleanMarkdown Function', () => {
  it('removes markdown formatting characters', () => {
    expect(cleanMarkdown('**bold text**')).toBe('bold text');
    expect(cleanMarkdown('_italic text_')).toBe('italic text');
    expect(cleanMarkdown('`code text`')).toBe('code text');
    expect(cleanMarkdown('***bold italic***')).toBe('bold italic');
  });

  it('handles multiple markdown styles in one string', () => {
    expect(cleanMarkdown('**bold** and _italic_')).toBe('bold and italic');
    expect(cleanMarkdown('`code` and **bold**')).toBe('code and bold');
  });

  it('returns empty string for null or undefined input', () => {
    expect(cleanMarkdown('')).toBe('');
    expect(cleanMarkdown(null as any)).toBe('');
    expect(cleanMarkdown(undefined as any)).toBe('');
  });
});
