import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Balance } from './balance.entity';
import { Holding } from './holding.entity';
import { Order } from './order.entity';
import { Trade } from './trade.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Balance, balance => balance.user)
  balances: Balance[];

  @OneToMany(() => Holding, holding => holding.user)
  holdings: Holding[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => Trade, trade => trade.user)
  trades: Trade[];
}
