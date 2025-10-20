import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

const authHandler = handleAuth({
  login: handleLogin({
    returnTo: '/',
    authorizationParams: {
      scope: 'openid profile email',
    },
  }),
  logout: handleLogout({
    returnTo: '/',
  }),
});

export async function GET(req: any, ctx: any) {
  return authHandler(req, ctx);
};
