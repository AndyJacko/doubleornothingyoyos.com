import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularMaterialModule } from '../angular-material.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    AngularMaterialModule,
    AuthRoutingModule,
    CommonModule,
    FormsModule,
  ],
})
export class AuthModule {}
