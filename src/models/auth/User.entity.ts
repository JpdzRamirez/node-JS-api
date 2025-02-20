import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './Role.entity';

@Entity('users') // Nombre de la tabla en Supabase
export class APPUser {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'uuid_authsupa',nullable:true, unique: true })
    uuid_authsupa?: string;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'schema_id', nullable: true })
    schema_id?: number;

    @Column({ nullable: true, unique: true })
    document?: string; // No puede ser null y debe ser único

    @Column({ nullable: false, unique: true })
    email!: string; // No puede ser null y debe ser único

    @Column({ nullable: true })
    password?: string; // No puede ser null

    @Column({ nullable: false })
    name!: string; // No puede ser null

    @Column({ nullable: true })
    lastname?: string;

    @Column({ nullable: false })
    mobile!: string; // No puede ser null

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date = new Date(); // Se genera automáticamente

    @ManyToOne(() => Role, { nullable: true, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'role_id' })
    roles?: Role | null;
}
