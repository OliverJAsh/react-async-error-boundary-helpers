import * as React from 'react';
import { render } from 'react-dom';
import { ErrorBoundary } from './ErrorBoundary';

// https://github.com/facebook/react/issues/13523#issuecomment-417605976
// https://medium.com/trabe/catching-asynchronous-errors-in-react-using-error-boundaries-5e8a5fd7b971
// https://github.com/facebook/react/issues/14981
// https://github.com/facebook/react/issues/14981#issuecomment-468460187

const rethrowErrorInsideSetState = (
    setStateCallback: (fn: () => any) => void,
) => <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => (
    ...args
) => {
    try {
        return fn(...args);
    } catch (e) {
        setStateCallback(() => {
            throw e;
        });
        throw new Error('Error was thrown inside React state callback.');
    }
};
const createAsyncErrorBoundaryWorkaround = rethrowErrorInsideSetState;
const useAsyncErrorBoundaryWorkaround = () => {
    const [, setState] = React.useState(null);
    return React.useMemo(() => createAsyncErrorBoundaryWorkaround(setState), [
        setState,
    ]);
};

//
// Begin example
//

class AsyncClassWithout extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            throw new Error('AsyncClassWithout');
        });
    }

    render() {
        return null;
    }
}

class AsyncClassWith extends React.Component {
    componentDidMount() {
        const asyncErrorBoundaryWorkaround = createAsyncErrorBoundaryWorkaround(
            this.setState.bind(this),
        );
        setTimeout(
            asyncErrorBoundaryWorkaround(() => {
                throw new Error('AsyncClassWith');
            }),
        );
    }

    render() {
        return null;
    }
}

const AsyncFCWithout: React.FC = () => {
    React.useEffect(() => {
        setTimeout(() => {
            throw new Error('AsyncFCWithout');
        });
    }, []);

    return null;
};

const AsyncFCWith: React.FC = () => {
    const asyncErrorBoundaryWorkaround = useAsyncErrorBoundaryWorkaround();

    React.useEffect(() => {
        setTimeout(
            asyncErrorBoundaryWorkaround(() => {
                throw new Error('AsyncFCWith');
            }),
        );
    }, []);

    return null;
};

class Sync extends React.Component {
    render() {
        throw new Error('Sync');
        return null;
    }
}

render(
    <ErrorBoundary>
        {/* <AsyncClassWithout /> */}
        {/* <AsyncClassWith /> */}
        {/* <AsyncFCWithout /> */}
        <AsyncFCWith />
        {/* <Sync /> */}

        <div>Hello, World!</div>
    </ErrorBoundary>,
    document.getElementById('root'),
);
