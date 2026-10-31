مواصفات فنية + ترتيب تشغيلي

# ترتيب أقسام الداشبورد / Inbound / Outbound / Reservations Patients / Doctors / KPIs

وثيقة موجهة لمهندس التقنية وفريق الإدارة لترتيب الشاشات حسب رحلة العميل وربط المؤشرات التسويقية والتشغيلية والمالية بمعادلات واضحة.

| المخرجات | المنطق | الهدف |
| --- | --- | --- |
| ترتيب الواجهات، الرسومات المطلوبة، | تواصل العميل → تأهيل الليد → الحجز | تحويل الشاشات من قوائم وأرقام |
| المعادلات، التنبيهات، وحقول البيانات | → المريض → الطبيب → الجلسة → | متفرقة إلى لوحة قيادة واضحة لاتخاذ |
| اللازمة. | الفاتورة → KPI. | القرار اليومي. |

| Contact Center | Reservations | Patients | Doctors | KPIs |
| --- | --- | --- | --- | --- |

إعداد: المستشار التحليلي الخاص - Home Healers

## 1) ملخص الموجود في الفيديو والمشكلة التحليلية

الفيديو يوضح وجود أقسام مهمة داخل النظام: KPIs ,Doctors ,Patients ,Reservations ,Inbound ,Outbound. المشكلة ليست في توفر البيانات، بل في أن الترتيب الحالي لا يربط الأرقام مباشرة بمسار اتخاذ القرار.

| Revenue / KPI التحصيل والأداء | Patient / Doctor ← ← العميل والطاقة التشغيلية | Reservation ← الحجز والتأكيد والجلسات | Lead جوnدةi oالtعaمcيلi fiوlمaلاuءمQته | / Inbound ← مdصnدر uالoليbد tوuحالOة التواصل |
| --- | --- | --- | --- | --- |

### الملاحظات الرئيسية من الفيديو

| القسم | الموجود حاليًا | المشكلة | المطلوب |
| --- | --- | --- | --- |
| Outbound | ,Status, Clients, Source Campaigns, Lead Quality Qualifications, Channels, Offers | المؤشرات موجودة لكنها غير مرتبطة بمعدل التحويل للحجز | إضافة Funnel واضح: Outbound Lead → Qualified → Reservation → Paid |
| Inbound | نفس هيكل Outbound مع أرقام مختلفة ,Status, Sessions, Revenue, Source, ServicesReservations Categories, Clients | نسبة Unknown عالية في المصدر والقناة ممتازة لكنها تحتاج ترتيب حسب الحجز ثم الجلسات ثم التحصيل | إظهار Unknown Source % كتنبيه أحمر وربطه بفريق الكول سنتر إضافة Cancellation ,Confirmation Rate Rate, Revenue/Session, Average Sessions |
| Patients | قائمة مرضى مع معلومات الهوية والجوال والجنس | لا تظهر جودة بيانات المريض ولا تكرار الحجز بشكل إداري | إضافة Patient Data Quality وRepeat Patient Rate أعلى القائمة |
| Doctors | قائمة أطباء مع بيانات مهنية وحالة ولغات | الصفحة إدارية أكثر من تشغيلية | إضافة الطاقة التشغيلية: Available Capacity, Utilization, Sessions/Doctor |
| KPIs | ,Active Users, Total Actions, Today/Week/Month By Event, Top Users, Most Modified Models | تركز على Activity Logs ولا تقيس إنتاجية التشغيل | فصل KPIs إلى User Audit وOperational KPI وDoctor KPI |

تنبيه مهم: وجود مصادر كثيرة باسم unknown في Inbound وReservations يمنع معرفة القنوات الرابحة والخاسرة. يجب اعتبار Unknown Source % مؤشراً أساسيًا في أول الصفحة.

## 2) ترتيب القائمة الجانبية وهيكل النظام المقترح

الأفضل ترتيب القائمة حسب رحلة العميل وليس حسب نوع البيانات فقط. هذا يجعل الموظف والمدير يفهمان أين يبدأ الطلب وأين ينتهي.

| الترتيب التنفيذي المقترح | الترتيب الحالي الملحوظ |
| --- | --- |
| Executive Dashboard.1 | Contact Center: Outbound / Inbound / WhatsApp • |
| Contact Center: Inbound, Outbound, WhatsApp.2 | Inbox |
| Reservations Operations.3 | / Master Management: Patients / Doctors • |
| Patients Management.4 | Reservations / Invoices / Services |
| Doctors & Capacity.5 | User Management: KPIs / Activity Logs / Users |
| Finance & Collections.6 |  |
| KPIs & Audit Logs.7 |  |
| Master Data.8 |  |

> تحديث Frontend: تم تطبيق ترتيب القائمة الجانبية حسب رحلة العميل في `menu-items.tsx` (Inbound قبل Outbound، ثم الحجوزات، المرضى، الأطباء، المالية، ثم KPIs).

