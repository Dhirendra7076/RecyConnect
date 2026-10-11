import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { validateLogin } from '../lib/validators'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const { login, isAuthenticated, loading: bootLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  // If already logged in, don't show the form.
  useEffect(() => {
    if (!bootLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [bootLoading, isAuthenticated, navigate, from])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { valid, errors: v } = validateLogin(form)
    if (!valid) return setErrors(v)

    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-emerald-50 to-emerald-100">
      <Link
        to="/"
        className="text-3xl font-bold mb-6 flex items-center gap-2 text-emerald-800"
      >
        <span aria-hidden="true">♻️</span> RecyConnect
      </Link>

      <form
        onSubmit={onSubmit}
        className="card w-full max-w-md bg-base-100 shadow-xl"
        noValidate
      >
        <div className="card-body gap-2">
          <h1 className="card-title text-2xl">Sign in</h1>
          <p className="text-sm opacity-70 mb-2">
            Welcome back. Let’s keep the city clean.
          </p>

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={busy}
            className="w-full mt-3"
          >
            Sign in
          </Button>

          <p className="text-center text-sm mt-2">
            New here?{' '}
            <Link to="/signup" className="link link-primary font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}