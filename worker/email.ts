/**
 * Email delivery, behind a thin adapter.
 *
 * Every third-party service on this project sits behind an interface so none
 * becomes load-bearing. Resend is the current implementation; swapping it means
 * writing another `EmailSender` and changing one line in the Worker, not
 * unpicking the enquiry handler.
 */

export interface EmailMessage {
  readonly to: string;
  readonly from: string;
  readonly replyTo?: string | undefined;
  readonly subject: string;
  /** Plain text is the body that must always be present. */
  readonly text: string;
}

export interface EmailResult {
  readonly ok: boolean;
  /** Present when `ok` is false. Logged, never shown to the enquirer. */
  readonly error?: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<EmailResult>;
}

/**
 * Resend.
 *
 * Sends plain text only. An enquiry notification is read by one of two people
 * on a phone; HTML would add a second body to keep in step with the first for
 * no benefit, and plain text cannot render wrong or trip a spam filter on
 * markup.
 */
export function createResendSender(apiKey: string): EmailSender {
  return {
    async send(message) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: message.from,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          }),
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => '');
          return {
            ok: false,
            error: `Resend responded ${response.status}: ${detail.slice(0, 300)}`,
          };
        }

        return { ok: true };
      } catch (cause) {
        return {
          ok: false,
          error: `Resend request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        };
      }
    },
  };
}

/**
 * Always fails. Used only to exercise the failure path, which is the one the
 * enquirer actually sees and the one an untested implementation gets wrong.
 */
export function createFailingSender(reason = 'Forced failure'): EmailSender {
  return {
    async send() {
      return { ok: false, error: reason };
    },
  };
}
