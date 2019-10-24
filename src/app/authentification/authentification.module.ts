import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthentificationRoutes } from './authentification.routing.module';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    FormsModule,
    CommonModule,
    AuthentificationRoutes
  ],
  providers:[]
})
export class AuthentificationModule { }// feature module
