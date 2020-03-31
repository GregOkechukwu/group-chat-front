import { Routes, RouterModule } from '@angular/router';
import { WrapperComponent } from './wrapper/wrapper.component';
import { UserResolver } from './resolvers/user.resolver';
import { ImageResolver } from './resolvers/image.resolver';
import { AuthGuardForHome } from './guards/auth.guard';
import { InviteResolver } from './resolvers/invite.resolver';
 
const routes : Routes = [
  {
    path : 'home', 
    component : WrapperComponent, 
    canActivate : [AuthGuardForHome],
    resolve : {
      user : UserResolver,
      inviteCount : InviteResolver,
      images : ImageResolver 
    },
    runGuardsAndResolvers : 'pathParamsChange'
  },
  {
    path : '**', 
    redirectTo : 'home'
  } // order matters!! make sure this is the last route registered
  
];
export const AppRoutes = RouterModule.forRoot(routes);
