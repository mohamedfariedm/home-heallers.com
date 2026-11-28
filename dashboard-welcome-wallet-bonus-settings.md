# Add the Welcome Wallet Bonus settings to the dashboard

Copy this whole file to the AI. It is self-contained. Do not open other files and do not change the backend.

The backend is fully done. Your job is to add one new section to the existing **Settings** page, from which an admin controls everything about the welcome wallet bonus. Do not build a job, do not send notifications, and do not put money into wallets from the frontend. The server does all of that.

## What the feature does

When a new client verifies their phone number for the first time, the server puts a gift amount into their wallet. Rules:

1. The gift can be spent **inside the app only** (booking payments and market orders). It can **never be withdrawn**.
2. It has an **expiry date**. Whatever is still unused after that period is removed from the wallet.
3. It is spent **first**, before the client's real money.
4. **Two notifications** are sent: one when the gift is credited, and one a configurable time before it expires.
5. Each client gets it **once only**. The same phone number also cannot get it again if the client deletes their account and registers again.
6. It is given to **new registrations only**. Existing clients do not get it.

## Where the section goes

On the existing **Settings** page, add a new section called **Welcome wallet bonus**. No new page and no new route.

## Fields

All of them live inside the `setting` object returned by `GET /api/admin/settings`.

### Main controls

| Field on screen | Key | Type | Limits | If the key is missing |
|---|---|---|---|---|
| Enable welcome wallet bonus | `welcome_wallet_enabled` | boolean | `true` or `false` | treat as `false` |
| Bonus amount (SAR) | `welcome_wallet_amount` | number (decimals allowed) | 0.01 to 10000 | show 50 |
| Expires after (days) | `welcome_wallet_expiry_days` | integer | 1 to 365 | show 30 |

### Notifications

| Field on screen | Key | Type | Limits | If the key is missing |
|---|---|---|---|---|
| Notification when credited | `welcome_wallet_credit_notification_enabled` | boolean | `true` or `false` | treat as `true` |
| Reminder before expiry | `welcome_wallet_expiry_notification_enabled` | boolean | `true` or `false` | treat as `true` |
| Send reminder this many hours before expiry | `welcome_wallet_expiry_reminder_hours` | integer | 1 to 720 | show 72 |

### Notification texts (8 fields)

Every text is optional. If a field is empty the server uses its own default text.

| Field on screen | Key | Max length |
|---|---|---|
| Credit notification title (Arabic) | `welcome_wallet_credit_title_ar` | 100 chars |
| Credit notification title (English) | `welcome_wallet_credit_title_en` | 100 chars |
| Credit notification body (Arabic) | `welcome_wallet_credit_body_ar` | 500 chars |
| Credit notification body (English) | `welcome_wallet_credit_body_en` | 500 chars |
| Expiry reminder title (Arabic) | `welcome_wallet_expiry_title_ar` | 100 chars |
| Expiry reminder title (English) | `welcome_wallet_expiry_title_en` | 100 chars |
| Expiry reminder body (Arabic) | `welcome_wallet_expiry_body_ar` | 500 chars |
| Expiry reminder body (English) | `welcome_wallet_expiry_body_en` | 500 chars |

The notification is sent in the client's language. If only the title or only the body is empty, the server uses the default for that part alone.

#### Placeholders inside the text

The admin types them in curly braces and the server replaces them:

| Placeholder | Replaced with |
|---|---|
| `{name}` | The client's name. If the client has no name, the word is removed from the sentence. |
| `{amount}` | The amount without extra zeros (`50` or `12.5`). In the credit notification it is the gift amount; in the expiry reminder it is what is left of it. |
| `{expiry_date}` | The expiry date as `2026-12-31`, in Riyadh time. |
| `{days_left}` | Number of days left. |

Show the four placeholders as helper text under the text fields. Do not build a preview of the text on the frontend.

Default texts (show them as placeholders in the empty fields):

- Credit (Arabic): `أهلاً بك في هوم هيلرز 🎁` / `أضفنا {amount} ريال هدية في محفظتك. تقدر تستخدمها في حجوزاتك لحد {expiry_date}.`
- Expiry (Arabic): `رصيدك الهدية قرب ينتهي` / `باقي {amount} ريال من رصيدك الهدية وينتهي في {expiry_date}. استخدمه في حجزك قبل ما يخلص.`
- Credit (English): `Welcome to Home Healers 🎁` / `We added {amount} SAR as a gift to your wallet. You can use it on your bookings until {expiry_date}.`
- Expiry (English): `Your gift balance is about to expire` / `{amount} SAR of your gift balance expires on {expiry_date}. Use it on a booking before it runs out.`

