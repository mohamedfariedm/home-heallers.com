# وثيقة ترتيب وتطوير داشبورد Home Healers

مخطط تنفيذي + مواصفات تقنية + معادلات المؤشرات لإضافتها من قبل فريق التقنية

| Home Healers | Dashboard Specification | Marketing + Operations + Finance |
| --- | --- | --- |

Based on screen recording

الهدف من هذه الوثيقة هو تحويل الداشبورد من شاشة أرقام منفصلة إلى غرفة قيادة توضّح رحلة العميل كاملة: من مصدر الليد، إلى التأهيل، إلى الحجز، إلى التنفيذ، إلى التحصيل والإيراد.

تاريخ الإعداد: 02 يوليو 2026

## 1. الفهرس التنفيذي

1. ملخص الموجود في الفيديو
2. الهيكل الجديد المقترح
3. رسمة مسار العميل والداشبورد
4. مؤشرات الإدارة العليا
5. التسويق والحملات
6. الكول سنتر والدعم
7. الحجوزات والتشغيل
8. الجلسات والباقات
9. الأطباء والطاقة التشغيلية
10. المدن والمناطق
11. المالية والتحصيل
12. قواعد التنبيه والمخاطر
13. متطلبات التنفيذ للمهندس
14. معايير القبول قبل الإطلاق

ملاحظة تحليلية مهمة: أكبر مشكلتين ظاهرتين من الفيديو هما انخفاض جودة الليدز ووجود مصدر Unknown بحجم كبير. لذلك يجب أن يظهران في أعلى الداشبورد كتنبيه إداري وليس داخل الرسوم فقط.

## 2. قراءة مختصرة للموجود في الفيديو

الأرقام التالية تم رصدها من الداشبورد الظاهرة في تسجيل الشاشة، وتستخدم كنقطة بداية للفريق التقني والتحليلي:

| الإيراد | Support Tickets | الحجوزات المؤكدة | إجمالي الحجوزات |
| --- | --- | --- | --- |
| 1,852,375.28 | 4,601 | 2,202 | 2,298 |
| SAR | طلبات دعم/تواصل | Confirmation Rate: 95.8% | من الفيديو - الفترة العامة |

| الأطباء النشطون | Conversion Rate | Outbound Quality | Inbound Quality |
| --- | --- | --- | --- |
| 165 | 11.5% | 2.24% | 0.95% |
| Active Doctors | متوسط الحملات | qualified 1,966 / 44 | qualified 2,635 / 25 |

### ملاحظات فورية

| الملاحظة | الأثر على القرار | الإجراء المطلوب |
| --- | --- | --- |
| نسبة تأكيد الحجوزات عالية 95.8% | التشغيل أو التأكيد جيد، لكن الاسم الحالي Reservation Rate قد يسبب لبس. | تغيير الاسم إلى Confirmation Rate. |
| جودة الليدز أقل من 3% | قد يوجد مشكلة في تعريف Qualified Lead أو في جودة الحملات أو إدخال البيانات. | مراجعة تعريف الليد المؤهل وإلزام سبب عدم التأهيل. |
| مصدر Unknown هو الأكبر في Campaign Statistics | يصعب قياس ربحية القنوات التسويقية. | إلزام UTM/source عند إنشاء الليد أو الحجز. |
| Support Tickets و Leads مختلطين | قد تظهر نسب التحويل غير دقيقة. | توحيد تعريفات: Qualified Lead ,Lead ,Ticket,.Reservation |

## 3. الهيكل الجديد المقترح للصفحة

الترتيب الأفضل يكون حسب رحلة العميل وليس حسب ترتيب الكروت الحالي. هذه رسمة الصفحة المقترحة:

| Channel / Campaign Lead Quality Rate | Service Type Confirmed Conversion Rate | City / Center Total Reservations Reservations | Date Range Total Revenue |
| --- | --- | --- | --- |
| / Red Flags: Unknown Source / Low Quality / Missed Calls |  | → Lead Funnel: Leads → Qualified → Reservations |  |
| Unassigned / Pending Payment |  | Confirmed → Sessions → Paid |  |
| Reservations & Operations | Call Center & Support |  | Marketing Performance |
| Finance & Collections |  | City / Area Performance | Doctors & Capacity |

