"use client";

import { useState, useEffect, useRef } from "react";
import EmailInput from "./inputs/EmailInput";
import ReCAPTCHA from "react-google-recaptcha";
import ContactMessage from "./ContactMessage";
import ContactNameInput from "./ContactName";
import FormContainer from "./FormContainer";
import emailjs from "@emailjs/browser";

const styles = {
  title: "text-center text-2xl text-shadow",
  buttonSection: "flex flex-col flex-wrap items-center justify-center gap-8",
  buttonContainer: "flex flex-row items-center justify-between gap-8",
  button: "text-white font-bold py-2 px-4 rounded text-shadow p-3 ",
  submitButton: {
    regular: "bg-slate-800 hover:cursor-not-allowed",
    verified:
      "bg-green-700 hover:bg-green-600 hover:cursor:pointer transition duration-300 ease-in-out",
  },
  cancelButton:
    "bg-slate-700 hover:bg-red-700 hover:cursor-pointer transition duration-300 ease-in-out",
};

const defaultFormState = {
  user_name: "",
  user_email: "",
  message: "",
  g_recaptcha_response: "",
};

type formButton = {
  name: string;
  type: "submit" | "reset";
  className: string;
  onClick: (e: React.SyntheticEvent) => void;
};

export function ContactForm() {
  //NOSONAR
  const [formState, setFormState] =
    useState<typeof defaultFormState>(defaultFormState);
  const [messageValidated, setMessageValidated] = useState<boolean>(false);
  const [emailValidated, setEmailValidated] = useState<boolean>(false);
  const [capResponse, setCapResponse] = useState<string | null>(null);
  const [nameValidated, setNameValidated] = useState<boolean>(false);
  const [sendError, setSendError] = useState<boolean | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const isFormValidated = () =>
    [messageValidated, emailValidated, nameValidated].every(Boolean);

  const [formValidated, setFormValidated] = useState<boolean>(
    isFormValidated()
  );

  const handleFormStateChange = (e: React.SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormState({ ...formState, [name]: value });
  };

  const resetState = () => {
    setFormState(defaultFormState);
    setCapResponse(null);
    setFormValidated(false);
    setNameValidated(false);
    setEmailValidated(false);
    setMessageValidated(false);
  };

  const emailJsFormRef = useRef<HTMLFormElement>(null);

  const displayMessage = (message: string) => {
    setMessage(message);
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
      setMessage(null);
    }, 5000);
  };

  const handleSubmitForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Handling form submit", {
      formState,
      formValidated,
      capResponse,
    });
    if (formValidated) {
      try {
        //NOSONAR

        // Add the captcha response token to the form data
        formState.g_recaptcha_response = capResponse || "";

        // Send the form data to emailjs
        // TODO: fix this to
        emailjs
          .sendForm(
            process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID || "",
            process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID || "",
            emailJsFormRef.current || "",
            process.env.NEXT_PUBLIC_EMAIL_PUB_TOKEN || ""
          )
          .then(() => {
            displayMessage("Email sent successfully!");
            resetState();
            setTimeout(() => {
              window.location.assign("/");
            }, 2000);
          });
      } catch (error) {
        setSendError(true);
        displayMessage(
          "There was an error sending your email. Please try again later."
        );
      }
    }
  };

  const handleResetForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetState();
  };

  useEffect(() => {
    setFormValidated(isFormValidated());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const formButtons: formButton[] = [
    {
      name: "Cancel",
      type: "reset",
      className: [styles.button, styles.cancelButton].join(" "),
      onClick: handleResetForm,
    },
    {
      name: "Submit",
      type: "submit",
      className: `${styles.button} ${
        formValidated
          ? styles.submitButton.verified
          : styles.submitButton.regular
      }`,
      onClick: handleSubmitForm,
    },
  ];

  const renderButtons = () => {
    return (
      <div className={styles.buttonContainer}>
        {" "}
        {formButtons.map(({ name, type, className, onClick }, i) => (
          <button key={i} type={type} className={className} onClick={onClick}>
            {name}
          </button>
        ))}{" "}
      </div>
    );
  };

  return (
    <FormContainer _ref={emailJsFormRef}>
      <h1 className={styles.title}>{`Let's get in touch!`}</h1>
      {showMessage ? (
        <h2 className={!sendError ? "text-emerald-500" : "text-red-500"}>
          {" "}
          {message}{" "}
        </h2>
      ) : (
        <></>
      )}
      <ContactNameInput
        onChange={handleFormStateChange}
        currentValue={formState.user_name}
        setValidated={setNameValidated}
      />

      <EmailInput
        onChange={handleFormStateChange}
        currentValue={formState.user_email}
        setValidated={setEmailValidated}
      />

      <ContactMessage
        onChange={handleFormStateChange}
        currentValue={formState.message}
        setValidated={setMessageValidated}
      />

      {formValidated ? (
        <section className={styles.buttonSection}>
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ""}
            onChange={setCapResponse}
            theme="dark"
          />

          {renderButtons()}
        </section>
      ) : (
        <></>
      )}
    </FormContainer>
  );
}
