const MOBILE_OFFSET = 100

export function scrollTo (element, isMobile) {
  const el = document.querySelector(element)
  if (!el) return
  const y = el?.getBoundingClientRect().top +  window.scrollY - (isMobile ? MOBILE_OFFSET : 0)
  window.scrollTo({top: y, behavior: 'smooth'})
}