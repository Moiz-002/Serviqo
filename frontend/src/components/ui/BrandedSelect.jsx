'use client';

import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function getTextContent(children) {
  return Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return child;
    if (isValidElement(child)) return getTextContent(child.props.children);
    return '';
  }).join('');
}

function getOptions(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === 'option') {
      const label = getTextContent(child.props.children).trim();
      return [{
        value: String(child.props.value ?? label),
        label,
        disabled: Boolean(child.props.disabled),
      }];
    }
    if (child.type === 'optgroup') return getOptions(child.props.children);
    return [];
  });
}

export default function BrandedSelect({
  id,
  name,
  value,
  defaultValue,
  onChange,
  children,
  className = '',
  containerClassName = '',
  getOptionIcon,
  disabled = false,
  required = false,
  placeholder,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}) {
  const generatedId = useId();
  const selectId = id || `branded-select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;
  const options = getOptions(children);
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ''));
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const rootRef = useRef(null);
  const listboxRef = useRef(null);
  const optionRefs = useRef([]);
  const typeaheadRef = useRef({ value: '', timeout: null });
  const selectedValue = String(value ?? internalValue);
  const selectedIndex = Math.max(options.findIndex((option) => option.value === selectedValue), 0);
  const selectedOption = options.find((option) => option.value === selectedValue);

  const findEnabledIndex = (startIndex, direction) => {
    if (!options.length) return -1;
    const step = direction < 0 ? -1 : 1;
    for (let offset = 0; offset < options.length; offset += 1) {
      const index = (startIndex + step * offset + options.length * 2) % options.length;
      if (!options[index].disabled) return index;
    }
    return -1;
  };

  const closeListbox = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openListbox = (focusIndex = selectedIndex, direction = 1) => {
    if (disabled) return;
    const enabledIndex = findEnabledIndex(focusIndex, direction);
    setIsOpen(true);
    if (enabledIndex >= 0) requestAnimationFrame(() => optionRefs.current[enabledIndex]?.focus());
  };

  const selectOption = (option) => {
    if (option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onChange?.({
      target: { name, value: option.value },
      currentTarget: { name, value: option.value },
    });
    closeListbox(true);
  };

  const moveFocus = (index, direction) => {
    const step = direction < 0 ? -1 : 1;
    let nextIndex = index;
    for (let attempts = 0; attempts < options.length; attempts += 1) {
      nextIndex = (nextIndex + step + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        optionRefs.current[nextIndex]?.focus();
        return;
      }
    }
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openListbox(
        event.key === 'ArrowDown' ? selectedIndex : Math.max(options.length - 1, 0),
        event.key === 'ArrowDown' ? 1 : -1,
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      openListbox(
        event.key === 'Home' ? 0 : Math.max(options.length - 1, 0),
        event.key === 'Home' ? 1 : -1,
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) closeListbox();
      else openListbox();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeListbox();
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = findEnabledIndex(
        event.key === 'Home' ? 0 : options.length - 1,
        event.key === 'Home' ? 1 : -1,
      );
      if (nextIndex >= 0) optionRefs.current[nextIndex]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(options[index]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeListbox(true);
    } else if (event.key === 'Tab') {
      closeListbox();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current.value += event.key.toLocaleLowerCase();
      clearTimeout(typeaheadRef.current.timeout);
      typeaheadRef.current.timeout = setTimeout(() => {
        typeaheadRef.current.value = '';
      }, 500);
      const startIndex = (index + 1) % options.length;
      const nextIndex = [...options.slice(startIndex), ...options.slice(0, startIndex)]
        .findIndex((option) => !option.disabled
          && option.label.toLocaleLowerCase().startsWith(typeaheadRef.current.value));
      if (nextIndex >= 0) {
        event.preventDefault();
        moveFocus((startIndex + nextIndex - 1 + options.length) % options.length, 1);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutsidePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !listboxRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [isOpen]);

  useEffect(() => () => clearTimeout(typeaheadRef.current.timeout), []);

  return (
    <div ref={rootRef} className={`branded-select relative w-full min-w-0 ${containerClassName}`}>
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        name={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={() => (isOpen ? closeListbox() : openListbox())}
        onKeyDown={handleTriggerKeyDown}
        className={`branded-select-trigger flex w-full min-w-0 items-center justify-between gap-3 text-left focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedOption ? '' : 'text-text-tertiary'}`}>
          {selectedOption?.label || placeholder || options[0]?.label || 'Select an option'}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-current opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={ariaLabelledBy || undefined}
          aria-label={ariaLabel || undefined}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[200] max-h-72 overflow-y-auto rounded-2xl border border-navy-100 bg-white p-2 shadow-[0_18px_45px_rgba(4,11,46,0.18)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const OptionIcon = getOptionIcon?.(option.value, option.label);
            return (
              <div
                key={`${option.value}-${index}`}
                ref={(element) => { optionRefs.current[index] = element; }}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                tabIndex={-1}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none transition-colors ${
                  option.disabled
                    ? 'cursor-not-allowed text-neutral-400'
                    : isSelected
                      ? 'cursor-pointer bg-navy-50 text-navy-900'
                      : 'cursor-pointer text-navy-700 hover:bg-neutral-50 focus:bg-cyan-50 focus:text-navy-900'
                }`}
              >
                {OptionIcon && <OptionIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-700" />}
                <span className="min-w-0 flex-1 whitespace-normal break-words">{option.label}</span>
                {isSelected && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-700" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
