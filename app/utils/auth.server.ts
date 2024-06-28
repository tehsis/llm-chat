// app/utils/auth.server.ts
import * as UserModel from "~/models/user.server";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { sessionStorage } from "~/session.server";
import invariant from "tiny-invariant";

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<UserModel.User>(sessionStorage);

const {
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_TENANT,
  AUTH0_CALLBACK_URL,
} = process.env;

invariant(AUTH0_CLIENT_ID, "AUTH0_CLIENT_ID is required in .env");
invariant(AUTH0_CLIENT_SECRET, "AUTH0_CLIENT_SECRET is required in .env");
invariant(AUTH0_TENANT, "AUTH0_TENANT is required in .env");
invariant(AUTH0_CALLBACK_URL, "AUTH0_CALLBACK_URL is required in .env");

let auth0Strategy = new Auth0Strategy(
  {
    callbackURL: AUTH0_CALLBACK_URL,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    domain: AUTH0_TENANT,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    if (!profile.emails || !profile.emails[0])
      throw new Error("No email found in profile");
    return UserModel.findOrCreate({ email: profile.emails[0].value });
  },
);

authenticator.use(auth0Strategy);
