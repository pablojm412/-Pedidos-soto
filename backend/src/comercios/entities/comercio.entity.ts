import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('comercios')
export class Comercio {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  nombre: string;

  @Column()
  categoria: string;

  @Column()
  direccion: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lng: number;

  @Column({ default: true })
  abierto: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costo_envio_base: number;
}
