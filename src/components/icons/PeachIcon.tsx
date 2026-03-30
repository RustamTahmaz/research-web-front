import type { SVGProps } from "react";

const PeachIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.702 5.114A6 6 0 0 1 22 11c0 6.1-4.5 11-10 11S2 17.1 2 11a6 6 0 0 1 7.003-5.943" />
      <path d="M8.496 9.132a1 1 0 0 0-.282-.866L7.058 7.113a1 1 0 0 1 .572-1.822l1.633-.256A1 1 0 0 0 10 4.5l.75-1.476a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133z" />
    </svg>
  );
};

export default PeachIcon;
