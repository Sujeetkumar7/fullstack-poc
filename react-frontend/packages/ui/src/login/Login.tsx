import { html } from "react-strict-dom";
import { useState } from "react";
import { loginStyles as styles } from "./Login.styles";
import Textbox from "../common/textbox/Textbox";
import Button from "../common/button/Button";

type LoginProps = { onLogin?: (user: { username: string }) => void };

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const usernameError =
    !username && touched
      ? "Username is required."
      : username && username.length < 3 && touched
      ? "Minimum 3 characters required."
      : "";

  const canSubmit = username.length >= 3 && !loading;

  const submit = async () => {
    if (!touched) setTouched(true);
    if (!canSubmit) return;

    setApiError(null);
    setLoading(true);

    try {
      onLogin?.({ username });
    } finally {
      setLoading(false);
    }
  };

  return (
    <html.div style={styles.page}>
      <html.div style={styles.card} role="region" aria-label="Login">
        <html.h2 style={styles.title}>Login</html.h2>

        <html.div style={styles.form}>
          <Textbox
            id="username"
            label="User ID"
            value={username}
            required
            error={usernameError || apiError || undefined}
            onChange={(e: any) => {
              const next = (e as any)?.target?.value ?? "";
              setUsername(next);
              if (!touched) setTouched(true);
              if (apiError) setApiError(null);
            }}
          />
          <html.div style={styles.actions}>
            <Button
              onClick={submit}
              variant={canSubmit ? "primary" : "primaryDisabled"}
            >
              {loading ? "Signing in…" : "Login"}
            </Button>
          </html.div>
        </html.div>

        <html.div style={styles.footer}>
          © 2025 EY. All rights reserved.
        </html.div>
      </html.div>
    </html.div>
  );
}
