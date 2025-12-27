export interface Product {
  id?: number;
  name: string;
  price: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  balance: number; // positive = customer owes us, negative = we owe customer
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id?: number;
  name: string;
  phone?: string;
  balance: number; // positive = we owe supplier, negative = supplier owes us
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SalesInvoice {
  id?: number;
  customerId: number;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  createdAt: Date;
}

export interface PurchaseInvoice {
  id?: number;
  supplierId: number;
  supplierName: string;
  items: InvoiceItem[];
  total: number;
  createdAt: Date;
}

export interface CustomerPayment {
  id?: number;
  customerId: number;
  customerName: string;
  amount: number;
  note?: string;
  createdAt: Date;
}

export interface SupplierPayment {
  id?: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  note?: string;
  createdAt: Date;
}
