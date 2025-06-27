const tagColorCache = new Map<string, string>()

export const getRandomColor = (key: string, opacity = 0.4): string => {
    if (tagColorCache.has(key)) {
        return tagColorCache.get(key)!
    }

    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }

    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`
    tagColorCache.set(key, rgba)
    return rgba
}