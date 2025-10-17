import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  user_id: number;

  @Column({ length: 10 })
  symbol: string;

  @Column({ type: 'enum', enum: ['buy', 'sell'] })
  side: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  total: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  fee: number;

  @CreateDateColumn()
  executed_at: Date;

  @ManyToOne(() => User, user => user.trades)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order, order => order.trades)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
