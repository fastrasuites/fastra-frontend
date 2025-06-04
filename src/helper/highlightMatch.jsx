import { escapeRegex } from "./helper";

export const highlightMatch = (text, query) => {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = String(text).split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} style={{ backgroundColor: "#ffeb3b", fontWeight: 500 }}>
        {part}
      </span>
    ) : (
      part
    )
  );
};
