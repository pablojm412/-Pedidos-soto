import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  pedido_id: number;

  @ManyToOne(() => Pedido, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column()
  proveedor: string; // ej: 'mercadopago'

  @Column({ default: 'pendiente' }) // pendiente, aprobado, rechazado
  estado: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column({ nullable: true })
  referencia_externa: string; // ID de la transacción del proveedor (ej: payment_id de MP)

  @CreateDateColumn()
  creado_en: Date;
}
