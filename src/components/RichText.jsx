/**
 * RichText — renders HTML from the rich text editor safely.
 * Also handles plain text (no HTML) by rendering it as-is.
 */
export default function RichText({ html, className, style }) {
  if (!html) return null;

  // Sanitize — strip script tags and event handlers
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

  return (
    <div
      className={`rich-text ${className || ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
