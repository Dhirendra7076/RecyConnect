import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { validateSignup } from '../lib/validators'
import { ROLES, ROLE_LABELS, ROLE_EMOJI } from '../lib/constants'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const ROLE_OPTIONS = [ROLES.HOUSEHOLD, ROLES.RECYCLER, ROLES.BUSINESS]

export default function Signup() {
  const { register, isAuthenticated, loading: bootLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    role: ROLES.HOUSEHOLD,
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!bootLoading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [bootLoading, isAuthenticated, navigate])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { valid, errors: v } = validateSignup(form)
    if (!valid) return setErrors(v)

    setBusy(true)
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        role: form.role,
      })
      toast.success('Account created — welcome to RecyConnect!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Signup failed')
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
        className="card w-full max-w-lg bg-base-100 shadow-xl"
        noValidate
      >
        <div className="card-body gap-2">
          <h1 className="card-title text-2xl">Create your account</h1>
          <p className="text-sm opacity-70 mb-2">Takes less than a minute.</p>

          {/* ---------- Role selector ---------- */}
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text font-medium">I am a…</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const active = form.role === r
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setForm((f) => ({ ...f, role: r }))
                      if (errors.role) setErrors((p) => ({ ...p, role: undefined }))
                    }}
                    className={[
                      'btn h-auto py-3 flex-col items-start text-left normal-case justify-start',
                      active
                        ? 'btn-primary'
                        : 'btn-outline border-base-300 text-base-content',
                    ].join(' ')}
                    aria-pressed={active}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {ROLE_EMOJI[r]}
                    </span>
                    <span className="text-sm font-semibold mt-1">
                      {ROLE_LABELS[r]}
                    </span>
                  </button>
                )
              })}
            </div>
            {errors.role && (
              <label className="label pt-1">
                <span className="label-text-alt text-error">{errors.role}</span>
              </label>
            )}
          </div>

          <div className="divider my-1" />

          <Input
            label="Full name"
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            value={form.displayName}
            onChange={set('displayName')}
            error={errors.displayName}
          />

          <Input
            label="Phone number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            hint="Used by recyclers to coordinate pickup"
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
            Create account
          </Button>

          <p className="text-center text-sm mt-2">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}