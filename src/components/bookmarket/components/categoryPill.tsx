
import type { ReactNode } from "react";

export default function CategoryPill({
    label,
    active,
    onClick,
    Icon,
}: {
    label: string;
    active?: boolean;
    onClick?: () => void;
    Icon: ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`
        flex flex-col items-center gap-1 px-4 py-2 min-w-[70px]
        ${active ? "font-semibold" : ""}
      `}
        >
            <div
                className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${active ? "bg-white shadow-md" : "bg-[#D1FADF]"}
        `}
            >
                <span
                    className={`transition-colors ${active ? "text-[#A06F3F]" : "text-black"
                        }`}
                >
                    {Icon}
                </span>
            </div>

            <span
                className={`text-xs transition-all ${active ? "text-[#A06F3F]" : "text-gray-700"
                    }`}
            >
                {label}
            </span>
        </button>
    );
}

