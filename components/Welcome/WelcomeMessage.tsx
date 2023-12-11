import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
// My imports.
import styles from "./WelcomeMessage.module.css";

function getGreetingMessage(session: Session | null): string {
  if (session) {
    return `Welcome back ${session.user.name} to World of Coffee!`;
  }
  return "Welcome to World of Coffee!";
}

export default function WelcomeMessage() {
  const { data: session } = useSession();
  const greetingMessage = getGreetingMessage(session);

  return (
    <section className={styles.message}>
      <h2>{greetingMessage}</h2>
      <p>
        <Link href="/menu">Order fresh coffee to go now!</Link>
      </p>
    </section>
  );
}
