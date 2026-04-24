import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, IS_GOOGLE_AUTH_ENABLED } from '../lib/googleAuth';

const RootProviders = ({ children }) => {
  if (!IS_GOOGLE_AUTH_ENABLED) {
    return children;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
};

export default RootProviders;
