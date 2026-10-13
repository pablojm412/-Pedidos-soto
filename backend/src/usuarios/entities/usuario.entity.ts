import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: 'cliente' }) // roles: cliente, comercio, repartidor, admin
  rol: string;

  @Column()
  password_hash: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  ubicacion_lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  ubicacion_lng: number;

  @Column({ type: 'timestamp', nullable: true })
  ubicacion_actualizada_en: Date;
}