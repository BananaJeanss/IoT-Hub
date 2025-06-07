import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure marked with secure settings
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to prevent XSS
const renderer = new marked.Renderer();

// Define types for marked tokens
interface LinkToken {
  href?: string;
  title?: string | null;
  text?: string;
}

interface ImageToken {
  href?: string;
  title?: string | null;
  text?: string;
}

interface CodeToken {
  text?: string;
  lang?: string;
}

// Override link rendering to add security attributes
renderer.link = (token: LinkToken) => {
  const href = token.href || '';
  const title = token.title || '';
  const text = token.text || '';
  const titleAttr = title ? ` title="${DOMPurify.sanitize(title)}"` : '';
  return `<a href="${DOMPurify.sanitize(href)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${DOMPurify.sanitize(text)}</a>`;
};

// Override image rendering with security
renderer.image = (token: ImageToken) => {
  const src = token.href || '';
  const title = token.title || '';
  const alt = token.text || '';
  const titleAttr = title ? ` title="${DOMPurify.sanitize(title)}"` : '';
  const altAttr = alt ? ` alt="${DOMPurify.sanitize(alt)}"` : '';
  return `<img src="${DOMPurify.sanitize(src)}"${titleAttr}${altAttr} style="max-width: 100%; height: auto;" loading="lazy" />`;
};

// Override code block rendering
renderer.code = (token: CodeToken) => {
  const code = token.text || '';
  const language = token.lang || '';
  const lang = language ? DOMPurify.sanitize(language) : '';
  const langClass = lang ? ` class="language-${lang}"` : '';
  return `<pre><code${langClass}>${DOMPurify.sanitize(code)}</code></pre>`;
};

marked.use({ renderer });

// DOMPurify configuration
const purifyConfig = {
  ALLOWED_TAGS: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'strong',
    'em',
    'u',
    'strike',
    'del',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'div',
    'span',
  ],
  ALLOWED_ATTR: [
    'href',
    'target',
    'rel',
    'title',
    'src',
    'alt',
    'width',
    'height',
    'style',
    'class',
    'id',
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
};

/**
 * Safely converts markdown to HTML with XSS protection
 * @param markdown - The markdown string to convert
 * @returns Sanitized HTML string
 */
export function markdownToSafeHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    // First convert markdown to HTML
    const rawHtml = marked(markdown) as string;

    // Then sanitize the HTML to prevent XSS
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, purifyConfig);

    return sanitizedHtml;
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Return escaped plain text as fallback
    return DOMPurify.sanitize(
      markdown.replace(/[<>&"']/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;',
        };
        return entities[char];
      }),
    );
  }
}

/**
 * Validates and sanitizes user input before storing
 * @param content - Raw user input
 * @returns Sanitized content safe for storage
 */
export function sanitizeUserContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove any potential script tags and dangerous content
  let cleaned = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=/gi, '');

  return cleaned.trim();
}

/**
 * Extracts plain text from markdown for search/preview purposes
 * @param markdown - The markdown string
 * @returns Plain text without markdown formatting
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Convert to HTML first, then strip tags
  const html = marked(markdown) as string;
  const plainText = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return plainText;
}
