import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);
  search = signal('');
  category = signal('');
  page = signal(1);
  totalPages = signal(1);

  categories = ['periféricos', 'monitores', 'áudio', 'móveis'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productService
      .list({ search: this.search() || undefined, category: this.category() || undefined, page: this.page() })
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.totalPages.set(res.pagination.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearchChange(): void {
    this.page.set(1);
    this.load();
  }

  onCategoryChange(category: string): void {
    this.category.set(this.category() === category ? '' : category);
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.load();
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.toast.show('Entre na sua conta para adicionar ao carrinho', 'info');
      return;
    }

    this.cartService.addItem(product.id, 1).subscribe({
      next: () => this.toast.show(`${product.name} adicionado ao carrinho`, 'success'),
      error: (err) => this.toast.show(err?.error?.message ?? 'Erro ao adicionar item', 'error'),
    });
  }
}
