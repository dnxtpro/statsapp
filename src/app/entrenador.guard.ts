
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from './_services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class EntrenadorGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.storageService.getUser();
    if (user && user.roles && (user.roles.includes('ROLE_ENTRENADOR') || user.roles.includes('ROLE_ADMIN'))) {
      return true;
    }  {
      // Redirigir o bloquear acceso si no tiene el rol adecuado
      this.router.navigateByUrl('error-505');
      return false;
    }
  }
}
