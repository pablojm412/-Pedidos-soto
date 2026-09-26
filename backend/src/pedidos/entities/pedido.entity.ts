import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Comercio } from '../../comercios/entities/comercio.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  cliente_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  @Column()
  comercio_id: number;

  @ManyToOne(() => Comercio, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'comercio_id' })
  comercio: Comercio;

  @Column({ nullable: true })
  repartidor_id: number;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'repartidor_id' })
  repartidor: Usuario;

  @Column({ default: 'pendiente' }) // pendiente, aceptado, en_camino, entregado, cancelado
  estado: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costo_envio: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  direccion_entrega: string;

  @CreateDateColumn()
  creado_en: Date;
}
