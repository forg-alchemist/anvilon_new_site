import type { MDXComponents } from "mdx/types";
import styles from "@/shared/styles/mdx.module.css";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className={styles.h1} {...props} />,

    h2: (props) => (
      <div className={styles.h2Wrapper}>
        <h2 className={styles.h2} {...props} />
        <div className={styles.h2Line} />
      </div>
    ),

    h3: (props) => <h3 className={styles.h3} {...props} />,

    p: (props) => <p className={styles.p} {...props} />,

    strong: (props) => <strong className={styles.strong} {...props} />,

    em: (props) => <em className={styles.em} {...props} />,

    blockquote: (props) => (
      <blockquote className={styles.blockquote} {...props} />
    ),

    ul: (props) => <ul className={styles.ul} {...props} />,

    ol: (props) => <ol className={styles.ol} {...props} />,

    li: ({ children, ...props }) => (
      <li className={styles.li} {...props}>
        <span className={styles.liBullet} />
        {children}
      </li>
    ),

    hr: (props) => <hr className={styles.hr} {...props} />,

    a: (props) => <a className={styles.a} {...props} />,

    code: (props) => <code className={styles.code} {...props} />,

    pre: (props) => <pre className={styles.pre} {...props} />,

    ...components,
  };
}
