import { html } from "react-strict-dom";
import { buttonStyles as styles } from "./Button.styles";

export type ButtonProps = {
  children: any;
  /** Controls which style variant to use */
  variant?: "primary" | "primaryDisabled";
  /** Click handler */
  onClick?: (e: any) => void;
};

export default function Button({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) {
  // Use a single style object (RSD requires one object for style)
  const style =
    variant === "primary" ? styles.buttonPrimary : styles.buttonPrimaryDisabled;

  return (
    <html.button onClick={onClick} style={style}>
      {children}
    </html.button>
  );
}
