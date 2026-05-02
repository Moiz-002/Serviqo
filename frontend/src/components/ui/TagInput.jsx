'use client';

import { X } from 'lucide-react';
import { useRef, useState } from 'react';

const TagInput = ({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Type and press Enter...',
  maxTags = 12,
}) => {
  const [input, setInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);
    setSelectedSuggestionIndex(-1);

    if (text.trim().length > 0) {
      const filtered = suggestions.filter(
        (s) =>
          s.toLowerCase().includes(text.toLowerCase()) &&
          !value.includes(s)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (
      trimmed &&
      !value.includes(trimmed) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmed]);
      setInput('');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      inputRef.current?.focus();
    }
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        addTag(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions) {
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  const isMaxed = value.length >= maxTags;

  return (
    <div className="relative w-full">
      {/* Input Container with Tags */}
      <div className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-surface focus-within:border-border-focus focus-within:ring-1 focus-within:ring-border-focus transition-colors duration-150 min-h-12">
        {/* Render existing tags as pills */}
        {value.map((tag, index) => (
          <div
            key={`tag-${index}`}
            className="flex items-center gap-1.5 bg-primary-light text-text-brand rounded-full px-3 py-1 text-sm flex-shrink-0"
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(index)}
              className="flex items-center justify-center w-4 h-4 hover:bg-primary-hover/20 rounded-full transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => input && setShowSuggestions(filteredSuggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={isMaxed ? `Maximum ${maxTags} skills reached` : placeholder}
          disabled={isMaxed}
          className="flex-1 min-w-32 outline-none bg-transparent text-text-primary placeholder-text-tertiary disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                index === selectedSuggestionIndex
                  ? 'bg-primary-subtle text-text-brand'
                  : 'text-text-secondary hover:bg-primary-subtle'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-2 text-xs text-text-tertiary">
        {value.length} / {maxTags} skills
      </div>
    </div>
  );
};

export default TagInput;
