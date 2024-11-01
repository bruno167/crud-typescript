import { Customer } from './models/customers';

export interface Database {
    get(id: number): Promise<Customer | undefined>;
    getAll(): Promise<Customer[]>;
    save(cliente: Omit<Customer, "id">): Promise<Customer>;
}