قاعدة التصميم: أول شاشة يراها المدير يجب أن تجيب على 5 أسئلة: هل التسويق جيد؟ هل الكول سنتر يحول؟ هل التشغيل قادر ينفذ؟ هل الأطباء مستغلين؟ وهل الإيراد تم تحصيله؟

## 4. رسمة رحلة العميل داخل الداشبورد

يجب أن يعكس ترتيب المؤشرات هذا المسار:

| مصدرCampaign / العميلChannel | / Lead ← Ticket | طلب أو ← اهتمام | Qualifiedعميل Reservationحجز Confirmedتأكيد ← ← Lead مؤهل |
| --- | --- | --- | --- |

| Assignedتعيين Doctor أخصائي | Completedتنفيذ ← ← Session جلسة | Collected Invoiceفاتورة تحصيل ← Revenue | Repeat /تكرار أو ← Package باقة |
| --- | --- | --- | --- |

### تعريفات أساسية يجب تثبيتها في النظام

| المصطلح | التعريف التشغيلي | متى يتم احتسابه؟ |
| --- | --- | --- |
| Ticket | أي طلب تواصل من عميل عبر واتساب، اتصال، تطبيق، موقع، أو حملة. | عند إنشاء طلب في الدعم أو الكول سنتر. |
| Lead | طلب يحمل احتمالية شراء خدمة، سواء جاء من حملة أو مصدر مباشر. | عند تسجيل بيانات العميل واهتمامه بالخدمة. |
| Qualified Lead | عميل لديه احتياج واضح، منطقة مغطاة، قدرة دفع أو جهة تعميد، ووقت مناسب. | بعد تقييم الكول سنتر أو التنسيق الطبي. |
| Reservation | حجز تم إنشاؤه في النظام بخدمة وموعد أو طلب موعد. | عند إنشاء الحجز. |
| Confirmed Reservation | حجز تم تأكيده مع العميل وتحديد الخدمة/الأخصائي/الوقت. | عند تحويل الحالة إلى Confirmed. |
| Completed Session | جلسة منفذة فعليًا ومغلقة من الأخصائي/التشغيل. | عند تغيير حالة الجلسة إلى Completed. |

## 5. مؤشرات الإدارة العليا Executive KPIs

هذه المؤشرات تكون في أعلى الداشبورد لأنها تحدد وضع الشركة خلال الفترة المختارة.

| المؤشر | المعادلة للمهندس | مصدر البيانات المقترح | تنبيه اللون |
| --- | --- | --- | --- |
| Total Revenue | SUM(paid_invoices.amount) | Invoices / Payments | أزرق معلوماتي أو أخضر عند تحقيق التارجت. |
| Total Reservations | COUNT(reservations.id) | Reservations | حسب التارجت الشهري. |
| Confirmed Reservations | COUNT(reservations WHERE status='confirmed') | Reservations | أخضر إذا في نمو يومي. |
| Confirmation Rate | Confirmed Reservations / Total Reservations x 100 | Reservations.status | أحمر < 70%، أصفر 70%-85%، أخضر > 85%. |
| Conversion Rate | Reservations / Support Tickets x 100 | Tickets + Reservations | أحمر < 8%، أصفر 8%-12%، أخضر > 12%. |
| Lead Quality Rate | Qualified Leads / Total Leads x 100 | Leads.qualified_flag | أحمر < 10%، أصفر 10%-20%، أخضر > 20%. |
| Target Achievement | Actual Reservations / Monthly Target x 100 | + Targets Reservations | أحمر إذا أقل من النسبة المتوقعة حسب اليوم. |

مهم: إذا كان Total Revenue في النظام يشمل الفواتير غير المحصلة، يجب تغيير الاسم إلى Gross Revenue وإضافة Collected Revenue كرقم مستقل.

## 6. Marketing Funnel - التسويق والتحويل

| Paid Revenue | Confirmed | Reservations | Qualified Leads | Total Leads |
| --- | --- | --- | --- | --- |