### الرسم المقترح لترتيب الصفحات داخليًا

كل صفحة تشغيلية يجب أن تبدأ بهذا الهيكل

| قائمة البيانات Search, Filter, Export | تحليل تفصيلي Charts / Breakdown | ملخص إداري KPI Cards 5-8 | فلاتر أساسية ,Date, City, Service, Channel Staff |
| --- | --- | --- | --- |

### الفلاتر الموحدة لكل الأقسام

| الفلتر | يظهر في | الغرض |
| --- | --- | --- |
| Date Range | كل الصفحات | تحديد فترة التحليل: اليوم، الأسبوع، الشهر، فترة مخصصة |
| City / Area | Inbound, Reservations, Doctors, Patients | ربط الطلب بالطاقة التشغيلية والتغطية |
| Channel / Source | Inbound, Outbound, Reservations | معرفة مصدر العميل وتحسين الإنفاق |
| Service / Category | Reservations, Doctors, Patients | معرفة الخدمات الأكثر طلباً |
| Status | Inbound, Outbound, Reservations, Doctors | تصفية الحالات الحرجة |
| Agent / User | Inbound, Outbound, KPIs | قياس أداء الموظف |
| Doctor / Therapist | Reservations, Doctors | قياس التعيين والتنفيذ والجودة |
| Payment Status | Reservations, Finance | تحديد التحصيل والمتبقي |

قاعدة تنفيذية: لا تعرض أي رسم أو KPI بدون فلتر تاريخ واضح، لأن المؤشر بدون فترة زمنية لا يصلح لاتخاذ القرار.

## 3) ترتيب صفحة Inbound و Outbound - الشكل الموحد

بما أن Inbound وOutbound يشتركان في نفس المنطق، الأفضل بناء Template واحد مع تغيير نوع الطلب حسب الصفحة.

Wireframe مقترح لصفحة Contact Center

| % Unknown Source | Support → Reservation | Success Rate | Qualified Leads | Total Supports |
| --- | --- | --- | --- | --- |
| Leads Qualification / Inside KSA / Need Service / Coverage Answered |  | Lead Quality by Campaign Google / WhatsApp / Call / Unknown |  | Status Statistics / New / Possible / Follow Up / Negotiation Success / Failed / Closed |
| Agent Performance |  | Offers Performance |  | Communication Channels |

Kanban أو Table للحالات المفتوحة: Closed / Failed / Success → Negotiation → Follow Up → Possible → New

### المعادلات الأساسية للـ Outbound / Inbound

| المؤشر | المعادلة | ملاحظات تقنية |
| --- | --- | --- |
| Total Supports | COUNT(customer_support_id) | حسب inbound = type أو outbound |
| Qualified Leads | COUNT(lead WHERE qualification_all_required = true) | العميل مؤهل إذا تحقق: داخل السعودية + يحتاج الخدمة + المدينة مغطاة + تم الرد |
| Lead Quality Rate | Qualified Leads ÷ Total Supports × 100 | يسمى أيضًا Qualified Lead Rate |
| Success Rate | Success Supports ÷ Total Supports × 100 | الحالة = Success |
| Failure Rate | Failed Supports ÷ Total Supports × 100 | الحالة = Failed |
| Follow-up Rate | Follow Up Supports ÷ Total Supports × 100 | لقياس التراكم |
| Support to Reservation Rate | Clients with Mobile & Reservation ÷ Total Supports × 100 | أهم مؤشر لربط الكول سنتر بالحجوزات |
| Multiple Reservation | Clients with Mobile & Multiple Reservations ÷ Clients with Mobile | لقياس جودة العميل المتكرر |
| Rate | Reservation × 100 & |  |
| % Unknown Source | Unknown Source Count ÷ Total Source Campaigns × 100 | إذا > 20% يظهر تنبيه أحمر |
| Channel Share | Supports from Channel ÷ Total Supports × 100 | واتساب / اتصال / Unknown / Lead Form |

qualified_lead = inside_ksa == true AND need_home_healers_service == true AND city_coverage == true AND

answered_by_call_or_whatsapp == true

الترتيب العملي: لا تضع Source Campaigns قبل Status Statistics. ابدأ بالحالة، ثم جودة الليد، ثم المصدر، ثم القناة، ثم العروض، ثم جدول المتابعة.

## 4) صفحة Outbound Customer Supports

### الترتيب المقترح

Top KPIs: Total Supports, Success Rate, Failed Rate, Lead.1.Quality Rate, Support to Reservation.Status Statistics.2.Clients Conversion.3.Source Campaigns.4.Lead Quality by Campaign.5.Leads Qualification.6.Communication Channels.7.Offers.8.Follow-up Kanban / Table.9

لقطة مرجعية من الفيديو - Outbound

### الأرقام الظاهرة في الفيديو كأمثلة تحقق

