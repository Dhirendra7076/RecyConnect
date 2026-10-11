import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[RecyConnect] Unhandled UI error:', error, info)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.href = '/'
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body items-center text-center gap-3">
            <div className="text-5xl" aria-hidden="true">💥</div>
            <h1 className="card-title">Something went wrong</h1>
            <p className="text-sm opacity-70">
              We hit an unexpected error. Your data is safe — just reload to
              continue.
            </p>
            {error?.message && (
              <p className="text-xs font-mono bg-base-200 rounded px-2 py-1 max-w-full overflow-x-auto">
                {error.message}
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary w-full mt-2"
              onClick={this.handleReload}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }
}