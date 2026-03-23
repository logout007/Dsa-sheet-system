import { useContext } from 'react'
import { ProgressContext } from '../context/ProgressContext'

export function useProgress() {
  return useContext(ProgressContext)
}
