"use server";

import { SecretName, getSecret } from "@/lib/secrets";

type SendEmailState = {
  sent: boolean | null;
};

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const HTTP_OK = 200;

export async function sendEmail(
  _prevState: SendEmailState,
  formData: FormData
): Promise<SendEmailState> {
  const data = {
    service_id: getSecret(SecretName.EmailServiceId),
    template_id: getSecret(SecretName.EmailTemplateId),
    user_id: getSecret(SecretName.EmailPubToken),
    accessToken: getSecret(SecretName.EmailAccessToken),
    template_params: {
      user_name: formData.get("user_name"),
      from_Email: formData.get("user_email"),
      message: formData.get("message"),
      "g-recaptcha-response": formData.get("g-recaptcha-response") || "",
    },
  };

  try {
    const response = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    return { sent: response.status === HTTP_OK };
  } catch (error) {
    console.error("Error sending email", error);
    return { sent: false };
  }
}
