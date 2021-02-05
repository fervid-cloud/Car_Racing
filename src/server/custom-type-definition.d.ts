//custom type created for readability and reusability
export type Nullable<T> = T | null | undefined;
// below SetIntervalType could also be made as
//Nullable<ReturnType<typeof setInterval>>
//but using this in other places than this to keep type SetIntervalType decoupled with Nullable type
// for ex. see RaceSimulation
export type SetIntervalType = ReturnType<typeof setInterval> | null | undefined;