## Screen rules

1. Toggle **Enable welcome wallet bonus**. Helper text: a new client who verifies their phone for the first time gets the amount in their wallet. It can be spent inside the app only, it cannot be withdrawn, and it expires. Off by default.
2. When the toggle is off, keep the other fields visible and editable so the admin can set them up before turning it on. The amount is required only when the toggle is on.
3. **Bonus amount** field: a number from 0.01 to 10000. Helper text: applies to new registrations only.
4. **Expires after (days)** field: an integer from 1 to 365. Helper text: counted from the day the bonus is credited; whatever is unused is removed from the wallet.
5. **Notification when credited** toggle and **Reminder before expiry** toggle: each one switches off only its own notification. Switching them off does **not** stop the feature itself.
6. **Reminder hours** field: an integer from 1 to 720. **Show it only when the expiry reminder toggle is on.** When it is hidden, keep its value and still send it on save. Helper text: it must be shorter than the bonus lifetime, otherwise no reminder is sent (example: a 2-day lifetime is 48 hours, so a 72-hour reminder will never be sent). Warn the admin when `reminder hours >= expiry days x 24`.
7. The eight text fields: single-line inputs for titles and textareas for bodies. Show a character counter.
8. Block saving if any number is empty or out of range, or has decimals in a field that must be a whole number (days and hours).
9. After saving, show the values returned by the server.
10. A change applies to clients who register after the save. Clients who already received the bonus keep the expiry date that was set at that time. Only the **reminder hours** value and the expiry reminder toggle apply immediately to bonuses that are already running.

## API

Base: `{host}/api/admin`
Header: `Authorization: Bearer {admin_token}`

- Read: `GET /api/admin/settings`
- Save: `PUT /api/admin/settings/{id}` using the same `id` that came back in the response. The server updates the single settings record.

Response shape (excerpt):

```json
{
  "data": {
    "id": 1,
    "setting": {
      "welcome_wallet_enabled": true,
      "welcome_wallet_amount": 50,
      "welcome_wallet_expiry_days": 30,
      "welcome_wallet_credit_notification_enabled": true,
      "welcome_wallet_expiry_notification_enabled": true,
      "welcome_wallet_expiry_reminder_hours": 72,
      "welcome_wallet_credit_title_ar": "",
      "welcome_wallet_credit_title_en": "",
      "welcome_wallet_credit_body_ar": "",
      "welcome_wallet_credit_body_en": "",
      "welcome_wallet_expiry_title_ar": "",
      "welcome_wallet_expiry_title_en": "",
      "welcome_wallet_expiry_body_ar": "",
      "welcome_wallet_expiry_body_en": "",
      "session_price": 400
    }
  }
}
```

## Important warning when saving

The server **replaces the whole `setting` object**; it does not merge. If you send only the welcome-wallet keys, `session_price` and every other setting will be deleted.

When saving:

1. Take the current `setting` object that came back from `GET`.
2. Change the welcome-wallet keys inside it (all 14 keys).
3. Send the complete object.

Send numbers as **numbers**, not strings. Send toggles as **booleans**, not `"1"` or `"0"`. Always send all 14 keys. The server strips any HTML from the texts and cuts them to the limits, so show the value returned after saving.

## Effect on the existing wallet screen (admin withdrawals)

If the dashboard has a **withdraw** action on a client's wallet: the server now refuses to withdraw more than the **withdrawable** balance (total balance minus the running welcome bonus). The refusal comes back as a `422` with the same shape as the existing withdrawal errors, and this message:

`Insufficient withdrawable balance. The welcome bonus cannot be withdrawn.`

Show the message to the admin as it is. Do not calculate the withdrawable balance on the frontend.

## Quick verification

1. Open Settings on old data that has none of the welcome-wallet keys. The toggle is off, the amount is 50, the days are 30, both notification toggles are on, the hours are 72, and the texts are empty.
2. Turn the feature on, set the amount to `75` and the days to `14`, save, and refresh. The values are as saved, and `session_price` and the other keys are still there.
3. In the English credit body type `Hi {name}, {amount} SAR until {expiry_date}`. Save and refresh. The text comes back as typed, with the curly braces.
4. Turn off the expiry reminder toggle. The hours field disappears, and saving sets `welcome_wallet_expiry_notification_enabled` to `false`.
5. Try an amount of `0` or `10001`, days of `0`, `366` or `1.5`, and hours of `0` or `721`. Saving is blocked on the screen.
6. Turn the main toggle off and save. `welcome_wallet_enabled` is `false` and the other keys stay in `setting`.

You are done when the section shows in Settings, and saving returns the same values and texts without wiping any other setting.
