export default interface Position {
    id: number;
    driver_name: string;
    top_speed: number;
    acceleration: number;
    handling: number;
    final_position?: number;
    speed: number;
    segment: number;
}