import { useState, useEffect } from 'react'

const useIntersectionObserver = (options) => {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      setEntries(entries)
    }, options)

    const elements = document.querySelectorAll('[data-observe]')
    elements.forEach(element => observer.observe(element))

    return () => {
      elements.forEach(element => observer.unobserve(element))
    }
  }, [options])

  return entries
}

export default useIntersectionObserver