| المؤشر | المعادلة | الغرض التحليلي | ملاحظة تنفيذية |
| --- | --- | --- | --- |
| Total Leads | COUNT(leads.id) | حجم الطلب القادم من كل القنوات. | لا يساوي Tickets إلا إذا كل Ticket يعتبر Lead. |
| Qualified Leads | COUNT(leads WHERE is_qualified=true) | قياس جودة الليدز. | يجب حفظ سبب التأهيل أو عدم التأهيل. |
| Lead Quality Rate | Qualified Leads / Total Leads x 100 | هل التسويق يجيب عملاء مناسبين؟ | يظهر كرت أحمر إذا أقل من 10%. |
| Lead to Reservation Rate | Total Reservations / Total Leads x 100 | معدل تحويل الليد إلى حجز. | حسب الفترة والقناة. |
| Qualified to Reservation Rate | Reservations from Qualified Leads / Qualified Leads x 100 | يقيس أداء الكول سنتر مع العملاء المؤهلين. | يربط lead_id بالحجز. |
| Cost per Lead - CPL | Ad Spend / Total Leads | تكلفة الليد. | يتطلب إدخال مصروف الحملة أو الربط مع المنصات. |
| Cost per Reservation CPR - | Ad Spend / Reservations | تكلفة الحجز. | أهم من CPL في القرارات. |
| ROAS | Revenue from Campaign / Ad Spend | العائد على الإنفاق الإعلاني. | يفضل استخدام Collected.Revenue |

## 7. Campaign Performance - أداء الحملات والمصادر

من الفيديو ظهر أن مصادر مثل Unknown وgoogle وmobile_application وother موجودة في Campaign Statistics. المطلوب هو توحيد المصدر ثم حساب النتائج لكل قناة.

| المؤشر | المعادلة | عرض الداشبورد | قاعدة مهمة |
| --- | --- | --- | --- |
| Leads by Channel | COUNT(leads.id) GROUP BY source | جدول + Bar Chart | Source لا يكون فارغًا. |
| Reservations by Channel | COUNT(reservations.id) GROUP BY lead.source | جدول + Donut | يجب ربط reservation بالlead. |
| Conversion by Campaign | Reservations / Support Tickets x 100 | Top 10 campaigns | لا تظهر حملة أقل من 20 طلب إلا مع وسم Low.Volume |
| % Unknown Source | Unknown Source Leads / Total Leads x 100 | كرت أحمر مستقل | أحمر إذا أكثر من 20%. |
| Revenue by Channel | SUM(payments.amount) GROUP BY source | جدول مالي | استخدم المدفوع فعليًا إذا متاح. |
| Channel Quality Rate | Qualified Leads by Channel / Leads by Channel x 100 | Heatmap | يكشف القنوات الرديئة. |

قاعدة إلزامية للتقنية: أي Lead أو Reservation جديد يجب أن يحمل created_channel ,utm_campaign ,utm_source ,campaign ,medium ,source. في حال عدم وجود المصدر يتم وضع Unknown مع تنبيه في Red Flags.

### تصنيف مصادر مقترح

| Partner | Owned | Paid |
| --- | --- | --- |
| Referral، جمعية، مستشفى، مركز طبي، تأمين، | SEO ،Call ،WhatsApp ،App ،Website، | Instagram ،Snapchat ،Google Ads، |
| B2B | Direct | X ،TikTok |

## 8. Customer Support / Call Center
بما أن الداشبورد تعرض Support Tickets، يجب تحويلها إلى لوحة أداء للكول سنتر وليس رقم إجمالي فقط.

| المؤشر | المعادلة | الاستخدام | تنبيه |
| --- | --- | --- | --- |
| Total Tickets | COUNT(tickets.id) | حجم الطلبات. | يفصل حسب النوع. |
| Inbound Tickets | COUNT(tickets WHERE direction='inbound') | الطلبات القادمة من العملاء. | يقارن مع Inbound Leads. |
| Outbound Tickets | COUNT(tickets WHERE direction='outbound') | متابعات الفريق. | يقيس النشاط والمتابعة. |
| Answered Calls Rate | Answered Calls / Total Calls x 100 | قياس استقبال الاتصالات. | أحمر إذا أقل من 85%. |
| Missed Calls | COUNT(calls WHERE status='missed') | فرص مهدرة. | يظهر في Red Flags. |
| First Response Time | AVG(first_response_at - ticket_created_at) | سرعة الرد. | أحمر إذا تجاوز SLA. |
| Ticket to Reservation Rate | Reservations from Tickets / Total Tickets x 100 | تحويل الكول سنتر. | حسب الموظف والقناة. |
| Pending Follow-ups | COUNT(leads WHERE status IN ('pending','follow_up')) | عملاء يحتاجون متابعة. | يظهر يوميًا. |
| Agent Conversion Rate | Reservations by Agent / Tickets handled by Agent x 100 | تقييم الموظفين. | لا يقارن بدون حد أدنى للحجم. |

