import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  SHIPPED: 'Enviado',
  CANCELLED: 'Cancelado',
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.orderService.list().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: Order['status']): string {
    return STATUS_LABEL[status];
  }

  statusBadgeClass(status: Order['status']): string {
    switch (status) {
      case 'PAID':
      case 'SHIPPED':
        return 'badge--success';
      case 'CANCELLED':
        return 'badge--danger';
      default:
        return 'badge--neutral';
    }
  }
}
