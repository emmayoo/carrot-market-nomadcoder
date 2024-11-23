"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState, useState } from "react";
import { smsLogIn } from "./actions";

const initialState = {
  token: false,
  error: undefined,
};

export default function SMSLogin() {
  const [state, action] = useActionState(smsLogIn, initialState);
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">SMS Log in</h1>
        <h2 className="text-xl">Verify your phone number.</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        {state.token ? (
          <>
            <Input
              type="number"
              name="token"
              placeholder="Verification code"
              required
              errors={state.error?.formErrors}
              min={100000}
              max={999999}
            />
            <input hidden name="phone" readOnly value={phone} />
          </>
        ) : (
          <Input
            type="text"
            name="phone"
            placeholder="Phone number"
            required
            errors={state.error?.formErrors}
            onChange={(e) => setPhone(e.target.value)}
          />
        )}
        <Button text={state.token ? "Verify Token" : "Send Verification SMS"} />
      </form>
    </div>
  );
}
