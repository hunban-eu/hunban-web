"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    sendMagicLink,
    initialError ? { status: "error", message: initialError } : { status: "idle" },
  );

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-md bg-surface-alt p-5">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid max-w-md gap-4">
      <label className="grid gap-1.5 text-sm font-semibold">
        Work email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-sm border border-line bg-surface px-3 py-2.5 text-base font-normal"
        />
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-medium text-ink">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
      >
        {pending ? "Sending..." : "Email me a login link"}
      </button>
    </form>
  );
}
