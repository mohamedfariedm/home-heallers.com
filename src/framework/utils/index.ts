import { HttpClient } from './request';
import { CreateRuleInput, UserInput, Region, City, Retailer, Store, LoginInput, AuthResponse, Category, Journey, Products, stock, Target, Inquerie, notifications } from '@/types'
import { routes } from '@/config/routes';
import { CreateBrandInput } from '@/utils/validators/create-brand.schema ';
import { CreateToDoInput } from '@/utils/validators/create-todo.schema';
import { BrandFormInput } from '@/utils/validators/Brand-form.schema copy';



///////////////////////////////////////////////////////////
//            ?? all HTTpClient in Project
///////////////////////////////////////////////////////////

class Client {

    auth = {
        login: (variables: LoginInput) => {
            return HttpClient.post<AuthResponse>(`/login`, variables);
          },
          logout: () => {
            return HttpClient.post<any>('/logout', {});
          },
    }

    roles = {
        all: (param:string) => HttpClient.get(`/roles?${param}`),
        create: (input: CreateRuleInput) => HttpClient.post(`/roles`, {name:input.name, permissions: input.permissions,"guard_name":"web"}),
        update: (input: {role_id: string ,name: any, permissions: number[]}) => HttpClient.patch(`/roles/${input.role_id}`, {name:input.name, permissions: input.permissions,"guard_name":"web"}),
        delete: (input: {role_id: number[]}) => HttpClient.delete(`/roles/${input.role_id}`),
    }
    permissions = {
        all: (param:string) => HttpClient.get(`/permissions?${param}`),
        create: (input: any) => HttpClient.post(`/permissions`, input),
        update: (input: {role_id: string ,name: any,guard_name:any}) => HttpClient.patch(`/permissions/${input.role_id}`, {name:input.name,guard_name:input.guard_name}),
        delete: (input: {role_id: number[]}) => HttpClient.delete(`/permissions/${input.role_id}`),
        findOne: (id: number) => HttpClient.get('/roles/edit', {role_id: id}),
    }
    nationalities = {
        all: (param:string) => HttpClient.get(`/nationalities?${param}`),
        create: (input: any) => HttpClient.post(`/nationalities`, input),
        update: (input: {role_id: string ,name: any}) => HttpClient.patch(`/nationalities/${input.role_id}`, {name:input.name}),
        delete: (input: {role_id: number[]}) => HttpClient.delete(`/nationalities/${input.role_id}`),
    }
    brands = {
        all: () => HttpClient.get('/brands/index'),
        allAgin: (param:string) => HttpClient.get(`/brands/index?${param}`),
        create: (input: BrandFormInput) => HttpClient.post('/brands/store', input),
        delete: (input: {brand_id: number[]}) => HttpClient.post('/brands/delete', input),
        findOne: (id: number) => HttpClient.get('/brands/edit', {brand_id: id}),
        update: (input: {brand_id: string ,name: string,image:any}) => HttpClient.post('/brands/update', input)
    }

    toDoList = {
        all: (param:string) => HttpClient.get(`review_points/index?${param}`),
        create: (input: CreateToDoInput) => HttpClient.post('/review_points/store', input),
        delete: (input: {point_id: number[]}) => HttpClient.post('/review_points/delete', input),
        findOne: (id: number) => HttpClient.get('/review_points/edit', {point_id: id}),
        update: (input: {title: string ,description: string,point_id:string}) => HttpClient.post('/review_points/update', input)
    }

    users = {
        all: (param:string) => HttpClient.get(`${routes.users.index}?${param}`),
        findeOne: (id:string) => HttpClient.get(`${routes.users.index}/edit?user_id=${id}`),
        update: (input: UserInput) => HttpClient.patch(`${routes.users.index}/${input.user_id}`, input),
        create: (input: UserInput) => HttpClient.post(`${routes.users.index}`, input),
        delete: (input: {user_id: number[]}) => HttpClient.delete(`${routes.users.index}/${input.user_id}`)
    }

