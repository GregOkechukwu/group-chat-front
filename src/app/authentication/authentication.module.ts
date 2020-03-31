import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthenticationRoutes } from './authentication.routing.module';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule, MatDialogModule, MatInputModule, MatFormFieldModule, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, MatButtonModule, MatProgressBarModule, MatSnackBarModule } from '@angular/material';
import { ProgressBarColorDirective } from '../directives/progress-bar-color.directive';

@NgModule({
  declarations: [
    LoginComponent, 
    RegisterComponent,
    ProgressBarColorDirective
  ],

  imports: [
    AuthenticationRoutes,
    FormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule
  ],

  exports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    ProgressBarColorDirective,
    MatSnackBarModule,
    MatBadgeModule
  ],

  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class AuthenticationModule { }// feature module
