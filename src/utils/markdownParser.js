import matter from 'gray-matter';

/**
 * Parse markdown content with frontmatter
 * @param {string} markdown - Raw markdown content
 * @returns {Object} Parsed content and metadata
 */
export function parseMarkdown(markdown) {
  try {
    const { data, content } = matter(markdown);

    // Ensure frontmatter is completely removed
    // gray-matter should handle this, but double-check
    const cleanContent = content.replace(/^---[\s\S]*?---\n*/m, '').trim();

    return {
      frontmatter: data,
      content: cleanContent,
    };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback: manually strip frontmatter if gray-matter fails
    const cleanContent = markdown.replace(/^---[\s\S]*?---\n*/m, '').trim();
    return {
      frontmatter: {},
      content: cleanContent,
    };
  }
}

/**
 * Load lesson markdown file
 * @param {string} lessonId - Lesson identifier
 * @returns {Promise<Object>} Parsed lesson data
 */
export async function loadLesson(lessonId) {
  try {
    // In production, lessons would be in public/lessons or imported dynamically
    // For now, we'll return sample content
    const module = lessonId.split('-')[0];
    const response = await fetch(`/lessons/module-${module}/${lessonId}.md`);

    if (!response.ok) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    const markdown = await response.text();
    return parseMarkdown(markdown);
  } catch (error) {
    console.error('Error loading lesson:', error);
    // Return default content if file not found
    return {
      frontmatter: {
        id: lessonId,
        title: 'Lesson Not Found',
        module: 1,
        lesson: 1,
        points: 0,
        estimatedTime: 0,
      },
      content: '# Lesson content not yet available\n\nThis lesson is under development.',
    };
  }
}
