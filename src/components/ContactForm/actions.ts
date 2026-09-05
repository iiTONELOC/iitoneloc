"use server";

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
    service_id: process.env.EMAIL_SERVICE_ID,
    template_id: process.env.EMAIL_TEMPLATE_ID,
    user_id: process.env.EMAIL_PUB_TOKEN,
    accessToken: process.env.EMAIL_ACCESS_TOKEN,
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