## 9. Operations & Reservations - الحجوزات والتشغيل

الرسم الحالي Reservations by Status جيد، لكن يجب إضافة مؤشرات تساعد التشغيل على التدخل بسرعة.

| المؤشر | المعادلة | الاستخدام | قواعد اللون |
| --- | --- | --- | --- |
| Reservations by Status | COUNT(reservations.id) GROUP BY status | توزيع الحالات. | الأحمر للحالات المتعثرة. |
| Cancellation Rate | Canceled Reservations / Total Reservations x 100 | قياس فقدان الحجز. | أحمر > 12%. |
| Failure Rate | Failed Reservations / Total Reservations x 100 | حجوزات فشلت بعد الإنشاء. | أحمر > 5%. |
| Completion Rate | Completed Sessions / Scheduled Sessions x 100 | تنفيذ الجلسات. | أخضر > 90%. |
| Unassigned Reservations | COUNT(reservations WHERE doctor_id IS NULL AND status='confirmed') | حجوزات بدون أخصائي. | أحمر إذا أكبر من 0 للحجوزات خلال 24 ساعة. |
| Same-day Reservations | COUNT(reservations WHERE DATE(session_date)=CURRENT_DATE) | ضغط اليوم. | يقارن مع Available.Capacity |
| Average Time to Assign | AVG(assigned_at - confirmed_at) | سرعة التعيين. | أحمر إذا أكبر من ساعتين للحجوزات العاجلة. |
| Reasons of Cancellation | COUNT(*) GROUP BY cancellation_reason | تحليل سبب الخسارة. | إلزام سبب الإلغاء. |

## 10. Packages & Sessions - الجلسات والباقات

Home Healers تعتمد بشكل كبير على تكرار الجلسات والباقات؛ لذلك لا يكفي عرض Total Sessions فقط.

| المؤشر | المعادلة | الغرض | ملاحظة |
| --- | --- | --- | --- |
| Total Sessions | COUNT(sessions.id) | حجم التنفيذ. | يفصل scheduled/.completed/canceled |
| Sessions per Reservation | Total Sessions / Total Reservations | متوسط الجلسات لكل حجز. | يرتفع عند نجاح الباقات. |
| Package Conversion Rate | Package Clients / Total Clients x 100 | نسبة العملاء الذين اشتروا باقة. | يظهر كرت أساسي. |
| Single Session Clients | COUNT(clients WHERE sessions_count=1) | عملاء فرصة للـ.upsell | يعرض للكول سنتر للمتابعة. |
| Single to Package Conversion | Clients upgraded to package / Single Session Clients x 100 | قياس تحويل التجربة إلى باقة. | مؤشر مهم للمبيعات. |
| Repeat Client Rate | Repeat Clients / Total Clients x 100 | ولاء العملاء. | حسب الخدمة والمدينة. |
| Package Completion Rate | Completed Package Sessions / Purchased Package Sessions x 100 | استهلاك الباقات. | يكشف الباقات المتوقفة. |
| Renewal Rate | Renewed Packages / Finished Packages x 100 | التجديد بعد نهاية الباقة. | مؤشر نمو مهم. |

## 11. Capacity & Doctors - الأطباء والطاقة التشغيلية

Active Doctors لوحده لا يوضح كفاءة التشغيل. يجب قياس الاستغلال، الطاقة المتاحة، والتقييم.

| المؤشر | المعادلة | الغرض | تنبيه |
| --- | --- | --- | --- |
| Active Doctors | COUNT(doctors WHERE is_active=true) | عدد الأطباء/الأخصائيين النشطين. | حسب المدينة والتخصص. |
| Available Capacity | SUM(doctor_available_slots) | كم جلسة يمكن تنفيذها اليوم. | يقارن مع الطلب. |
| Utilization Rate | Booked Slots / Available Slots x 100 | استغلال الطاقة. | أحمر إذا أقل من 50% أو أعلى من 95% بدون مرونة. |
| Sessions per Doctor | Completed Sessions / Active Doctors | الإنتاجية. | حسب الفترة. |
| Revenue per Doctor | Collected Revenue / Active Doctors | إنتاجية مالية. | حسب الخدمة والمدينة. |
| Late Arrival Rate | Late Sessions / Completed Sessions x 100 | الالتزام بالمواعيد. | أحمر إذا > 10%. |
| Doctor Rating | AVG(reviews.rating) | جودة الخدمة. | أحمر إذا أقل من 5/4.2. |
| Cancellation by Doctor | Canceled Sessions by Doctor / Doctor Sessions x 100 | متابعة الأداء الفردي. | لا يستخدم للعقوبة بدون مراجعة السبب. |