| المجموعة | المؤشرات الظاهرة | الاستخدام |
| --- | --- | --- |
| Status | / Failed 1,053 / New 397 / Possible 242 / Success 215 / Closed 34 / Follow Up 26 Negotiation 10 | قياس حالة المتابعة ومشكلة الفشل |
| Clients | Total Customer Supports 1,980 / Clients with Mobile & Reservation 127 / Multiple Reservations 44 | قياس التحويل من التواصل إلى حجز وتكرار الحجز |
| Source | Google 1,261 / Unknown 306 / Mobile App 283 / Other 77 / Instagram 26 / Referral | تحديد المصدر الأعلى والأقل جودة |
| Campaigns | 6 |  |
| Lead Quality | Google 3.89% = 49/1261 / Referral 16.67% = 1/6 / Unknown 0% |  |

مقارنة جودة المصادر مع ضرورة الانتباه لحجم العينة

| Channels | WhatsApp 1,311 / Unknown 322 / Lead Form 267 / Call 80 | معرفة القناة التي تحتاج متابعة أسرع |
| --- | --- | --- |

### مؤشرات يجب إضافتها في Outbound

| المؤشر | المعادلة | لون التنبيه |
| --- | --- | --- |
| Outbound Success Rate | Success ÷ Total Outbound Supports | أخضر إذا > 15%، أصفر 8%-15%، أحمر < 8% |
| Outbound Failed Rate | Failed ÷ Total Outbound Supports | أحمر إذا > 40% |
| Outbound Qualified Rate | Qualified Outbound Leads ÷ Total Outbound Supports | أخضر إذا > 20% |
| Outbound to Reservation Rate | Outbound Clients with Reservation ÷ Total Outbound Supports | أحمر إذا < 5% |
| Follow-up Aging | AVG(today - last_follow_up_at) | أحمر إذا > 24 ساعة للطلبات الساخنة |
| Offer Conversion | Reservations per Offer ÷ Supports per Offer | يعرض أفضل عرض فعليًا وليس الأكثر عدداً فقط |

ملاحظة: رقم Failed في Outbound مرتفع جداً مقارنة بـ Success. يجب إضافة سبب الفشل كحقل إلزامي: لا يرد، غير مهتم، خارج التغطية، سعر، تكرار، رقم خاطئ، يحتاج لاحقًا.

## 5) صفحة Inbound Customer Supports

### الترتيب المقترح

Top KPIs: Total Inbound, New, Qualified, Support to.1.% Reservation, Unknown Source.Status Statistics.2.Qualification Breakdown.3.Communication Channels.4.Source Campaigns + Quality.5.Offers Performance.6.Pending Follow-up / SLA Breach.7.Inbound Table / Kanban.8

لقطة مرجعية من الفيديو - Inbound

### الأرقام الظاهرة في الفيديو كأمثلة تحقق

| المجموعة | المؤشرات الظاهرة | التحليل |
| --- | --- | --- |
| Status | New 948 / Failed 504 / Possible 143 / Success 141 / Closed 83 / Follow Up Negotiation 3 / 32 | Inbound يحتاج سرعة فرز New وتحويله إلى Possible/Success |
| Clients | Total Customer Supports 2,635 / Clients with Reservation 124 / Multiple Reservations 45 | عدد كبير من التواصل لا يتحول إلى حجز |
| Source | / Unknown 1,471 / Google 866 / Other 137 / Instagram 78 / Call 33 | Unknown هو أكبر مصدر، ويحتاج إلزام source عند |
| Campaigns | WhatsApp 21 | إنشاء الدعم |
| Lead Quality | Google 2.66% = 23/866 / Other 0.73% = 1/137 / Unknown 0% | الجودة منخفضة جداً وتحتاج تحسين التأهيل والتتبع |

| Qualification | / Inside KSA Yes 51 / Need Service Yes 23 No 28 / City Coverage Yes 50 No 1 | الأسئلة التأهيلية موجودة ويجب تحويلها إلى |
| --- | --- | --- |
| Answered Yes 50 No 1 |  | Qualified Score |
| Channels | Unknown 1,517 / Call 738 / WhatsApp 372 / Lead Form 8 | القنوات تحتاج توحيد Naming وتسجيل آلي |

### مؤشرات يجب إضافتها في Inbound

| المؤشر | المعادلة | الغرض |
| --- | --- | --- |
| Inbound Response Rate | Answered Inbound ÷ Total Inbound | قياس الرد على العملاء الواردين |
| Inbound Qualification Rate | Qualified Inbound ÷ Total Inbound | قياس جودة الطلبات الواردة |
| Inbound Conversion Rate | Reservations from Inbound ÷ Total Inbound | أهم مؤشر للكول سنتر |
| New Aging | AVG(now - created_at WHERE status='New') | قياس تراكم الطلبات الجديدة |
| SLA Breach Rate | Tickets exceeded SLA ÷ Open Tickets | تنبيه تشغيلي |
| % Unknown Channel | Unknown Channel Count ÷ Total Inbound | أحمر إذا > 10% |

