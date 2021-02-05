//custom type created for readability and reusability
export type Nullable<T> = T | null | undefined;
// below SetIntervalType could also be made as
//Nullable<ReturnType<typeof setInterval>>
//but using this in other places than this to keep type ddefinition of SetIntervalType decoupled with type definitio of Nullable type
// for ex. see RaceSimulation model
export type SetIntervalType = ReturnType<typeof setInterval>;