    regions = {
        all: (param:string) => HttpClient.get(`${routes.regions.index}/index?${param}`),
        create: (input: Region) => HttpClient.post(`${routes.regions.index}/store`, input),
        update: (input : Region) => HttpClient.post(`${routes.regions.index}/update`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.post(`${routes.regions.index}/delete`, input)
    }
    countries = {
        all: (param:string) => HttpClient.get(`${routes.countries.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.countries.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.countries.index}/${input.country_id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.countries.index}/${input.region_id}`)
    }
    packages = {
        all: (param:string) => HttpClient.get(`${routes.packages.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.packages.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.packages.index}/${input.coupon_id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.packages.index}/${input.region_id}`)
    }
    customerSupport = {
        all: (param:string) => HttpClient.get(`${routes.customerSupport.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.customerSupport.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.customerSupport.index}/${input.lead_id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.customerSupport.index}/${input.region_id}`),
        downloadSampleSheet: () => HttpClient.get('/customer-supports/download-sample-sheet'),
        import: (file: FormData) => HttpClient.post('/customer-supports/import', file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    }
    addresses = {
        all: (param:string) => HttpClient.get(`${routes.addresses.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.addresses.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.addresses.index}/${input.id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.addresses.index}/${input.region_id}`)
    }
    blog = {
        all: (param:string) => HttpClient.get(`${`/news`}?${param}`),
        create: (input: any) => HttpClient.post(`${`/news`}`, input),
        update: (input : any) => HttpClient.patch(`${`/news`}/${input.id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${`/news`}/${input.region_id}`)
    }
    invoices = {
        all: (param:string) => HttpClient.get(`${`/invoices`}?${param}`),
        create: (input: any) => HttpClient.post(`${`/invoices`}`, input),
        update: (input : any) => HttpClient.patch(`${`/invoices`}/${input.id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${`/invoices`}/${input.region_id}`)
    }
    patients = {
        all: (param:string) => HttpClient.get(`${routes.patients.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.patients.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.patients.index}/${input.lead_id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.patients.index}/${input.region_id}`)
    }
    doctors = {
        all: (param:string) => HttpClient.get(`${routes.doctors.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.doctors.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.doctors.index}/${input.doctor_id}`, input) ,
        delete: (input: {doctor_id: number[]}) => HttpClient.delete(`${routes.doctors.index}/${input.doctor_id}`)
    }
 reservations = {
  all: (param: string) => HttpClient.get(`${routes.reservations.index}?${param}`),
  create: (input: any) => HttpClient.post(`${routes.reservations.index}`, input),
  update: (input: any) => HttpClient.patch(`${routes.reservations.index}/${input.reservation_id}`, input),
  delete: (input: { reservation_id: number[] }) => HttpClient.delete(`${routes.reservations.index}/${input.reservation_id}`),
  downloadSampleSheet: () => HttpClient.get('/reservations-sample-sheet'),
  import: (file: FormData) => HttpClient.post('/reservations/import', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  createPaymentWhatsapp: (input: { reservation_id: number }) => HttpClient.post('/reservations/create-payment-whatsapp', input),
};
    coupons = {
        all: (param:string) => HttpClient.get(`${routes.coupons.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.coupons.index}`, input),
        update: (input : any) => HttpClient.patch(`${routes.coupons.index}/${input.coupon_id}`, input) ,
        delete: (input: {region_id: number[]}) => HttpClient.delete(`${routes.coupons.index}/${input.region_id}`)
    }

    cities = {
        all: (param:string) => HttpClient.get(`${routes.cities.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.cities.index}`, input),
        update: (input: any) => HttpClient.patch(`${routes.cities.index}/${input.city_id}`, input),
        delete: (input: {city_id: number[]}) => HttpClient.delete(`${routes.cities.index}/${input.city_id}`)
    }
    states = {
        all: (param:string) => HttpClient.get(`${routes.states.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.states.index}`, input),
        update: (input: any) => HttpClient.patch(`${routes.states.index}/${input.id}`, input),
        delete: (input: {city_id: number[]}) => HttpClient.delete(`${routes.states.index}/${input.city_id}`)
    }
    services = {
        all: (param:string) => HttpClient.get(`${routes.services.index}?${param}`),
        create: (input: any) => HttpClient.post(`${routes.services.index}`, input),
        update: (input: any) => HttpClient.patch(`${routes.services.index}/${input.service_id}`, input),
        delete: (input: {city_id: number[]}) => HttpClient.delete(`${routes.services.index}/${input.city_id}`)
    }

    retailers = {
        all: (param:string) => HttpClient.get(`${routes.retailers.index}/index?${param}`),
        create: (input: Retailer) => HttpClient.post(`${routes.retailers.index}/store`, input),
        update: (input : Retailer) => HttpClient.post(`${routes.retailers.index}/update`, input) ,
        delete: (input: {retailer_id: number[]}) => HttpClient.post(`${routes.retailers.index}/delete`, input)
    }

    stores = {
        all: (param:string) => HttpClient.get(`${routes.stores.index}/index?${param}`),
        create: (input: Store) => HttpClient.post(`${routes.stores.index}/store`, input),
        update: (input : Store) => HttpClient.post(`${routes.stores.index}/update`, input) ,
        delete: (input: {store_id: number[]}) => HttpClient.post(`${routes.stores.index}/delete`, input)
    }
    features_categories = {
        all: (param:string) => HttpClient.get(`${routes.features_categories.index}/index?${param}`),
        create: (input: {name:string,is_active:number,BG_id:string,VCP_id:string,BU_id:string}) => HttpClient.post(`${routes.features_categories.index}/store`, input),
        update: (input : {name:string,is_active:number,category_id: any,BG_id:string,VCP_id:string,BU_id:string}) => HttpClient.post(`${routes.features_categories.index}/update`, input) ,
        delete: (input: {category_id:number[] }) => HttpClient.post(`${routes.features_categories.index}/delete`, input)
    }
    features = {
        all: (param:string) => HttpClient.get(`${routes.features.index}/index?${param}`),
        getCategories: () => HttpClient.get(`${routes.features.index}/create`),
        create: (input: {name:string,is_active:number,category_id:number[]}) => HttpClient.post(`${routes.features.index}/store`, input),
        update: (input : {name:string,is_active:number,category_id: any,feature_id:number}) => HttpClient.post(`${routes.features.index}/update`, input) ,
        delete: (input: {feature_id:number[] }) => HttpClient.post(`${routes.features.index}/delete`, input)
    }
    // categories = {
    //     all: () => HttpClient.get(`${routes.categories.index}/index`),
    //     allParent: () => HttpClient.get(`${routes.categories.index}/create`),
    //     create: (input: Category) => HttpClient.post(`${routes.categories.index}/store`, input),
    //     update: (input : Category) => HttpClient.post(`${routes.categories.index}/update`, input) ,
    //     delete: (input: {category_id: number[]}) => HttpClient.post(`${routes.categories.index}/delete`, input)
    // }

    mainCategories = {
        all: (param:string) => HttpClient.get(`/categories?${param}`),
        create: (input: any) => HttpClient.post(`/categories`, input),
        update: (input: {role_id: string ,name: any,image:any}) => HttpClient.patch(`/categories/${input.role_id}`, {name:input.name,image:input.image}),
        delete: (input: {role_id: number[]}) => HttpClient.delete(`/categories/${input.role_id}`),
    }
    journeys = {
        all: (param:string) => HttpClient.get(`${routes.journeys.index}/index?${param}`),
        findAllData: () => HttpClient.get(`${routes.journeys.index}/create`),
        findOne: (id: string) => HttpClient.get(`${routes.journeys.index}/edit?journey_id=${id}`) ,
        create: (input: Journey) => HttpClient.post(`${routes.journeys.index}/store`, input),
        update: (input: Journey) => HttpClient.post(`${routes.journeys.index}/update`, input),
        delete: (input: {journey_id: number[]}) => HttpClient.post(`${routes.journeys.index}/delete`, input)
    }
    inquerie = {
        all: (param:string) => HttpClient.get(`${routes.inquiries.index}/index?${param}`),
        update: (input: Inquerie) => HttpClient.post(`${routes.inquiries.index}/update`, input),
        findOne: (id: number) => HttpClient.get(`${routes.inquiries.index}/edit?inquiry_id=${id}`) ,
        // findAllData: () => HttpClient.get(`${routes.journeys.index}/create`),
        // create: (input: Journey) => HttpClient.post(`${routes.journeys.index}/store`, input),
        // delete: (input: {journey_id: number[]}) => HttpClient.post(`${routes.journeys.index}/delete`, input)
    }

    products = {
        all: (param:string) => HttpClient.get(`${routes.products.index}/index?${param}`),
        findAllData: () => HttpClient.get(`${routes.products.index}/create`),
        findSpacifcData: (id:number) => HttpClient.get(`/features?BU_id=${id}`),
        create: (input: Products) => HttpClient.post(`${routes.products.index}/store`, input),
        update: (input : Products) => HttpClient.post(`${routes.products.index}/update`, input) ,
        delete: (input: {product_id: number[]}) => HttpClient.post(`${routes.products.index}/delete`, input)
    }
    contracts = {
        all: (param:string) => HttpClient.get(`/contracts?${param}`),
        findOne: (id: number) => HttpClient.get(`/contracts/${id}`),
        create: (input: any) => HttpClient.post('/contracts', input),
        update: (input: any) => HttpClient.patch(`/contracts/${input.id}`, input),
        delete: (input: {contract_id: number[]}) => {
            const promises = input.contract_id.map(id => HttpClient.delete(`/contracts/${id}`));
            return Promise.all(promises);
        }
    }
    notifications = {
        all: (param:string) => HttpClient.get(`${routes.notifications.index}/index?${param}`),
        findAllData: () => HttpClient.get(`${routes.notifications.index}/create`),
        create: (input: notifications) => HttpClient.post(`${routes.notifications.index}/store`, input),
        // update: (input : Products) => HttpClient.post(`${routes.products.index}/update`, input) ,
        // delete: (input: {product_id: number[]}) => HttpClient.post(`${routes.products.index}/delete`, input)
    }

    checkin = {
        all: (options: any) => HttpClient.get(`${routes.chickIn.index}?${options}`),
        findOne: (id: number) => HttpClient.get(`specific_check_in_out?id=${id}`),
    }

    stock = {
        all: (params:string) => HttpClient.get(`${routes.stock.index}/index?${params}`),
        findAll: () => HttpClient.get(`${routes.stock.index}/create`),
        create: (input: stock) => HttpClient.post(`${routes.stock.index}/store`, input),
        update: (input : stock) => HttpClient.post(`${routes.stock.index}/update`, input) ,
    }

    setting = {
        reportFilter: () => HttpClient.get('/filter_request'),
        allUsersActive: (role: string) => HttpClient.get(`/get_users_with_role?role=${role}`),
        allUsersByRole: (role: string[]) => HttpClient.post(`/get_users_with_role`,{"role":role}),
        allRoles: () => HttpClient.get(`/roles/index`),
        locations: (params: string) => HttpClient.get(`/google_map_request?${params}`)
    }

    stockPrcess = {
        all: (params: string) => HttpClient.get(`${routes.stockPrcess.index}/index?${params}`),
        findOne: (id: number) => HttpClient.get(`${routes.stockPrcess.index}/view?process_id=${id}`)
    }

    sales = {
        all: (params: string) => HttpClient.get(`${routes.sales.index}/index?${params}`)
    }

    benchmark = {
        all: (params: string) => HttpClient.get(`${routes.benchmark.index}?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_benchmark_report?id=${id}`)
    }

    launchedModel = {
        all: (params: string) => HttpClient.get(`${routes.launchedModel.index}?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_launched_models_report?id=${id}`)
    }

    instore = {
        all: (params: string) => HttpClient.get(`/InstorePromotion_report?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_InstorePromotion_report?id=${id}`)
    }
    logRequest = {
        all: (params: string) => HttpClient.get(`${routes.logRequest.index}/index?${params}`),
        findOne: (id: number) => HttpClient.get(`/log_requests/view?log_id=${id}`)
    }
    sampling = {
        all: (params: string) => HttpClient.get(`/Sampling_report?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_Sampling_report?id=${id}`)
    }

    salesChart = {
        all: (type:string,params:string) => HttpClient.get(`${routes.salesChart.index}?chart_type=${type}&${params}`)
    }

    newInstalledPOSM = {
        all: (params: string) => HttpClient.get(`${routes.newInstalledPOSM.index}?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_NewInstalledPOSM_report?id=${id}`)
    }
    newInstalledSoftPOSM = {
        all: (params: string) => HttpClient.get(`${routes.newInstalledSoftPOSM.index}?${params}`),
        findOne: (id: number) => HttpClient.get(`/specific_NewInstalledSoftPOSM_report?id=${id}`)
    }

    targets = {
        all: (param:string) => HttpClient.get(`${routes.targets.index}/index?${param}`),
        findAll: () => HttpClient.get(`${routes.targets.index}/create`),
        create: (input: Target) => HttpClient.post(`${routes.targets.index}/store`, input),
        update: (input : Target) => HttpClient.post(`${routes.targets.index}/update`, input),
        delete: (input: {target_id: number[]}) => HttpClient.post(`${routes.targets.index}/delete`, input)
    }

    salesTargetChart = {
        all: (type:string,params:string) => HttpClient.get(`${routes.salesTargetChart.index}?chart_type=${type}&${params}`)
    }

    salesTargetTable = {
        all: (type:string,params:string) => HttpClient.get(`${routes.salesTargetTable.index}?${params}`)
    }

      pages = {
    all: (param: string) => HttpClient.get(`${routes.pages.index}/${param}`),
    sections: (param: string) =>
      HttpClient.get(`${routes.sections.index}/${param}`),
    postes: (param: string) =>
      HttpClient.get(`${routes.posts.index}?section_id=${param}`),
    spacificPage: (param: string) =>
      HttpClient.get(`${routes.pages.index}/${param}`),
    update: (input: {
      title: {};
      description?: {};
      attachment: any;
      section_id: string;
      id: number;
      additional?: {};
      children?:any;
      // value:number;
    }) => HttpClient.put(`/posts/${input.id}`, input),
    updatePage: (input: {
      title: {};
      description?: {};
      attachment: any;
      section_id: string;
      id: number;
      additional?: {};
      children?:any;
      // value:number;
    }) => HttpClient.put(`/pages/${input.id}`, input),
    edit: (input: { section_id: string; page_id: number; active: number;priority:number;title:{en:string;ar:string}}) =>
      HttpClient.put(`/sections/${input.section_id}`, input),

    // allAgin: (param:string) => HttpClient.get(`/brands/index?${param}`),
    // create: (input: BrandFormInput) => HttpClient.post('/brands/store', input),
    // delete: (input: {brand_id: number[]}) => HttpClient.post('/brands/delete', input),
    // findOne: (id: number) => HttpClient.get('/brands/edit', {brand_id: id}),
    // update: (input: {brand_id: string ,name: string,image:any}) => HttpClient.post('/brands/update', input)
  };


  attachmentsService = {
    all: (id: string) => HttpClient.get(`/service_page/${id}`),
    sections: (id: string) =>
      HttpClient.get(`/service_page/${id}`),
    postes: (id: string) =>
      HttpClient.get(`/service_page/${id}`),
    spacificPage: (id: string) =>
      HttpClient.get(`/service_page/${id}`),
    update: (input: {
      title: {};
      description?: {};
      attachment: any;
      section_id: string;
      id: number;
      additional?: {};
      children?:any;
      // value:number;
    }) => HttpClient.put(`/posts/${input.id}`, input),
    updatePage: (input: {
      title: {};
      description?: {};
      attachment: any;
      section_id: string;
      id: number;
      additional?: {};
      children?:any;
      // value:number;
    }) => HttpClient.put(`/pages/${input.id}`, input),
    edit: (input: { section_id: string; page_id: number; active: number;priority:number;title:{en:string;ar:string}}) =>
      HttpClient.put(`/sections/${input.section_id}`, input),

    // allAgin: (param:string) => HttpClient.get(`/brands/index?${param}`),
    // create: (input: BrandFormInput) => HttpClient.post('/brands/store', input),
    // delete: (input: {brand_id: number[]}) => HttpClient.post('/brands/delete', input),
    // findOne: (id: number) => HttpClient.get('/brands/edit', {brand_id: id}),
    // update: (input: {brand_id: string ,name: string,image:any}) => HttpClient.post('/brands/update', input)
  };
  faqs = {
    all: () => HttpClient.get('/faqs'),
    create: (input: any) => HttpClient.post('/faqs', input),
    delete: (input: { brand_id: number[] }) =>
      HttpClient.delete(`/faqs/${input.brand_id}`),
    update: (input: any) => HttpClient.put(`/faqs/${input.id}`, input),
  };

  clientReview = {
    all: () => HttpClient.get('/client-reviews'),
    create: (input: any) => HttpClient.post('/client-reviews', input),
    delete: (input: { brand_id: number[] }) =>
      HttpClient.delete(`/client-reviews/${input.brand_id}`),
    update: (input: any) =>
      HttpClient.put(`/client-reviews/${input.brand_id}`, input),
  };
    SiteSettings = {
    all: () => HttpClient.get('/settings'),
    update: (input: any) => HttpClient.put(`/settings/1`, input),
  };
}


export default new Client();