lead_score = (inside_ksa? 25: 0) + (need_service? 30: 0) + (city_covered? 25: 0) + (answered? 20: 0)

قاعدة جودة: يعتبر الليد مؤهلاً عندما يكون 80 ≥ Lead Score أو عندما تكون كل إجابات التأهيل الأساسية = Yes.

## 6) ترتيب صفحة Reservations

صفحة الحجوزات هي القلب التشغيلي للنظام، لذلك يجب أن ترتب من الأعلى حسب: حالة الحجز → الجلسات → التحصيل → المصدر → الخدمة → العميل.

Wireframe مقترح لصفحة Reservations

| Cancellation Rate | Collection Rate | Total Sessions | Confirmed | Total Reservations |
| --- | --- | --- | --- | --- |
| Source Campaigns With Unknown Alert |  | Revenue & Collection Paid / Unpaid / Remaining |  | Reservation by Status Reviewing / Confirmed / Canceled / Failed |
| Client Repeat & Multiple Bookings |  | Categories Performance |  | Services Performance |
| Upcoming Sessions |  | Unassigned Reservations |  | Reservations Table Assign Doctor / Invoice / Status / Actions |

### المعادلات الأساسية للحجوزات

| المؤشر | المعادلة | ملاحظة |
| --- | --- | --- |
| Confirmation Rate | Confirmed Reservations ÷ Total Reservations × 100 | بديل أدق من Reservation Rate إذا كان المقصود confirmed/total |
| Reviewing Rate | Reviewing Reservations ÷ Total Reservations × 100 | يقيس تراكم الحجوزات تحت المراجعة |
| Cancellation Rate | Canceled Reservations ÷ Total Reservations × 100 | يظهر مع أسباب الإلغاء |
| Failure Rate | Failed Reservations ÷ Total Reservations × 100 | فشل حجز أو تنفيذ |
| Average Sessions per Reservation | Total Sessions ÷ Total Reservations | يقيس عمق البيع والباقة |
| Paid Reservation Rate | Paid Reservations ÷ Total Reservations × 100 | مؤشر تحصيل عددي |
| Collection Rate | Paid Revenue ÷ (Paid Revenue + Unpaid Revenue) 100 × | مؤشر مالي أساسي |
| Revenue per Reservation | Total Revenue ÷ Total Reservations | متوسط قيمة الحجز |
| Revenue per Session | Total Revenue ÷ Total Sessions | متوسط الإيراد لكل جلسة |
| % Unknown Source | Unknown Reservations ÷ Total Reservations × 100 | تنبيه أحمر إذا > 20% |

الربط المطلوب: كل Reservation يجب أن يحمل patient_id ,support_id ,communication_channel ,source_campaign, invoice_id ,service_id ,doctor_id حتى نستطيع تتبع الرحلة كاملة.

## 7) Reservations - الأرقام الظاهرة والإضافات المطلوبة

### الترتيب التفصيلي

.Reservation by Status.1.Revenue & Collection.2.Source Campaigns.3.Services.4.Categories.5.Clients & Multiple Bookings.6.Reservations table with actions.7

لقطة مرجعية من الفيديو - Reservations

### الأرقام الظاهرة في الفيديو كأمثلة تحقق

| القسم | المؤشرات | الاستخدام |
| --- | --- | --- |
| Status | / Total Reservations 2,303 / Sessions 6,963 / Confirmed 2,202 / Reviewing 59 / Canceled 34 Failed 8 | يعطي صحة الحجز والتنفيذ |
| Revenue | Paid 2,030 = 1,704,586.23 SAR / Unpaid 273 = 215,969.05 SAR / Remaining 260 | قياس التحصيل والمتبقي |
| Source | / Unknown 1,659 / Google 483 / Other 43 / WhatsApp 24 / Center 21 / Call 15 / Website 16 Referral 16 | Unknown عالي جداً ويجب علاجه |
| Services | آلام عضلي ومفصلي 429 - 1,438 sessions / إعادة تأهيل عصبي 46 - 130 sessions / مساج لمفاوي 15 - 44 sessions | معرفة الخدمات الأعلى طلباً وربطها بالإيراد |

| Categoriesالعلاج الطبيعي 354 - 1,162 sessions / العلاج الطبيعي العام 50 - 167 sessions / المساج اللمفاوي 19 - 67 sessions | قياس الفئات التشغيلية |
| --- | --- |
| Clients Total Unique Customers 1,255 / Multiple Bookings 460 - 1,508 reservations - 5,222 sessions | قياس تكرار العملاء والباقة |

### مؤشرات إضافية مهمة للحجوزات

