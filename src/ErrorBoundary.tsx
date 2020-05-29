import * as React from 'react';

type Props = {};
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
    state = { hasError: false };

    // Not needed?
    // componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {}

    static getDerivedStateFromError(error: unknown) {
        return { hasError: true };
    }

    render() {
        return this.state.hasError ? (
            <div>Caught error</div>
        ) : (
            this.props.children
        );
    }
}
