/**
 * Pre-authenticated browser state, for specs whose subject is not the login form.
 *
 * SauceDemo's whole session is one cookie, so there is no need to drive the login
 * form to obtain it: planting the cookie reaches the same state without the three
 * actions, the navigation, and a dependency on a form the spec isn't testing.
 * Set as a session cookie (`expires: -1`) rather than captured from a real login,
 * whose cookie SauceDemo expires ten minutes after it is issued.
 *
 * Usage: `test.use(asUser("standard_user"))` at the top of the spec or describe.
 */
export const asUser = (username: string) => ({
  storageState: {
    cookies: [
      {
        name: "session-username",
        value: username,
        domain: "www.saucedemo.com",
        path: "/",
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  },
});
