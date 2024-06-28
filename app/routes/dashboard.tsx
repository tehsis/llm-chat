import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate("auth0", request);

  return json({ user });
}

export default function DashboardRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard {data.user.email}!</p>
    </div>
  );
}
