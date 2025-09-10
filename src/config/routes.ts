import { countries } from "@/app/shared/logistics/shipment/create-edit/select-options";

export const routes = {
  eCommerce: {
    dashboard: '/ecommerce',
    products: '/ecommerce/products',
    createProduct: '/ecommerce/products/create',
    productDetails: (slug: string) => `/ecommerce/products/${slug}`,
    ediProduct: (slug: string) => `/ecommerce/products/${slug}/edit`,
    categories: '/ecommerce/categories',
    createCategory: '/ecommerce/categories/create',
    editCategory: (id: string) => `/ecommerce/categories/${id}/edit`,
    orders: '/ecommerce/orders',
    createOrder: '/ecommerce/orders/create',
    orderDetails: (id: string) => `/ecommerce/orders/${id}`,
    editOrder: (id: string) => `/ecommerce/orders/${id}/edit`,
    reviews: '/ecommerce/reviews',
    shop: '/ecommerce/shop',
    cart: '/ecommerce/cart',
    checkout: '/ecommerce/checkout',
    trackingId: (id: string) => `/ecommerce/tracking/${id}`,
  },
  support: {
    dashboard: '/support',
    inbox: '/support/inbox',
    supportCategory: (category: string) => `/support/inbox/${category}`,
    messageDetails: (id: string) => `/support/inbox/${id}`,
    snippets: '/support/snippets',
    createSnippet: '/support/snippets/create',
    viewSnippet: (id: string) => `/support/snippets/${id}`,
    editSnippet: (id: string) => `/support/snippets/${id}/edit`,
    templates: '/support/templates',
    createTemplate: '/support/templates/create',
    viewTemplate: (id: string) => `/support/templates/${id}`,
    editTemplate: (id: string) => `/support/templates/${id}/edit`,
  },
    settings: {
    index: '/settings',
  },
  logistics: {
    dashboard: '/logistics',
    shipmentList: '/logistics/shipments',
    customerProfile: '/logistics/customer-profile',
    createShipment: '/logistics/shipments/create',
    editShipment: (id: string) => `/logistics/shipments/${id}/edit`,
    shipmentDetails: (id: string) => `/logistics/shipments/${id}`,
    tracking: (id: string) => `/logistics/tracking/${id}`,
  },
  analytics: '/analytics',
  file: {
    dashboard: '/file',
    manager: '/file-manager',
    upload: '/file-manager/upload',
    create: '/file-manager/create',
  },
  roles: {
    index: '/roles',
  },
  permissions: {
    index: '/permissions',
  },
  nationalities: {
    index: '/nationalities',
  },
  brands: {
    index: '/brands',
  },
  features_categories: {
    index: '/features_categories',
  },
  features: {
    index: '/features',
  },
  toDoList: {
    index: '/todolist',
  },
  users: {
    index: '/users',
  },
  regions: {
    index: '/regions'
  },
  coupons: {
    index: '/coupons'
  },
  patients: {
    index: '/clients'
  },
  cities: {
    index: '/cities'
  },
  states: {
    index: '/states'
  },
  countries: {
    index: '/countries',
  },
  retailers: {
    index: '/retailers'
  },
  stores: {
    index: '/stores'
  },
  logRequest: {
    index: '/log_requests'
  },
  notifications: {
    index: '/notifications'
  },
  // categories: {
  //   index: '/categories'
  // },
  mainCategories: {
    index: '/categories'
  },
  services: {
    index: '/services'
  },
  supCategories: {
    index: '/supcategories'
  },
  supSupCategories: {
    index: '/supsupcategories'
  },
  journeys: {
    index: '/journeys'
  },
  products: {
    index: '/products'
  },
  chickIn: {
    index: '/check_in_out_report',
    chickInDetails: (slug: string) => `/check_in_out_report/${slug}`,
    chickInOutDetails: (slug: string, id: string) => `/check_in_out_report/${slug}/${id}`
  },
  stockPrcess: {
    index: '/stock_process'
  },
  sales: {
    index: '/sales'
  },
  stock: {
    index: '/stock'
  },
  benchmark: {
    index: '/benchmark_report'
  },
  launchedModel: {
    index: '/launched_models_report'
  },
  newInstalledPOSM: {
    index: '/NewInstalledPOSM_report'
  },
  newInstalledSoftPOSM: {
    index: '/NewInstalledSoftPOSM_report'
  },
  instore: {
    index: '/InstorePromotion_report'
  },
  salesChart: {
    index: '/sales_chart'
  },
  salesTargetChart: {
    index: '/sales_target_chart'
  },
  salesTargetTable: {
    index: '/sales_target_table'
  },
  employeeLocation: {
    index: '/employee-places'
  },
  Sampling: {
    index: '/Sampling_report'
  },
  targets: {
    index: '/targets'
  },
  inquiries: {
    index: '/inquiries'
  },
  packages: {
    index: '/packages'
  },
  customerSupport: {
    index: '/customer-supports'
  },
  addresses: {
    index: '/addresses',
  },
  blogs: {
    index: '/blogs',
  },
  invoices: {
    index: '/invoices',
  },
  pos: {
    index: '/point-of-sale',
  },
  eventCalendar: '/event-calendar',
  rolesPermissions: '/roles-permissions',
  brandsPermissions: '/brands-permissions',
  invoice: {
    home: '/invoice',
    create: '/invoice/create',
    details: (id: string) => `/invoice/${id}`,
    edit: (id: string) => `/invoice/${id}/edit`,
  },
  widgets: {
    cards: '/widgets/cards',
    icons: '/widgets/icons',
    charts: '/widgets/charts',
    maps: '/widgets/maps',
    banners: '/widgets/banners',
  },
  tables: {
    basic: '/tables/basic',
    collapsible: '/tables/collapsible',
    enhanced: '/tables/enhanced',
    pagination: '/tables/pagination',
    search: '/tables/search',
    stickyHeader: '/tables/sticky-header',
  },
  multiStep: '/multi-step',
  forms: {
    profileSettings: '/forms/profile-settings',
    notificationPreference: '/forms/profile-settings/notification',
    personalInformation: '/forms/profile-settings/profile',
    newsletter: '/forms/newsletter',
  },
  search: {
    realEstate: '/search/real-estate',
    nft: '/search/nft',
    flightAndHotel: '/search/flight',
  },
  emailTemplates: '/email-templates',
  profile: '/profile',
  welcome: '/welcome',
  comingSoon: '/coming-soon',
  accessDenied: '/access-denied',
  notFound: '/not-found',
  maintenance: '/maintenance',
  blank: '/blank',
  auth: {
    signUp1: '/auth/sign-up-1',
    signUp2: '/auth/sign-up-2',
    signUp3: '/auth/sign-up-3',
    signUp4: '/auth/sign-up-4',
    signUp5: '/auth/sign-up-5',
    // sign in
    signIn1: '/auth/sign-in-1',
    signIn2: '/auth/sign-in-2',
    signIn3: '/auth/sign-in-3',
    signIn4: '/auth/sign-in-4',
    signIn5: '/auth/sign-in-5',
    // forgot password
    forgotPassword1: '/auth/forgot-password-1',
    forgotPassword2: '/auth/forgot-password-2',
    forgotPassword3: '/auth/forgot-password-3',
    forgotPassword4: '/auth/forgot-password-4',
    forgotPassword5: '/auth/forgot-password-5',
    // OTP
    otp1: '/auth/otp-1',
    otp2: '/auth/otp-2',
    otp3: '/auth/otp-3',
    otp4: '/auth/otp-4',
    otp5: '/auth/otp-5',
  },
  signIn: '/signin',
    pages: {
    index: '/pages',
  },
  attachmentsService: {
    index: '/attachmentsService',
  },
  sections: {
    index: '/sections',
  },
  posts: {
    index: '/posts',
  },
    faqs: {
    index: '/faqs',
  },
    ClientReview: {
    index: '/client-reviews',
  },
    doctors: {
    index: '/doctors',
  },
    reservations: {
    index: '/reservations',
  },
};
