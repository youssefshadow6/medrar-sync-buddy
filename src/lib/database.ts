import Dexie, { Table } from 'dexie';
import { 
  Product, 
  Customer, 
  Supplier, 
  SalesInvoice, 
  PurchaseInvoice,
  CustomerPayment,
  SupplierPayment 
} from './types';

export class MedrarDatabase extends Dexie {
  products!: Table<Product, number>;
  customers!: Table<Customer, number>;
  suppliers!: Table<Supplier, number>;
  salesInvoices!: Table<SalesInvoice, number>;
  purchaseInvoices!: Table<PurchaseInvoice, number>;
  customerPayments!: Table<CustomerPayment, number>;
  supplierPayments!: Table<SupplierPayment, number>;

  constructor() {
    super('MedrarDB');
    
    this.version(1).stores({
      products: '++id, name, price, createdAt, updatedAt',
      customers: '++id, name, phone, balance, createdAt, updatedAt',
      suppliers: '++id, name, phone, balance, createdAt, updatedAt',
      salesInvoices: '++id, customerId, customerName, total, createdAt',
      purchaseInvoices: '++id, supplierId, supplierName, total, createdAt',
      customerPayments: '++id, customerId, customerName, amount, createdAt',
      supplierPayments: '++id, supplierId, supplierName, amount, createdAt',
    });
  }
}

export const db = new MedrarDatabase();

// Helper functions
export const normalizeSearch = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const searchMatch = (target: string, query: string): boolean => {
  return normalizeSearch(target).includes(normalizeSearch(query));
};
