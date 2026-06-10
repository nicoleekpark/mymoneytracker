/**
 * useKeyboardHeight
 *
 * Hook that returns the current keyboard height.
 * Use this to add dynamic padding to ScrollViews so content
 * can be scrolled above the keyboard.
 *
 * Usage:
 * ```tsx
 * const keyboardHeight = useKeyboardHeight()
 *
 * <ScrollView
 *   contentContainerStyle={{ paddingBottom: basePadding + keyboardHeight }}
 * >
 *   ...
 * </ScrollView>
 * ```
 */

import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return keyboardHeight
}