| المؤشر | لماذا مهم؟ | طريقة العرض |
| --- | --- | --- |
| Unassigned Reservations | أي حجز بدون طبيب يؤثر مباشرة على التشغيل | كرت أحمر + جدول |
| Same-day Reservations | حجوزات تحتاج سرعة تنسيق | كرت يومي |
| Upcoming Sessions | لتخطيط الأطباء اليومي | جدول حسب الوقت والمدينة |
| Package Conversion | تحويل جلسة واحدة إلى باقة | خط بياني + كرت |
| Renewal Rate | تجديد الباقات بعد انتهائها | نسبة شهرية |
| Cancellation Reasons | ليس كافيًا معرفة عدد الإلغاءات | Pie / Bar chart |

collection_rate = paid_amount / (paid_amount + unpaid_amount) avg_sessions_per_reservation = total_sessions /

total_reservations repeat_customer_rate = multiple_booking_customers / unique_customers

## 8) ترتيب صفحة Patients

صفحة المرضى حاليًا تظهر كقائمة بيانات. المطلوب إضافة طبقة Dashboard أعلى القائمة لقياس جودة بيانات المرضى وقيمة العميل وتكرار الحجز.

### الترتيب المقترح

.Patient Summary KPIs.1.Data Quality KPIs.2.Patient Segmentation.3.Repeat & Retention.4.Patient Table.5

لقطة مرجعية من الفيديو - Patients

Wireframe مقترح للمرضى

| Profile Completeness | Repeat Patients | Active Patients | New Patients | Total Patients |
| --- | --- | --- | --- | --- |
| Patients by Booking Frequency |  | Patients by Service Need |  | Patients by City |
| High Value Patients |  | Inactive Patients |  | Missing Mobile / National ID |

### الأعمدة المقترحة في جدول المرضى

| المجموعة | الأعمدة | الغرض |
| --- | --- | --- |
| هوية المريض | ID, Name, Mobile, National ID, Gender, Date of Birth | التعريف والاتصال |
| الجودة | Profile Completeness %, Missing Fields, Duplicate Mobile | تنظيف قاعدة البيانات |
| الحجوزات | Total Reservations, Last Reservation Date, Upcoming Reservation | تحديد نشاط العميل |
| القيمة | Total Revenue, Average Invoice, Remaining Payment | معرفة قيمة العميل |
| التسويق | First Source, Last Source, Channel, Campaign | معرفة مصدر العميل |
| التشغيل | Preferred City, Address Count, Assigned Doctor | تسهيل جدولة الجلسات |

### معادلات Patients

| المؤشر | المعادلة |
| --- | --- |
| Active Patients | COUNT(DISTINCT patient_id WHERE confirmed_or_completed_reservation_in_period = true) |
| Repeat Patient Rate | Patients with 2+ Reservations ÷ Total Patients × 100 |
| Reservation-linked Patients | Patients with at least 1 Reservation ÷ Total Patients × 100 |
| Profile Completeness | Completed Required Fields ÷ Total Required Fields × 100 |
| Duplicate Mobile Rate | Duplicate Mobile Patients ÷ Total Patients × 100 |
| Patient LTV | SUM(revenue for patient across all reservations) |
| Days Since Last Booking | Today - Last Reservation Date |

توصية تقنية: منع إنشاء Patient بدون رقم جوال صحيح، وإضافة فحص تكرار للجوال والهوية قبل الإنشاء.

## 9) ترتيب صفحة Doctors

صفحة الأطباء/الأخصائيين يجب أن تجمع بين البيانات الإدارية والطاقة التشغيلية. القائمة وحدها لا تكفي لاتخاذ قرار التغطية أو التوظيف أو توزيع الحجوزات.

### الترتيب المقترح

.Doctor Capacity Summary.1.Doctors by Status & City.2.Utilization & Workload.3.Quality & Patient Experience.4.Revenue per Doctor.5.Doctors Table.6

لقطة مرجعية من الفيديو - Doctors

Wireframe مقترح للأطباء

| Revenue per Doctor | Sessions per Doctor | Utilization Rate | Available Capacity | Active Doctors |
| --- | --- | --- | --- | --- |
| Low Utilization Doctors |  | Top Performing Doctors |  | Coverage by City |
| Doctor Rating |  | Late Arrival Rate |  | Cancellation by Doctor |

### الأعمدة المقترحة في جدول الأطباء

| المجموعة | الأعمدة | الغرض |
| --- | --- | --- |
| تعريف | ID, Name, Mobile, Email, Status | تعريف وتفعيل الطبيب |
| مهني | Degree, Classification, Medical School, Specialty, Languages | التصنيف والمهارة |
| تغطية | City, Areas, Service Categories, Gender Preference | توزيع الطلبات |
| تشغيل | Available Slots, Booked Slots, Sessions Completed, Cancellations | إدارة الطاقة |
| جودة | Rating, Complaints, Late Arrival, No-show | تجربة العميل |
| مالي | Revenue, Payable Amount, Commission, Average Revenue/Session | حساب التكلفة والربحية |

### معادلات Doctors

