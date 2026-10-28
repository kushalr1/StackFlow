import { Pipe, PipeTransform } from '@angular/core';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/** Renders assistant Markdown to HTML. Output is sanitized, so model text can never inject script. */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    const html = marked.parse(value, { async: false, breaks: true, gfm: true });
    return DOMPurify.sanitize(html);
  }
}
