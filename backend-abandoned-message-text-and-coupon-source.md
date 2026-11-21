# طلب للباك: نص رسالة الحجز غير المكتمل + تمييز كوبوناته

انسخ الملف ده كامل للـ AI اللي شغال على الباك (`home-healers-app`). الملف مكتفي بنفسه. متعدلش حاجة في الداشبورد.

الداشبورد خلّص قسم **إشعارات الحجوزات غير المكتملة** في Settings، وبيحتاج حاجتين من الباك.

## الوضع الحالي في الباك (اتراجع على الكود)

`App\Services\Coupon\AbandonedReservationCouponService`:

- نص الإشعار ثابت من ملفات الترجمة `lang/{ar,en}/coupons.php` (`abandoned_push_*` للكوبون، `abandoned_reminder_push_*` للتذكير). الأدمن مش بيقدر يغيره.
- الكوبون بيتعمل في `createPersonalCoupon` بـ `client_id` وبدون أي علامة تفرّقه عن باقي الكوبونات. الرابط الوحيد هو `reservations.abandoned_coupon_id`، والاسم الثابت `coupons.abandoned_coupon_name`.
- لما العميل يطبق الكوبون، سجل `market_coupon_redemptions` مفيهوش أي مؤشر إنه كوبون استرجاع حجز.

## الطلب 1: نص الرسالة يتحكم فيه الداشبورد

الداشبورد بيحفظ 4 مفاتيح جوه كائن `setting` (نفس مكان `abandoned_payment_*`):

| المفتاح | النوع | الحد |
|---|---|---|
| `abandoned_payment_message_title_ar` | string | 100 حرف |
| `abandoned_payment_message_title_en` | string | 100 حرف |
| `abandoned_payment_message_body_ar` | string | 500 حرف |
| `abandoned_payment_message_body_en` | string | 500 حرف |

المطلوب:

1. نسخة **واحدة** من النص، تتبعت سواء الكوبون مفعّل أو لا.
2. لو العنوان **والنص** كلاهم فاضيين للغة العميل، استخدم النص الحالي من ملفات الترجمة (الكوبون أو التذكير حسب الحالة). لو واحد منهم بس فاضي، استخدم الافتراضي له وحده.
3. اللغة حسب `$client->notificationLocale()` زي ما هو دلوقتي.
4. الـ placeholders بصيغة الأقواس المعقوصة، واستبدلها بـ `str_replace` (مش `:name` بتاع Laravel، عشان النص ممكن فيه `:`):
   - `{name}`: اسم العميل. لو مش موجود، شيل الكلمة وامسح المسافة الزايدة.
   - `{percent}`: نسبة الخصم (رقم بدون `%`، الأدمن بيكتب `%` بنفسه).
   - `{code}`: كود الكوبون.
5. لو الرسالة بتتبعت **من غير كوبون**، استبدل `{code}` و `{percent}` بنص فاضي ومتبعتش الأقواس للعميل.
6. `extra_data` يفضل زي ما هو: `type: coupon` + `coupon_code` مع الكوبون، و `type: reservation_reminder` من غيره.
7. اقصّ العنوان والنص على الحدود فوق ونضّف الـ HTML.
8. أضف الفاليديشن في `EditSystemSettings.php` لو بيتحقق من مفاتيح الـ setting.
9. أضف تيستات: نص مخصص، نص فاضي يرجع للافتراضي، كل placeholder، وكوبون مقفول مع `{code}` في النص.

## الطلب 2: تمييز الكوبونات المستخدمة من الاسترجاع عن باقي الكوبونات

عايزين نعرف لما العميل يطبق كوبون إنه كوبون **استرجاع حجز غير مكتمل** مش كوبون عادي.

المطلوب:

1. عمود جديد في `market_coupons`: `source` (string، nullable، عليه index). القيمة الجديدة `abandoned_booking`. الكوبونات العادية تفضل `null`.
2. في `createPersonalCoupon` ضيف `'source' => 'abandoned_booking'`، وضيف `source` في `$fillable`. اعمل ثابت (constant أو enum) بدل string مكتوب.
3. migration تعمل backfill للكوبونات القديمة: كل `market_coupons.id` موجود في `reservations.abandoned_coupon_id` ياخد `source = abandoned_booking`.
4. اعرض `source` في:
   - ريسبونس الكوبونات في الـ admin API اللي الداشبورد بيستخدمها.
   - بيانات الكوبون اللي بترجع مع الحجز وقت التطبيق، وكمان `coupon_source` على سجل الـ redemption (يتجاب من الكوبون، متكرّرش العمود إلا لو محتاجه للأداء).
5. في Filament (قائمة الكوبونات): badge أو عمود "المصدر" وفلتر، عشان يتفرق كوبون الاسترجاع عن العادي.
6. فلتر `source` في endpoint قائمة الكوبونات والـ redemptions (`?source=abandoned_booking`).
7. (اختياري) عدّاد بسيط: كام رسالة اتبعتت، وكام كوبون اتطبق بعدها. المصدر: `reservations.abandoned_reminder_sent_at` و `abandoned_coupon_id` مع الـ redemptions.
8. تيستات: الكوبون الجديد ياخد الـ `source`، الكوبون العادي `null`، الـ backfill شغال، والفلتر يرجع المطلوب بس.

## ملاحظات

- `abandoned_payment_coupon_delay_minutes` اسمه فيه `coupon` لأسباب قديمة. متغيرهوش.
- الداشبورد بيحفظ كائن `setting` كامل، فالمفاتيح الجديدة هتوصل مع باقي الإعدادات. تأكد إن أي كود بيحفظ الـ setting ما بيمسحش المفاتيح الغريبة.
- خلص لما الأدمن يغيّر النص ويحفظ، والإشعار الجاي بيوصل بالنص الجديد، والكوبون المطبق يظهر بـ `source = abandoned_booking`.