| المؤشر | المعادلة |
| --- | --- |
| Active Doctors | COUNT(doctor_id WHERE status='active') |
| Available Capacity | SUM(available_slots for active doctors in selected period) |
| Booked Capacity | SUM(booked_slots for active doctors in selected period) |
| Doctor Utilization Rate | Booked Capacity ÷ Available Capacity × 100 |
| Sessions per Doctor | Completed Sessions ÷ Active Doctors |
| Revenue per Doctor | Collected Revenue assigned to Doctor ÷ Doctor Count or per Doctor |
| Cancellation by Doctor | Canceled Reservations assigned to Doctor ÷ Total Reservations assigned to Doctor × 100 |
| Late Arrival Rate | Late Sessions ÷ Completed Sessions × 100 |
| Capacity Gap | Required Sessions - Available Capacity |

مؤشر لازم يظهر أعلى الصفحة: Demand vs Capacity حسب المدينة. إذا الطلب في الرياض أعلى من الطاقة المتاحة تظهر المدينة باللون الأحمر.

## 10) ترتيب صفحة KPIs

صفحة KPIs في الفيديو تحتوي تبويبين: Users وDoctors. تبويب Users يعرض Activity Logs مثل Active Users وTotal Actions وBy Event وTop Users وMost Modified Models. المطلوب فصلها إلى مؤشرات رقابية وتشغيلية.

### الترتيب المقترح لتبويب Users

.Active Users.1.Total Actions.2.Actions Today / Week / Month.3.Actions by Event.4.Top Users.5.Most Modified Models.6.Risk Actions: Delete / Mass Update.7.Activity Log Table.8

لقطة مرجعية من الفيديو - KPIs

### الأرقام الظاهرة في تبويب Users

| المجموعة | المؤشرات الظاهرة | الغرض |
| --- | --- | --- |
| Summary | Active Users 11 / Total Actions 11,661 / Today 29 / Week 409 / Month 244 | قياس نشاط مستخدمي النظام |
| By Event | Updated 6,379 / Created 4,603 / Uncategorized 522 / Deleted 157 | معرفة نوع النشاط |
| Most Modified | CustomerSupport 5,994 / Reservation 2,038 / InvoiceDetail 1,215 / Invoice 1,174 / Address | تحديد الشاشات الأكثر تعديلاً |
| Models | 367 |  |

### المعادلات المقترحة للـ KPIs

| المؤشر | المعادلة | الغرض |
| --- | --- | --- |
| Actions per Active User | Total Actions ÷ Active Users | قياس كثافة العمل |
| % Create | Created Actions ÷ Total Actions × 100 | حجم الإضافات الجديدة |
| % Update | Updated Actions ÷ Total Actions × 100 | حجم التعديلات |
| % Delete | Deleted Actions ÷ Total Actions × 100 | تنبيه رقابي |
| Risk Action Rate | Total Actions × 100 ÷ (Deleted + Bulk Update + Permission Changes) | قياس المخاطر |
| Top User Contribution | Actions by User ÷ Total Actions × 100 | تحديد الاعتماد على موظف واحد |
| Model Change Share | Actions by Model ÷ Total Actions × 100 | تحديد أكثر شاشات تتغير |

### تبويب Doctors داخل KPIs

تبويب Doctors الحالي يظهر 163 Active Doctors و1 Total Actions. الأفضل ألا يكون Doctor KPI مجرد Activity Logs، بل يجمع بين النشاط والتشغيل.

| المؤشر المطلوب | المعادلة | العرض |
| --- | --- | --- |
| Doctor Activity Actions | Actions by Doctor Users | رقابي |
| Doctor Completed Sessions | Completed Sessions by Doctor | تشغيلي |
| Doctor Utilization | Booked Slots ÷ Available Slots | تشغيلي |
| Doctor Rating | AVG(patient_rating) | جودة |
| Doctor Revenue | Collected Revenue assigned to Doctor | مالي |
| Doctor Cancellation Rate | Canceled assigned reservations ÷ assigned reservations | جودة تشغيل |

## 11) متطلبات البيانات والـ API للمهندس

لتنفيذ هذه المؤشرات يجب أن تكون العلاقات بين الجداول واضحة، وأن يتم تسجيل المصدر والقناة والحالة بشكل إلزامي.

### الجداول/الكيانات الأساسية

