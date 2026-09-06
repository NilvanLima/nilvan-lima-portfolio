import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private cart = inject(CartService);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.cart.refresh().subscribe();
    }
  }
}
