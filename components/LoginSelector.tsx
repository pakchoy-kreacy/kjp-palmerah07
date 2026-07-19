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
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
        Pilih jenis login
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSelectParent}
          className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/12 px-4 py-6 text-center text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/50 hover:bg-white/20 hover:shadow-xl active:scale-[0.97]"
        >
          <svg
            className="mx-auto mb-2 h-8 w-8 text-white/70 transition-colors group-hover:text-white"
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
          <span className="relative z-10 block text-sm font-bold leading-tight">
            Orang Tua
          </span>
          <span className="relative z-10 mt-0.5 block text-[11px] font-medium text-white/50 leading-tight">
            Masuk dengan NISN
          </span>
        </button>

        <button
          onClick={onSelectAdmin}
          className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/8 px-4 py-6 text-center text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/40 hover:bg-white/15 hover:shadow-xl active:scale-[0.97]"
        >
          <svg
            className="mx-auto mb-2 h-8 w-8 text-white/50 transition-colors group-hover:text-white"
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
          <span className="relative z-10 block text-sm font-bold leading-tight">
            Admin
          </span>
          <span className="relative z-10 mt-0.5 block text-[11px] font-medium text-white/50 leading-tight">
            Panel sekolah
          </span>
        </button>
      </div>
    </div>
  );
}
