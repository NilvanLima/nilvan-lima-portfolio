import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.cartService.refresh().subscribe();
  }

  increase(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1).subscribe({
      error: (err) => this.toast.show(err?.error?.message ?? 'Erro ao atualizar item', 'error'),
    });
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      this.remove(item);
      return;
    }
    this.cartService.updateQuantity(item.productId, item.quantity - 1).subscribe({
      error: (err) => this.toast.show(err?.error?.message ?? 'Erro ao atualizar item', 'error'),
    });
  }

  remove(item: CartItem): void {
    this.cartService.removeItem(item.productId).subscribe({
      next: () => this.toast.show('Item removido do carrinho', 'info'),
      error: (err) => this.toast.show(err?.error?.message ?? 'Erro ao remover item', 'error'),
    });
  }
}
