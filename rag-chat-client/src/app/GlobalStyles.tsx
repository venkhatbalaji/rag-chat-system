import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
      }

      code {
        background: var(--code-bg);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.95rem;
      }

      pre {
        background: var(--pre-bg);
        color: var(--pre-text);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 0.95rem;
      }

      strong {
        font-weight: 600;
      }

      em {
        font-style: italic;
      }

      a {
        color: inherit;
        text-decoration: none;
      }
    `}
  />
);