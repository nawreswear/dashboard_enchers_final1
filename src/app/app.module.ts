import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
// Components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { FeatureComponent } from './components/feature/feature.component';
import { FooterComponent } from './components/footer/footer.component';
import { FilterComponent } from './components/filter/filter.component';
import { SearchComponent } from './components/search/search.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CartComponent } from './components/cart/cart.component';

//
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

//
//import { CarouselModule } from 'ngx-owl-carousel-o';
import { ToastrModule } from 'ngx-toastr';
import { ToastComponent } from './components/toast/toast.component';
import { AuthGuard } from './guards/auth.guard';
import { loggedGuard } from './guards/logged.guard';
import { JwtModule } from '@auth0/angular-jwt';
import { adminGuard } from './guards/admin.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CategoryComponent } from './pages/category/category.component';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { AddNewCategoryComponent } from './pages/add-new-category/add-new-category.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ArticlesComponent } from './articles/articles.component';
import { CategoriesComponent } from './categories/categories.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AboutComponent } from './about/about.component';

const routes: Route[] = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'login', component: LoginComponent },
      { path: 'navbar', component: NavbarComponent },
       {path: 'register',component: RegisterComponent},
      { path: 'articles', component: ArticlesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'about', component: AboutComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {path: 'category',children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: CategoryComponent },
          { path: 'new', component: AddNewCategoryComponent },
          { path: 'edit/:id',component: EditCategoryComponent,
            data: {
              breadcrumb: {label: 'Edit'},
            },
          },
        ],
      },
    ],
  },
  { path: '**', component: NotFoundComponent }, // Wildcard route for 404
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    ArticlesComponent,
    CategoriesComponent,
    HomeComponent,
    RegisterComponent,
    ProductsComponent,
    ProductDetailsComponent,
    NavbarComponent,
    CarouselComponent,
    FeatureComponent,
    FooterComponent,
    FilterComponent,
    SearchComponent,
    ProductCardComponent,
    CartComponent,
    ToastComponent,
    DashboardComponent,
    HomeLayoutComponent,
    AdminLayoutComponent,
    CategoryComponent,
    AddNewCategoryComponent,
    EditCategoryComponent,
    AboutComponent,
  ],
  imports: [
    MatSnackBarModule,
    BrowserModule,
    MatCardModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
   //CarouselModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      enableHtml: true,
      easing: 'ease-in-out',
      progressBar: true,
      tapToDismiss: true,
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token');
        },
      },
    }),
    BreadcrumbModule,
  ],
  providers: [],
  exports: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
