import { useLanguage } from "@/hooks/useLanguage";

export default function ReturnPolicy() {
  const { lang, isRTL, t } = useLanguage();

  return (
    <div className={`container mx-auto px-4 py-12 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">{t("returnPolicy")}</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="prose prose-slate max-w-none">
            {lang === "ar" ? (
              <>
                <p className="text-lg text-slate-600 mb-8">
                  في اليوسف للإلكترونيات، نسعى دائماً لتوفير أفضل تجربة تسوق لك. إذا لم تكن راضياً تماماً عن مشترياتك، فنحن هنا لمساعدتك وفقاً للسياسات التالية:
                </p>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">فترة الاسترجاع والاستبدال</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>الاسترجاع متاح خلال <strong>7 أيام</strong> من تاريخ استلام الطلب.</li>
                  <li>الاستبدال متاح خلال <strong>14 يوماً</strong> من تاريخ استلام الطلب.</li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">شروط الاسترجاع والاستبدال</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>يجب أن يكون المنتج في حالته الأصلية وبغلافه الأصلي ولم يتم فتحه أو استخدامه.</li>
                  <li>يجب إرفاق فاتورة الشراء الأصلية مع المنتج.</li>
                  <li>الأجهزة الإلكترونية التي تم فتحها أو استخدامها لا يمكن استرجاعها إلا في حال وجود عيب مصنعي (مشمول بالضمان).</li>
                  <li>المنتجات المخفضة (العروض الخاصة) تخضع لشروط استرجاع خاصة قد يتم توضيحها وقت الشراء.</li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">خطوات الإرجاع</h3>
                <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-8">
                  <li>تواصل مع خدمة العملاء عبر رقم الدعم الفني أو البريد الإلكتروني.</li>
                  <li>تزويدنا برقم الطلب وصور للمنتج إذا لزم الأمر.</li>
                  <li>سيتم إصدار بوليصة شحن للإرجاع، قم بتسليم المنتج لشركة الشحن.</li>
                  <li>بعد استلامنا للمنتج وفحصه، سيتم إرجاع المبلغ إلى نفس وسيلة الدفع الأصلية خلال 7 إلى 14 يوم عمل.</li>
                </ol>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">تكاليف الشحن للإرجاع</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>إذا كان الإرجاع بسبب عيب مصنعي أو خطأ من المتجر، نتحمل تكلفة الشحن بالكامل.</li>
                  <li>إذا كان الإرجاع لسبب آخر (عدم الرغبة بالمنتج)، يتحمل العميل تكلفة الشحن للإرجاع.</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-lg text-slate-600 mb-8">
                  At AL-YOUSEF Electronics, we always strive to provide you with the best shopping experience. If you are not completely satisfied with your purchase, we are here to help according to the following policies:
                </p>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Return and Exchange Period</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>Returns are available within <strong>7 days</strong> from the date of receiving the order.</li>
                  <li>Exchanges are available within <strong>14 days</strong> from the date of receiving the order.</li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Return and Exchange Conditions</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>The product must be in its original condition and original packaging, unopened and unused.</li>
                  <li>The original purchase invoice must be attached with the product.</li>
                  <li>Electronic devices that have been opened or used cannot be returned unless there is a manufacturing defect (covered by warranty).</li>
                  <li>Discounted products (special offers) are subject to special return conditions that may be clarified at the time of purchase.</li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Return Steps</h3>
                <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-8">
                  <li>Contact customer service via the technical support number or email.</li>
                  <li>Provide us with the order number and pictures of the product if necessary.</li>
                  <li>A return shipping waybill will be issued, hand the product over to the shipping company.</li>
                  <li>After we receive and inspect the product, the amount will be refunded to the same original payment method within 7 to 14 business days.</li>
                </ol>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Return Shipping Costs</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                  <li>If the return is due to a manufacturing defect or an error from the store, we bear the full shipping cost.</li>
                  <li>If the return is for another reason (no longer want the product), the customer bears the return shipping cost.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
