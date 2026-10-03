import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: 'cliente' })
  rol: string; // 'cliente' | 'comercio' | 'repartidor' | 'admin'

  @Column()
  password_hash: string;

  // --- Ubicación en vivo (solo se usa si rol === 'repartidor') ---
  @Column({ type: 'float', nullable: true })
  ubicacion_lat: number;

  @Column({ type: 'float', nullable: true })
  ubicacion_lng: number;

  @Column({ type: 'timestamp', nullable: true })
  ubicacion_actualizada_en: Date;
}