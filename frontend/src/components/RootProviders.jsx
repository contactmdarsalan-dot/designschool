import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_AUTH_CONFIG } from '../lib/googleAuth';

const RootProviders = ({ children }) => {
  if (!GOOGLE_AUTH_CONFIG.enabled) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_AUTH_CONFIG.clientId}>{children}</GoogleOAuthProvider>;
};

export default RootProviders;
