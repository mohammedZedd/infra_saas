import React, { Component } from "react"
import type { ReactNode } from "react"

interface State {
  hasError: boolean
  error?: Error
}

interface Props {
  children: ReactNode
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("CanvasErrorBoundary caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-center p-8">
          <h2 className="text-lg font-semibold text-red-600">Unable to load canvas</h2>
          {this.state.error && (
            <pre className="mt-2 max-w-lg overflow-x-auto text-xs text-gray-700 bg-white p-2 rounded">
              {this.state.error.message}
            </pre>
          )}
          <p className="mt-2 text-sm text-gray-600">
            An unexpected error occurred while initializing the editor. Please try again or
            re-select a cloud provider.
          </p>
          <button
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Reload Canvas
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
