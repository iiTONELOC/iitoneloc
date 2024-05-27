import { ContactForm, Footer } from "@/components";

const styles = {
  main: "w-full h-full flex flex-col items-center justify-center p-4",
  header: "w-full flex flex-col items-center justify-center px-4",
  h1: "text-center text-3xl md:text-4xl font-bold mt-6",
};

export default function Contact(): JSX.Element {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Contact Me</h1>
      </header>
      <div className={styles.main}>
        <ContactForm />
      </div>
      <Footer />
    </main>
  );
}
