import { marked } from "marked";
import DOMPurify from "dompurify";

// Force marked to return a string (not Promise)
export const renderMarkdown = (markdown: string): string => {
  const rawHtml = marked.parse(markdown) as string;
  return DOMPurify.sanitize(rawHtml);
};
