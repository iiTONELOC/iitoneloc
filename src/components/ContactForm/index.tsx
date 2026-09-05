'use client';

import { sendEmail } from './actions';
import { useActionState, useEffect, useState } from 'react';
import FormContainer from './FormContainer';
import ContactNameInput from './ContactName';
import EmailInput from './inputs/EmailInput';
import ContactMessage from './ContactMessage';
import ReCAPTCHA from 'react-google-recaptcha';

const styles = {
  header: 'flex flex-col gap-1 border-b border-op-border pb-4',
  title: 'font-mono text-[15px] font-medium text-op-text',
  sub: 'font-mono text-[12px] text-op-dim',
  status: 'font-mono text-[12.5px]',
  field: 'flex flex-col gap-[7px]',
  label: 'font-mono text-[10.5px] uppercase tracking-[1px] text-op-dim',
  buttonSection: 'flex flex-col flex-wrap gap-4',
  buttonContainer: 'flex flex-row items-center gap-3',
  button:
    'font-mono text-[13px] font-medium py-[10px] px-[19px] rounded-[6px] transition-all duration-150 ',
  submitButton: {
    regular: 'bg-op-surface border border-op-border text-op-dim cursor-not-allowed',
    verified:
      'bg-op-accent border border-op-accent text-[#1a1206] font-bold hover:bg-op-accent-hi cursor-pointer',
  },
  cancelButton:
    'bg-op-surface border border-op-border-bright text-op-text hover:border-red-500/50 hover:text-red-400 cursor-pointer',
};

const defaultFormState = {
  user_name: '',
  user_email: '',
  message: '',
};

const defaultEmailSentState = {
  sent: null,
};

const SENDING_MESSAGE = 'Sending email...';
const SUCCESS_MESSAGE = 'Email sent successfully!';
const FAILURE_MESSAGE =
  'There was an error sending your email. Please try again later.';
const MESSAGE_TIMEOUT_MS = 5000;
const REDIRECT_DELAY_MS = 750;

type FormButton = {
  name: string;
  type: 'submit' | 'reset';
  className: string;
  onClick: (e: React.SyntheticEvent) => void;
};

export function ContactForm() {
  const [formState, setFormState] =
    useState<typeof defaultFormState>(defaultFormState);
  const [messageValidated, setMessageValidated] = useState<boolean>(false);
  const [emailValidated, setEmailValidated] = useState<boolean>(false);
  const [capResponse, setCapResponse] = useState<string | null>(null);
  const [nameValidated, setNameValidated] = useState<boolean>(false);
  const [sendError, setSendError] = useState<boolean | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [emailSent, formAction] = useActionState(
    sendEmail,
    defaultEmailSentState
  );

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

  const displayMessage = (message: string) => {
    setMessage(message);
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
      setMessage(null);
    }, MESSAGE_TIMEOUT_MS);
  };

  const handleSubmitForm = (e: React.SyntheticEvent) => {
    if (formValidated && capResponse) {
      setSendError(false);
      displayMessage(SENDING_MESSAGE);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
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

  useEffect(() => {
    if (emailSent.sent === null) return;

    if (emailSent.sent) {
      displayMessage(SUCCESS_MESSAGE);
      resetState();
      setTimeout(() => {
        window.location.assign('/');
      }, REDIRECT_DELAY_MS);
      return;
    }

    setSendError(true);
    displayMessage(FAILURE_MESSAGE);
    setCapResponse(null);
  }, [emailSent]);

  const formButtons: FormButton[] = [
    {
      name: 'Cancel',
      type: 'reset',
      className: [styles.button, styles.cancelButton].join(' '),
      onClick: handleResetForm,
    },
    {
      name: 'Submit',
      type: 'submit',
      className: `${styles.button} ${formValidated
          ? styles.submitButton.verified
          : styles.submitButton.regular
        }`,
      onClick: handleSubmitForm,
    },
  ];

  const renderButtons = () => {
    return (
      <div className={styles.buttonContainer}>
        {' '}
        {formButtons.map(({ name, type, className, onClick }) => (
          <button key={name} type={type} className={className} onClick={onClick}>
            {name}
          </button>
        ))}{' '}
      </div>
    );
  };

  return (
    <FormContainer onAction={formAction}>
      <div className={styles.header}>
        <h3 className={styles.title}>Send a message</h3>
        <p className={styles.sub}>Open to roles, projects, or questions.</p>
      </div>

      {showMessage ? (
        <p
          className={`${styles.status} ${
            sendError ? 'text-red-400' : 'text-op-live'
          }`}
        >
          {message}
        </p>
      ) : (
        <></>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactName">
          name
        </label>
        <ContactNameInput
          onChange={handleFormStateChange}
          currentValue={formState.user_name}
          setValidated={setNameValidated}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactEmail">
          email
        </label>
        <EmailInput
          onChange={handleFormStateChange}
          currentValue={formState.user_email}
          setValidated={setEmailValidated}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactMessage">
          message
        </label>
        <ContactMessage
          onChange={handleFormStateChange}
          currentValue={formState.message}
          setValidated={setMessageValidated}
        />
      </div>

      {formValidated ? (
        <section className={styles.buttonSection}>
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ''}
            onChange={setCapResponse}
            theme='dark'
          />

          {renderButtons()}
        </section>
      ) : (
        <></>
      )}
    </FormContainer>
  );
}