| Entity | أهم الحقول المطلوبة ,id, type, status, source_campaign, communication_channel, offer_id, qualification_answersCustomerSupport lead_score, assigned_agent_id, patient_mobile, reservation_id, created_at, updated_at | العلاقات يرتبط بـ Patient/ Reservation/User |
| --- | --- | --- |
| Reservation | ,id, patient_id, doctor_id, status, sessions_count, source_campaign, channel, service_id category_id, city_id, invoice_id, support_id, created_at, confirmed_at, canceled_reason | يرتبط بـ Patient/Doctor/ Invoice/Service |
| Patient | id, name, mobile, national_id, gender, dob, city_id, profile_completeness, created_at | يرتبط بحجوزات وعناوين |
| Doctor | id, name, status, classification, degree, languages, cities, services, available_slots, created_at | يرتبط بالحجوزات والجلسات |
| Invoice | ,id, reservation_id, status, paid_amount, unpaid_amount, remaining_amount payment_method, paid_at | يرتبط بالحجز |
| ActivityLog | id, user_id, user_type, event, model_type, model_id, before, after, created_at | يرتبط بالمستخدمين والأطباء |
| Session | id, reservation_id, doctor_id, status, scheduled_at, completed_at, late_minutes, rating | يرتبط بالحجز والطبيب |

### نمط البيانات المستخدم (بدون endpoints جديدة)

| الصفحة | API الحالي | كتلة الإحصائيات المستخدمة |
| --- | --- | --- |
| Inbound / Outbound | customer-supports list | `statistics` (by_status, leads, clients_with_mobile_*, by_source_campaign, lead_quality_by_source_campaign, by_leads_qualification, by_communication_channel, by_offer, …) |
| Reservations | reservations list | `statistics` (by_status, paid/unpaid, by_source_campaign, by_service, by_category, customers, …) |
| Patients | clients list | `statistics` (by_status, with_multiple_reservations, …) |
| Doctors / KPIs إضافي | ناقص | انظر `docs/home_healers_dashboard_backend_missing_apis.md` |

أي حقل ناقص يُطلب كإضافة داخل نفس `statistics` — بدون endpoint جديد وبدون JSON shape منفصل.

## 12) نظام الألوان والتنبيهات المقترح

الهدف أن يقرأ المدير الصفحة خلال 30 ثانية ويعرف أين المشكلة.

| المؤشر | أحمر | أصفر | أخضر |
| --- | --- | --- | --- |
| Lead Quality Rate | 10% < | 10%-20% | 20% > |
| % Unknown Source | 20% > | 10%-20% | 10% < |
| Support to Reservation Rate | 5% < | 5%-10% | 10% > |
| Confirmation Rate | 85% < | 85%-95% | 95% > |
| Cancellation Rate | 8% > | 4%-8% | 4% < |
| Collection Rate | 85% < | 85%-95% | 95% > |
| Doctor Utilization | < 50% أو > 90% | 50%-65% | 65%-85% |
| SLA Breach Rate | 10% > | 5%-10% | 5% < |
| Profile Completeness | 70% < | 70%-90% | 90% > |
| Delete Action Rate | 3% > | 1%-3% | 1% < |

### Red Flags Section - يظهر أعلى الداشبورد التنفيذي

| Lead Quality منخفض | Unknown Source عالي |
| --- | --- |
| أقل من 10% | أي مصدر مجهول أعلى من 20% |

| تحصيل متأخر | حجوزات بدون طبيب |
| --- | --- |
| Remaining Payment عالي | Unassigned Reservations |

| طاقة غير كافية | طلبات New متراكمة |
| --- | --- |
| Demand أعلى من Capacity | Inbound/Outbound aging |

### معادلة لون الحالة

status_color = if metric_value in red_range: "Need Attention" elif metric_value in yellow_range: "Average"

else: "Excellent"

ملاحظة: لا تقارن Campaign أو Source إذا العينة صغيرة جداً. اجعل الحد الأدنى للعرض التحليلي 50 leads أو 20 reservations؛ وما دون ذلك يظهر تحت Sample Too Small.

## 13) خطة التنفيذ Frontend - Prioritized Backlog

قاعدة التنفيذ: نستخدم نفس نمط الإحصائيات الحالي على صفحات القوائم/الكانبان (الحقول الموجودة في `statistics` داخل استجابة الـ list). لا نضيف endpoints جديدة ولا نغيّر شكل JSON.

ترتيب العمل حسب رحلة العميل + ما يمكن بناؤه فورًا من البيانات الحالية.

| الأولوية | المهمة (Frontend) | الصفحة | يعتمد على | المخرجات |
| --- | --- | --- | --- | --- |
| FE-P0 | ترتيب القائمة الجانبية حسب رحلة العميل | Sidebar | موجود | Inbound → Outbound → WhatsApp → Reservations → Patients → Doctors → Invoices → KPIs → Master Data |
| FE-P0 | Top KPI Cards + إعادة ترتيب أقسام الإحصائيات | Inbound / Outbound | `customer_supports.statistics` الحالي | Total, Success/Failed Rate, Lead Quality, Support→Reservation, Unknown Source % ثم Status → Clients → Source → Quality → Qualification → Channels → Offers |
| FE-P0 | تنبيه Unknown Source أحمر إذا > 20% | Inbound / Outbound / Reservations | `by_source_campaign` | Red flag في أعلى الصفحة |
| FE-P0 | Top KPI Rates من البيانات الحالية | Reservations | `reservations.statistics` الحالي | Confirmation / Cancellation / Collection / Unknown Source + ترتيب Status → Revenue → Source → Services → Categories → Clients |
| FE-P1 | تحسين عرض Patients summary | Patients | `clients.statistics` الحالي | Repeat rate من multiple bookings + ترتيب أوضح فوق الجدول |
| FE-P1 | توحيد ألوان الحالة (أخضر/أصفر/أحمر) على الكروت المحسوبة | Contact Center + Reservations | Thresholds في القسم 12 | قراءة سريعة خلال 30 ثانية |
| FE-P2 | Doctors capacity UI | Doctors | يحتاج حقول من الـ Backend (انظر ملف النواقص) | بعد توفر البيانات |
| FE-P2 | Patient data quality / LTV UI | Patients | يحتاج حقول من الـ Backend | بعد توفر البيانات |
| FE-P2 | KPIs operational tab enhancements | KPIs | يحتاج حقول تشغيلية من الـ Backend | فصل واضح بعد توفر البيانات |

