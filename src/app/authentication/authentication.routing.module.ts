import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuardForLoginRegister } from '../guards/auth.guard';

const routes :  Routes = [
    {
        path : "login", 
        runGuardsAndResolvers : 'pathParamsChange',
        canActivate : [AuthGuardForLoginRegister],
        component : LoginComponent
    },
    {
        path : "register",
        runGuardsAndResolvers : 'pathParamsChange',
        canActivate : [AuthGuardForLoginRegister], 
        component : RegisterComponent
    }
];
export const AuthenticationRoutes = RouterModule.forChild(routes);
