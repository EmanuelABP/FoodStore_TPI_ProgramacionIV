import type { ReactNode } from "react";

interface Props {
  titulo: string;
  onSubmit: () => void;
  children: ReactNode;
}

export default function AuthForm({ titulo, onSubmit, children }: Props) {
  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">{titulo}</h1>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900" noValidate
        onSubmit={(evento) => { evento.preventDefault(); onSubmit(); }}>
        {children}
      </form>
    </main>
  );
}
