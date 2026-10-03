import { IsNumber } from 'class-validator';

export class ActualizarUbicacionDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}