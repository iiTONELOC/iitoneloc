"use server";

export async function sendEmail(prevState: any, formData: FormData) {
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
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return {
        message: "Email sent successfully!",
        status: 200,
      };
    } else {
      return {
        message: "Error",
        status: 500,
      };
    }
  } catch (error) {
    console.error("Error sending email", error);
    return {
      message: "Error",
      status: 500,
    };
  }
}
