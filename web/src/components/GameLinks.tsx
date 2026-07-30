import { GAMES } from "../lib/games";
import styles from "./GameLinks.module.css";

// Plain DOM link cards (not drawn on the canvas). The list sits in a container with
// the appearance of a scroll — a capped-height panel with a styled scrollbar and
// fade edges — so it reads as scrollable even when everything fits.
export default function GameLinks() {
  return (
    <section aria-label="Games" className={styles.panel}>
      <div className={styles.scroll}>
        <ul className={styles.list}>
          {GAMES.map((g) => {
            const soon = g.status === "soon";
            const inner = (
              <>
                <span className={styles.title}>
                  {g.title}
                  {soon && <span className={styles.badge}>soon</span>}
                </span>
                <span className={styles.tag}>{g.tag}</span>
                <span className={styles.blurb}>{g.blurb}</span>
              </>
            );
            return (
              <li key={g.title}>
                {soon ? (
                  <span className={`${styles.card} ${styles.disabled}`} aria-disabled="true">
                    {inner}
                  </span>
                ) : (
                  <a className={styles.card} href={g.href}>
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
