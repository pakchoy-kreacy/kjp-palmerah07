"use client";

interface LoginSelectorProps {
  onSelectParent: () => void;
  onSelectAdmin: () => void;
}

export function LoginSelector({
  onSelectParent,
  onSelectAdmin,
}: LoginSelectorProps) {
  return (
    <div className="animate-fade-in w-full text-center">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
        Pilih jenis login
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onSelectParent}
          className="group relative overflow-hidden rounded-xl border border-red-200 bg-red-50 px-2 py-3.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md active:translate-y-0"
        >
          <svg
            className="mx-auto mb-1 h-6 w-6 text-red-500 transition-colors group-hover:text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span className="relative z-10 block text-xs font-bold leading-tight text-gray-800">
            Orang Tua
          </span>
          <span className="relative z-10 mt-0.5 block text-[10px] font-semibold leading-tight text-gray-400">
            Masuk dengan NISN
          </span>
        </button>

        <button
          onClick={onSelectAdmin}
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-2 py-3.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100 hover:shadow-md active:translate-y-0"
        >
          <svg
            className="mx-auto mb-1 h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          <span className="relative z-10 block text-xs font-bold leading-tight text-gray-800">
            Admin
          </span>
          <span className="relative z-10 mt-0.5 block text-[10px] font-semibold leading-tight text-gray-400">
            Panel sekolah
          </span>
        </button>
      </div>
    </div>
  );
}
