import type { SVGProps } from 'react'

/** CRA-style `{ ReactComponent }` import expected by impact-ui HomePage for launch.svg. */
export function ReactComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 28 28"
      aria-hidden
      {...props}
    >
      <rect width="28" height="28" rx="4" fill="#6962ef" />
    </svg>
  )
}
