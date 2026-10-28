import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const pipe = new MarkdownPipe();

  it('renders bold text as strong elements, not literal asterisks', () => {
    const html = pipe.transform('There are **11** total employees');

    expect(html).toContain('<strong>11</strong>');
    expect(html).not.toContain('**');
  });

  it('renders bullet lists as list items', () => {
    const html = pipe.transform('* **Name:** Arnav\n* **Job Title:** Engineer');

    expect(html).toContain('<li>');
    expect(html).not.toMatch(/^\s*\*/m);
  });

  it('strips script tags from model output', () => {
    const html = pipe.transform('Hello <script>alert(1)</script>');

    expect(html).not.toContain('<script');
  });
});
