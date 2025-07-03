import React, { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.tsx'

type Theme = 'light' | 'dark'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'light'
    })

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme')
        document.body.classList.add(`${theme}-theme`)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
