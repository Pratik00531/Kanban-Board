export const playCompletionSound = () => {
  if (typeof window === 'undefined') return
  
  // Using Web Audio API to generate a pleasant completion sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Pleasant chime sound (E5 -> C6)
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime) // E5
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.1) // C6
    
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log('Audio playback not supported')
  }
}
