import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);

  placingOrder = signal(false);
  errorMessage = signal<string | null>(null);

  confirm(): void {
    this.placingOrder.set(true);
    this.errorMessage.set(null);

    this.orderService.checkout().subscribe({
      next: (order) => {
        this.cartService.refresh().subscribe();
        this.toast.show('Pedido confirmado!', 'success');
        this.router.navigate(['/orders'], { state: { justPlacedId: order.id } });
      },
      error: (err) => {
        this.placingOrder.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Não foi possível concluir a compra');
      },
    });
  }
}
