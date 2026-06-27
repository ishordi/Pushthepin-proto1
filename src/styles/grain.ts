export function mountGrain(): () => void {
  const el = document.createElement('div');
  el.className = 'grain';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  return () => el.remove();
}
