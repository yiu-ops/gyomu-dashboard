export const CATEGORIES = [
  "교원인사",
  "비전임조교관리",
  "겸직관리",
  "교원연수출장",
  "교원업적평가",
  "위원회운영",
  "교원상벌",
  "교원연구활동지원",
  "기타업무",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Tailwind bg + text 클래스 쌍
export const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  교원인사:       { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-200" },
  비전임조교관리: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  겸직관리:       { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
  교원연수출장:   { bg: "bg-cyan-100",   text: "text-cyan-800",   border: "border-cyan-200" },
  교원업적평가:   { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-200" },
  위원회운영:     { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-200" },
  교원상벌:       { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-200" },
  교원연구활동지원: { bg: "bg-teal-100", text: "text-teal-800",   border: "border-teal-200" },
  기타업무:       { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-200" },
};

export function getCategoryStyle(category: string) {
  return (
    CATEGORY_STYLE[category] ?? {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
    }
  );
}
