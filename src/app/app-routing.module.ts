import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService as AuthGuard } from './guards/auth-guard.service';
import { RoleGuardService as RoleGuard } from './guards/role-guard.service';
import { WrapperComponent } from './wrapper/wrapper.component';
import { UserResolver } from './resolvers/user.resolver';
import { ImageResolver } from './resolvers/image.resolver';
 
const routes : Routes = [
  {
    path : 'home', 
    component : WrapperComponent, 
    canActivate : [AuthGuard],
    resolve : {
      user : UserResolver,
      image : ImageResolver
    },
    runGuardsAndResolvers : 'pathParamsChange'
  },
  {
    path : '**', 
    redirectTo : 'home'
  } // order matters!! make sure this is the last route registered
  
];
export const AppRoutes = RouterModule.forRoot(routes);
