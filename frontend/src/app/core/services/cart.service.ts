import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly items = computed<CartItem[]>(() => this._cart()?.items ?? []);
  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  constructor(private http: HttpClient) {}

  refresh(): Observable<Cart> {
    return this.http
      .get<Cart>(`${environment.apiUrl}/cart`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  addItem(productId: string, quantity = 1): Observable<CartItem> {
    return this.http
      .post<CartItem>(`${environment.apiUrl}/cart/items`, { productId, quantity })
      .pipe(tap(() => this.refresh().subscribe()));
  }

  updateQuantity(productId: string, quantity: number): Observable<CartItem> {
    return this.http
      .patch<CartItem>(`${environment.apiUrl}/cart/items/${productId}`, { quantity })
      .pipe(tap(() => this.refresh().subscribe()));
  }

  removeItem(productId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/cart/items/${productId}`)
      .pipe(tap(() => this.refresh().subscribe()));
  }

  clearLocal(): void {
    this._cart.set(null);
  }
}
