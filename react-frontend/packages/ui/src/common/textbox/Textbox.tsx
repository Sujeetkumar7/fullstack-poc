import { html } from "react-strict-dom";
import { textboxStyles as styles } from "./Textbox.styles";

export type TextboxProps = {
  id: string;
  label?: string;
  type?: "text" | "email" | "password";
  value: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  /** Set to a non-empty string to render an error message under the field */
  error?: string;
  /** Keep 'any' to avoid TS mismatches with RSD event typings */
  onChange: (e: any) => void;
  /** Optional extra style for the wrapper div if needed */
  wrapperStyle?: any;
};

export default function Textbox({
  id,
  label,
  type = "text",
  value,
  placeholder,
  required,
  helpText,
  error,
  onChange,
  wrapperStyle,
}: TextboxProps) {
  return (
    <html.div style={wrapperStyle ?? styles.field}>
      {label ? (
        <html.label style={styles.label} for={id}>
          {label}
        </html.label>
      ) : null}

      <html.input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        style={styles.input}
        placeholder={placeholder}
        required={required}
      />

      {helpText ? (
        <html.div style={styles.helpText}>{helpText}</html.div>
      ) : null}
      {!!error ? <html.div style={styles.error}>{error}</html.div> : null}
    </html.div>
  );
}
