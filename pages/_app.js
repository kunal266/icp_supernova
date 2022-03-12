import "../ui/styles/global.css"
import { ProvideState } from '../ui/utils/state';
import { ProvideAuth } from '../ui/utils/auth';
import { ProvideRoute } from '../ui/utils/route';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
    return <>
        <ProvideAuth>
            <ProvideState>
            <Toaster
                position="top-center"
                reverseOrder={false}
                />
                <ProvideRoute>
                    <Component {...pageProps} />
                </ProvideRoute>
            </ProvideState>
        </ProvideAuth>

    </>
}
