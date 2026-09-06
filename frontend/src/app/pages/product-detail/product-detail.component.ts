import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  notFound = signal(false);
  quantity = signal(1);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  changeQuantity(delta: number): void {
    const next = this.quantity() + delta;
    const max = this.product()?.stock ?? 1;
    if (next >= 1 && next <= max) {
      this.quantity.set(next);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.show('Entre na sua conta para adicionar ao carrinho', 'info');
      return;
    }

    this.cartService.addItem(product.id, this.quantity()).subscribe({
      next: () => this.toast.show(`${product.name} adicionado ao carrinho`, 'success'),
      error: (err) => this.toast.show(err?.error?.message ?? 'Erro ao adicionar item', 'error'),
    });
  }
}
