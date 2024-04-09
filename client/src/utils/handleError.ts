export function handleError<T>({
  data,
  error,
}: { data: T; error: null } | { data: null; error: Error }): T {
  if (error) {
    throw error;
  }
  return data;
}