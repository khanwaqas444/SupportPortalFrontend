import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentLoginComponent } from './component-login/component-login.component';
import { ComponentRegisterComponent } from './component-register/component-register.component';
import { ComponentUserComponent } from './component-user/component-user.component';

const routes: Routes = [
  { path: 'login', component: ComponentLoginComponent},
  { path: 'register', component: ComponentRegisterComponent},
  { path: 'user/management', component: ComponentUserComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
