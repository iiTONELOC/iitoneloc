import { ContactForm, Footer } from "@/components";

const styles = {
  main: "w-full h-full flex flex-col items-center justify-start",
  header: "w-full flex flex-col items-center justify-center px-4 pt-8 pb-2",
  h1: "text-3xl md:text-4xl font-bold text-gray-100 tracking-tight",
  subtitle: "text-sm font-mono text-sig-dim mt-2",
  formWrap: "w-full flex flex-col items-center justify-center p-4 py-8",
};

export default function Contact(): JSX.Element {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Contact</h1>
        <p className={styles.subtitle}>anthony@wedefendit.com</p>
      </header>
      <div className={styles.formWrap}>
        <ContactForm />
      </div>
      <Footer />
    </main>
  );
}
