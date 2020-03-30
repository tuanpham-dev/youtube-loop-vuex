export default function debounce (fn, delay, ...args) {
  var timeout = null

  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
