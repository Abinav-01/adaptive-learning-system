import { useState } from 'react'
import './App.css'
import LessonPlayer from './components/LessonPlayer'

function App() {
  return (
    <main>
      <h1 style={{ textAlign: 'center', marginTop: 24 }}>Polynomials — Lesson Player</h1>
      <LessonPlayer />
    </main>
  )
}

export default App
