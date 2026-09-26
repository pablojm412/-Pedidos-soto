import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Comercio } from '../../comercios/entities/comercio.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  comercio_id: number;

  @ManyToOne(() => Comercio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comercio_id' })
  comercio: Comercio;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ default: true })
  disponible: boolean;

  @Column({ default: 0 })
  stock: number;
}
