export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">
      <div className="text-6xl" aria-hidden="true">♻️</div>
      <h1 className="text-3xl font-bold tracking-tight">RecyConnect</h1>
      <p className="opacity-70 text-center max-w-md">
        Step&nbsp;1 is running. Vite + React + Tailwind + DaisyUI are wired up.
      </p>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-outline">Outline</button>
        <span className="badge badge-success badge-lg">DaisyUI OK</span>
      </div>
    </div>
  )
}