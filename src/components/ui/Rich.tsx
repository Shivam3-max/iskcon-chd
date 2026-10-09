import { Fragment } from "react";

/**
 * Admin-friendly inline formatting: *words* become the accent italic,
 * a line break becomes <br>. Everything else is plain text (never HTML).
 */
export default function Rich({ text, em = "text-maroon" }: { text?: string; em?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*[^*]+\*)/g).map((part, i) =>
            part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
              <em key={i} className={em}>{part.slice(1, -1)}</em>
            ) : (
              <Fragment key={i}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}
