/**
 * AutoSuggestInput Component
 *
 * Text input with inline suggestions (Apple Calendar style).
 * Suggestions appear below the input with dividers, expanding the section.
 */

import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'

export type AutoSuggestInputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  /** Current input value */
  value: string
  /** Change handler */
  onChangeText: (text: string) => void
  /** Function to get suggestions for a query */
  getSuggestions: (query: string) => string[]
  /** Minimum characters before showing suggestions */
  minChars?: number
  /** Maximum suggestions to show */
  maxSuggestions?: number
  /** Debounce delay in ms */
  debounceMs?: number
  /** Input ref forwarding */
  inputRef?: React.RefObject<TextInput | null>
}

export function AutoSuggestInput({
  value,
  onChangeText,
  getSuggestions,
  minChars = 2,
  maxSuggestions = 3,
  debounceMs = 150,
  inputRef,
  style,
  ...textInputProps
}: AutoSuggestInputProps) {
  const theme = useHoHTheme()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const internalRef = useRef<TextInput | null>(null)
  const ref = inputRef || internalRef

  const updateSuggestions = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (query.trim().length < minChars) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      debounceRef.current = setTimeout(() => {
        const results = getSuggestions(query).slice(0, maxSuggestions)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      }, debounceMs)
    },
    [getSuggestions, minChars, maxSuggestions, debounceMs]
  )

  const handleChangeText = (text: string) => {
    onChangeText(text)
    updateSuggestions(text)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeText(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    if (value.trim().length >= minChars) {
      updateSuggestions(value)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const renderHighlightedText = (text: string, query: string) => {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase().trim()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1 || !lowerQuery) {
      return <Text style={[styles.suggestionText, { color: theme.semantic.text }]}>{text}</Text>
    }

    const before = text.slice(0, index)
    const match = text.slice(index, index + lowerQuery.length)
    const after = text.slice(index + lowerQuery.length)

    return (
      <Text style={[styles.suggestionText, { color: theme.semantic.text }]}>
        {before}
        <Text style={{ fontWeight: fontWeight.semibold }}>{match}</Text>
        {after}
      </Text>
    )
  }

  return (
    <View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, { color: theme.semantic.text }, style]}
        placeholderTextColor={theme.semantic.textSecondary}
        {...textInputProps}
      />

      {/* Inline suggestions - Apple Calendar style */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { borderTopColor: theme.semantic.border }]}>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion}-${index}`}
              onPress={() => handleSelectSuggestion(suggestion)}
              style={({ pressed }) => [
                styles.suggestionRow,
                index < suggestions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.semantic.border,
                },
                pressed && { opacity: 0.6 },
              ]}
            >
              {renderHighlightedText(suggestion, value)}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: fontSize.lg,
    paddingVertical: 4,
  },
  suggestionsContainer: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  suggestionRow: {
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: fontSize.lg,
  },
})
