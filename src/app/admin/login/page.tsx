import { signIn } from "../actions";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-brand-800">Ingreso del personal</h1>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">
          {error === "config"
            ? "El área de personal no está configurada (falta Supabase)."
            : "Correo o contraseña incorrectos."}
        </p>
      )}
      <form action={signIn} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="font-medium">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 block w-full rounded-lg border border-gray-400 px-3 py-2.5"
          />
        </div>
        <div>
          <label htmlFor="password" className="font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-lg border border-gray-400 px-3 py-2.5"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
