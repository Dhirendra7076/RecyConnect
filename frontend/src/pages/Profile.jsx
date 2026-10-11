import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ROLE_EMOJI, ROLE_LABELS } from '../lib/constants'
import { initials } from '../lib/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Profile() {
  const { user, logout } = useAuth()
  const toast = useToast()

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold">Profile</h1>
        <p className="text-sm opacity-70 mt-1">Your account details.</p>
      </header>

      <Card>
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-16">
              <span className="text-xl font-bold">
                {initials(user.displayName)}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-lg truncate">{user.displayName}</p>
            <p className="text-sm opacity-70">
              {ROLE_EMOJI[user.role]} {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>

        <div className="divider my-2" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="opacity-60">Email</dt>
            <dd className="font-medium truncate">{user.email}</dd>
          </div>
          {user.phone && (
            <div className="flex justify-between gap-3">
              <dt className="opacity-60">Phone</dt>
              <dd className="font-medium">{user.phone}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="opacity-60">Account type</dt>
            <dd className="font-medium capitalize">{user.role}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold text-base mb-2">Session</h2>
        <p className="text-sm opacity-70 mb-3">
          Sign out of this device. Your listings and impact history stay safe.
        </p>
        <Button
          variant="error"
          onClick={() => {
            logout()
            toast.info('Logged out')
          }}
        >
          🚪 Log out
        </Button>
      </Card>
    </div>
  )
}