## 12. Area Performance / City - المدن والمناطق

في الفيديو تظهر رسومات Reservations by City وReservations by State. المطلوب جعلها أداة قرار تشغيلية: أين نزيد الأطباء؟ وأين نخفض الإنفاق؟

| المؤشر | المعادلة | الاستخدام | طريقة العرض |
| --- | --- | --- | --- |
| Reservations by City | COUNT(reservations.id) GROUP BY city | قياس الطلب. | Map + 10 Top لاحقًا. |
| Sessions by City | COUNT(sessions.id) GROUP BY city | قياس التنفيذ. | .Bar Chart |
| Revenue by City | SUM(payments.amount) GROUP BY city | ربحية المدينة. | جدول مرتب تنازليًا. |
| Conversion by City | Reservations by City / Leads by City x 100 | قوة السوق في المدينة. | .Heatmap |
| Demand vs Capacity | Reservations Needed / Available Slots | هل الطلب أعلى من الطاقة؟ | أحمر إذا الطلب أكبر من الطاقة. |
| Cancellation by City | Canceled Reservations by City / Reservations by City x 100 | كشف مشاكل التغطية أو السعر. | يعرض مع أسباب الإلغاء. |

إذا كانت المدينة أو المنطقة تظهر Unknown بنسبة عالية، فهذا خلل في إدخال العنوان ويؤثر على قرارات التوسع والتوظيف.

## 13. Collection & Finance - المالية والتحصيل

يجب فصل الإيراد المسجل عن الإيراد المحصل، لأن القرار المالي يعتمد على التحصيل الفعلي.

| المؤشر | المعادلة | الغرض | ملاحظة |
| --- | --- | --- | --- |
| Gross Revenue | SUM(invoices.total_amount) | إجمالي الفواتير الصادرة. | ليس بالضرورة محصل. |
| Collected Revenue | SUM(payments.amount WHERE status='paid') | الإيراد المحصل فعليًا. | الأهم للإدارة. |
| Pending Revenue | SUM(invoices.amount WHERE status='pending') | مبالغ تحت التحصيل. | يظهر في Red Flags إذا زاد. |
| Collection Rate | Paid Invoices / Total Invoices x 100 | كفاءة التحصيل. | أحمر < 80%. |
| Average Invoice Value | Gross Revenue / Total Invoices | متوسط قيمة الفاتورة. | يقارن حسب الخدمة. |
| Average Revenue per Session | Collected Revenue / Completed Sessions | قيمة الجلسة المحصلة. | مؤشر تسعير. |
| Refund Rate | Refund Amount / Collected Revenue x 100 | قياس المرتجعات. | أحمر إذا تجاوز حد الإدارة. |
| Payment Method Breakdown | SUM(amount) GROUP BY payment_method | مدى، Apple Pay، تحويل، كاش. | مفيد للمالية. |

## 14. Red Flags - قواعد التنبيه الآلي

ضع صندوق تنبيهات أعلى الداشبورد يعرض المشاكل التي تحتاج قراراً فورياً.

| التنبيه | الشرط البرمجي | اللون | الإجراء المقترح |
| --- | --- | --- | --- |
| Low Lead Quality | Lead Quality Rate < 10% | أحمر | مراجعة الحملات وتعريف Qualified Lead. |
| High Unknown Source | Unknown Source % > 20% | أحمر | إصلاح UTM وربط المصدر عند الإدخال. |
| Missed Calls High | Missed Calls Rate > 15% | أحمر | زيادة تغطية الكول سنتر في ساعات الذروة. |
| Pending Follow-ups | Pending Follow-ups > threshold | برتقالي | توزيع المتابعات على الموظفين. |
| Unassigned Reservation | Confirmed AND doctor_id IS NULL AND session_date < 24h | أحمر | تصعيد إلى التشغيل. |
| Demand Higher than Capacity | Today Reservations > Available Capacity | أحمر | فتح أطباء إضافيين أو إعادة الجدولة. |
| Pending Collection | Pending Revenue / Gross Revenue > 20% | برتقالي | متابعة التحصيل. |
| Doctor Rating Low | Doctor Rating < 4.2 | أحمر | مراجعة الجودة والتدريب. |

