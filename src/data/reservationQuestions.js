/**
 * Intake questions for a workshop seat, ported from the Arabic Google Form
 * used for the Nasiriyah workshop. `ar` holds the original wording so the form
 * can be flipped to Arabic (or shown bilingually) without re-sourcing it.
 */
export const reservationQuestions = [
  {
    id: 'name',
    type: 'text',
    label: 'Full name',
    ar: 'الأسم',
    required: true,
    autocomplete: 'name',
  },
  {
    id: 'gender',
    type: 'radio',
    label: 'Gender',
    ar: 'الجنس',
    required: true,
    options: [
      { value: 'male', label: 'Male', ar: 'ذكر' },
      { value: 'female', label: 'Female', ar: 'أنثى' },
    ],
  },
  {
    id: 'age',
    type: 'number',
    label: 'Age',
    ar: 'العمر',
    required: true,
    min: 10,
    max: 100,
  },
  {
    id: 'phone',
    type: 'tel',
    label: 'Phone number',
    ar: 'رقم الهاتف',
    required: true,
    autocomplete: 'tel',
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email address',
    ar: 'البريد الالكتروني',
    required: false,
    autocomplete: 'email',
  },
  {
    id: 'worksCommercially',
    type: 'radio',
    label: 'Do you currently work in commercial photography (weddings, advertising, products, etc.)?',
    ar: 'هل تعمل حالياً في مجال التصوير التجاري (مثل الأعراس، الإعلانات، المنتجات، إلخ)؟',
    required: true,
    options: [
      { value: 'yes', label: 'Yes', ar: 'نعم' },
      { value: 'no', label: 'No', ar: 'لا' },
    ],
  },
  {
    id: 'specialities',
    type: 'checkbox',
    label: 'Which areas do you work in or care about?',
    hint: 'Choose as many as apply.',
    ar: 'ما هي التخصصات التي تعمل/تهتم بها في التصوير؟ (يمكن اختيار أكثر من خيار)',
    required: true,
    options: [
      { value: 'weddings', label: 'Weddings', ar: 'تصوير الاعراس' },
      { value: 'products', label: 'Products', ar: 'تصوير المنتجات' },
      { value: 'portrait', label: 'Portrait', ar: 'تصوير البورترية' },
      { value: 'travel', label: 'Travel & nature', ar: 'تصوير السفر والطبيعة' },
      { value: 'video', label: 'Video', ar: 'تصوير الفيديو' },
      { value: 'photojournalism', label: 'Photojournalism', ar: 'التصوير الصحفي' },
      { value: 'other', label: 'Other', ar: 'اخرى' },
    ],
  },
  {
    id: 'device',
    type: 'radio',
    label: 'What do you mainly shoot on?',
    ar: 'ما نوع الجهاز الأساسي الذي تستخدمه في التصوير؟',
    required: true,
    options: [
      { value: 'camera', label: 'A professional camera (DSLR or mirrorless)', ar: 'كاميرا احترافية (DSLR أو Mirrorless)' },
      { value: 'phone', label: 'A mobile phone', ar: 'هاتف نقال' },
      { value: 'both', label: 'Both', ar: 'الاثنان معاً' },
    ],
  },
  {
    id: 'brand',
    type: 'radio',
    label: 'Which system do you rely on most?',
    ar: 'على ماذا تعتمد بشكل رئيسي؟',
    required: true,
    options: [
      { value: 'sony', label: 'Sony' },
      { value: 'canon', label: 'Canon' },
      { value: 'nikon', label: 'Nikon' },
      { value: 'fujifilm', label: 'Fujifilm' },
      { value: 'phone', label: 'Phone' },
    ],
  },
  {
    id: 'hasLighting',
    type: 'radio',
    label: 'Do you own lighting equipment?',
    ar: 'هل تمتلك معدات إضاءة؟',
    required: true,
    options: [
      { value: 'yes', label: 'Yes', ar: 'نعم' },
      { value: 'no', label: 'No', ar: 'لا' },
    ],
  },
  {
    id: 'motivation',
    type: 'textarea',
    label: 'Why do you want to join this workshop?',
    ar: 'لماذا تود الدخول لهذه الورشة؟',
    required: true,
    rows: 4,
  },
]

/** Blank answer set — checkboxes start as arrays, everything else as strings. */
export const emptyAnswers = () =>
  Object.fromEntries(
    reservationQuestions.map((q) => [q.id, q.type === 'checkbox' ? [] : '']),
  )
