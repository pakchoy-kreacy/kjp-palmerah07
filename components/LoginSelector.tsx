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
    <div className="animate-fade-in w-full max-w-sm space-y-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-white/60">
        Pilih jenis login
      </p>

      <div className="space-y-3">
        <button
          onClick={onSelectParent}
          className="group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-left text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/40 hover:bg-white/20 hover:shadow-xl active:scale-[0.98]"
        >
          <span className="relative z-10 block text-lg font-semibold">
            Login Orang Tua
          </span>
          <span className="relative z-10 block mt-0.5 text-sm text-white/60">
            Masuk menggunakan NISN siswa
          </span>
        </button>

        <button
          onClick={onSelectAdmin}
          className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-left text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:bg-white/15 hover:shadow-xl active:scale-[0.98]"
        >
          <span className="relative z-10 block text-lg font-semibold">
            Login Admin
          </span>
          <span className="relative z-10 block mt-0.5 text-sm text-white/60">
            Masuk ke panel admin sekolah
          </span>
        </button>
      </div>
    </div>
  );
}