## 15. متطلبات التنفيذ للمهندس

### أ. طبقة البيانات المقترحة

الجدول /

| الحقول الأساسية المصدر | الغرض |
| --- | --- |
| **leads** — id, client_id, source, medium, campaign, city, service_type, is_qualified, qualification_reason, created_at | قياس التسويق وجودة الليدز. |
| **tickets** — id, lead_id, direction, type, agent_id, status, first_response_at, closed_at, created_at | قياس الكول سنتر والدعم. |
| **reservations** — id, lead_id, client_id, service_type, city, status, confirmed_at, canceled_reason, doctor_id, created_at | قياس الحجز والتأكيد. |
| **sessions** — id, reservation_id, doctor_id, scheduled_at, completed_at, status, late_minutes | قياس التنفيذ والجلسات. |
| **doctors** — id, city, specialty, is_active, available_slots, rating | قياس الطاقة التشغيلية. |
| **invoices** — id, reservation_id, client_id, total_amount, status, payment_method, issued_at | الفواتير. |
| **payments** — id, invoice_id, amount, status, paid_at, method | التحصيل الفعلي. |
| targets month, reservations_target, revenue_target, city, service_type | المقارنة بالتارجت. |

### ب. نمط الـ API المستخدم (بدون endpoints جديدة)

الفرونت يعتمد على نفس استجابات القوائم الحالية مع كتلة `statistics` داخلها:

| الصفحة | مصدر البيانات الحالي | ما يحسبه الفرونت الآن |
| --- | --- | --- |
| Inbound / Outbound | `customer-supports` list + `statistics` | Success/Failed/Lead Quality/Support→Reservation/Unknown Source % |
| Reservations | `reservations` list + `statistics` | Confirmation/Cancellation/Collection/Unknown Source % |
| Patients | `clients` list + `statistics` | Repeat / multiple bookings من الحقول الحالية |
| Doctors / KPIs إضافي | ناقص — انظر ملف النواقص | لا يُبنى حتى تُضاف الحقول على نفس النمط |

أي نقص يُطلب كحقول إضافية داخل `statistics` الحالية، موثّق في:
`docs/home_healers_dashboard_backend_missing_apis.md`

## 16. قواعد تجربة المستخدم للفرونت إند

- كل كرت يعرض: الاسم، الرقم، حالة اللون، وتفسير مختصر عند الحاجة.
- الضغط على الكرت يفتح الجدول/الكانبان بنفس فلتر الـ `link` القادم من الـ API.
- رسالة واضحة عند عدم وجود بيانات بدل ترك القسم فارغًا.
- الفلاتر الحالية للصفحة تؤثر على نفس `statistics` (لا داشبورد منفصل).

## 17. خطة التنفيذ المرحلية (Frontend أولاً)

| المرحلة | المخرجات | الأولوية | يعتمد على Backend؟ |
| --- | --- | --- | --- |
| المرحلة 1 | ترتيب Sidebar + Top KPIs + Unknown Source alert على Contact Center و Reservations | عالية جدًا | لا — بيانات موجودة |
| المرحلة 2 | إعادة ترتيب أقسام الإحصائيات حسب رحلة القرار + ألوان الحالة | عالية | لا — بيانات موجودة |
| المرحلة 3 | تحسين Patients summary من الإحصائيات الحالية | متوسطة | لا — جزئيًا موجود |
| المرحلة 4 | Doctors capacity / utilization UI | متوسطة | نعم — حقول ناقصة |
| المرحلة 5 | Patient data quality / LTV + أسباب الإلغاء/الفشل | متوسطة | نعم — حقول ناقصة |
| المرحلة 6 | KPIs operational enhancements + Agent/SLA | لاحقة | نعم — حقول ناقصة |

### معايير القبول قبل الإطلاق (لهذه المرحلة)

- كل كرت محسوب له معادلة واضحة من الحقول الحالية.
- كل رقم قابل للتتبع عبر `link` إلى الجدول.
- Unknown Source يظهر كتنبيه أحمر إذا > 20%.
- ترتيب الأقسام يطابق رحلة العميل.
- لا يوجد endpoint أو JSON shape جديد في الفرونت.