### مهام Backend (ليست Frontend) — موثّقة في ملف مستقل

انظر: `docs/home_healers_dashboard_backend_missing_apis.md`

لا تُبنى endpoints جديدة من الفرونت. أي نقص يُطلب كحقول إضافية داخل `statistics` الحالية لنفس الـ list APIs.

### Acceptance Criteria

- كل بطاقة KPI محسوبة من `statistics` الحالية تعرض: الرقم، النسبة إن وجدت، وحالة اللون.
- كل رقم قابل للضغط يفتح الجدول/الكانبان بنفس الفلتر (الروابط الحالية `link`).
- ترتيب الأقسام داخل الصفحة يطابق رحلة القرار: حالة → تحويل → مصدر → جودة → قناة → عروض/خدمات → جدول.
- Unknown Source يظهر كتنبيه واضح أعلى الصفحة عند تجاوز 20%.
- لا يوجد اعتماد على endpoint/JSON جديد في هذه المرحلة.

النتيجة المتوقعة: بعد الترتيب، يستطيع المدير معرفة أين المشكلة خلال أقل من دقيقة: هل المشكلة في التسويق، الكول سنتر، الحجوزات، التعيين، الأطباء، أو التحصيل.

## 14) دليل استخدام مختصر للإدارة

### كيف تقرأ الصفحة يوميًا؟

1. ابدأ من Red Flags: أي لون أحمر يحتاج إجراء قبل نهاية اليوم. 2. افتح Inbound: راقب New وUnknown Source وInbound Conversion. 3. افتح Outbound: راقب Failed وFollow Up Aging وSuccess Rate. 4. افتح Reservations: راقب Reviewing وUnassigned وCanceled وRemaining Payment. 5. افتح Doctors: راقب Available Capacity وUtilization حسب المدينة. 6. افتح KPIs: راقب نشاط المستخدمين والحذف والتعديلات العالية.

### متى يتم التصعيد؟

| الحالة | الإجراء | المسؤول |
| --- | --- | --- |
| Unknown Source < 20% | إيقاف إدخال مصدر unknown ومراجعة التكامل مع الحملات | IT + Marketing |
| Inbound New متراكم أكثر من 24 ساعة | توزيع الطلبات على الكول سنتر | Operations |
| Failed Outbound مرتفع | مراجعة أسباب الفشل والسكريبت | Call Center Supervisor |
| Unassigned Reservations | تعيين طبيب أو تصعيد نقص الطاقة | Medical Coordinator |
| Collection Rate منخفض | متابعة الفواتير غير المدفوعة | Finance |
| Doctor Utilization منخفض | إعادة توزيع الحجوزات أو مراجعة الجدول | Operations |

### قرارات مباشرة من كل قسم

| Outbound | Inbound |
| --- | --- |
| هل المتابعات تنتج حجوزات؟ ما سبب الفشل؟ | هل العملاء الواردون يتحولون بسرعة؟ هل يوجد مصدر مجهول؟ |

| Patients | Reservations |
| --- | --- |
| من هم العملاء المتكررون؟ هل بياناتهم مكتملة؟ | كم حجز مؤكد؟ كم جلسة؟ كم متبقي تحصيله؟ |

| KPIs | Doctors |
| --- | --- |
| من يعمل؟ ما أكثر شاشة تعدل؟ هل هناك حذف غير طبيعي؟ | هل لدينا طاقة كافية حسب المدينة والخدمة؟ |

قاعدة الإدارة اليومية: لا تعتمد على الرقم الإجمالي فقط. اقرأ النسبة + المصدر + المسؤول + الفترة الزمنية قبل اتخاذ القرار.

## 15) لقطات مرجعية من الفيديو

هذه اللقطات وضعت فقط لتوضيح أن الترتيب المقترح مبني على الأقسام الظاهرة في الفيديو.

| Reservations | Inbound | Outbound |
| --- | --- | --- |

| KPIs | Doctors | Patients |
| --- | --- | --- |
