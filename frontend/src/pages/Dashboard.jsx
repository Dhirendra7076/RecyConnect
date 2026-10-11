import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ROLE_LABELS, ROLE_EMOJI } from '../lib/constants'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const toast = useToast()

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center gap-2">
          <div className="text-5xl" aria-hidden="true">
            {ROLE_EMOJI[user.role] || '♻️'}
          </div>
          <h1 className="card-title text-2xl">
            Hi, {user.displayName}!
          </h1>
          <p className="opacity-70 text-sm">
            {ROLE_LABELS[user.role] || user.role} · {user.email}
          </p>
          <div className="divider my-2" />
          <p className="text-xs opacity-60">
            Role-aware dashboard coming in Step 4.
          </p>
          <Button
            variant="error"
            className="w-full mt-2"
            onClick={() => {
              logout()
              toast.info('Logged out')
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}