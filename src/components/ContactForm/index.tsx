'use client';

import { sendEmail } from './actions';
import { useActionState } from 'react';
import FormContainer from './FormContainer';
import ContactNameInput from './ContactName';
import EmailInput from './inputs/EmailInput';
import ContactMessage from './ContactMessage';
import ReCAPTCHA from 'react-google-recaptcha';
import { useState, useEffect, useRef } from 'react';

const styles = {
  title: 'text-center text-xl font-mono text-gray-100',
  buttonSection: 'flex flex-col flex-wrap items-center justify-center gap-6',
  buttonContainer: 'flex flex-row items-center justify-between gap-4',
  button: 'font-mono text-sm py-2 px-5 rounded-md transition-all duration-200 ',
  submitButton: {
    regular: 'bg-sig-dark border border-sig-border text-sig-dim cursor-not-allowed',
    verified:
      'bg-sig-green/10 border border-sig-green/40 text-sig-green hover:bg-sig-green/20 hover:border-sig-green/60 cursor-pointer',
  },
  cancelButton:
    'bg-sig-dark border border-sig-border text-sig-dim hover:border-red-500/40 hover:text-red-400 cursor-pointer',
};

const defaultFormState = {
  user_name: '',
  user_email: '',
  message: '',
  g_recaptcha_response: '',
};

const defaultEmailSentState = {
  message: '',
};

type formButton = {
  name: string;
  type: 'submit' | 'reset';
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
    if (formValidated && capResponse && capResponse !== '') {
      try {
        displayMessage('Sending email...');
      } catch (error) {
        setSendError(true);
        displayMessage(
          'There was an error sending your email. Please try again later.'
        );
      }
    } else {
      e.preventDefault();
      e.stopPropagation();
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

  useEffect(() => {
    emailSent.message !== '' && console.log('Email sent', emailSent);
    emailSent.message === 'Email sent successfully!' &&
      (() => {
        displayMessage('Email sent successfully!');
        resetState();
        setTimeout(() => {
          window.location.assign('/');
        }, 750);
      })();
    emailSent.message === 'Error' &&
      (() => {
        setSendError(true);
        displayMessage(
          'There was an error sending your email. Please try again later.'
        );
        setCapResponse(null);
      })();
  }, [emailSent]);

  const formButtons: formButton[] = [
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
        {formButtons.map(({ name, type, className, onClick }, i) => (
          <button key={i} type={type} className={className} onClick={onClick}>
            {name}
          </button>
        ))}{' '}
      </div>
    );
  };

  return (
    <FormContainer _ref={emailJsFormRef} onAction={formAction}>
      <h1 className={styles.title}>{`Let's get in touch`}</h1>
      {showMessage ? (
        <h2 className={`text-sm font-mono ${!sendError ? 'text-sig-green' : 'text-red-400'}`}>
          {' '}
          {message}{' '}
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
